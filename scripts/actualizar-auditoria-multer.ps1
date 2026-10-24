# actualizar-auditoria-multer.ps1
# Marca multer 2.x como resuelto en docs/ciclo-de-vida/AUDITORIA.md
# Uso: powershell -ExecutionPolicy Bypass -File .\scripts\actualizar-auditoria-multer.ps1 -NoCommit

param(
  [switch]$NoCommit
)

$ErrorActionPreference = 'Stop'
$root = 'C:\Users\Admin\Documents\gmail-ai-cleaner'
$target = Join-Path $root 'docs\ciclo-de-vida\AUDITORIA.md'

if (-not (Test-Path $target)) {
  Write-Error "No existe $target"
  exit 1
}

$content = [System.IO.File]::ReadAllText($target, [System.Text.UTF8Encoding]::new($false))

$oldLine = '- [ ] multer@1.4.5 -> 2.x (URGENTE por CVEs)'
$newLine = '- [x] multer@1.4.5 -> 2.x (RESUELTO 2026-10-24, ver SEGURIDAD.md)'

if ($content -notmatch [regex]::Escape($oldLine)) {
  Write-Host "Sin cambios: no se encontro la linea exacta en AUDITORIA.md" -ForegroundColor Yellow
  Write-Host "Buscando coincidencias parciales:" -ForegroundColor Yellow
  Select-String -Path $target -Pattern 'multer' | ForEach-Object {
    Write-Host "  L$($_.LineNumber): $($_.Line)"
  }
  exit 1
}

$newContent = $content -replace [regex]::Escape($oldLine), $newLine

[System.IO.File]::WriteAllText($target, $newContent, [System.Text.UTF8Encoding]::new($false))

$verify = Select-String -Path $target -Pattern 'multer@1\.4\.5.*RESUELTO'
if ($verify) {
  Write-Host "OK: AUDITORIA.md actualizada. Linea $($verify.LineNumber):" -ForegroundColor Green
  Write-Host "  $($verify.Line.Trim())"
} else {
  Write-Error "Fallo la verificacion post-replace"
  exit 1
}

if ($NoCommit) {
  Write-Host "`n[Dry-run] No se hace commit. Revisar con: git diff docs/ciclo-de-vida/AUDITORIA.md" -ForegroundColor Cyan
  exit 0
}