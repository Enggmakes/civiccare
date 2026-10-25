# Document 06 — API Specification
## CivicCare: RESTful Application Interface, Schemas, Authentication Contracts, and Error Taxonomy

---

### 1. Document Control & Metadata
- **Document Identifier:** CIVIC-API-006
- **Status:** Approved Interface Specification
- **Version:** 1.0.0
- **Base URL (Production):** `https://api.civiccare.gov.in/api/v1`
- **Base URL (Local Dev):** `http://localhost:4000/api/v1`
- **Protocol:** HTTPS (TLS 1.3 enforced)
- **Content-Type:** `application/json` (except media presigning)

---

### 2. Global Authentication, Authorization & Security Headers

#### 2.1 Authentication Scheme
All protected endpoints require a valid Supabase JWT Bearer token passed in the standard `Authorization` HTTP header:
```http
Authorization: Bearer <supabase_jwt_token>
```
The Node.js Gateway verifies token validity, signature, and expiration using the Supabase JWT secret or public JWKS endpoint.

#### 2.2 Security & Rate Limiting Headers
Every API response returns standard security and rate limiting headers:
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
RateLimit-Limit: 120
RateLimit-Remaining: 118
RateLimit-Reset: 1730000000
```
- **Citizen Endpoints:** 60 requests / minute per IP / User ID.
- **Admin Endpoints:** 180 requests / minute per User ID.
- **AI Inference Endpoints:** 10 requests / minute per User ID (abuse prevention).

---

### 3. Error Response Taxonomy

All non-2xx responses strictly conform to RFC 7807 Problem Details:

```json
{
  "status": 422,
  "error_code": "VALIDATION_FAILED",
  "message": "The provided coordinates are outside the municipal boundary.",
  "details": [
    {
      "field": "latitude",
      "issue": "Latitude 28.6139 is outside the Municipal Corporation of Greater Mumbai polygon boundary."
    }
  ],
  "timestamp": "2024-10-26T10:30:15.123Z",
  "trace_id": "req-9b8c7d6e-5f4a"
}
```

---

### 4. API Endpoint Matrix

| Endpoint ID | HTTP Method & Route | Purpose | Role Authorization |
| :--- | :--- | :--- | :--- |
| **API-001** | `POST /auth/sync-profile` | Synchronize user metadata upon sign-in | `CITIZEN`, `STAFF`, `ADMIN` |
| **API-002** | `GET /profiles/me` | Fetch authenticated user profile & preferences | Authenticated User |
| **API-003** | `POST /uploads/presign` | Request pre-signed S3 upload URL for photos | Authenticated User |
| **API-004** | `POST /ai/analyze` | Request pre-submission AI category/severity review | `CITIZEN` |
| **API-005** | `POST /reports` | Lodge a new civic issue report | `CITIZEN` |
| **API-006** | `GET /reports/my` | List reports filed by the authenticated citizen | `CITIZEN` |
| **API-007** | `GET /reports/nearby` | Fetch nearby reports within spatial radius | Public / Authenticated |
| **API-008** | `GET /reports/:id` | Fetch full ticket details, images & timeline | Public / Authenticated |
| **API-009** | `POST /reports/duplicate-check` | Query spatial duplicate candidates within 50m | `CITIZEN`, `STAFF` |
| **API-010** | `POST /reports/:id/upvote` | Upvote an existing report (duplicate suppression) | `CITIZEN` |
| **API-011** | `GET /admin/reports` | Tabular paginated report listing with filters | `STAFF`, `SUPERVISOR`, `ADMIN` |
| **API-012** | `PATCH /admin/reports/:id/status` | Update ticket workflow status & remarks | `STAFF`, `SUPERVISOR`, `ADMIN` |
| **API-013** | `PATCH /admin/reports/:id/assign` | Assign ticket to department or field crew | `DEPT_SUPERVISOR`, `SUPER_ADMIN` |
| **API-014** | `POST /admin/reports/:id/resolve` | Upload mandatory resolution proof & resolve | `FIELD_WORKER`, `SUPERVISOR` |
| **API-015** | `POST /reports/:id/feedback` | Submit citizen rating or contest resolution | `CITIZEN` (Report Owner) |
| **API-016** | `GET /admin/dashboard/summary` | Fetch top-level dashboard KPI statistics | `DEPT_SUPERVISOR`, `SUPER_ADMIN` |
| **API-017** | `GET /admin/analytics/trends` | Fetch 7-day intake vs. resolution trends | `DEPT_SUPERVISOR`, `SUPER_ADMIN` |
| **API-018** | `GET /admin/reports/geospatial` | Fetch clustered GeoJSON points for Map View | `STAFF`, `SUPERVISOR`, `ADMIN` |
| **API-019** | `GET /notifications` | List user notification inbox | Authenticated User |
| **API-020** | `GET /admin/audit-logs` | Fetch immutable audit trail for compliance | `SUPER_ADMIN` |

---

### 5. Detailed Endpoint Contracts

#### 5.1 API-003: Request Presigned Upload URL
- **Route:** `POST /uploads/presign`
- **Description:** Generates a secure, temporary pre-signed PUT URL to stream image bytes directly to Supabase S3 storage without passing through the Node.js API process.
- **Request Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "content_type": "image/jpeg",
  "file_size_bytes": 2458900,
  "upload_context": "REPORT_INTAKE" // 'REPORT_INTAKE' | 'RESOLUTION_PROOF'
}
```
- **Response `200 OK`:**
```json
{
  "upload_url": "https://xyz.supabase.co/storage/v1/object/upload/sign/report-images/temp/d8e7a6b5.jpg?token=eyJhbG...",
  "storage_path": "temp/d8e7a6b5.jpg",
  "expires_in_seconds": 600
}
```
- **Errors:**
  - `400 BAD_REQUEST`: File size exceeds 8MB or unsupported MIME type (only JPEG, PNG, WebP allowed).

---

#### 5.2 API-004: Asynchronous Pre-Submission AI Review
- **Route:** `POST /ai/analyze`
- **Description:** Triggers computer vision and NLP inference on an uploaded image artifact to provide immediate feedback on Screen 5 before citizen finalizes submission.
- **Request Body:**
```json
{
  "storage_path": "temp/d8e7a6b5.jpg",
  "latitude": 19.1197,
  "longitude": 72.8397,
  "description": "Large pothole on the main road near city mall. It is causing problems for vehicles."
}
```
- **Response `200 OK`:**
```json
{
  "category_predicted": "POTHOLE",
  "confidence": 0.942,
  "severity_estimated": "HIGH",
  "bounding_boxes": [
    {
      "box_2d": [0.32, 0.28, 0.74, 0.81],
      "label": "pothole",
      "score": 0.942
    }
  ],
  "nlp_keywords": ["large pothole", "main road", "vehicles hazard"],
  "duplicate_candidates_count": 0,
  "suggested_department": "Road Maintenance Department"
}
```
- **Errors:**
  - `404 NOT_FOUND`: Temporary image path does not exist in storage.
  - `504 GATEWAY_TIMEOUT`: AI service inference exceeded 3.0s (falls back to category `OTHERS`).

---

#### 5.3 API-005: Create Civic Report
- **Route:** `POST /reports`
- **Description:** Finalizes report creation, moves image from temporary to permanent storage, inserts database record, routes to department, and returns unique tracking ID `#CC20241026`.
- **Request Body:**
```json
{
  "category_code": "POTHOLE",
  "title": "Pothole on MG Road",
  "description": "Large pothole on the main road near city mall. It is causing problems for vehicles.",
  "latitude": 19.1197,
  "longitude": 72.8397,
  "formatted_address": "MG Road, Andheri West, Mumbai, Maharashtra",
  "storage_paths": [
    "temp/d8e7a6b5.jpg"
  ],
  "ai_confidence": 0.942,
  "user_overridden_category": false
}
```
- **Response `201 Created`:**
```json
{
  "report_id": "d8e7a6b5-c4d3-4e2f-a1b0-9c8d7e6f5a4b",
  "ticket_number": "#CC20241026",
  "status": "SUBMITTED",
  "category": "Pothole",
  "severity": "HIGH",
  "assigned_department": "Road Maintenance Department",
  "created_at": "2024-10-26T10:30:00.000Z",
  "formatted_address": "MG Road, Andheri West, Mumbai, Maharashtra",
  "tracking_url": "/reports/d8e7a6b5-c4d3-4e2f-a1b0-9c8d7e6f5a4b"
}
```
- **Errors:**
  - `400 BAD_REQUEST`: Missing mandatory GPS coordinates or empty description.
  - `409 CONFLICT`: Exact duplicate submission within 60 seconds (idempotency key match).

---

#### 5.4 API-008: Fetch Report Details & Timeline
- **Route:** `GET /reports/:id`
- **Description:** Returns full report metadata, signed image URLs, current assignee, and complete milestone progress timeline for Screen 7 and Screen 10 in `image.png`.
- **Response `200 OK`:**
```json
{
  "report_id": "d8e7a6b5-c4d3-4e2f-a1b0-9c8d7e6f5a4b",
  "ticket_number": "#CC20241026",
  "status": "IN_PROGRESS",
  "severity": "HIGH",
  "title": "Pothole on MG Road",
  "description": "Large pothole on the main road near city mall. It is causing problems for vehicles.",
  "category": {
    "code": "POTHOLE",
    "name": "Pothole",
    "icon": "alert-circle"
  },
  "location": {
    "latitude": 19.1197,
    "longitude": 72.8397,
    "formatted_address": "MG Road, Andheri West, Mumbai, Maharashtra"
  },
  "assigned_department": {
    "id": "b3a985d2-6d43-4f51-b844-3d0d8bb00101",
    "name": "Road Maintenance Department"
  },
  "assigned_to": {
    "id": "f5e4d3c2-b1a0-4f8e-9d7c-6b5a4e3d2c1b",
    "full_name": "John D'souza"
  },
  "images": [
    {
      "id": "img-001",
      "signed_url": "https://xyz.supabase.co/storage/v1/object/sign/report-images/pothole.jpg?token=...",
      "is_primary": true
    }
  ],
  "timeline": [
    {
      "step": 1,
      "status": "SUBMITTED",
      "title": "Report Submitted",
      "timestamp": "2024-10-26T10:30:00.000Z",
      "remarks": "Your report has been received.",
      "completed": true
    },
    {
      "step": 2,
      "status": "AI_VERIFIED",
      "title": "AI Classification",
      "timestamp": "2024-10-26T10:31:00.000Z",
      "remarks": "Detected as Pothole (High Severity)",
      "completed": true
    },
    {
      "step": 3,
      "status": "ROUTED",
      "title": "Sent to Road Maintenance Dept.",
      "timestamp": "2024-10-26T10:35:00.000Z",
      "remarks": "Your report has been routed to the appropriate department.",
      "completed": true
    },
    {
      "step": 4,
      "status": "IN_PROGRESS",
      "title": "In Progress",
      "timestamp": "2024-10-26T14:15:00.000Z",
      "remarks": "Department has started working on the issue.",
      "completed": true,
      "active_pulse": true
    },
    {
      "step": 5,
      "status": "RESOLVED",
      "title": "Resolved",
      "timestamp": null,
      "remarks": "Pending physical remediation",
      "completed": false
    }
  ]
}
```

---

#### 5.5 API-012: Update Report Workflow Status & Remarks
- **Route:** `PATCH /admin/reports/:id/status`
- **Authorization:** `FIELD_WORKER`, `DEPT_SUPERVISOR`, `SUPER_ADMIN`
- **Request Body:**
```json
{
  "new_status": "IN_PROGRESS",
  "remarks": "Work started. Expected completion in 2 days.",
  "assignee_id": "f5e4d3c2-b1a0-4f8e-9d7c-6b5a4e3d2c1b"
}
```
- **Response `200 OK`:**
```json
{
  "report_id": "d8e7a6b5-c4d3-4e2f-a1b0-9c8d7e6f5a4b",
  "previous_status": "ROUTED",
  "new_status": "IN_PROGRESS",
  "updated_at": "2024-10-26T14:15:00.000Z",
  "audit_log_id": "aud-123456"
}
```

---

#### 5.6 API-014: Submit Mandatory Resolution Evidence
- **Route:** `POST /admin/reports/:id/resolve`
- **Authorization:** `FIELD_WORKER`, `DEPT_SUPERVISOR`
- **Description:** Enforces BR-003: A ticket cannot transition to `RESOLVED` without a verified post-repair photograph.
- **Request Body:**
```json
{
  "storage_path": "resolution-proof/2024/10/d8e7a6b5-post-repair.jpg",
  "resolution_remarks": "Road cavity filled with hot-mix asphalt and roller compacted.",
  "technician_signature": "John D'souza"
}
```
- **Response `200 OK`:**
```json
{
  "report_id": "d8e7a6b5-c4d3-4e2f-a1b0-9c8d7e6f5a4b",
  "status": "RESOLVED",
  "evidence_id": "evi-987654",
  "resolved_at": "2024-10-28T16:00:00.000Z",
  "dispute_deadline": "2024-10-30T16:00:00.000Z"
}
```
- **Errors:**
  - `422 UNPROCESSABLE_ENTITY`: Resolution photo missing or unreadable.

---

#### 5.7 API-016: Dashboard Overview KPI Summary
- **Route:** `GET /admin/dashboard/summary`
- **Authorization:** `DEPT_SUPERVISOR`, `SUPER_ADMIN`
- **Response `200 OK` (Matches Screen 8 in `image.png`):**
```json
{
  "kpis": {
    "total_reports": {
      "count": 1284,
      "growth_percentage": 12.0,
      "trend": "UP"
    },
    "pending": {
      "count": 342,
      "growth_percentage": 5.0,
      "trend": "UP"
    },
    "in_progress": {
      "count": 516,
      "growth_percentage": 18.0,
      "trend": "UP"
    },
    "resolved": {
      "count": 426,
      "growth_percentage": 25.0,
      "trend": "UP"
    }
  },
  "category_breakdown": [
    { "category": "Pothole", "percentage": 35, "count": 450 },
    { "category": "Garbage", "percentage": 22, "count": 282 },
    { "category": "Streetlight", "percentage": 18, "count": 231 },
    { "category": "Water Leak", "percentage": 12, "count": 154 },
    { "category": "Broken Road", "percentage": 8, "count": 103 },
    { "category": "Others", "percentage": 5, "count": 64 }
  ]
}
```

---
*Next Document: [Document 07 — AI/ML Design and Implementation](file:///d:/SOURCE%20CODE/BUSINESS/CIVIC%20CARE/docs/07_AI_ML_DESIGN_AND_IMPLEMENTATION.md)*
