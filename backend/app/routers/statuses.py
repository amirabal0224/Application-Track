from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import Select, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..auth import current_active_user
from ..db import get_async_session
from ..models import Status, User
from ..schemas import StatusCreate, StatusOut

router = APIRouter(prefix="/statuses", tags=["statuses"])


@router.get("", response_model=list[StatusOut])
async def list_statuses(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> list[Status]:
    stmt: Select[tuple[Status]] = select(Status).where(or_(Status.user_id.is_(None), Status.user_id == user.id)).order_by(Status.name.asc())
    result = await session.execute(stmt)
    return list(result.scalars().all())


@router.post("", response_model=StatusOut, status_code=201)
async def create_status(
    payload: StatusCreate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> Status:
    status = Status(name=payload.name.strip(), user_id=user.id)
    session.add(status)
    await session.commit()
    await session.refresh(status)
    return status


@router.delete("/{status_id}", status_code=204)
async def delete_status(
    status_id: uuid.UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> None:
    status = await session.get(Status, status_id)
    if status is None or status.user_id != user.id:
        raise HTTPException(status_code=404, detail="Status not found")
    await session.delete(status)
    await session.commit()
