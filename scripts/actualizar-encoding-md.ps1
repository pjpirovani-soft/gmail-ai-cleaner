<#
.SYNOPSIS
  Corrige ENCODING.md con contenido adaptado a gmail-ai-cleaner.
.PARAMETER NoCommit
  Si se especifica, solo muestra que haria (dry-run).
#>
[CmdletBinding()]
param([switch]$NoCommit)

$base = "C:\Users\Admin\Documents\gmail-ai-cleaner"
$dest = Join-Path $base "docs\calidad\ENCODING.md"
$enc = [System.Text.UTF8Encoding]::new($false)

$content = @"
# ENCODING - gmail-ai-cleaner

## Reglas
- UTF-8 sin BOM (obligatorio).
- Line endings: LF (nunca CRLF en archivos que se commitean).
- PowerShell: usar [System.IO.File]::WriteAllText con UTF8Encoding(false).
- Nunca usar Out-File sin -Encoding utf8NoBOM en PowerShell 5.

## Verificar
Get-Content -Path .\server.ts -Encoding Byte -TotalCount 3
# Si empieza con 0xEF 0xBB 0xBF tiene BOM, hay que quitarlo.

## .gitattributes
Debe tener:
* text=auto eol=lf
*.ps1 text eol=crlf

## Mojibake
Si aparecen caracteres rotos (acentos mal codificados), reescribir el archivo completo con UTF-8 sin BOM.

## Estado del proyecto (2026-10-24)
- Archivos con CRLF: 7 (originales del repo)
- Archivos con BOM: 0
- Archivos con mojibake: 0 (corregido)
"@

if ($NoCommit) {
    Write-Host "[DRY-RUN] Escribiria: $dest" -ForegroundColor Yellow
    Write-Host "[DRY-RUN] Encoding: UTF-8 sin BOM" -ForegroundColor Yellow
    return
}

[System.IO.File]::WriteAllText($dest, $content, $enc)
Write-Host "OK: $dest" -ForegroundColor Green