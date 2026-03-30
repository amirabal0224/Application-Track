# Application Tracker

Monorepo with:
- `backend/` FastAPI (Python)
- `frontend/` React (TypeScript)
- Postgres via Docker Compose

## Local dev
1. Database
- If Docker is available, start Postgres: `docker compose up -d`
- Otherwise, the backend can run on SQLite (see `backend/.env.example`)

2. Start backend
- See `backend/README.md`

3. Start frontend
- `cd frontend`
- `npm.cmd install`
- `npm.cmd run dev`
