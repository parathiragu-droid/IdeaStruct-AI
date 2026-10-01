# IdeaStruct AI — User Guide

Welcome to **IdeaStruct AI**! This guide walks you through transforming any engineering idea — **Software**, **Hardware**, or **Hybrid** — into an actionable, structured technical blueprint.

---

## 1. What is IdeaStruct AI?

IdeaStruct AI accepts natural language descriptions of **any** technical project and generates a complete engineering plan:
- **SOFTWARE PROJECTS**: Interactive prototype application, tech stack recommendations with trade-offs, database schemas, REST APIs, screens, and deployment plan.
- **HARDWARE PROJECTS**: Bill of Materials (BOM), power requirements, pin connection schedules, circuit wiring diagrams, firmware logic, safety notes, and an **interactive 3D project model**.
- **HYBRID PROJECTS**: Both software and hardware plans, joined by a device-to-cloud integration architecture (Hardware → Communication Protocol → Backend → Database → Dashboard).

---

## 2. Quick Local Startup

IdeaStruct AI runs 100% locally on your machine.

### Step 2.1: Start MongoDB
Ensure MongoDB is running locally on port 27017:
```powershell
net start MongoDB
```

### Step 2.2: Start Backend (Spring Boot)
In a PowerShell window:
```powershell
cd "d:\IdeaStruct AI\backend"
.\mvnw.cmd spring-boot:run
```
*The backend starts at `http://localhost:8080`.*

### Step 2.3: Start Frontend (React + Vite)
In a second PowerShell window:
```powershell
cd "d:\IdeaStruct AI\frontend"
npm run dev
```
*The web interface is available at `http://localhost:5173`.*

---

## 3. Step-by-Step User Walkthrough

### Step 1: Create a New Project
1. Navigate to `http://localhost:5173`.
2. Click **+ New Project** in the navigation bar.
3. Enter your **Project Name**.
4. Type your project description in **Describe your project idea**.
   - As you type, IdeaStruct AI dynamically previews the detected project type:
     - 💻 **SOFTWARE** (e.g. web applications, mobile apps, SaaS platforms)
     - 🔌 **HARDWARE** (e.g. Arduino monitors, sensor circuits, embedded controllers)
     - ⚡ **HYBRID** (e.g. IoT weather stations, smart agriculture with mobile dashboards)
   - You can leave type detection on **Auto Detect (Recommended)** or override it under *Project Type Detection*.
5. Click **Create Project**.

---

### Step 2: Generate Your Blueprint
On your project dashboard:
- **Live AI Plan:** Click **Generate with Live AI** (calls Google Gemini with structured schema output).
- **Demo Plan:** Click **Generate Demo Plan** (uses offline deterministic fixtures matching the classified project type; no API key needed).

---

### Step 3: Explore the Simple View Dashboard
The default Simple View organizes your engineering plan cleanly:
1. **Top Metrics Bar:** Displays Project Type badge, estimated duration, recommended team size, estimated cost range, feature count, and Plan Check status.
2. **Project Summary:** What is being built, problem statement, target users, and key goals.
3. **Software Plan (if applicable):**
   - Recommended tech stack with alternatives and trade-offs.
   - Database collections, backend APIs, and screen flow previews.
4. **Hardware Plan (if applicable):**
   - Working principle and Bill of Materials (BOM) cost table.
   - Power budget and pin connection schedules.
   - **Circuit Wiring Diagram:** Interactive color-coded wiring diagram showing VCC (Red), GND (Slate), I2C (Amber), SPI (Purple), and GPIO lines.
5. **Interactive Prototype Preview:**
   - **Software Prototype:** Click through live screens, submit demo forms, and toggle desktop/mobile preview modes.
   - **3D Hardware Viewer:** Rotate (left click + drag), zoom (scroll wheel), pan (right click + drag), click components to inspect their pinouts, and toggle enclosure visibility.
6. **Project Recommendations:** Suggested optimizations, alternate technologies, assumptions, and risks.

---

### Step 4: Explore the Advanced View
Switch to **Advanced View** using the toggle at the top right to access detailed technical groups:
- **GENERAL:** Overview, Requirements, Features, Roles, Estimates, Roadmap, Plan Check.
- **SOFTWARE (if applicable):** Architecture, Tech Stack, Data Structure, Backend APIs, App Screens, Software Prototype.
- **HARDWARE (if applicable):** Components (BOM), Connections, Diagrams (Wiring & Block), Firmware, 3D Model.

---

### Step 5: Audit Plan Quality with Plan Check
Click the **Plan Check** section:
- Runs 18+ deterministic structural rules verifying:
  - Feature-to-requirement traceability.
  - Pin connection validity and duplicate detection.
  - Microcontroller and power source presence.
  - 3D primitive mappings for physical components.
  - Hybrid communication paths connecting hardware to software.
- Zero AI hallucinations; issues are flagged with actionable remediation guidance.

---

## 4. Engineering Disclaimers

- **Software Prototypes:** Functional interactive wireframes to demonstrate user journeys — *not production application code*.
- **Hardware 3D Models:** Parametric visual prototypes communicating physical arrangement — *not manufacturing CAD*.
- **Wiring Diagrams:** Planning guidance — *always verify pin assignments against manufacturer datasheets prior to physical prototyping*.
- **Estimates:** Planning approximations based on provided requirements — *not financial quotes*.
