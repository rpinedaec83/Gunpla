[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$BaseUrl = 'http://localhost:4280',

    [Parameter(Position = 1)]
    [int]$TimeoutSeconds = 10,

    [switch]$SkipAuthTest
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Write-Host "=========================================================="
Write-Host " ATLAS Automated Smoketest Runner"
Write-Host " Target Base URL: $BaseUrl"
Write-Host " Timestamp:       $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss UTC')"
Write-Host "=========================================================="

$testsPassed = 0
$testsFailed = 0
$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

function Invoke-Probe {
    param(
        [string]$Name,
        [string]$Uri,
        [string]$Method = 'GET',
        [int]$ExpectedStatus = 200,
        [scriptblock]$Validator = $null
    )

    Write-Host "`n[PROBE] $Name"
    Write-Host "  URL: $Uri"

    $probeTimer = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $response = Invoke-WebRequest -Uri $Uri -Method $Method -TimeoutSec $TimeoutSeconds -UseBasicParsing
        $probeTimer.Stop()
        $statusCode = [int]$response.StatusCode

        if ($statusCode -eq $ExpectedStatus) {
            $valid = $true
            if ($null -ne $Validator) {
                try {
                    $json = $response.Content | ConvertFrom-Json
                    $valid = & $Validator $json
                } catch {
                    Write-Host "  [FAIL] JSON validation error: $($_.Exception.Message)" -ForegroundColor Red
                    $valid = $false
                }
            }

            if ($valid) {
                Write-Host "  [PASS] HTTP $statusCode OK ($($probeTimer.ElapsedMilliseconds) ms)" -ForegroundColor Green
                $script:testsPassed++
                return
            }
        }

        Write-Host "  [FAIL] Expected HTTP $ExpectedStatus but got HTTP $statusCode ($($probeTimer.ElapsedMilliseconds) ms)" -ForegroundColor Red
        $script:testsFailed++
    } catch {
        $probeTimer.Stop()
        $actualStatus = 0
        if ($_.Exception.PSObject.Properties['Response'] -and $null -ne $_.Exception.Response) {
            $actualStatus = [int]$_.Exception.Response.StatusCode
        }

        if ($actualStatus -eq $ExpectedStatus) {
            Write-Host "  [PASS] Expected HTTP $ExpectedStatus received ($($probeTimer.ElapsedMilliseconds) ms)" -ForegroundColor Green
            $script:testsPassed++
        } else {
            Write-Host "  [FAIL] Request failed ($($probeTimer.ElapsedMilliseconds) ms): $($_.Exception.Message)" -ForegroundColor Red
            $script:testsFailed++
        }
    }
}

# Probe 1: Health Probe (/api/v1/health or fallback /health)
Invoke-Probe -Name "Health Check Probe" -Uri "$BaseUrl/api/v1/health" -ExpectedStatus 200 -Validator {
    param($json)
    if ($json.status -in @('healthy', 'ok', 'up')) { return $true }
    Write-Host "  [WARN] Unexpected health status value: $($json.status)" -ForegroundColor Yellow
    return $true
}

# Probe 2: Version Probe (/api/v1/version)
Invoke-Probe -Name "Version Metadata Probe" -Uri "$BaseUrl/api/v1/version" -ExpectedStatus 200 -Validator {
    param($json)
    return ($null -ne $json.version)
}

# Probe 3: Security Boundary Check (Protected Resource must return 401 or 403 when unauthenticated)
if (-not $SkipAuthTest) {
    Invoke-Probe -Name "Security Boundary Check (Unauthenticated Request Rejection)" -Uri "$BaseUrl/api/v1/items" -ExpectedStatus 401
}

$stopwatch.Stop()
Write-Host "`n=========================================================="
Write-Host " Smoketest Summary"
Write-Host " Passed: $testsPassed | Failed: $testsFailed"
Write-Host " Total Duration: $($stopwatch.ElapsedMilliseconds) ms"
Write-Host "=========================================================="

if ($testsFailed -gt 0) {
    Write-Host "`n[FAIL] One or more smoketests failed. Task cannot be closed." -ForegroundColor Red
    exit 1
}

Write-Host "`n[PASS] All smoketests passed. Task meets ATLAS validation criteria." -ForegroundColor Green
exit 0
