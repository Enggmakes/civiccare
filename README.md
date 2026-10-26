# 🏙️ CivicCare — AI-Powered Civic Issue Reporting & Municipal Triage Platform

CivicCare is a next-generation civic grievance redressal and municipal issue reporting platform. It empowers citizens to report everyday infrastructure problems (potholes, garbage dumping, non-functioning streetlights, water leaks, and broken roads) with automated AI defect detection, instant municipal department routing, real-time GPS geolocation, and interactive map exploration.

---

## 🏗️ Repository Architecture

This repository is organized as a unified monorepo:

```text
CIVIC CARE/
├── civiccare-app/          # Mobile Citizen App (React Native, Expo SDK 52, Expo Router)
│   ├── src/
│   │   ├── app/            # File-based navigation screens (Tabs, Report Flow, Details)
│   │   ├── components/     # UI Components & design tokens
│   │   ├── constants/      # Design system, themes, and municipal color tokens
│   │   └── services/       # Supabase client, Clerk auth, and report store
│   └── assets/             # Brand logos, Flaticon 3D civic pins, and SF icons
│
├── civiccare-admin/        # Municipal Admin & Department Web Portal (React 19, TypeScript, Vite)
│   ├── src/
│   │   ├── components/     # AdminLogin, DashboardOverview, ReportsManagement, MapView, AnalyticsView, UpdateReportDrawer
│   │   ├── services/       # Live Supabase Realtime synchronization & data triage
│   │   └── types.ts        # Shared grievance, department, and SLA interfaces
│   └── public/             # Municipal headquarters banners & category icons
│
├── ai-backend/             # Real-time AI Defect Detection Microservice (FastAPI, YOLOv8, OpenCV)
│   ├── main.py             # FastAPI API with Anti-False-Positive Filter & municipal severity
│   ├── yolov8n.pt          # YOLOv8 neural network defect weights
│   └── requirements.txt    # Python dependencies (ultralytics, opencv, fastapi, uvicorn)
│
├── docs/                   # Full Technical & Engineering Documentation
│   ├── 01_PRODUCT_REQUIREMENTS_DOCUMENT.md
│   ├── 02_SYSTEM_WORKFLOWS_AND_USER_JOURNEYS.md
│   ├── 05_DATABASE_SCHEMA_AND_DATA_DICTIONARY.md
│   ├── 07_AI_ML_DESIGN_AND_IMPLEMENTATION.md
│   └── 13_DEPLOYMENT_COST_AND_OPERATIONS.md
│
└── supabase_setup.sql      # Complete PostgreSQL DDL, RLS policies, triggers & seeds
```

---

## ⚡ Core Features

1. **AI Defect Detection & Anti-False-Positive Filter:**
   - Detects civic infrastructure hazards using YOLOv8 computer vision and OpenCV surface defect analysis.
   - Rejects selfies, portraits, and indoor photos to prevent false reporting.
   - Automatically computes municipal severity scores (Low, Medium, High, Critical) based on damage extent and keywords.
   - Routes issues automatically to municipal departments (Roads, Solid Waste, Electrical & Public Lighting, Water Supply).

2. **Native Mobile App (iOS & Android):**
   - Built on React Native and Expo with Apple SF Symbols and modern floating liquid glass navigation tabs.
   - Edge-to-edge full bleed rendering with dynamic safe-area insets.
   - Camera integration with direct upload to Supabase Storage (`report-images` bucket).

3. **Interactive Civic Map Exploration:**
   - Real-time OpenStreetMap / CartoDB integration without external API key dependencies.
   - Custom 3D Flaticon teardrop pins anchored to GPS coordinates.
   - Deep zoom support with hardware acceleration (levels 1 to 20).
   - Rich incident popup preview with photo, ticket number, location, and severity badges.

4. **Cloud Database & Storage (Supabase):**
   - PostgreSQL schema with Row-Level Security (RLS) policies.
   - Milestone tracking in `report_status_history` for full civic transparency.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 18+ & npm
- Python 3.10+
- Expo Go app on iOS or Android

### 2. Set Up the Mobile App
```bash
cd civiccare-app
npm install
npx expo start
```

### 3. Set Up the Municipal Admin Portal
```bash
cd civiccare-admin
npm install
npm run dev
# Serving on http://localhost:3000 / http://localhost:3001
```

### 4. Set Up the AI Microservice
```bash
cd ai-backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Database Setup
Execute `supabase_setup.sql` in the **SQL Editor** of your Supabase project dashboard to create tables, storage buckets, RLS policies, and seed municipal departments.

---

## 📄 License
This project is open-source under the MIT License.
