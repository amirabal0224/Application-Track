from __future__ import annotations

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "application-tracker"
    environment: str = "dev"

    database_url: str = "sqlite+aiosqlite:///./apptracker.db"
    secret_key: str = "CHANGE_ME"
    enable_registration: bool = True
    demo_email: str = ""
    demo_password: str = ""

    cors_origins: str = "http://localhost:5173,http://localhost:5174"

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        # Render commonly provides postgres:// or postgresql:// without an async driver.
        if value.startswith("postgres://"):
            return "postgresql+asyncpg://" + value[len("postgres://") :]
        if value.startswith("postgresql://") and "+" not in value.split("://", 1)[0]:
            return "postgresql+asyncpg://" + value[len("postgresql://") :]
        return value


settings = Settings()
