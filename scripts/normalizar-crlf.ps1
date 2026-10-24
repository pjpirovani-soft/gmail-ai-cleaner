<#
.SYNOPSIS
  Normaliza archivos con CRLF a LF (UTF-8 sin BOM).
.PARAMETER NoCommit
  Dry-run: solo muestra que haria.
.PARAMETER IncludeServerTs
  Incluye server.ts (archivo riesgoso). Requiere tests verdes.
#>
[CmdletBinding()]
param([switch]$NoCommit, [switch]$IncludeServerTs)

$base = "C:\Users\Admin\Documents\gmail-ai-cleaner"
$enc = [System.Text.UTF8Encoding]::new($false)

$targets = @(
    "CHANGELOG.md",
    "CONTRIBUTING.md",
    "GUIA_DE_DESPLIEGUE.md",
    "GUIA_DE_USUARIO.md",
    "GUIA_PWA.md",
    "README.md"
)
if ($IncludeServerTs) { $targets += "server.ts" }

$normalizados = 0
$saltados = 0

foreach ($rel in $targets) {
    $path = Join-Path $base $rel
    if (-not (Test-Path $path)) {
        Write-Host "SKIP: $rel no existe" -ForegroundColor Yellow
        $saltados++
        continue
    }

    $bytes = [System.IO.File]::ReadAllBytes($path)
    $hasCRLF = $false
    for ($i = 0; $i -lt $bytes.Length - 1; $i++) {
        if ($bytes[$i] -eq 13 -and $bytes[$i+1] -eq 10) { $hasCRLF = $true; break }
    }

    if (-not $hasCRLF) {
        Write-Host "SKIP: $rel ya es LF" -ForegroundColor Green
        $saltados++
        continue
    }

    if ($NoCommit) {
        Write-Host "[DRY-RUN] Normalizaria a LF: $rel" -ForegroundColor Yellow
        $normalizados++
        continue
    }

    $text = [System.IO.File]::ReadAllText($path)
    $text = $text -replace "`r`n", "`n"
    [System.IO.File]::WriteAllText($path, $text, $enc)
    Write-Host "OK: $rel -> LF" -ForegroundColor Green
    $normalizados++
}

Write-Host ""
Write-Host "Normalizados: $normalizados | Saltados: $saltados" -ForegroundColor Cyan