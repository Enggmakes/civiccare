# Document 12 — Repository Structure and Developer Setup
## CivicCare: Monorepo Architecture, Local Development Workflow, Docker Compose, and Environment Configuration

---

### 1. Document Control & Metadata
- **Document Identifier:** CIVIC-DEV-012
- **Status:** Approved Engineering Workspace Specification
- **Version:** 1.0.0
- **Monorepo Tooling:** Turborepo 2.0+ with pnpm Workspaces
- **Primary Runtime Versions:** Node.js 20 LTS, Python 3.10+, Docker Engine 24+, Expo CLI 51+

---

### 2. Monorepo Directory Architecture

CivicCare adopts a unified **Turborepo monorepo** layout. This ensures strict type safety across client and server boundaries, atomic multi-package commits, and shared design tokens.

```text
civic-care/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                 # Lint, Type-check, Unit Tests on PR
│   │   ├── cd-api.yml             # Docker build & push to AWS ECR
│   │   └── cd-admin.yml           # Vercel production deployment
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── dependabot.yml
├── apps/
│   ├── mobile/                    # Citizen Mobile App (React Native / Expo 51)
│   │   ├── app/                   # Expo Router file-based routes
│   │   │   ├── (auth)/            # Login, OTP verification
│   │   │   ├── (tabs)/            # Home, Reports, Map, Profile
│   │   │   └── report/            # Camera capture, AI review, Timeline
│   │   ├── assets/                # App icons, splash screens, vector illustrations
│   │   ├── components/            # Mobile-specific UI components
│   │   ├── hooks/                 # useLocation, useCamera, useReports
│   │   ├── services/              # API clients, Supabase realtime subscriptions
│   │   ├── app.json               # Expo configuration & hardware permissions
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── admin/                     # Municipal Admin Web Dashboard (React 18 / Vite)
│   │   ├── src/
│   │   │   ├── assets/            # Logos, municipal crests
│   │   │   ├── components/        # Sidebar, KPI cards, Drawer, Modals
│   │   │   ├── pages/             # Dashboard, ReportsTable, MapView, Analytics
│   │   │   ├── hooks/             # useReportFilters, useAdminStats
│   │   │   ├── services/          # REST API integration, WebSocket listeners
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   └── package.json
│   │
│   ├── api/                       # Application API Gateway (Node.js 20 / Express)
│   │   ├── src/
│   │   │   ├── controllers/       # ReportController, AuthController, AdminController
│   │   │   ├── middleware/        # authMiddleware, rateLimiter, errorHandler
│   │   │   ├── routes/            # /api/v1/reports, /api/v1/admin, /api/v1/ai
│   │   │   ├── services/          # AIClientService, RoutingEngine, S3StorageService
│   │   │   ├── utils/             # TicketGenerator, GeoUtils
│   │   │   └── server.ts
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── ai-service/                # AI Inference Microservice (Python 3.10 / FastAPI)
│       ├── app/
│       │   ├── api/               # /internal/v1/predict, /health
│       │   ├── models/            # YOLOv8 PyTorch & ONNX weights loader
│       │   ├── pipeline/          # cv_detector.py, nlp_parser.py, deduplicator.py
│       │   └── core/              # config.py, logger.py
│       ├── weights/               # Pretrained weights (yolov8n_civiccare.onnx)
│       ├── requirements.txt
│       ├── Dockerfile
│       └── main.py
│
├── packages/
│   ├── types/                     # Shared TypeScript interfaces & DTOs
│   │   ├── src/
│   │   │   ├── models.ts          # Report, Department, Profile, Image
│   │   │   ├── enums.ts           # StatusEnum, SeverityEnum, RoleEnum
│   │   │   └── api.ts             # Request & Response payload schemas
│   │   └── package.json
│   │
│   ├── ui/                        # Shared Design System Tokens & Primitives
│   │   ├── src/
│   │   │   ├── colors.ts          # CivicCare palette tokens matching image.png
│   │   │   ├── typography.ts
│   │   │   └── spacing.ts
│   │   └── package.json
│   │
│   └── database/                  # Supabase PostgreSQL Migrations & Seed Data
│       ├── migrations/            # 001_initial_schema.sql, 002_rls_policies.sql
│       ├── seeds/                 # 001_departments.sql, 002_categories.sql
│       └── config.toml
│
├── docs/                          # Comprehensive Technical Documentation Package
│   ├── README.md                  # Master Documentation Index
│   ├── 01_PRODUCT_REQUIREMENTS_DOCUMENT.md
│   └── ... (Documents 01 through 15)
│
├── docker-compose.yml             # Local multi-container development environment
├── turbo.json                     # Turborepo task pipeline configuration
├── pnpm-workspace.yaml            # pnpm workspace package definitions
├── package.json                   # Root scripts
└── README.md
```

---

### 3. Local Development Prerequisites

Developers must have the following tools installed locally:
1. **Node.js:** `v20.x LTS` (Manage via `nvm` or `fnm`)
2. **pnpm:** `v9.x` (`corepack enable && corepack prepare pnpm@latest --activate`)
3. **Python:** `v3.10.x` or `v3.11.x` with `pip` and `virtualenv`
4. **Docker Desktop:** Version 24+ with Compose v2 enabled
5. **Supabase CLI:** (`npm install -g supabase`)
6. **Expo Go App:** Installed on a physical iOS or Android testing device (or Android Studio / Xcode Simulator)

---

### 4. Environment Variables Configuration

Create `.env` files in respective application directories based on the templates below.

#### 4.1 Node.js API Gateway (`apps/api/.env`)
```bash
# Server Port & Runtime
PORT=4000
NODE_ENV=development

# Supabase Managed Database & Auth
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Backend Only!
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Internal AI Microservice Network
AI_SERVICE_URL=http://localhost:8000
AI_INTERNAL_SECRET=dev_internal_shared_secret_123

# External Geocoding & Map Services
MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiZGV2LXVzZXIiLCJhIjoiY2x...

# Storage Bucket Names
SUPABASE_STORAGE_BUCKET=report-images
```

#### 4.2 Python AI Service (`apps/ai-service/.env`)
```bash
PORT=8000
ENVIRONMENT=development
MODEL_WEIGHTS_PATH=./weights/yolov8n_civiccare.onnx
DEVICE=cpu # 'cuda' for GPU, 'cpu' for local testing
INTERNAL_AUTH_KEY=dev_internal_shared_secret_123
CONFIDENCE_THRESHOLD=0.60
```

#### 4.3 Citizen Mobile App (`apps/mobile/.env`)
```bash
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
EXPO_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiZGV2LXVzZXIiLCJhIjoiY2x...
```

#### 4.4 Admin Web Dashboard (`apps/admin/.env`)
```bash
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=http://localhost:4000/api/v1
VITE_MAPBOX_TOKEN=pk.eyJ1IjoiZGV2LXVzZXIiLCJhIjoiY2x...
```

---

### 5. Local Docker Compose Architecture (`docker-compose.yml`)

The root `docker-compose.yml` provides a completely isolated, reproducible local environment simulating cloud infrastructure.

```yaml
version: '3.8'

services:
  # Python AI Inference Microservice
  ai-service:
    build:
      context: ./apps/ai-service
      dockerfile: Dockerfile
    container_name: civiccare-ai-service
    ports:
      - "8000:8000"
    environment:
      - PORT=8000
      - DEVICE=cpu
      - INTERNAL_AUTH_KEY=dev_internal_shared_secret_123
    volumes:
      - ./apps/ai-service:/app
    networks:
      - civiccare-net

  # Node.js API Gateway
  api-gateway:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    container_name: civiccare-api-gateway
    ports:
      - "4000:4000"
    environment:
      - PORT=4000
      - NODE_ENV=development
      - AI_SERVICE_URL=http://ai-service:8000
      - AI_INTERNAL_SECRET=dev_internal_shared_secret_123
    depends_on:
      - ai-service
    volumes:
      - ./apps/api:/app
      - /app/node_modules
    networks:
      - civiccare-net

networks:
  civiccare-net:
    driver: bridge
```

---

### 6. Step-by-Step Developer Setup Guide

```bash
# 1. Clone the repository
git clone https://github.com/civiccare/civic-care.git
cd civic-care

# 2. Install monorepo dependencies across all packages
pnpm install

# 3. Start local Supabase infrastructure (Postgres, PostGIS, Auth, S3 Storage)
supabase start

# 4. Apply database migrations and seed municipal departments
supabase db reset

# 5. Launch the AI microservice and API gateway via Docker Compose
docker compose up -d

# 6. Start development servers across the monorepo concurrently
pnpm dev
```

#### Selective Independent Development:
- **Frontend / UI Engineers:** Can develop the Mobile App (`pnpm --filter mobile dev`) or Admin Web (`pnpm --filter admin dev`) independently using mock API handlers without launching the Python AI service.
- **AI / ML Engineers:** Can work exclusively in `apps/ai-service` using Python virtual environment (`python -m venv venv && source venv/bin/activate && pip install -r requirements.txt`).
- **Backend Engineers:** Can test API logic against local Supabase containers (`pnpm --filter api dev`).

---

### 7. Git Workflow & Engineering Hygiene

- **Branching Convention:**
  - `feature/FR-xxx-feature-title`
  - `fix/BUG-xxx-issue-title`
  - `refactor/CIVIC-xxx-description`
- **Conventional Commits Enforced via Husky & Commitlint:**
  - `feat(mobile): implement camera viewfinder and photo preview (FR-005)`
  - `fix(api): resolve spatial bounding box check in PostGIS radius query (BUG-012)`
  - `docs(prd): update SLA dispute window from 24h to 48h`
- **Automated Pre-commit Hooks:** Runs Prettier, ESLint, and TypeScript compiler check prior to permitting any commit.

---
*Next Document: [Document 13 — Deployment, Cost, and Operations](file:///d:/SOURCE%20CODE/BUSINESS/CIVIC%20CARE/docs/13_DEPLOYMENT_COST_AND_OPERATIONS.md)*
