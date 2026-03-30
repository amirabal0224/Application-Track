## Backend (FastAPI)

### Local setup
Run these commands from the `backend/` directory.

1. Choose a database:
   - SQLite (no Docker required): use `DATABASE_URL=sqlite+aiosqlite:///./apptracker.db`
   - Postgres (Docker / deployed): use `DATABASE_URL=postgresql+asyncpg://app:app@localhost:5432/apptracker`

2. Install deps (uses the repo's Python environment):
   - `python -m pip install -r requirements.txt`

3. Configure env:
   - Copy `.env.example` to `.env` and edit values.

4. Run API:
   - `uvicorn app.main:app --reload --port 8000`

### Notes
- API docs: `http://localhost:8000/docs`
- Health: `GET /health`
