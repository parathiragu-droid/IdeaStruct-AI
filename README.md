# IdeaStruct AI — Engineering Project Planner & Blueprint Generator

> **From Simple Ideas to Complete Engineering Plans.**  
> An intelligent engineering project planner and development blueprint generator built with Spring Boot, React, MongoDB, Three.js, and Gemini AI. Supports **Software**, **Hardware**, and **Hybrid** systems.

---

## 1. PROJECT VISION & CORE CAPABILITIES

IdeaStruct AI accepts **any** user-provided project idea or requirement and converts it into a complete, structured engineering plan. It dynamically classifies projects into three distinct domains:

1. **SOFTWARE**: Interactive demo application / prototype, tech stack recommendations, database schemas, REST APIs, UI screen flows, and deployment plans.
2. **HARDWARE**: Bill of materials (BOM), power budget, connection/wiring diagram, firmware logic, safety notes, and an **interactive parametric 3D project model**.
3. **HYBRID**: Integrates both software and hardware prototypes with an end-to-end device-to-cloud integration architecture (Hardware → Communication Protocol → Backend → Database → Dashboard).

> [!IMPORTANT]
> **Planning Limitations & Disclaimers:**
> - **Software Prototype:** Interactive design/demo for workflow communication — *not generated production code*.
> - **Hardware 3D Prototype:** Conceptual parametric physical visualization — *not manufacturing CAD or mechanical tolerance simulation*.
> - **Wiring Plan:** Engineering planning guidance — *always verify pinouts with component datasheets before physical construction*.
> - **Cost & Time Estimates:** Indicative planning approximations based on supplied requirements — *not binding guarantees*.

---

## 2. HIGH-LEVEL ARCHITECTURE

```
USER IDEA
    │
    ▼
PROJECT CLASSIFIER
    │
    ├───────────────────────────────┐
    │                               │
 SOFTWARE                        HARDWARE
    │                               │
 SOFTWARE PLAN                   HARDWARE PLAN
    │                               │
 DEMO APP                        WIRING DIAGRAM
                                 + 3D MODEL
    │                               │
    └───────────────┬───────────────┘
                    │
                    ▼
            COMPLETE BLUEPRINT
                    │
                    ▼
               PLAN CHECK
```
*(For **HYBRID** projects, both branches are generated and linked via the integration architecture pipeline).*

---

## 3. PROJECT STRUCTURE

```
IdeaStruct-AI/
├── frontend/          # React 19 single-page UI (Vite 8, Three.js, Vanilla CSS, Mermaid 12)
│   ├── src/
│   │   ├── components/
│   │   │   ├── prototype/      # Safe interactive Software Prototype Engine (Component Whitelist)
│   │   │   ├── hardware/       # Deterministic SVG Wiring Diagram & Parametric 3D Three.js Viewer
│   │   │   ├── dashboard/      # Simple & Advanced views, Tech Stack, Estimates, Recommendations
│   │   │   └── navigation/     # Navigation & System Status headers
│   │   └── pages/              # ProjectNew, ProjectDetail, ProjectList, HealthCheck
├── backend/           # Spring Boot 3.4.3 backend (Java 21 compile target, Maven wrapper)
│   ├── src/main/java/com/ideastruct/
│   │   ├── api/                # REST Controllers (Health, Project) & DTOs
│   │   ├── application/        # ProjectService, BlueprintService, ValidationService
│   │   ├── domain/             # ProjectClassifier, ValidationRuleEngine (18+ rules), Model
│   │   └── infrastructure/     # GeminiAiBlueprintProvider, DemoBlueprintProvider, MongoRepository
├── api/               # API documentation, contracts, examples, and Postman collections
├── database/          # MongoDB documentation, schemas, indexes, and reference fixtures
├── shared/            # Shared single canonical JSON schema (blueprint.schema.json)
├── docs/              # Architecture, User Guide, Build Status, Test Reports
├── scripts/           # Automated verification suites & Playwright E2E journeys
└── README.md          # Primary developer entry point and onboarding guide
```

---

## 4. PREREQUISITES

- **Operating System:** Windows 10/11 (64-bit)
- **Shell:** Windows PowerShell 5.1+ or PowerShell Core 7+
- **Java:** OpenJDK 21+ (Java 21 LTS recommended; `<java.version>21</java.version>` target)
- **Node.js:** Node.js 20.19+ or 22+ (verified with Node v24.14.0, npm 11.9.0)
- **MongoDB:** Local MongoDB Community service running on default port `27017`

---

## 5. ENVIRONMENT SETUP

Copy `.env.example` to `.env` or set environment variables in your PowerShell terminal:

```powershell
# 1. MongoDB Connection URI (Local default is mongodb://localhost:27017/ideastruct_ai)
$env:MONGODB_URI = "mongodb://localhost:27017/ideastruct_ai"

# 2. Server Port
$env:PORT = "8080"

# 3. Gemini AI Provider Configuration (Optional for DEMO mode, required for LIVE_AI)
# Never prefix with VITE_ or expose to the frontend.
$env:GEMINI_API_KEY = "your_actual_gemini_api_key_here"
$env:GEMINI_MODEL = "gemini-3.5-flash-lite"
```

### AI Provider Modes: DEMO vs LIVE_AI
- **DEMO Mode (Default / Keyless):**
  - Requires **zero API keys** and zero external network access.
  - Automatically selects deterministic fixtures matching the classified project type (Software Campus Dining, Hardware Environmental Monitor, or Hybrid Smart Aquaponics).
  - Truthfully labeled in MongoDB and UI: `source: "DEMO"`, `provider: null`, `model: "deterministic-fixture-v1"`.
- **LIVE_AI Mode:**
  - Calls Google's official Gemini Generative Language API (`gemini-3.5-flash-lite`).
  - Truthfully labeled: `source: "LIVE_AI"`, `provider: "google"`, `model: "gemini-3.5-flash-lite"`.
  - Enforces JSON canonical schema conformity.

---

## 6. RUNNING LOCALLY

### 1. Start Backend (Terminal 1)
```powershell
cd "d:\IdeaStruct AI\backend"
.\mvnw.cmd spring-boot:run
```
Backend health check: `http://localhost:8080/api/health`

### 2. Start Frontend (Terminal 2)
```powershell
cd "d:\IdeaStruct AI\frontend"
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 7. AUTOMATED TESTS & VERIFICATION

All automated test commands can be executed from PowerShell:

```powershell
# 1. Backend Automated Tests (89/89 tests passing across 7 test classes, bounded retry & Retry-After verified)
cd "d:\IdeaStruct AI\backend"
.\mvnw.cmd test

# 2. Frontend Automated Tests (16/16 test suites passing)
cd "d:\IdeaStruct AI\frontend"
npm test

# 3. Frontend Linter Check (0 errors)
cd "d:\IdeaStruct AI\frontend"
npm run lint

# 4. Frontend Production Build (Bundles cleanly with Three.js)
cd "d:\IdeaStruct AI\frontend"
npm run build

# 5. Phase 6 Global Blank-Screen & Tab Navigation Stress Test (199/199 checks, 0 blank pages)
cd "d:\IdeaStruct AI"
node scripts/e2e/phase6_global_blank_screen_stress.cjs

# 6. Phase 7 Live AI Generation Error State & Recovery Test (100% pass, 0 silent resets)
cd "d:\IdeaStruct AI"
node scripts/e2e/phase7_live_ai_error_state_test.cjs

# 7. Phase 7B Live AI Success Path Final Verification (Software, Hardware, Hybrid LIVE_AI: 100% pass)
cd "d:\IdeaStruct AI"
node scripts/e2e/phase7b_live_ai_verification.cjs

# 8. Core Regression Suites
node scripts/verification/verify_full_product_extension.js
node scripts/verification/verify_e2e_journeys.js
```

---

## 8. SAFETY & SECURITY ARCHITECTURE

- **Zero Arbitrary Code Execution:** Software prototypes render strictly from a whitelist of 17 React components (`Heading`, `Text`, `Button`, `Input`, `Textarea`, `Select`, `Card`, `List`, `Table`, `ImagePlaceholder`, `Navbar`, `Sidebar`, `Tabs`, `Badge`, `Form`, `Modal`, `StatCard`) and 9 deterministic actions (`NAVIGATE`, `OPEN_MODAL`, `CLOSE_MODAL`, `SET_VALUE`, `SUBMIT_DEMO`, `SHOW_MESSAGE`, `FILTER_DEMO_DATA`, `SELECT_ITEM`, `BACK`). Zero `eval()`, zero `new Function()`, zero arbitrary HTML injection.
- **Deterministic Diagram & 3D Rendering:** Wiring diagrams are computed deterministically as SVGs from structured `components` and `connections`. 3D models render parametrically from validated primitives (`BOARD`, `SENSOR_MODULE`, `DISPLAY_PANEL`, `LED`, `BUZZER`, `BUTTON`, `BOX`, `CYLINDER`, `CONNECTOR`).
- **Zero Exposed Keys:** Gemini API keys are read solely by the backend service. No client-side exposure.
- **Optimistic Concurrency:** All document mutations require revision matching via `If-Match` or `expectedRevision`, preventing stale overwrites with HTTP 409 Conflict.

---

## 9. DOCUMENTATION INDEX

- [`docs/USER_GUIDE.md`](./docs/USER_GUIDE.md): Complete guide for Software, Hardware, and Hybrid planning.
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md): System architecture, 3D viewer, wiring engine, and validation rules.
- [`docs/PROJECT_CONTEXT.md`](./docs/PROJECT_CONTEXT.md): Pinned versions, canonical schema, and boundary guidelines.
- [`docs/BUILD_STATUS.md`](./docs/BUILD_STATUS.md): Historical milestone and phase implementation log.
- [`docs/TEST_REPORT.md`](./docs/TEST_REPORT.md): Complete verification matrix and E2E browser test results.
- [`api/API_CONTRACT.md`](./api/API_CONTRACT.md): Comprehensive REST API contract with request/response schemas.
- [`database/README.md`](./database/README.md): MongoDB database model, stored Project aggregate, and indexes.
- [`shared/schemas/blueprint.schema.json`](./shared/schemas/blueprint.schema.json): Single canonical blueprint JSON schema.

