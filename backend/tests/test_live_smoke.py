from __future__ import annotations

import time
from datetime import datetime, timedelta, timezone

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


def test_application_sort_query_parameter() -> None:
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
    status_map = {item["name"]: item["id"] for item in statuses.json()}

    suffix = str(int(time.time() * 1000))
    older_date = (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
    newer_date = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()

    alpha = httpx.post(
        f"{BASE_URL}/applications",
        headers=auth_headers,
        json={
            "company": f"Alpha-{suffix}",
            "role": "Role A",
            "status_id": status_map["Offer"],
            "applied_date": older_date,
        },
        timeout=10.0,
    )
    assert alpha.status_code == 201

    zulu = httpx.post(
        f"{BASE_URL}/applications",
        headers=auth_headers,
        json={
            "company": f"Zulu-{suffix}",
            "role": "Role Z",
            "status_id": status_map["Applied"],
            "applied_date": newer_date,
        },
        timeout=10.0,
    )
    assert zulu.status_code == 201

    alpha_id = alpha.json()["id"]
    zulu_id = zulu.json()["id"]

    def ids_for(sort: str) -> list[str]:
        response = httpx.get(f"{BASE_URL}/applications?sort={sort}", headers=auth_headers, timeout=10.0)
        assert response.status_code == 200
        return [item["id"] for item in response.json()]

    sorted_ids = ids_for("name-asc")
    assert sorted_ids.index(alpha_id) < sorted_ids.index(zulu_id)

    sorted_ids = ids_for("name-desc")
    assert sorted_ids.index(zulu_id) < sorted_ids.index(alpha_id)

    sorted_ids = ids_for("applied-asc")
    assert sorted_ids.index(alpha_id) < sorted_ids.index(zulu_id)

    sorted_ids = ids_for("applied-desc")
    assert sorted_ids.index(zulu_id) < sorted_ids.index(alpha_id)

    sorted_ids = ids_for("status-priority")
    assert sorted_ids.index(alpha_id) < sorted_ids.index(zulu_id)

    sorted_ids = ids_for("updated-desc")
    assert sorted_ids.index(zulu_id) < sorted_ids.index(alpha_id)
