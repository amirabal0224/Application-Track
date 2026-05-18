#!/usr/bin/env pwsh
# Clear demo applications and statuses

docker compose exec backend python /app/scripts/clear-demo-data.py
