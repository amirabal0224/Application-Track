## Backend (FastAPI)

### Local setup
1. Start Postgres (from repo root):
   - `docker compose up -d`
2. Create a virtualenv + install deps:
   - `python -m venv .venv`
   - `.venv\\Scripts\\pip install -r requirements.txt`
3. Configure env:
   - Copy `.env.example` to `.env` and edit values.
4. Run API:
   - `.venv\\Scripts\\uvicorn app.main:app --reload --port 8000`

### Notes
- API docs: `http://localhost:8000/docs`
- Health: `GET /health`
