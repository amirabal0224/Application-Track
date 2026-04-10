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

### Backend (Render)
1. Push this repo to GitHub.
2. In Render, create a Blueprint deployment from [render.yaml](render.yaml).
3. In Render service env vars, set:
- `CORS_ORIGINS=https://amirabal0224.github.io`
- `DEMO_EMAIL` (example: `demo@apptrack.dev`)
- `DEMO_PASSWORD` (example: `ChangeMeDemo123!`)
4. Keep `ENABLE_REGISTRATION=false` for demo mode.
5. After deploy, verify:
- `https://application-track-api.onrender.com/health` (or your service URL)
- `https://application-track-api.onrender.com/docs` (or your service URL)

### Frontend (GitHub Pages)
1. In GitHub repo settings:
- Enable GitHub Pages with GitHub Actions as the source.
- Add repository variable `VITE_API_BASE_URL` set to your Render backend URL.
	- For example: `https://application-track-api.onrender.com`
2. Push to `main` to trigger workflow [deploy-gh-pages.yml](.github/workflows/deploy-gh-pages.yml).
3. Open the published URL and verify login + CRUD flow.
	- Expected URL for this repo: `https://amirabal0224.github.io/Application-Track/`

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
