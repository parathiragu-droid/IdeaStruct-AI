# IdeaStruct AI — Production Deployment Guide

This document describes the production deployment architecture, setup instructions, environment variables, and verification procedures for IdeaStruct AI.

---

## 1. Production Architecture Overview

IdeaStruct AI is live in production across the following cloud tiers:

| Tier | Technology | Platform | Current Production URL / Reference | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | React 19 + Vite 8 (SPA) | **Vercel** | `https://idea-struct-ai.vercel.app` | SPA routing rewrite configured via `vercel.json`. Zero secrets exposed to client. |
| **Backend** | Spring Boot 3.4.3 (Java 21) | **Render** *(historical/alt: Railway)* | `https://ideastruct-api.onrender.com` | Docker container build. Dynamic port binding via `$PORT`. |
| **Database** | MongoDB 7.0+ | **MongoDB Atlas** | Cloud replica set | Managed cloud replica set. Connection authenticated over TLS via `MONGODB_URI`. |
| **AI Provider** | Gemini 3.5 Flash Lite | **Google AI Studio** | Server-side Gemini API proxy | Invoked exclusively server-side via backend. `GEMINI_API_KEY` never sent to client. |
| **Repository** | Git / GitHub | **GitHub** | `parathiragu-droid/IdeaStruct-AI` | Automated CI/CD integration with Vercel and Render. |

---

## 2. Environment Variables Specification

> [!WARNING]
> **Zero Secrets in Frontend**: `GEMINI_API_KEY` and `MONGODB_URI` must NEVER be exposed to the frontend or prefixed with `VITE_`.

### Backend Environment Variables (Render)

| Variable | Description | Example / Production Setting |
| :--- | :--- | :--- |
| `PORT` | Dynamically provided by cloud host. | `${PORT:8080}` |
| `MONGODB_URI` | MongoDB Atlas SRV connection string with database name. | `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/ideastruct_ai?retryWrites=true&w=majority` |
| `GEMINI_API_KEY` | Google Gemini API key used for LIVE_AI generation. | `AIzaSy...` (Backend only, never in frontend) |
| `GEMINI_MODEL` | Gemini model identifier. | `gemini-3.5-flash-lite` |
| `FRONTEND_URL` | Production URL of Vercel frontend for CORS whitelist. | `https://idea-struct-ai.vercel.app` |

### Frontend Environment Variables (Vercel)

| Variable | Description | Production Value |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Public HTTPS base URL of the Render Spring Boot backend. | `https://ideastruct-api.onrender.com` |

---

## 3. Step-by-Step Deployment Instructions

### Step A: MongoDB Atlas Setup

1. **Sign in / Create Account**: Go to [MongoDB Atlas](https://cloud.mongodb.com/).
2. **Create Project & Cluster**:
   - Create a project named `ideastruct-ai`.
   - Deploy an `M0 Free Tier` cluster (e.g. AWS / us-east-1).
3. **Database User**:
   - Go to **Security > Database Access**.
   - Click **Add New Database User**.
   - Authentication Method: **Password**. Set username and a strong password.
   - Built-in Role: **Read and write to any database**.
4. **Network Access**:
   - Go to **Security > Network Access**.
   - Click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`) so dynamic cloud containers can connect.
5. **Get Connection String**:
   - Click **Connect > Drivers**.
   - Select Java / Node.js.
   - Copy connection string:
     `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/ideastruct_ai?retryWrites=true&w=majority`

---

### Step B: Backend Deployment on Render

1. **Sign in / Authorize**:
   - Log in to [Render](https://render.com/) with GitHub.
2. **Create Web Service**:
   - Click **New + > Web Service**.
   - Connect the repository: `parathiragu-droid/IdeaStruct-AI`.
3. **Configure Service Settings**:
   - **Root Directory**: `backend`
   - **Environment**: `Docker` (or Java Runtime)
   - Render automatically uses `backend/Dockerfile`.
4. **Add Environment Variables**:
   Under **Environment Variables**, add:
   - `MONGODB_URI`: `<Your MongoDB Atlas connection string>`
   - `GEMINI_API_KEY`: `<Your Gemini API key>`
   - `GEMINI_MODEL`: `gemini-3.5-flash-lite`
   - `FRONTEND_URL`: `https://idea-struct-ai.vercel.app`
5. **Verify Public Domain & Health**:
   - Public domain: `https://ideastruct-api.onrender.com`.
   - Healthcheck path: `/api/health`.
   - Verify: Open `https://ideastruct-api.onrender.com/api/health` in your browser. Expected response: HTTP 200 with status `UP`.

*(Note: Railway deployment is preserved as an alternative historical option using `backend/railway.json` and Dockerfile).*

---

### Step C: Frontend Deployment on Vercel

1. **Sign in / Authorize**:
   - Log in to [Vercel](https://vercel.com/) with GitHub.
2. **Import Project**:
   - Click **Add New > Project**.
   - Import the `parathiragu-droid/IdeaStruct-AI` repository.
3. **Configure Project Settings**:
   - **Root Directory**: Select `frontend`.
   - **Framework Preset**: `Vite`.
   - **Build Command**: `npm run build`.
   - **Output Directory**: `dist`.
4. **Environment Variables**:
   - Add `VITE_API_BASE_URL` with value: `https://ideastruct-api.onrender.com`.
5. **Deploy**:
   - Click **Deploy**.
   - Production domain: `https://idea-struct-ai.vercel.app`.
6. **Verify SPA Routing**:
   - `frontend/vercel.json` rewrites all requests to `/index.html`.
   - Direct URLs like `/projects`, `/projects/new`, and `/health` resolve cleanly without 404s.

---

### Step D: Update CORS & Final Connection

1. In Render backend settings:
   - Confirm `FRONTEND_URL` is set to `https://idea-struct-ai.vercel.app`.
2. Open `https://idea-struct-ai.vercel.app` in your browser to verify full end-to-end operation!

---

## 4. Post-Deployment Verification Checklist

- [ ] `GET /api/health` returns HTTP 200 and indicates MongoDB connected.
- [ ] Direct navigation to `/health` on Vercel shows green System Status.
- [ ] Create Software project: Overview, Architecture, Tech Stack, Prototype demo work.
- [ ] Create Hardware project: BOM, Wiring diagram, and 3D Model viewer render with WebGL.
- [ ] Create Hybrid project: Integration architecture and device-to-cloud sections load.
- [ ] Generate Live AI plan: Gemini calls resolve through Render backend and save to MongoDB Atlas.
- [ ] Page refresh on `/projects/:id` preserves state and reloads without 404 or blank screen.
- [ ] Responsive inspection: 1440px desktop, 1024px tablet, 768px portrait, and 375px mobile show zero horizontal overflow.
- [ ] DevTools console check: 0 fatal console errors, 0 WebGL errors, 0 CORS blocks.
- [ ] Security check: Built frontend bundle contains NO API keys or database credentials.

---

## 5. Redeployment & Rollback Procedures

### Redeployment
- **Automatic CI/CD**: Pushing commits to `main` branch triggers automatic rebuilds on both Render and Vercel.
- **Manual Redeploy (Render)**: In Render dashboard, navigate to `ideastruct-api` and click **Manual Deploy > Deploy latest commit**.
- **Manual Redeploy (Vercel)**: In Vercel dashboard, navigate to **Deployments** and click **Redeploy**.

### Rollback
- **Render**: Navigate to **Deploys**, select a prior successful deploy, and click **Rollback to this deploy**.
- **Vercel**: In **Deployments**, select the previous successful deployment and click **Promote to Production**.
