param(
    [string]$ComposeFile = "docker-compose.prod.yml",
    [string]$HealthUrl = "http://localhost:8000/health",
    [int]$HealthRetries = 20,
    [int]$HealthDelaySeconds = 3,
    [switch]$SkipHealthCheck
)

$ErrorActionPreference = "Stop"

Write-Host "[1/5] Pulling latest images..."
docker compose -f $ComposeFile pull

Write-Host "[2/5] Recreating services..."
docker compose -f $ComposeFile up -d

Write-Host "[3/5] Current service status:"
docker compose -f $ComposeFile ps

Write-Host "[4/5] Showing recent backend/frontend logs..."
docker compose -f $ComposeFile logs --tail 60 backend frontend

if (-not $SkipHealthCheck) {
    Write-Host "[5/5] Waiting for API health endpoint: $HealthUrl"
    $ok = $false

    for ($i = 1; $i -le $HealthRetries; $i++) {
        try {
            $resp = Invoke-RestMethod -Uri $HealthUrl -Method Get -TimeoutSec 5
            if ($resp.status -eq "ok") {
                $ok = $true
                break
            }
        }
        catch {
            # keep retrying
        }

        Write-Host "  Attempt $i/$HealthRetries failed. Retrying in $HealthDelaySeconds sec..."
        Start-Sleep -Seconds $HealthDelaySeconds
    }

    if (-not $ok) {
        Write-Error "Health check failed after $HealthRetries attempts. Check logs with: docker compose -f $ComposeFile logs -f backend frontend"
        exit 1
    }

    Write-Host "Health check passed. Deployment looks good."
}
else {
    Write-Host "[5/5] Health check skipped."
}
