from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_users import schemas as fu_schemas
from fastapi_users.router import get_auth_router, get_register_router
from sqlalchemy import select

from .auth import auth_backend, fastapi_users
from .core import settings
from .db import SessionLocal, engine
from .models import Base, Status
from .routers.applications import router as applications_router
from .routers.statuses import router as statuses_router


class UserRead(fu_schemas.BaseUser[str]):
    pass


class UserCreate(fu_schemas.BaseUserCreate):
    pass


app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"] ,
)

app.include_router(get_auth_router(auth_backend), prefix="/auth/jwt", tags=["auth"])
app.include_router(get_register_router(UserRead, UserCreate), prefix="/auth", tags=["auth"])

app.include_router(statuses_router)
app.include_router(applications_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


DEFAULT_STATUSES = ["Applied", "Interview", "Offer", "Rejected", "Withdrawn"]


@app.on_event("startup")
async def on_startup() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as session:
        existing = await session.execute(select(Status).where(Status.user_id.is_(None)))
        existing_names = {s.name for s in existing.scalars().all()}
        to_add = [Status(name=name, user_id=None) for name in DEFAULT_STATUSES if name not in existing_names]
        if to_add:
            session.add_all(to_add)
            await session.commit()
