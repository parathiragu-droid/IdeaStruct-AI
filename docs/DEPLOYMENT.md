# IdeaStruct AI — Production Deployment Guide

This document describes the production deployment architecture, setup instructions, environment variables, and verification procedures for IdeaStruct AI.

---

## 1. Production Architecture Overview

IdeaStruct AI uses a decoupled cloud production architecture:

| Tier | Technology | Platform | Notes |
| :--- | :--- | :--- | :--- |
| **Frontend** | React 19 + Vite 8 (SPA) | **Vercel** | SPA routing rewrite configured via `vercel.json`. Zero secrets exposed to client. |
| **Backend** | Spring Boot 3.4.3 (Java 21) | **Railway** | Multi-stage Docker container build. Dynamic port binding via `$PORT`. |
| **Database** | MongoDB 7.0+ | **MongoDB Atlas** | Managed cloud replica set. Connection authenticated over TLS via `MONGODB_URI`. |
| **AI Provider** | Gemini 3.5 Flash Lite | **Google AI Studio** | Invoked exclusively server-side via backend. `GEMINI_API_KEY` never sent to client. |

---

## 2. Environment Variables Specification

> [!WARNING]
> **Zero Secrets in Frontend**: `GEMINI_API_KEY` and `MONGODB_URI` must NEVER be exposed to the frontend or prefixed with `VITE_`.

### Backend Environment Variables (Railway)

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Dynamically provided by Railway host. | `${PORT:8080}` |
| `MONGODB_URI` | MongoDB Atlas SRV connection string with database name. | `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/ideastruct_ai?retryWrites=true&w=majority` |
| `GEMINI_API_KEY` | Google Gemini API key used for LIVE_AI generation. | `AIzaSy...` (Backend only) |
| `GEMINI_MODEL` | Gemini model identifier. | `gemini-3.5-flash-lite` |
| `FRONTEND_URL` | Production URL of Vercel frontend for CORS whitelist. | `https://ideastruct-ai.vercel.app` |

### Frontend Environment Variables (Vercel)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Public HTTPS base URL of the Railway Spring Boot backend. | `https://ideastruct-api-production.up.railway.app` |

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
   - Authentication Method: **Password**. Set username (e.g., `ideastruct_admin`) and a strong password.
   - Built-in Role: **Read and write to any database**.
4. **Network Access**:
   - Go to **Security > Network Access**.
   - Click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`) so Railway dynamic cloud containers can connect.
5. **Get Connection String**:
   - Click **Connect > Drivers**.
   - Select Java / Node.js.
   - Copy connection string:
     `mongodb+srv://ideastruct_admin:<password>@<cluster>.mongodb.net/ideastruct_ai?retryWrites=true&w=majority`
   - Replace `<password>` with your database user password and specify `ideastruct_ai` as the database name.

---

### Step B: Backend Deployment on Railway

1. **Sign in / Authorize**:
   - Log in to [Railway](https://railway.com/) using your GitHub account.
2. **Create New Project**:
   - Click **New Project > Deploy from GitHub repo**.
   - Select your IdeaStruct AI repository.
3. **Configure Service Settings**:
   - In Railway Service Settings, set **Root Directory** to `/backend`.
   - Railway will automatically detect `backend/Dockerfile` and `backend/railway.json`.
4. **Add Variables**:
   Under **Variables**, add:
   - `MONGODB_URI`: `<Your MongoDB Atlas connection string>`
   - `GEMINI_API_KEY`: `<Your Gemini API key>`
   - `GEMINI_MODEL`: `gemini-3.5-flash-lite`
   - `FRONTEND_URL`: `https://ideastruct-ai.vercel.app` (or update after Vercel URL is created)
5. **Generate Public Domain**:
   - Under **Settings > Networking**, click **Generate Domain**.
   - Note the generated domain (e.g., `https://ideastruct-api-production.up.railway.app`).
6. **Verify Backend Health**:
   - Open `https://<railway-domain>/api/health` in your browser.
   - Expected response: HTTP 200 with database status `UP`.

---

### Step C: Frontend Deployment on Vercel

1. **Sign in / Authorize**:
   - Log in to [Vercel](https://vercel.com/) with GitHub.
2. **Import Project**:
   - Click **Add New > Project**.
   - Import the IdeaStruct AI repository.
3. **Configure Project Settings**:
   - **Root Directory**: Click edit and select `frontend`.
   - **Framework Preset**: `Vite`.
   - **Build Command**: `npm run build`.
   - **Output Directory**: `dist`.
4. **Environment Variables**:
   - Add `VITE_API_BASE_URL` with value: `https://<your-railway-domain>`.
5. **Deploy**:
   - Click **Deploy**.
   - Vercel builds the SPA and provides a production URL (e.g., `https://ideastruct-ai.vercel.app`).
6. **Verify SPA Routing**:
   - `frontend/vercel.json` contains rewrites mapping all routes to `/index.html`.
   - Direct URLs like `/projects`, `/projects/new`, and `/health` resolve without 404s.

---

### Step D: Update CORS & Final Connection

1. In Railway:
   - Update `FRONTEND_URL` variable with the exact Vercel production URL.
2. Railway redeploys the service automatically to apply the new CORS allowed origin.
3. Open the live Vercel URL in your browser and test creating a project!

---

## 4. Post-Deployment Verification Checklist

- [ ] `GET /api/health` returns HTTP 200 and indicates MongoDB connected.
- [ ] Direct navigation to `/health` on Vercel shows green System Status.
- [ ] Create Software project: Overview, Architecture, Tech Stack, Prototype demo work.
- [ ] Create Hardware project: BOM, Wiring diagram, and 3D Model viewer render with WebGL.
- [ ] Create Hybrid project: Integration architecture and device-to-cloud sections load.
- [ ] Generate Live AI plan: Gemini calls resolve through Railway backend and save to MongoDB Atlas.
- [ ] Page refresh on `/projects/:id` preserves state and reloads without 404 or blank screen.
- [ ] Responsive inspection: 1440px desktop, 1024px tablet, 768px portrait, and 375px mobile show zero horizontal overflow.
- [ ] DevTools console check: 0 fatal console errors, 0 WebGL errors, 0 CORS blocks.
- [ ] Security check: Built frontend bundle contains NO API keys or database credentials.

---

## 5. Redeployment & Rollback Procedures

### Redeployment
- **Automatic CI/CD**: Pushing commits to `main` branch triggers automatic rebuilds on both Railway and Vercel.
- **Manual Redeploy (Railway)**: In Railway dashboard, navigate to the service and click **Redeploy**.
- **Manual Redeploy (Vercel)**: In Vercel dashboard, navigate to **Deployments** and click **Redeploy**.

### Rollback
- **Railway**: Go to **Deployments**, find the last known stable deployment, and click **Rollback**.
- **Vercel**: Go to **Deployments**, select the previous successful deployment, and click **Promote to Production**.
