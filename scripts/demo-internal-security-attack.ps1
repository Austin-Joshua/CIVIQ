<#
.SYNOPSIS
  Demo-only: fires many authenticated API calls against YOUR local API to trigger security rules.
  Does NOT use failed-password login — it abuses valid JWT traffic (internal-style attack).

USAGE (PowerShell, from repo root):
  $env:CIVIQ_DEMO_TOKEN = "<paste JWT from browser DevTools Application storage or auth header>"
  .\scripts\demo-internal-security-attack.ps1 -Mode MutatingFlood

  # Or forbidden-route spam (use a VIEWER account token):
  .\scripts\demo-internal-security-attack.ps1 -Mode ForbiddenFlood -Token $viewerJwt

REQUIREMENTS:
  - Go API running (default http://127.0.0.1:5000)
  - SECURITY_MONITOR_ENABLED=true, Telegram vars set if you want mobile alerts

RECOVERY AFTER DEMO:
  - Dashboard → Security Monitor → Blocked IPs & users → Unblock (SUPER_ADMIN), OR
  - Wait until block expiry (see .env SECURITY_BLOCK_*_MINUTES)
#>
param(
  [Parameter(Mandatory = $false)]
  [string]$Token = $env:CIVIQ_DEMO_TOKEN,
  [ValidateSet('MutatingFlood', 'ForbiddenFlood')]
  [string]$Mode = 'MutatingFlood',
  [string]$BaseUrl = 'http://127.0.0.1:5000'
)

if (-not $Token) {
  Write-Error "Set CIVIQ_DEMO_TOKEN to your JWT, or pass -Token 'eyJ...' (copy from browser while logged into the app)."
  exit 1
}

$headers = @{
  Authorization = "Bearer $Token"
  'Content-Type'  = 'application/json'
}

Write-Host "Mode: $Mode  →  $BaseUrl" -ForegroundColor Cyan
Write-Host "Sending requests... (watch Security Monitor + Telegram)" -ForegroundColor Yellow

switch ($Mode) {
  'MutatingFlood' {
    # Triggers: >20 successful PATCH in 1 min → user block + Telegram (mutating_flood)
    for ($i = 1; $i -le 22; $i++) {
      try {
        Invoke-RestMethod -Uri "$BaseUrl/api/users/me" -Method PATCH -Headers $headers -Body '{}' -ErrorAction Stop | Out-Null
        Write-Host "  PATCH $i/22 OK"
      }
      catch {
        Write-Host "  PATCH $i failed: $_" -ForegroundColor Red
      }
    }
  }
  'ForbiddenFlood' {
    # Triggers: repeated 403 on restricted route → IP block + Telegram (unauthorized_flood)
    for ($i = 1; $i -le 6; $i++) {
      try {
        $r = Invoke-WebRequest -Uri "$BaseUrl/api/users" -Headers @{ Authorization = "Bearer $Token" } -UseBasicParsing -ErrorAction SilentlyContinue
        Write-Host "  GET /users $i status $($r.StatusCode)"
      }
      catch {
        $code = $_.Exception.Response.StatusCode.value__
        Write-Host "  GET /users $i status $code (expected 403 for non-admin)"
      }
    }
  }
}

Write-Host "`nDone. Open Dashboard → Security Monitor (event log + blocks). Telegram shows CRITICAL alerts when rules fire." -ForegroundColor Green
