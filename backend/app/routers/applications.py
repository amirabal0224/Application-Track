from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import Select, and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth import current_active_user
from ..db import get_async_session
from ..models import Application, Status, User
from ..schemas import ApplicationCreate, ApplicationOut, ApplicationPatch

router = APIRouter(prefix="/applications", tags=["applications"])


async def _ensure_status_allowed(session: AsyncSession, user_id: uuid.UUID, status_id: uuid.UUID) -> Status:
    status = await session.get(Status, status_id)
    if status is None:
        raise HTTPException(status_code=422, detail="Invalid status_id")
    if status.user_id is not None and status.user_id != user_id:
        raise HTTPException(status_code=422, detail="Invalid status_id")
    return status


@router.get("", response_model=list[ApplicationOut])
async def list_applications(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> list[Application]:
    stmt: Select[tuple[Application]] = (
        select(Application)
        .where(Application.user_id == user.id)
        .order_by(Application.updated_at.desc())
    )
    result = await session.execute(stmt)
    return list(result.scalars().all())


@router.post("", response_model=ApplicationOut, status_code=201)
async def create_application(
    payload: ApplicationCreate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> Application:
    await _ensure_status_allowed(session, user.id, payload.status_id)
    app = Application(user_id=user.id, **payload.model_dump())
    session.add(app)
    await session.commit()
    await session.refresh(app)
    return app


@router.get("/{application_id}", response_model=ApplicationOut)
async def get_application(
    application_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> Application:
    app = await session.get(Application, application_id)
    if app is None or app.user_id != user.id:
        raise HTTPException(status_code=404, detail="Application not found")
    return app


@router.patch("/{application_id}", response_model=ApplicationOut)
async def patch_application(
    application_id: uuid.UUID,
    payload: ApplicationPatch,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> Application:
    app = await session.get(Application, application_id)
    if app is None or app.user_id != user.id:
        raise HTTPException(status_code=404, detail="Application not found")

    data = payload.model_dump(exclude_unset=True)
    if "status_id" in data and data["status_id"] is not None:
        await _ensure_status_allowed(session, user.id, data["status_id"])

    for key, value in data.items():
        setattr(app, key, value)

    await session.commit()
    await session.refresh(app)
    return app


@router.delete("/{application_id}")
async def delete_application(
    application_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> Response:
    app = await session.get(Application, application_id)
    if app is None or app.user_id != user.id:
        raise HTTPException(status_code=404, detail="Application not found")
    await session.delete(app)
    await session.commit()
    return Response(status_code=204)
