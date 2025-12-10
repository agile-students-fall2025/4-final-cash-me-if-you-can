
# Full Project Pipeline Documentation (CI/CD for extra credit)

This document explains the full architecture of our project — including how the frontend, backend, routing, and deployment pipeline work together. It also walks through what happens behind the scenes when a user interacts with the application.

---

## Overview

Our system consists of a **frontend client**, **backend API**, **reverse proxy**, and a **database layer**.  
The application is deployed to a server environment where builds are generated, services are started, and routing is configured so that all user traffic flows correctly end-to-end.

## Components

### Frontend (React)
- Located in `/front-end`
- Built with `npm run build`
- Produces optimized static files (`build/`)
- Served to the user via NGINX or a static hosting directory
- Communicates with backend through `/api/...`

### Backend (Express)
- Located in `/back-end`
- Contains API routes, authentication, and business logic
- Runs under **PM2** so the server stays alive even after terminal closes
- Reads configuration from `.env`
- Example routes:
  - `/api/health`
  - `/api/login`
  - `/api/...`

### Reverse Proxy (NGINX)
- Accepts traffic from the outside world (port 80/443)
- Serves **frontend files** to the browser
- Proxies API requests → backend server
- Helps avoid CORS issues and centralizes routing

### Database
- Stores user accounts, app data, transactions, etc.
- Queried by the backend
- Persisted outside of application code

---

## How a Request Flows Through the System

1. User visits the site  
   → Browser requests `http://137.184.20.219`

2. NGINX serves `index.html`, JS, CSS (the frontend build)

3. User performs an action (ex. login)
   ```ts
   fetch("/api/login", { method: "POST", body: ... })
   ```

4. NGINX detects `/api/...` and reverse-proxies it to backend:
   ```
   http://localhost:5001/api/login
   ```

5. Backend processes request:
   - Verifies credentials
   - Reads/writes to database
   - Returns JSON response

6. Frontend updates UI based on returned data

---

## Behind the Scenes

- `pm2` restarts backend automatically if it crashes or server reboots
- Environment variables keep secrets secure
- `/api/health` route provides quick verification that backend is running
- Builds minify/optimize frontend for production
- Reverse proxy allows single domain handling for both frontend & backend
---


## Extra Credit 
Using Github Actions, we have continuous integration and continuous deployment as follows:
1. Any feature branch is created from staging.
2. The developer pushes their code to their branch, then creates a PR to merge into staging
3. The CI server (through Github Actions) runs the test code and indicates whether the new code passes or fails
4. Once the PR is approved and staging is updated, the CD workflow runs:
    - Using a personal access token, the CD server authenticates Github CLI and opens a PR from staging to main
    - The PR is automatically merged
    - The CD server connects to the digital ocean droplet via ssh and runs the deployment script, which pulls the new code, installs dependencies, updates NGINX (to serve the frontend), restarts the pm2 server (for the backend APIs and the database), and redeploys the new code to the domain (droplet's ip)

All the code for this pipeline can be viewed under `/.github/workflows/ci.yml` (CI), `/.github/workflows/cd.yml` (CD), and `/scripts/deploy.sh` (deployment script)