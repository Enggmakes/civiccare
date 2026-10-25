# CivicCare Mobile Application (React Native / Expo 58)

CivicCare is an AI-powered crowdsourced civic issue reporting, classification, and resolution platform for citizens. Built with **React Native**, **Expo 58**, **NativeTabs**, **Clerk Authentication**, and **Supabase Database & Storage**.

---

## Exact UI Design Mapping (`image.png`)

This application implements the 7 Citizen Mobile App screens from the visual reference design in `image.png`:

| Screen # | Screen Title | Route Path | Features & Visual Design Elements |
| :---: | :--- | :--- | :--- |
| **1** | **Splash Screen** | `/welcome` | CivicCare skyline logo with leaf accent, roadway perspective leading into towers, `"Get Started"` primary CTA, and `"Already have an account? Sign In"`. |
| **2** | **Onboarding** | `/onboarding` | 3-slide interactive walkthrough with phone illustration displaying photo & pin, top-right `"Skip"` button, and pagination dots. |
| **3** | **Home Screen** | `/(tabs)` | Top location bar (`"Mumbai"`), search input, `"Together for a Cleaner, Safer City"` hero banner, prominent blue `[+] Report an Issue` button, 6-category grid (`Pothole`, `Garbage`, `Streetlight`, `Water Leak`, `Broken Road`, `Others`), and Recent Reports feed. |
| **4** | **Report Issue** | `/report-issue` | Photo preview card with `[X]` delete badge, dashed `Add More Photos` button, 300-char Issue Description field, auto-detected location card with interactive map thumbnail, and `"Submit Report"` button. |
| **5** | **AI Processing** | `/ai-analysis` | Centered pulsing AI neural brain emblem, subtext, and animated 5-step checklist (`Image analysis`, `Text analysis`, `Detecting category`, `Estimating severity`, `Finding similar reports`). |
| **6** | **Report Submitted** | `/report-submitted` | Green checkmark circle, headline, structured summary card with copyable ID `#CC20241026`, detected category (`Pothole`), severity (`High`), location, and `"Track This Report"` CTA. |
| **7** | **Track Report** | `/report-details` | Large photo header with floating `"In Progress"` status pill, ticket title & number, and vertical chronological milestone timeline with active pulse indicator. |

---

## Native Tabs Architecture (`expo-router/native-tabs`)

The bottom navigation utilizes Expo Router's native platform tabs:
- **Home (`/(tabs)`)**: Main intake dashboard with Report an Issue button and categories.
- **My Reports (`/(tabs)/reports`)**: Segmented filters (`All`, `Active`, `Resolved`) for tracking personal historical tickets.
- **Nearby Map (`/(tabs)/explore`)**: Interactive geospatial map centered on Mumbai with color-coded severity pins and popup preview cards matching Screen 9.
- **Profile (`/(tabs)/profile`)**: Citizen account details with Clerk Authentication status, preferences, and quick app tour links.

---

## Authentication & Storage Architecture

### 1. Clerk Authentication (`src/services/clerk.tsx`)
- Configured using `@clerk/expo` and `@clerk/expo/token-cache`.
- Set your Clerk publishable key in `.env`:
  ```bash
  EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
  ```
- **Zero-Block Fallback:** When running in development without an active Clerk key, the app automatically activates a seamless Demo Provider with citizen profile `Rajesh Sharma` so all screens and features can be tested immediately!

### 2. Supabase Storage & Database (`src/services/supabase.ts`)
- Configured using `@supabase/supabase-js` and `@react-native-async-storage/async-storage`.
- Set your Supabase credentials in `.env`:
  ```bash
  EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
  ```
- Seeded with baseline data matching `#CC20241026` from `image.png` with offline local cache persistence.

---

## Running the Application Locally

```bash
# Navigate to the mobile app directory
cd civiccare-app

# Start the Expo development server
npm start

# Run on Web (Browser preview)
npm run web

# Run on Android (Physical device with Expo Go or Emulator)
npm run android

# Run on iOS (Simulator or Expo Go)
npm run ios
```
