#!/usr/bin/env python
"""Clear all user applications and user-created statuses from the database."""

import asyncio
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from sqlalchemy import delete, select
from app.db import SessionLocal, engine
from app.models import Base, Application, Status


async def clear_demo_data():
    """Delete all applications and user-created statuses."""
    async with SessionLocal() as session:
        # Delete all applications
        await session.execute(delete(Application))
        print("✓ Cleared all applications")

        # Delete user-created statuses (keep default system statuses where user_id is None)
        await session.execute(delete(Status).where(Status.user_id.isnot(None)))
        print("✓ Cleared all user-created statuses")

        await session.commit()
        print("\n✓ Demo data cleared successfully")


if __name__ == "__main__":
    asyncio.run(clear_demo_data())
