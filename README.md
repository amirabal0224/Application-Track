# Application Tracker

Monorepo with:
- `backend/` FastAPI (Python)
- `frontend/` React (TypeScript)
- Postgres via Docker Compose

## Deploy On Your Local Machine (Docker)

This is the quickest full-stack deployment on your computer.

1. Start all services:
- `docker compose up -d --build`

2. Open app and API:
- Frontend: `http://localhost:5173/#/login`
- API docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`

3. Demo login:
- Email: `demo@apptrack.dev`
- Password: `ChangeMeDemo123!`

4. Run smoke tests:
- `docker compose exec backend pytest tests/test_live_smoke.py -q`

5. Stop services:
- `docker compose down`

## Deploy To Production

### Backend
You can deploy the backend to any hosting provider that supports Python web services (VPS, cloud VM, container registry, or a platform-as-a-service). Important notes:

- The service exposes a FastAPI app on `/` and provides `/health` and `/docs` endpoints for verification.
- Required environment variables:
	- `DATABASE_URL` — e.g. `postgresql+asyncpg://user:pass@host:5432/dbname`
	- `SECRET_KEY`
	- `CORS_ORIGINS` — include your Netlify domain (e.g. `https://your-site.netlify.app`) or custom domain
	- `ENABLE_REGISTRATION` (optional)
	- `DEMO_EMAIL`, `DEMO_PASSWORD` (optional demo account)

You can deploy with Docker Compose using `docker-compose.prod.yml`, or build the image from `backend/` and run it on your server/container platform. After deployment, verify the API health endpoint and docs (e.g. `https://your-backend.example/health`).

### Frontend (Netlify)
1. Connect the repository to Netlify and set the base directory to `frontend`.
2. Use these build settings:
- Build command: `npm run build`
- Publish directory: `dist`
3. Add Netlify environment variables:
- `VITE_API_BASE_URL` set to your deployed backend URL.
	- For example: `https://your-backend.example`
- `VITE_ENABLE_REGISTER=false` for demo mode.
4. Set the backend CORS allowlist to include your Netlify domain, for example `https://your-site.netlify.app` or your custom domain.
5. Open the Netlify site and verify login + CRUD flow.

### GitHub Action + Netlify automation

The repository includes a GitHub Action that builds the frontend with the correct `VITE_API_BASE_URL` and deploys the static site to Netlify automatically. To enable it, add the following repository secrets in GitHub (Settings → Secrets → Actions):

- `NETLIFY_AUTH_TOKEN` — a Netlify personal access token with `sites:deploy` scope. Create one at https://app.netlify.com/user/applications#personal-access-tokens.
- `NETLIFY_SITE_ID` — the Site ID of your Netlify site (Site settings → General → Site details → Site ID).
- `VITE_API_BASE_URL` — the full URL of your backend API (e.g., `https://your-backend.example`).
- `DEMO_EMAIL` and `DEMO_PASSWORD` — (optional) demo credentials used by the workflow to run a smoke login test after deployment.

Once set, push a commit to `main` (or run the workflow manually) — the Action will:

- Build `frontend` with the provided `VITE_API_BASE_URL` and `VITE_ENABLE_REGISTER=false`.
- Deploy `frontend/dist` to Netlify.
- Run a post-deploy health check against `${VITE_API_BASE_URL}/health` and attempt a demo login to verify the backend.

Local verification before pushing:

Run the local build and verify `VITE_API_BASE_URL` is embedded in the build output:

```bash
cd frontend
VITE_API_BASE_URL=https://your-backend.example npm run build
./scripts/verify_netlify_build.sh https://your-backend.example
```

If the verification script finds the API URL in `frontend/dist` the build is configured correctly.

## Local Dev (Without Docker For Frontend/Backend)
1. Start database
- If Docker is available, start Postgres: `docker compose up -d db`
- Otherwise, backend can run on SQLite (see `backend/.env.example`)

2. Start backend
- See [backend/README.md](backend/README.md)

3. Start frontend
- `cd frontend`
- `npm.cmd install`
- `npm.cmd run dev`

## Netlify Notes

- The frontend is a static Vite build in [frontend/](frontend/).
- Netlify uses [netlify.toml](netlify.toml) to build from that folder and route SPA paths to `index.html`.
- The backend allows `*.netlify.app` origins by default and still supports exact origins via `CORS_ORIGINS`.

## Deploy With Docker (production)

You can run the whole stack as Docker images on a server instead of using Render.

1. For the Docker image workflow, no API secret is needed.
	- The frontend image uses same-origin API calls and `frontend/nginx.conf` proxies them to the `backend` service.
	- Keep `VITE_API_BASE_URL` set when the frontend is built against a separate backend.

2. A GitHub Actions workflow is included (`.github/workflows/publish-images.yml`) which builds and pushes two images to GitHub Container Registry (GHCR):
	- `ghcr.io/<your-org>/application-track-backend:latest`
	- `ghcr.io/<your-org>/application-track-frontend:latest`

3. On your server copy `docker-compose.prod.yml` and run:

```bash
docker compose pull
docker compose up -d
```

4. Required environment variables in `docker-compose.prod.yml` (or via a `.env` file):
- `DATABASE_URL` — `postgresql+asyncpg://user:pass@db:5432/dbname`
- `SECRET_KEY`
- `CORS_ORIGINS` — include your frontend domain (e.g. `https://your-site.netlify.app` or your hostname)
- `ENABLE_REGISTRATION=false` (recommended for demo)
- `DEMO_EMAIL`, `DEMO_PASSWORD`

5. For HTTPS, run a reverse proxy (Caddy/Traefik/nginx) in front of the compose stack or use your cloud provider's load balancer.

Notes:
- The backend normalizes common `postgres://` URLs to `postgresql+asyncpg://` in `backend/app/core.py`.
- The frontend build uses `VITE_API_BASE_URL` at build time; set that environment variable in Netlify or any other static host so the published frontend points to the correct backend.

