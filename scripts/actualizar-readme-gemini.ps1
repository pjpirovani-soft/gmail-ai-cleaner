# actualizar-readme-gemini.ps1
# Reemplaza "Gemini 3.8 Flash" por "Gemini 2.5 Flash" en README.md
# Uso: powershell -ExecutionPolicy Bypass -File .\scripts\actualizar-readme-gemini.ps1 -NoCommit

param(
  [switch]$NoCommit
)

$ErrorActionPreference = 'Stop'
$root = 'C:\Users\Admin\Documents\gmail-ai-cleaner'
$readme = Join-Path $root 'README.md'

if (-not (Test-Path $readme)) {
  Write-Error "No existe README.md en $root"
  exit 1
}

$content = [System.IO.File]::ReadAllText($readme, [System.Text.UTF8Encoding]::new($false))

$oldText = 'Gemini 3.8 Flash'
$newText = 'Gemini 2.5 Flash'

if ($content -notmatch [regex]::Escape($oldText)) {
  Write-Host "Sin cambios: no se encontro '$oldText' en README.md" -ForegroundColor Yellow
  exit 0
}

$newContent = $content -replace [regex]::Escape($oldText), $newText

[System.IO.File]::WriteAllText($readme, $newContent, [System.Text.UTF8Encoding]::new($false))

$verify = Select-String -Path $readme -Pattern 'Gemini 2\.5 Flash'
if ($verify) {
  Write-Host "OK: README.md actualizado. Linea $($verify.LineNumber):" -ForegroundColor Green
  Write-Host "  $($verify.Line.Trim())"
} else {
  Write-Error "Fallo la verificacion post-replace"
  exit 1
}

if ($NoCommit) {
  Write-Host "`n[Dry-run] No se hace commit. Revisar con: git diff README.md" -ForegroundColor Cyan
  exit 0
}

Write-Host "`nListo. Revisar con: git diff README.md" -ForegroundColor Cyan