$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$Prev = $args[0]
if (-not $Prev) {
    $tagFile = Join-Path $Root ".last-release-tag"
    if (Test-Path $tagFile) {
        $Prev = (Get-Content $tagFile -Raw).Trim()
    } else {
        Write-Error "Usage: .\rollback-local.ps1 <image:tag>  or run local-release first"
        exit 1
    }
}

Write-Host "Rolling back: tagging $Prev as quiz-backend:local"
docker compose down
docker tag $Prev quiz-backend:local
docker compose up -d --no-build

Start-Sleep -Seconds 3
& "$Root\scripts\healthcheck.ps1" -BaseUrl "http://localhost:3000"
Write-Host "Rollback smoke OK"
