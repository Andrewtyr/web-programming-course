$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$Tag = if ($args[0]) { $args[0] } else { "quiz-backend:local-$(Get-Date -Format 'yyyyMMdd-HHmmss')" }
Write-Host "Building image: $Tag (+ quiz-backend:local)"
docker build -t $Tag -t quiz-backend:local .

Write-Host "Starting stack (compose, no rebuild)..."
docker compose up -d --no-build

Write-Host "Waiting for backend..."
for ($i = 0; $i -lt 30; $i++) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 2
        if ($r.StatusCode -eq 200) { break }
    } catch { Start-Sleep -Seconds 1 }
}

& "$Root\scripts\healthcheck.ps1" -BaseUrl "http://localhost:3000"
$smoke = & curl.exe -s -o NUL -w "%{http_code}" "http://localhost:3000/api/admin/questions"
Write-Host "Smoke: GET /api/admin/questions (unauthorized) HTTP $smoke"
if ($smoke -ne "401") { throw "expected 401 without Bearer token" }

Set-Content -Path "$Root\.last-release-tag" -Value $Tag -Encoding utf8
Write-Host "Local release done. Image tag: $Tag"
