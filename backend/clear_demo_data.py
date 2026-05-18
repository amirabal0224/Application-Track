#!/usr/bin/env python
"""Clear all user applications and user-created statuses from the database."""

import asyncio
from sqlalchemy import delete
from app.db import SessionLocal
from app.models import Application, Status


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
