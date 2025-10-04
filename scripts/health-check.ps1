Param(
  [switch]$Verbose,
  [switch]$ShowDockerHealth,
  [int]$MaxWaitSeconds = 40
)

try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}

$meta = [pscustomobject]@{
  PostgresContainer = 'postgres'
  PostgresPortHost  = 5432
  ApiContainer      = 'server'
  ApiBaseUrl        = 'http://localhost:3000'
  ApiHealthUrl      = 'http://localhost:3000/api/v1/health'
  ApiPostsUrl       = 'http://localhost:3000/api/v1/posts'
  FrontContainer    = 'client'
  FrontHostUrl      = 'http://localhost:5173/'
  InternalApiHost   = 'server:3000'
  ComposeFile       = 'docker-compose-dev.yml'
}

$serviceNames = @('postgres','server','client')

function Get-DockerHealth($service){
  try {
    $cid = docker compose -f $($meta.ComposeFile) ps -q $service 2>$null
    if(-not $cid){
      $jsonOut = docker compose -f $($meta.ComposeFile) ps --format json 2>$null
      if($jsonOut){
        try {
          $arr = $jsonOut | ConvertFrom-Json
          $idMatch = $arr | Where-Object { $_.Service -eq $service } | Select-Object -First 1
          if($idMatch){ $cid = $idMatch.ID }
        } catch {}
      }
    }
    if(-not $cid){ return [pscustomobject]@{ Service=$service; Status='missing'; FailingStreak=$null; Log=$null } }
    $raw = docker inspect --format='{{json .State.Health}}' $cid 2>$null
    if(-not $raw){ return [pscustomobject]@{ Service=$service; Status='no-health'; FailingStreak=$null; Log=$null } }
    $obj = $raw | ConvertFrom-Json
    $lastLog = $null
    if($obj.Log){ $lastLog = ($obj.Log | Select-Object -Last 1).Output }
    return [pscustomobject]@{ Service=$service; Status=$obj.Status; FailingStreak=$obj.FailingStreak; Log=$lastLog }
  } catch { return [pscustomobject]@{ Service=$service; Status='error'; FailingStreak=$null; Log=$_.Exception.Message } }
}

if($ShowDockerHealth){
  Write-Host '== Docker Health (snapshot inicial) ==' -ForegroundColor DarkCyan
  $serviceNames | ForEach-Object { Get-DockerHealth $_ } | Format-Table | Out-String | Write-Host
}

Write-Host ('Esperando servicios healthy (máximo ' + $MaxWaitSeconds + 's)...') -ForegroundColor DarkGray
$sw = [Diagnostics.Stopwatch]::StartNew()
while($sw.Elapsed.TotalSeconds -lt $MaxWaitSeconds){
  $statuses = $serviceNames | ForEach-Object { Get-DockerHealth $_ }
  $allReady = $statuses | Where-Object { $_.Service -ne 'client' } | Where-Object { $_.Status -ne 'healthy' } | Measure-Object | Select-Object -ExpandProperty Count
  if($allReady -eq 0){ break }
  Start-Sleep -Seconds 2
}
$sw.Stop()
Write-Host ('Tiempo de espera: ' + [int]$sw.Elapsed.TotalSeconds + 's') -ForegroundColor DarkGray

if($ShowDockerHealth){
  Write-Host '== Docker Health (después de espera) ==' -ForegroundColor DarkCyan
  $serviceNames | ForEach-Object { Get-DockerHealth $_ } | Format-Table | Out-String | Write-Host
}

Write-Host 'Configuración:' -ForegroundColor DarkCyan
$meta | Format-List | Out-String | ForEach-Object { $_.TrimEnd() } | Write-Host

$failures = @()

function Step {
  param(
    [string]$Name,
    [scriptblock]$Run
  )
  Write-Host "-- $Name" -ForegroundColor Yellow
  try {
    & $Run
    if($LASTEXITCODE -ne 0){ throw "ExitCode $LASTEXITCODE" }
    Write-Host "OK $Name" -ForegroundColor Green
  } catch {
    Write-Host "FAIL $Name -> $_" -ForegroundColor Red
    $script:failures += $Name
  }
  Write-Host ''
}

function Get-Status($url){
  try { (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5).StatusCode } catch { return 0 }
}

Step 'docker compose ps' { docker compose -f docker-compose-dev.yml ps | Out-Null }

Step 'API health' {
  Write-Host "[INFO] URL: $($meta.ApiHealthUrl)" -ForegroundColor DarkGray
  $s = Get-Status $meta.ApiHealthUrl
  if($s -ne 200){ throw "HTTP $s" }
}

Step 'API posts list' {
  Write-Host "[INFO] URL: $($meta.ApiPostsUrl)" -ForegroundColor DarkGray
  $resp = Invoke-WebRequest -Uri $meta.ApiPostsUrl -UseBasicParsing -TimeoutSec 5
  if($resp.StatusCode -ne 200){ throw "HTTP $($resp.StatusCode)" }
  $count = ($resp.Content | Select-String '"id"').Count
  Write-Host "Posts: $count (Fuente: $($meta.ApiPostsUrl))"
}

Step 'Frontend root' {
  Write-Host "[INFO] URL: $($meta.FrontHostUrl)" -ForegroundColor DarkGray
  $s = Get-Status $meta.FrontHostUrl
  if($s -ne 200){ throw "HTTP $s" }
}

Step 'client -> server (internal)' {
  Write-Host "[INFO] Container: $($meta.FrontContainer) -> $($meta.InternalApiHost)/api/v1/health" -ForegroundColor DarkGray
  docker compose -f $meta.ComposeFile exec -T $($meta.FrontContainer) sh -c "wget -q -O - http://$($meta.InternalApiHost)/api/v1/health > /dev/null" | Out-Null
  if($LASTEXITCODE -ne 0){ throw "wget exit $LASTEXITCODE" }
}

Step 'server DATABASE_URL' {
  Write-Host "[INFO] Container: $($meta.ApiContainer) Var: DATABASE_URL" -ForegroundColor DarkGray
  $envVar = docker compose -f $meta.ComposeFile exec -T $($meta.ApiContainer) sh -c 'echo $DATABASE_URL'
  if(-not $envVar){ throw 'sin DATABASE_URL' }
  if($Verbose){ Write-Host "DATABASE_URL=$envVar" }
}

if($failures.Count -gt 0){
  $joined = ($failures -join ', ')
  Write-Host ('== RESULTADO: FALLO (' + $joined + ') ==') -ForegroundColor Red
  exit 1
} else {
  Write-Host '== RESULTADO: OK ==' -ForegroundColor Green
}
