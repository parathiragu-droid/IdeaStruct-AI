# Project Context: IdeaStruct AI

## 1. Product Overview & Expanded Vision
IdeaStruct AI is a local engineering project planner and blueprint generator. It takes natural-language descriptions of **ANY** project idea and dynamically classifies and generates complete, structured, and traceable engineering plans for:
1. **SOFTWARE**: Systems requiring web, mobile, desktop, backend, or cloud applications.
2. **HARDWARE**: Physical electronics, microcontrollers, sensors, actuators, and embedded devices.
3. **HYBRID**: Systems combining physical hardware with software interfaces and cloud infrastructure.

Outputs include:
- Overview (summary, problem statement, target users, goals, scope, out-of-scope boundaries)
- Features & Requirements (functional & non-functional, acceptance criteria, traceability)
- Roles (actors, interactive flag, permissions)
- Project Estimates (difficulty, duration range, team roles, resources)
- Software Plan (tech stack recommendations with tradeoffs, architecture, database schemas, REST APIs, screens, prototype)
- Hardware Plan (working principle, BOM components, controllers/sensors/actuators, power budget, pin schedule, wiring diagram, firmware logic, 3D model)
- Hybrid Integration Architecture (device-to-cloud protocols and data contracts)
- Build Roadmap, Risks & Recommendations
- Deterministic Plan Check (18+ rules across software, hardware, and hybrid relationships)

## 2. Technology Stack & Pinned Versions
- **Backend:** Spring Boot 3.4.3, Java 21 compile target (`<java.version>21</java.version>` in `pom.xml`; runs on Java 21+ runtimes), Maven via Maven Wrapper (`mvnw.cmd` / `mvnw.ps1`).
- **Backend Starters:** `spring-boot-starter-web`, `spring-boot-starter-validation`, `spring-boot-starter-data-mongodb`, `spring-boot-starter-test`.
- **Frontend:** React ^19.2.8, Vite ^8.3.0, JavaScript/JSX, React Router ^7.18.4, Vanilla CSS custom properties.
- **3D Visualization:** Three.js ^0.186.0 with OrbitControls.
- **Database:** MongoDB (local service on `localhost:27017` or configurable `MONGODB_URI`).
- **AI Provider:** Gemini API (default model: `gemini-3.5-flash-lite`, configurable via `GEMINI_MODEL`) with strict structured JSON output + explicit DEMO mode.
- **Diagrams:** Mermaid (^12.0.0) for system architecture + custom deterministic React SVG engine for circuit wiring diagrams.

## 3. Core Architectural Decisions
- **Source of Truth:** Canonical JSON Schema ([`shared/schemas/blueprint.schema.json`](../shared/schemas/blueprint.schema.json), schemaVersion `2.0`). Backward compatible with older `1.0` software blueprints.
- **Persistence:** Single aggregate MongoDB project document per idea, atomic updates, optimistic concurrency with `revision` counter (HTTP 409 on stale edits).
- **Security & Safety:**
  - Zero arbitrary code execution: prototypes use a strictly controlled whitelist of React components. No `eval()`, `new Function()`, or unescaped HTML.
  - Secrets kept strictly in backend environment (`GEMINI_API_KEY`). CORS locked to `http://localhost:5173`.
  - Deterministic SVG and Three.js parametric rendering from validated models.
- **Deterministic Rules:** 18+ server-side validation rules for requirement traceability, pin conflicts, missing controllers, power supply requirements, and hybrid data paths.

## 4. Engineering Limitations & Disclaimers
- **Software Prototype:** Interactive demo and wireframe navigation — *not production application code*.
- **Hardware 3D Prototype:** Conceptual parametric physical arrangement — *not manufacturing CAD or mechanical stress simulation*.
- **Circuit Wiring Diagram:** Engineering planning guidance — *always verify pinouts with component datasheets before physical construction*.
- **Time & Team Estimates:** Indicative planning approximations.

