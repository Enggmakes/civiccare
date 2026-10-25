# Document 04 — Technical Architecture
## CivicCare: Distributed System Architecture, C4 Models, Service Boundaries, and Integration Topology

---

### 1. Document Control & Metadata
- **Document Identifier:** CIVIC-ARCH-004
- **Status:** Approved Architectural Blueprint
- **Version:** 1.0.0
- **Author:** Lead Systems Architect
- **Primary Technical Scope:** Microservice boundaries, authentication topology, PostGIS data flows, AI inference pipeline, and cloud deployment topology.

---

### 2. Architectural Paradigm & System Overview

CivicCare is architected around a **Decoupled Edge-First Cloud Architecture**. The system separates compute-heavy deep learning inference from high-concurrency transactional API workflows and geospatial database queries.

```mermaid
graph TB
    subgraph "Clients"
        RN[Citizen Mobile App<br/>React Native / Expo 51]
        WEB[Municipal Web Dashboard<br/>React 18 / Vite / TS]
    end

    subgraph "Edge / Ingress Layer"
        CF[Cloudflare CDN & WAF]
        GW[API Gateway / Node.js Express<br/>Reverse Proxy & Rate Limiter]
    end

    subgraph "Application Core (Node.js 20 LTS)"
        SVC_REP[Reports & Triage Service]
        SVC_ROUT[Routing & SLA Engine]
        SVC_NOTIF[Notification Service]
        SVC_AUDIT[Audit Log Engine]
    end

    subgraph "AI / ML Microservice (Python 3.10 / FastAPI)"
        AI_GW[FastAPI Asynchronous Gateway]
        CV_ENG[YOLOv8 Vision Classifier & Box Detector]
        NLP_ENG[DistilBERT Text Classifier & Urgency Parser]
        DEDUP_ENG[Spatial-Temporal & Cosine Similarity Deduplicator]
    end

    subgraph "Managed Data & Storage Layer (Supabase Cloud)"
        AUTH[Supabase Auth Service]
        PG[(PostgreSQL 15 + PostGIS Spatial DB)]
        STORAGE[Supabase S3-Compatible Object Storage]
        REALTIME[Supabase Realtime WebSockets]
    end

    subgraph "External Cloud Providers"
        EXPO_NOTIF[Expo Push Notification Service]
        MAP_TILES[Mapbox / OpenStreetMap Vector Tiles]
        SMS_GW[Twilio / MSG91 SMS Gateway]
    end

    RN -->|TLS 1.3 REST| CF
    WEB -->|TLS 1.3 REST| CF
    CF --> GW
    GW --> SVC_REP
    GW --> SVC_ROUT
    GW --> SVC_NOTIF
    GW --> SVC_AUDIT

    SVC_REP -->|Internal HTTP / mTLS| AI_GW
    AI_GW --> CV_ENG
    AI_GW --> NLP_ENG
    AI_GW --> DEDUP_ENG

    SVC_REP -->|Prisma / pg Pooler| PG
    SVC_ROUT -->|Spatial Queries ST_DWithin| PG
    SVC_NOTIF --> EXPO_NOTIF
    SVC_NOTIF --> SMS_GW

    RN -.->|Direct Signed URL Upload| STORAGE
    WEB -.->|Direct Signed URL Upload| STORAGE
    RN -.->|WebSocket wss://| REALTIME
    WEB -.->|WebSocket wss://| REALTIME
    PG -.->|WAL Replication CDC| REALTIME
    AUTH -.->|JWT Bearer Token| GW
```

---

### 3. C4 Architectural Blueprint

#### 3.1 C4 Level 1: System Context Diagram
The System Context diagram illustrates how external actors interact with the CivicCare software boundary.

```mermaid
graph LR
    Cit[Citizen Commuter] -->|Reports issues, tracks status, rates repairs| CC[CivicCare Platform]
    Staff[Municipal Field Worker] -->|Inspects tasks, uploads resolution photos| CC
    Sup[Department Supervisor] -->|Triage, assigns workers, reassigns tickets| CC
    Admin[Municipal Super Admin] -->|Monitors city analytics, manages users| CC

    CC -->|Sends push alerts| ExpoPush[Expo Push Service]
    CC -->|Fetches reverse geocoding & tiles| MapSvc[Mapbox Geocoding & Vector Tiles]
    CC -->|Sends OTPs| SMSProvider[SMS Gateway Provider]
```
*Plain-Language Summary:* Citizens interface via mobile devices to upload evidence and receive real-time updates. Municipal staff and supervisors use web portals to inspect, assign, and resolve tickets. CivicCare interfaces with external mapping, push notification, and SMS infrastructure to provide location context and timely alerts.

#### 3.2 C4 Level 2: Container Diagram
The Container diagram breaks down the executable units running across the infrastructure.

```mermaid
graph TB
    subgraph MobileContainer["Mobile Client (Expo / React Native)"]
        UI_RN[React Native Views]
        STATE_RN[Zustand Local Store]
        OFFLINE_CACHE[AsyncStorage / SQLite Offline Queue]
        UI_RN --> STATE_RN
        STATE_RN --> OFFLINE_CACHE
    end

    subgraph WebContainer["Web Client (React / Vite)"]
        UI_WEB[React SPA]
        MAP_WEB[Mapbox GL JS Map View]
        STATE_WEB[TanStack Query Cache]
        UI_WEB --> STATE_WEB
        UI_WEB --> MAP_WEB
    end

    subgraph BackendGateway["Node.js Application Gateway (Express / TypeScript)"]
        AUTH_MW[JWT Auth Middleware & RBAC]
        RATE_MW[Express Rate Limiter]
        ROUTERS[REST API Endpoints /api/v1/*]
        AUTH_MW --> RATE_MW --> ROUTERS
    end

    subgraph AIService["AI Inference Microservice (FastAPI / Python)"]
        API_AI[FastAPI Router]
        MODEL_CV[Ultralytics YOLOv8 PyTorch Weights]
        MODEL_NLP[Text Transformer Embeddings]
        API_AI --> MODEL_CV
        API_AI --> MODEL_NLP
    end

    subgraph DatabaseContainer["Database & Storage (Supabase)"]
        SUPA_AUTH[Supabase GoTrue Auth]
        SUPA_PG[(PostgreSQL 15 + PostGIS Extensions)]
        SUPA_S3[S3-Compatible Object Storage]
        SUPA_RT[Elixir Realtime Server]
    end

    UI_RN -->|HTTPS| AUTH_MW
    UI_WEB -->|HTTPS| AUTH_MW
    ROUTERS -->|Internal mTLS| API_AI
    ROUTERS -->|TCP Port 5432| SUPA_PG
    UI_RN -->|Direct Presigned PUT| SUPA_S3
    UI_WEB -->|Direct Presigned PUT| SUPA_S3
    UI_RN -->|WSS| SUPA_RT
    UI_WEB -->|WSS| SUPA_RT
    SUPA_PG -->|Logical Replication| SUPA_RT
```
*Plain-Language Summary:* The client applications communicate with a secure Node.js API Gateway that handles business logic, authorization, and database transactions. The Node.js service calls a dedicated Python FastAPI service for AI inference. High-volume media uploads bypass the application server, streaming directly to Supabase S3 storage via pre-signed URLs.

---

### 4. Authentication Architecture: Clerk vs. Supabase Auth Comparison

The prompt requires a rigorous architectural comparison between **Clerk** and **Supabase Auth** before finalizing the system baseline.

| Architectural Evaluation Criteria | Clerk Authentication | Supabase Auth (GoTrue) |
| :--- | :--- | :--- |
| **Native Database Integration** | External provider. Requires webhook listeners (`user.created`, `user.updated`) and a custom sync worker to maintain local PostgreSQL `profiles` records. | **Native.** Automatically populates `auth.users` inside PostgreSQL; perfectly syncs with `public.profiles` via database triggers. |
| **Row Level Security (RLS)** | High complexity. PostgreSQL RLS relies on `auth.uid()`. Integrating Clerk requires custom JWT signing keys and setting session variables (`request.jwt.claims`) per connection. | **Zero Overhead.** Seamless out-of-the-box RLS integration. `auth.uid()` and custom app claims are natively evaluated by the Postgres engine. |
| **Mobile SDK Support (Expo)** | Excellent drop-in UI components, but heavily web-oriented; native Expo SDK requires OAuth web browser popups. | Robust `@supabase/supabase-js` client with native AsyncStorage session persistence and mobile SMS OTP. |
| **Pricing & Scaling Constraints** | Free tier capped at 10,000 Monthly Active Users (MAUs). Overage fees apply ($0.02 to $0.05 per active user thereafter). | Free tier includes 50,000 MAUs. Pro tier is flat $25/month for 100,000 MAUs with unlimited database capabilities. |
| **Realtime Token Propagation** | Requires dual-token lifecycle management: Clerk JWT for API calls, secondary Supabase token for Realtime subscriptions. | Unified JWT token used across Database queries, Storage upload policies, and Realtime WebSocket subscriptions. |
| **Operational Attack Surface** | Two vendor security surfaces and third-party webhook failure risks. | Single cohesive security boundary within Supabase Cloud. |

#### Architectural Recommendation & Decision:
**Selected Baseline: Supabase Auth.**
*Justification:* CivicCare relies heavily on PostgreSQL Row-Level Security (RLS) policies to isolate citizen data, restrict status transitions, and enforce municipal role boundaries. Supabase Auth natively binds JWT identity directly to `auth.uid()` at the database engine level without webhook latency, external synchronization failures, or multi-token mismatch issues during Realtime WebSocket subscriptions.

---

### 5. Media Ingestion & Secure Upload Architecture

To prevent API gateway memory saturation from multi-megabyte citizen photographs, CivicCare implements an **Asynchronous Direct Pre-signed Storage Pattern**.

```mermaid
sequenceDiagram
    autonumber
    actor Client as Mobile Client (Expo)
    participant API as Node.js Gateway
    participant Storage as Supabase Storage (S3)
    participant DB as PostgreSQL
    participant AI as FastAPI Service

    Client->>API: POST /api/v1/uploads/presign (file_type="image/jpeg", size=2458900)
    API->>API: Validate file size (max 8MB), mime type (JPEG/PNG/WebP)
    API->>API: Generate secure UUID path: "reports/pending/d8e7a6...jpg"
    API->>Storage: Create Presigned Upload URL (TTL: 10 minutes)
    Storage-->>API: Presigned PUT URL + Temporary Token
    API-->>Client: 200 OK { upload_url, object_key, expires_at }

    Client->>Storage: PUT binary stream directly to presigned URL
    Storage-->>Client: 200 OK (Upload Verified)

    Client->>API: POST /api/v1/ai/analyze { object_key, latitude, longitude, description }
    API->>AI: POST /internal/v1/predict { s3_key: object_key, text: description }
    AI->>Storage: Fetch image stream for inference
    AI-->>API: Return { category: "POTHOLE", confidence: 0.94, severity: "HIGH" }
    API-->>Client: Return Analysis Results for Citizen Confirmation
```

#### Key Architecture Safeguards:
1. **Zero Gateway Proxying:** Images never stream through the Node.js API process, preventing heap memory exhaustion under peak incident surges.
2. **Strict MIME & Magic Byte Validation:** Supabase Storage bucket policies reject files failing image header signatures.
3. **Private Bucket Isolation:** The `report-images` bucket is completely private. Client access requires time-limited signed read URLs (max 15-minute TTL) generated dynamically.

---

### 6. AI Microservice Architecture & Fault Tolerance

The AI inference layer operates as an independent Python FastAPI microservice running inside an isolated Docker container.

```mermaid
graph TD
    API[Node.js Gateway] -->|Circuit Breaker Timeout 3.0s| FASTAPI[FastAPI AI Service]
    
    subgraph "FastAPI Internal Execution Pipeline"
        FASTAPI --> RESIZE[OpenCV Image Resizing & Normalization 640x640]
        RESIZE --> YOLO[Ultralytics YOLOv8 PyTorch Inference]
        YOLO --> BBOX[Bounding Box Extractor & Class Filter]
        
        FASTAPI --> NLP_PRE[NLP Tokenizer & Keyword Cleaner]
        NLP_PRE --> NLP_MODEL[Text Classification Model]
        
        BBOX --> FUSION[Decision Fusion Engine]
        NLP_MODEL --> FUSION
        FUSION --> SEV[Severity Scoring Heuristic]
    end

    FUSION -->|JSON Results| API
    
    FASTAPI -.->|If Timeout or Exception| FALLBACK[Circuit Breaker Fallback]
    FALLBACK -->|Category: 'OTHERS', Needs Human Review| API
```

#### Circuit Breaker & Graceful Degradation Rules:
- **Execution Budget:** Maximum inference execution window is $3,000\text{ ms}$.
- **Fallback Trigger:** If FastAPI takes $> 3,000\text{ ms}$ or returns HTTP 500, the Node.js API automatically falls back to an unverified submission state (`ai_processed = false`, `category = OTHERS`).
- **Asynchronous Reconciliation:** A BullMQ background worker polls unprocessed tickets every 60 seconds and retries inference once the AI service capacity normalizes.

---

### 7. Realtime Synchronization & Event-Driven Architecture

CivicCare utilizes PostgreSQL Write-Ahead Log (WAL) Logical Replication via Supabase Realtime to push live events to mobile and web clients without polling.

```mermaid
graph LR
    subgraph "Database Transaction"
        DB_UPDATE[PostgreSQL UPDATE reports SET status = 'IN_PROGRESS']
        WAL[PostgreSQL WAL Log]
        DB_UPDATE --> WAL
    end

    subgraph "Supabase Realtime Cluster"
        CDC[Change Data Capture Worker]
        WAL --> CDC
        CDC --> CH[Broadcast Channel: 'report:CC20241026']
    end

    subgraph "Subscribers"
        CH -->|WebSocket Event| MOB[Citizen Mobile App: Updates Timeline Pulse]
        CH -->|WebSocket Event| WEB[Admin Web App: Updates Triage Counter]
        CH -->|Webhook Event| NOTIF_SVC[Push Notification Worker: Sends Expo Push]
    end
```

---

### 8. Environmental Topology & Infrastructure Specifications

| Infrastructure Layer | Development Environment | Staging Environment | Production Environment |
| :--- | :--- | :--- | :--- |
| **Mobile App (Expo)** | Expo Go / Local Dev Client | Expo EAS Internal Preview Build | iOS App Store & Google Play Store |
| **Admin Web App** | Vite Dev Server (`localhost:5173`) | Vercel Preview Deployment | Vercel Production Custom Domain with Cloudflare WAF |
| **Node.js API Gateway** | Local Node 20 (`localhost:4000`) | Render / Railway Staging Service | AWS ECS Fargate Container Cluster (Auto-scaling 2–8 tasks) |
| **Python AI Microservice** | Local Python 3.10 FastAPI (`localhost:8000`) | Render GPU / Docker Staging | AWS ECS Fargate or RunPod / Modal GPU Server |
| **PostgreSQL & Storage** | Supabase Local CLI (Docker) | Supabase Cloud Pro Staging Project | Supabase Cloud Pro Production with PostGIS & Daily Backups |

---
*Next Document: [Document 05 — Database Schema and Data Dictionary](file:///d:/SOURCE%20CODE/BUSINESS/CIVIC%20CARE/docs/05_DATABASE_SCHEMA_AND_DATA_DICTIONARY.md)*
