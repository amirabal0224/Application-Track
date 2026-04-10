from __future__ import annotations

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


settings = Settings()
