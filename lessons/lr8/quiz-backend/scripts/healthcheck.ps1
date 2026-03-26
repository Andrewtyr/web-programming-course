param(
    [string]$BaseUrl = "http://localhost:3000"
)
$uri = "$BaseUrl/health"
try {
    $r = Invoke-WebRequest -Uri $uri -UseBasicParsing -TimeoutSec 10
    if ($r.StatusCode -ne 200) {
        Write-Error "healthcheck failed: expected 200, got $($r.StatusCode)"
        exit 1
    }
    Write-Host "health OK ($uri)"
} catch {
    Write-Error "healthcheck failed: $_"
    exit 1
}
