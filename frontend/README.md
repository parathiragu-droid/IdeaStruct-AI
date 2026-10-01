# IdeaStruct AI — Frontend Developer Guide

The IdeaStruct AI frontend is a single-page React application built with **React 18**, **Vite 5**, **React Router 6**, and a pure **Vanilla CSS Design Token Architecture**. It provides an interactive planning dashboard, safe sandboxed UI prototype simulator, interactive hardware schematic viewer, and 3D spatial circuit visualizer.

---

## 1. Architecture & Directory Layout

```
frontend/src/
├── app/
│   └── App.jsx                   # Canonical application entry, routing, and error boundaries
├── components/
│   ├── common/                   # Shared UI primitives (buttons, badges, spinners, modals)
│   ├── dashboard/                # Plan dashboard, overview, tabs, and export actions
│   ├── hardware/                 # Hardware visualization (SchematicViewer, Layout3DViewer, BOM)
│   ├── navigation/               # Top navigation bar, system status indicator
│   └── prototype/                # Sandboxed safe prototype simulator
│       ├── PrototypeWhitelistComponents.jsx  # 17 Whitelisted pure React components
│       └── SafePrototypeEngine.jsx           # Pure stateful execution engine (9 actions)
├── pages/
│   ├── ProjectDetailPage.jsx    # Primary blueprint inspection & workbench page
│   ├── ProjectNewPage.jsx       # Project creation with type override & honest confidence detection
│   └── ProjectsListPage.jsx     # Project catalog and recent blueprints
├── services/
│   └── api.js                   # Strongly typed REST client communicating with Spring Boot backend
├── styles/
│   └── index.css                # Canonical design token system, CSS variables, and themes
└── tests/                       # 12 automated verification suites (100% green)
```

---

## 2. Key Subsystems

### Multi-Domain Plan Dashboard
- Dynamically adapts its visualization mode based on `projectType` (`SOFTWARE`, `HARDWARE`, or `HYBRID`).
- Displays executive summary cards (duration, team size, cost range, project type badge).
- Offers tabbed exploration: Architecture, Database & APIs, Hardware & Wiring, 3D Spatial Layout, and Interactive Prototype.

### Safe UI Prototype Engine
- **Sandboxed Security**: Absolutely zero `eval()`, `new Function()`, or unescaped HTML injections.
- **17 Controlled Components**: `Heading`, `Text`, `Button`, `Input`, `Textarea`, `Select`, `Card`, `List`, `Table`, `ImagePlaceholder`, `Navbar`, `Sidebar`, `Tabs`, `Badge`, `Form`, `Modal`, `StatCard`.
- **9 Deterministic Actions**: `NAVIGATE`, `OPEN_MODAL`, `CLOSE_MODAL`, `SET_VALUE`, `SUBMIT_DEMO`, `SHOW_MESSAGE`, `FILTER_DEMO_DATA`, `SELECT_ITEM`, `BACK`.
- Graceful degradation: Unknown components or actions fail safely with fallback notices without crashing the page.

### Hardware & 3D Circuit Visualization
- **Schematic Viewer**: Interactive SVG rendering of microcontroller pinouts, sensors, actuators, and signal wiring with color coding.
- **3D Spatial Layout Viewer**: Interactive Three.js/Canvas 3D enclosure and breadboard visualizer with pan, zoom, orbit rotation, component picking, and camera reset.

---

## 3. Local Development Commands

All commands are run from the `frontend/` directory:

```bash
# Install dependencies
npm ci

# Start local development server (http://localhost:5173)
npm run dev

# Run Oxlint code verification
npm run lint

# Build production bundle
npm run build

# Run all 12 frontend automated test suites
node src/tests/runAllTests.js
```

---

## 4. Coding Conventions

- **Styling**: Always use CSS variables from `src/styles/index.css` (e.g., `var(--primary)`, `var(--bg-surface)`, `var(--border-subtle)`). Avoid inline styles unless computing dynamic positions.
- **State Management**: Use React local and lifted state. Avoid heavy global state libraries when React built-ins suffice.
- **API Contracts**: All backend calls must go through `src/services/api.js`. Handle loading, error, empty, and success states explicitly in every page and modal.
- **Security**: Never execute arbitrary code or evaluate untrusted user input as executable JavaScript.
