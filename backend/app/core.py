from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "application-tracker"
    environment: str = "dev"

    database_url: str = "postgresql+asyncpg://app:app@localhost:5432/apptracker"
    secret_key: str = "CHANGE_ME"

    cors_origins: str = "http://localhost:5173"


settings = Settings()
