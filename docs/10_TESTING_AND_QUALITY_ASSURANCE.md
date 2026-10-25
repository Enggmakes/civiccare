# Document 10 — Testing and Quality Assurance
## CivicCare: Comprehensive Verification Strategy, Test Matrix, and Quality Gates

---

### 1. Document Control & Metadata
- **Document Identifier:** CIVIC-QA-010
- **Status:** Approved Quality Assurance Specification
- **Version:** 1.0.0
- **Test Automation Stack:** Jest, React Native Testing Library, Playwright (Web E2E), Supertest (API), Locust (Load Testing), PyTest (AI Service)

---

### 2. Testing Pyramid & Verification Strategy

CivicCare enforces a multi-tiered test pyramid to guarantee system reliability across mobile hardware, cloud APIs, database policies, and machine learning inference.

```mermaid
graph TD
    subgraph "CivicCare Test Pyramid"
        E2E[End-to-End User Journeys (Playwright & Maestro)<br/>10% of Test Volume]
        INT[Integration & API Gateway Tests (Supertest & Jest)<br/>25% of Test Volume]
        SEC_DB[Database RLS & Security Policy Tests (pgTAP)<br/>20% of Test Volume]
        AI_VAL[AI Model Benchmarks & mAP Validation (PyTest)<br/>15% of Test Volume]
        UNIT[Unit Tests: Components, Hooks, Utilities (Jest)<br/>30% of Test Volume]
    end

    UNIT --> AI_VAL
    AI_VAL --> SEC_DB
    SEC_DB --> INT
    INT --> E2E
```

---

### 3. Measurable Quality Gates

Before any pull request can be merged or deployed to production, code must pass all automated quality gates:

| Quality Gate ID | Domain | Target Threshold / Metric | Verification Tool |
| :--- | :--- | :--- | :--- |
| **GATE-01** | Unit Test Code Coverage | $\ge 80\%$ line & branch coverage on business logic | Jest / Istanbul |
| **GATE-02** | Static Analysis & Linting | Zero ESLint / TypeScript strict errors; zero Ruff/Flake8 errors | ESLint / Ruff |
| **GATE-03** | Database RLS Coverage | 100% of tables have active RLS; 100% of role policies verified | pgTAP / Supabase CLI |
| **GATE-04** | API Response Latency ($p95$) | $p95 < 250\text{ ms}$ under 200 concurrent simulated users | Locust / k6 |
| **GATE-05** | Mobile Performance | Cold start $< 2.0\text{s}$; frame rate $\ge 58\text{ FPS}$ during map scroll | Flashlight / Perfetto |
| **GATE-06** | AI Inference Latency | $p95 < 2,500\text{ ms}$ on CPU; $< 100\text{ ms}$ on GPU | PyTest Benchmark |
| **GATE-07** | AI Model Accuracy | $\text{mAP@50} \ge 0.85$ across standard civic classes on test set | Ultralytics Val Mode |
| **GATE-08** | Security Vulnerability Gate | Zero High/Critical CVEs in dependency tree | Snyk / npm audit |

---

### 4. Master Test Matrix (TEST-001 through TEST-030)

The table below details actionable test cases covering normal flows, edge cases, failure recoveries, and security boundaries.

| Test ID | Category | Preconditions | Test Execution Steps | Expected Result | Pass/Fail Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TEST-001** | Mobile Auth | Citizen on Login Screen | Enter 10-digit mobile number, tap "Send OTP", enter valid 6-digit OTP | Session token stored in SecureStore; navigated to Home Screen (Screen 3) | HTTP 200; JWT valid; user profile loaded |
| **TEST-002** | Permission Denied | App newly installed | Tap "Report Issue"; tap "Deny" on native Camera permission dialog | System intercepts denial; displays friendly modal explaining camera necessity with "Open Settings" CTA | App does not crash; submission blocked gracefully |
| **TEST-003** | GPS Drifting | Device in poor GPS zone | Tap "Report Issue"; hardware returns horizontal accuracy $> 30\text{m}$ | Map pin rendered with yellow accuracy alert; allows citizen to tap "Change" to refine pin | Address field marked "Low Accuracy"; manual pin draggable |
| **TEST-004** | Form Validation | Citizen on Screen 4 | Attempt to tap "Submit Report" with empty description ($< 10$ chars) | Submit button disabled or validation error: "Description must be at least 10 characters" | Form rejects submission; focuses description input |
| **TEST-005** | AI Inference (Pothole) | Clean pothole photo | Upload clear pothole photo; call `POST /api/v1/ai/analyze` | AI returns category `POTHOLE`, confidence $\ge 0.85$, severity `HIGH`, bounding box coordinates | JSON response matches schema; Screen 5 checklist completes |
| **TEST-006** | AI Low Confidence | Blurry night photo | Upload dark, out-of-focus photo; call AI analyze endpoint | Model confidence $< 0.60$; returns `flagged_uncertain: true` and defaults category to `OTHERS` | Prompt citizen to manually select category; ticket flagged for human review |
| **TEST-007** | AI Service Timeout | FastAPI service down | Simulate 3.5s timeout on AI container; submit report from mobile | API gateway circuit breaker fires at 3.0s; report saved as `SUBMITTED`, category `OTHERS` | Citizen submission succeeds; no 500 error; background retry queued |
| **TEST-008** | Spatial Deduplication | Active pothole ticket at Lat 19.1197, Lng 72.8397 | Second citizen submits pothole at Lat 19.1199, Lng 72.8398 (18m away) | System triggers Duplicate Modal (Screen 11); displays existing report thumbnail and distance | Warning displayed; option to "Upvote & Follow" or "Submit Anyway" |
| **TEST-009** | Duplicate Upvote | Duplicate modal active | Citizen taps "Upvote & Track Existing" on ticket #CC20241010 | Subscriber count increments; citizen added to notification recipients; no new report created | Primary report `subscriber_count = 2`; citizen navigated to timeline |
| **TEST-010** | Duplicate Override | Duplicate modal active | Citizen taps "Submit New Report Anyway" | New independent report created; marked with `duplicate_override: true` for supervisor inspection | New ticket ID generated; supervisor dashboard shows override badge |
| **TEST-011** | Smart Auto-Routing | Report created with category `STREETLIGHT` | Submit ticket; check `reports.department_id` in database | System automatically routes ticket to Electrical & Public Lighting Department | Department ID matches public lighting code; department supervisor notified |
| **TEST-012** | Timeline Realtime Update | Citizen tracking ticket #CC20241026 | Admin transitions status to `IN_PROGRESS` in Web Dashboard | Mobile app timeline updates milestone 4 to active pulse instantly via WebSocket without reload | Realtime event received $< 500\text{ ms}$; UI updates timeline |
| **TEST-013** | Mandatory Resolution Proof | Ticket in `IN_PROGRESS` | Supervisor attempts to set status to `RESOLVED` without uploading photo | System rejects request with HTTP 422: "Resolution photo proof is mandatory" | Status remains `IN_PROGRESS`; error banner displayed |
| **TEST-014** | Successful Resolution | Ticket in `IN_PROGRESS` | Supervisor uploads valid post-repair photo and remarks, sets `RESOLVED` | Status updates to `RESOLVED`; citizen receives push alert; 48-hour dispute timer starts | Record inserted in `resolution_evidence`; timeline step 5 checked |
| **TEST-015** | Citizen Dispute ($\le 48$h) | Ticket resolved 12h ago | Citizen taps "Dispute & Reopen", provides reason and counter-photo | Ticket status transitions to `REOPENED`; supervisor alerted of contested resolution | Status in DB is `REOPENED`; dispute record saved |
| **TEST-016** | Dispute Auto-Close ($> 48$h) | Ticket resolved 49h ago | Background timer evaluates resolved tickets past 48 hours | Ticket status transitions automatically to `CLOSED`; dispute button disabled | Status in DB is `CLOSED`; final SLA metrics recorded |
| **TEST-017** | RLS Citizen Elevation | Citizen token active | Citizen dispatches `PATCH /reports/:id` attempting to change status to `RESOLVED` | Supabase RLS rejects query with permission denied; status unchanged in database | HTTP 403 Forbidden; zero changes to database |
| **TEST-018** | RLS Profile Privacy | Citizen A authenticated | Citizen A queries `GET /profiles/:id_of_citizen_B` | RLS policy restricts read; returns only own profile or redacts sensitive contact info | PII (phone, email) masked; cannot view other user's profile |
| **TEST-019** | Media Magic Bytes Check | Citizen upload endpoint | Upload PHP script renamed as `pothole.jpg` containing malicious payload | Media sanitizer inspects magic bytes; rejects file with HTTP 400 | File rejected; zero bytes written to storage |
| **TEST-020** | Media Size Limit | Citizen upload endpoint | Attempt to upload 12MB raw uncompressed photo | Presign request rejected with HTTP 400: "File size exceeds 8MB limit" | Upload URL not generated |
| **TEST-021** | Rate Limiting | Authenticated citizen | Script sends 8 report creation requests in 3 minutes | Initial 5 succeed; 6th request rejected with HTTP 429 Too Many Requests | RateLimit headers returned; account throttled |
| **TEST-022** | Offline Report Caching | Device in Airplane Mode | Capture photo, enter text, tap "Submit Report" while offline | App catches network failure; stores draft in SQLite; displays "1 report queued offline" | Draft persisted across app restarts; auto-syncs when online |
| **TEST-023** | Offline Auto-Sync | App with queued draft | Disable Airplane Mode; cellular connection restored | NetInfo listener detects online event; triggers background sync worker | Queued report uploaded; push notification confirms ID #CC20241026 |
| **TEST-024** | Admin Geospatial Map | Admin on Screen 9 | Filter by category "Pothole" and severity "High" | Map renders red pins; clicking pin opens popup with thumbnail, ID, and "View Details" | Mapbox renders $< 1.0\text{s}$; pin click opens Drawer |
| **TEST-025** | Inter-Dept Reassign | Supervisor in Drawer | Select "Reassign Department" $\rightarrow$ "Water Supply" with mandatory reason | Ticket department updated; transfer logged in `audit_logs`; Water Supply supervisor notified | Audit log created; ticket moves to Water Supply queue |
| **TEST-026** | Simultaneous Admin Edits | 2 Admins edit same ticket | Admin A updates status to `IN_PROGRESS`; Admin B attempts update | Optimistic concurrency check (version/timestamp) notifies Admin B of concurrent change | Stale overwrite prevented; Admin B prompted to refresh |
| **TEST-027** | Audit Immutability | Super Admin database session | Execute `DELETE FROM public.audit_logs WHERE id = ...` | Database trigger `trg_protect_audit_logs` fires; raises exception | SQL execution fails; audit records intact |
| **TEST-028** | Citizen Account Deletion | Citizen requests deletion | Call `DELETE /api/v1/profiles/me` | Profile anonymized (`deleted_user_xyz`); report foreign keys detached; PII wiped | DPDP compliant; historical public reports retained |
| **TEST-029** | Push Notification Delivery | Mobile app in background | Admin marks ticket `ASSIGNED` | Expo Push service delivers system notification to device status bar | Push notification arrives $< 3.0\text{s}$; tap opens report |
| **TEST-030** | KPI Dashboard Metrics | Admin on Screen 8 | Add 10 new reports; query `GET /admin/dashboard/summary` | KPI counters (`Total`, `Pending`, `In Progress`, `Resolved`) reflect exact database sums | Metrics match SQL aggregates exactly |

---

### 5. Automated E2E Test Scenarios (Playwright / Maestro)

#### Scenario E2E-01: Complete Citizen Intake to Resolution Loop
1. Citizen registers via mobile app with test phone number `+91 9800000001`.
2. Citizen captures pothole photo on simulated camera, enters `"Deep pothole on MG Road"`.
3. AI classification validates as `POTHOLE` (High Severity).
4. Citizen submits; receives tracking ID `#CC20241026`.
5. Playwright web test logs into Admin Dashboard as Supervisor.
6. Supervisor finds `#CC20241026`, assigns to field worker, changes status to `IN_PROGRESS`.
7. Mobile app verifies timeline reflects `In Progress` within 1 second.
8. Supervisor uploads resolution photo, sets status to `RESOLVED`.
9. Mobile app receives push alert, opens feedback modal, submits 5-star rating.
10. Database confirms ticket reaches `CLOSED` state.

---
*Next Document: [Document 11 — Development Roadmap and Task Breakdown](file:///d:/SOURCE%20CODE/BUSINESS/CIVIC%20CARE/docs/11_DEVELOPMENT_ROADMAP_AND_TASK_BREAKDOWN.md)*
