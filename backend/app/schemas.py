from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class StatusOut(BaseModel):
    id: uuid.UUID
    name: str
    user_id: uuid.UUID | None

    class Config:
        from_attributes = True


class StatusCreate(BaseModel):
    name: str = Field(min_length=1, max_length=64)


class ApplicationOut(BaseModel):
    id: uuid.UUID
    company: str
    role: str
    location: str | None
    job_url: str | None
    applied_date: datetime | None
    status_id: uuid.UUID
    notes: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ApplicationCreate(BaseModel):
    company: str = Field(min_length=1, max_length=128)
    role: str = Field(min_length=1, max_length=128)
    location: str | None = Field(default=None, max_length=128)
    job_url: str | None = Field(default=None, max_length=512)
    applied_date: datetime | None = None
    status_id: uuid.UUID
    notes: str | None = None


class ApplicationPatch(BaseModel):
    company: str | None = Field(default=None, min_length=1, max_length=128)
    role: str | None = Field(default=None, min_length=1, max_length=128)
    location: str | None = Field(default=None, max_length=128)
    job_url: str | None = Field(default=None, max_length=512)
    applied_date: datetime | None = None
    status_id: uuid.UUID | None = None
    notes: str | None = None
