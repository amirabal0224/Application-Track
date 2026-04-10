from __future__ import annotations

import time

import httpx

BASE_URL = "http://localhost:8000"
DEMO_EMAIL = "demo@apptrack.dev"
DEMO_PASSWORD = "ChangeMeDemo123!"


def test_health() -> None:
    res = httpx.get(f"{BASE_URL}/health", timeout=10.0)
    assert res.status_code == 200
    assert res.json().get("status") == "ok"


def test_auth_and_application_crud_flow() -> None:
    login = httpx.post(
        f"{BASE_URL}/auth/jwt/login",
        content=f"username={DEMO_EMAIL}&password={DEMO_PASSWORD}",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=10.0,
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    auth_headers = {"Authorization": f"Bearer {token}"}

    statuses = httpx.get(f"{BASE_URL}/statuses", headers=auth_headers, timeout=10.0)
    assert statuses.status_code == 200
    status_items = statuses.json()
    assert len(status_items) > 0

    status_id = status_items[0]["id"]
    suffix = str(int(time.time() * 1000))

    created = httpx.post(
        f"{BASE_URL}/applications",
        headers=auth_headers,
        json={
            "company": f"SmokeCo-{suffix}",
            "role": "QA Engineer",
            "status_id": status_id,
            "notes": "pytest smoke",
        },
        timeout=10.0,
    )
    assert created.status_code == 201
    app_id = created.json()["id"]

    listed = httpx.get(f"{BASE_URL}/applications", headers=auth_headers, timeout=10.0)
    assert listed.status_code == 200
    ids = {item["id"] for item in listed.json()}
    assert app_id in ids
