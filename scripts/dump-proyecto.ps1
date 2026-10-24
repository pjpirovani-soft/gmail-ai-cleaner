$ErrorActionPreference = 'Stop'
# dump-proyecto.ps1 - Genera un dump del proyecto para pegar a una IA.
# Uso: powershell -ExecutionPolicy Bypass -File scripts/dump-proyecto.ps1
# Salida: portapapeles (no escribe archivo, no persiste secretos).

$n = [Environment]::NewLine
$root = (Get-Location).Path
$ts = Get-Date -Format 'yyyy-MM-dd HHmm'
$sb = [System.Text.StringBuilder]::new()

function Add-Line([string]$text = '') { [void]$sb.AppendLine($text) }
function Add-Block([string]$title, [string]$content) {
  Add-Line ('--- ' + $title + ' ---')
  Add-Line $content.TrimEnd()
  Add-Line ''
}
function Try-Git([string]$argsStr) {
  try { $out = & git $argsStr.Split(' '); if ($LASTEXITCODE -ne 0) { return $null }; return $out }
  catch { return $null }
}

Add-Line ('=== DUMP PROYECTO - ' + $ts + ' ===')
Add-Line ('Root: ' + $root)
Add-Line ''
Add-Line '## Repo'
Add-Line ('Remote: ' + (Try-Git 'config --get remote.origin.url'))
Add-Line ('Branch: ' + (Try-Git 'rev-parse --abbrev-ref HEAD'))
Add-Line ('HEAD:   ' + (Try-Git 'log --oneline -1'))
Add-Line ''
Add-Line '## Git log (ultimos 5)'
Add-Line (((Try-Git 'log --oneline -5') -join $n))
Add-Line ''
Add-Line '## Git status'
$status = ((Try-Git 'status --short') -join $n)
if ([string]::IsNullOrWhiteSpace($status)) { $status = '(clean)' }
Add-Line $status
Add-Line ''
Add-Line '## Estructura top-level'
Add-Line ((Get-ChildItem -Directory | Select-Object -ExpandProperty Name) -join $n)
Add-Line ''

# Docs CDD del proyecto
foreach ($sub in @('docs/contexto','docs/proyecto','docs/calidad','docs/ciclo-de-vida')) {
  $dir = Join-Path $root $sub
  if (Test-Path $dir) {
    Add-Line ('## ' + $sub)
    Add-Line ''
    Get-ChildItem $dir -Filter '*.md' -File | ForEach-Object {
      if ($_.Name -eq 'BITACORA.md') {
        Add-Block ($sub + '/' + $_.Name + ' (ultimas 40 lineas)') ((Get-Content -Path $_.FullName -Tail 40 -Encoding UTF8) -join $n)
      } else {
        Add-Block ($sub + '/' + $_.Name) ([System.IO.File]::ReadAllText($_.FullName, [System.Text.UTF8Encoding]::new($false)))
      }
    }
  }
}

# Archivos clave en raiz
foreach ($f in @('PROMPT.md','README.md','CHANGELOG.md','package.json','vercel.json','service-worker.js')) {
  $path = Join-Path $root $f
  if (Test-Path $path) {
    Add-Block $f ([System.IO.File]::ReadAllText($path, [System.Text.UTF8Encoding]::new($false)))
  }
}

# Env vars: solo nombres
$envPath = Join-Path $root '.env'
if (Test-Path $envPath) {
  $keys = Get-Content -Path $envPath -Encoding UTF8 | Where-Object { $_ -match '^\s*[A-Z_][A-Z0-9_]*\s*=' } | ForEach-Object { ($_ -split '=',2)[0].Trim() }
  Add-Line '## Variables de entorno (solo nombres, valores ocultos)'
  Add-Line ($keys -join $n)
  Add-Line ''
}

# server.ts (limitado a primeras 200 lineas para no explotar tokens)
$serverTs = Join-Path $root 'server.ts'
if (Test-Path $serverTs) {
  Add-Block 'server.ts (primeras 200 lineas)' ((Get-Content -Path $serverTs -TotalCount 200 -Encoding UTF8) -join $n)
}

Add-Line '=== FIN DEL DUMP ==='

$dump = $sb.ToString()
Write-Host ('Dump generado: ' + $dump.Length + ' caracteres') -ForegroundColor Green
Set-Clipboard -Value $dump
Write-Host 'Copiado al portapapeles.' -ForegroundColor Green