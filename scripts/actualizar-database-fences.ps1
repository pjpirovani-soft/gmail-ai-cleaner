# actualizar-database-fences.ps1
# Convierte fences "\\\" a backticks Markdown en docs/proyecto/DATABASE.md
# Uso: powershell -ExecutionPolicy Bypass -File .\scripts\actualizar-database-fences.ps1 -NoCommit

param(
  [switch]$NoCommit
)

$ErrorActionPreference = 'Stop'
$root = 'C:\Users\Admin\Documents\gmail-ai-cleaner'
$target = Join-Path $root 'docs\proyecto\DATABASE.md'

if (-not (Test-Path $target)) {
  Write-Error "No existe $target"
  exit 1
}

$content = [System.IO.File]::ReadAllText($target, [System.Text.UTF8Encoding]::new($false))

# Contar ocurrencias antes
$countOpen = ([regex]::Matches($content, '(?m)^\\\\\\\s+ypescript\s*$')).Count
$countClose = ([regex]::Matches($content, '(?m)^\\\\\\\s*$')).Count
Write-Host "Antes: open=$countOpen close=$countClose" -ForegroundColor Cyan

if ($countOpen -eq 0 -and $countClose -eq 0) {
  Write-Host "Sin cambios: no se encontraron fences con backslashes." -ForegroundColor Yellow
  exit 0
}

# 1) Reemplazar apertura: \ \ \ + espacios + ypescript  ->  ```typescript
# En regex PowerShell: \\\\ matchea 2 backslashes literales, necesitamos 3
$openPattern = '(?m)^\\\\\\[ \t]+ypescript\s*$'
$openReplacement = '```typescript'
$content = [regex]::Replace($content, $openPattern, $openReplacement)

# 2) Reemplazar cierre: linea que es solo \ \ \  ->  ```
$closePattern = '(?m)^\\\\\\\s*$'
$closeReplacement = '```'
$content = [regex]::Replace($content, $closePattern, $closeReplacement)

[System.IO.File]::WriteAllText($target, $content, [System.Text.UTF8Encoding]::new($false))

# Verificar despues
$countOpenAfter = ([regex]::Matches($content, '(?m)^```typescript\s*$')).Count
$countCloseAfter = ([regex]::Matches($content, '(?m)^```\s*$')).Count
$stillBackslash = ([regex]::Matches($content, '\\\\\\')).Count

Write-Host "Despues: typescript=$countOpenAfter close=$countCloseAfter backslashes_restantes=$stillBackslash" -ForegroundColor Green

if ($countOpenAfter -ge 2 -and $countCloseAfter -ge 2 -and $stillBackslash -eq 0) {
  Write-Host "OK: DATABASE.md actualizado." -ForegroundColor Green
} else {
  Write-Warning "Revisar manualmente. Esperaba typescript>=2, close>=2, backslashes=0"
}

if ($NoCommit) {
  Write-Host "`n[Dry-run] No se hace commit. Revisar con: git diff docs/proyecto/DATABASE.md" -ForegroundColor Cyan
  exit 0
}