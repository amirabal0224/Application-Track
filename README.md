# Application Tracker

Monorepo with:
- `backend/` FastAPI (Python)
- `frontend/` React (TypeScript)
- Postgres via Docker Compose

## Fast Demo (Docker)
1. Start all services:
- `docker compose up -d --build`

2. Open app and API:
- Frontend: `http://localhost:5173/#/login`
- API docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`

3. Demo login:
- Email: `demo@apptrack.dev`
- Password: `ChangeMeDemo123!`

4. Stop services:
- `docker compose down`

## Local dev (without Docker for frontend/backend)
1. Start database
- If Docker is available, start Postgres: `docker compose up -d db`
- Otherwise, the backend can run on SQLite (see `backend/.env.example`)

2. Start backend
- See `backend/README.md`

3. Start frontend
- `cd frontend`
- `npm.cmd install`
- `npm.cmd run dev`
