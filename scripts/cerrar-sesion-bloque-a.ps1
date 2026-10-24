# cerrar-sesion-bloque-a.ps1
# Agrega entrada a BITACORA.md y actualiza STATUS.md (protocolo de cierre)
# Uso: powershell -ExecutionPolicy Bypass -File .\scripts\cerrar-sesion-bloque-a.ps1 -NoCommit

param(
  [switch]$NoCommit
)

$ErrorActionPreference = 'Stop'
$root = 'C:\Users\Admin\Documents\gmail-ai-cleaner'
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)

# --- BITACORA.md: append entrada ---
$bitacora = Join-Path $root 'docs\proyecto\BITACORA.md'
if (-not (Test-Path $bitacora)) { Write-Error "No existe $bitacora"; exit 1 }

$entrada = @"

## 2026-10-24 - Bloque A (saneamiento documental)

### Que se hizo

- README.md: "Gemini 3.8 Flash" -> "Gemini 2.5 Flash" (modelo inexistente)
- SESSION-STATE.md: reescrito al estado real (Fase 5 pendiente, tests OK, multer OK)
- AUDITORIA.md: multer 2.x marcado como resuelto (commit 9760d58)
- DATABASE.md: fences rotos (\\\ ypescript) -> ```typescript validos de Markdown
- 4 scripts nuevos en scripts/ (actualizar-readme-gemini, actualizar-session-state, actualizar-auditoria-multer, actualizar-database-fences)

### Commits

- bacf4ec docs: sincroniza README, SESSION-STATE, AUDITORIA y DATABASE con estado real

### Hallazgos

- DATABASE.md tenia fences con backslashes (\\\ en vez de ```), no se renderizaban como code blocks
- Script inicial de fences fallo (regex esperaba backticks, archivo tenia backslashes) - corregido
- API.md verificado: no tiene el mismo bug

### Lecciones

- Verificar SIEMPRE la forma exacta del texto a reemplazar (Get-Content con Skip/First) antes de escribir regex
- PowerShell en modo multilinea (>>) es fragil con texto que empieza con - o [
- VS Code con files.encoding=utf8 + files.eol=\n evita BOM y CRLF por default

### Proximos pasos

1. Fase 5: configurar .env con GEMINI_API_KEY + GMAIL_CLIENT_ID + GMAIL_CLIENT_SECRET
2. Probar OAuth flow completo con Gmail real
3. Decidir Bloque C: rate limiting (recomendado) vs helmet vs refactor server.ts
"@

$bitacoraContent = [System.IO.File]::ReadAllText($bitacora, $utf8NoBom)
if ($bitacoraContent -match 'Bloque A \(saneamiento documental\)') {
  Write-Host "BITACORA: entrada ya existe, no se duplica." -ForegroundColor Yellow
} else {
  $bitacoraLf = $bitacoraContent -replace "`r`n", "`n"
  $entradaLf = $entrada -replace "`r`n", "`n"
  [System.IO.File]::WriteAllText($bitacora, ($bitacoraLf.TrimEnd() + "`n" + $entradaLf + "`n"), $utf8NoBom)
  Write-Host "BITACORA.md: entrada agregada." -ForegroundColor Green
}

# --- STATUS.md: reescribir ---
$status = Join-Path $root 'docs\proyecto\STATUS.md'
if (-not (Test-Path $status)) { Write-Error "No existe $status"; exit 1 }

$statusContent = @'
# STATUS - gmail-ai-cleaner

Actualizado: 2026-10-24 (post Bloque A)

## Progreso

- [x] Fase 1: setup inicial (repo clonado, deps instaladas, build + dev OK)
- [x] Fase 2: features core (v2.0.0 con OAuth + Gemini + fallback + PWA)
- [x] Fase 3: v2.1.0 (3 categorias estrictas, instrucciones personalizadas)
- [x] Documentacion CDD (Bloque 1 + Bloque 2a + Bloque 2b + Bloque 3)
- [x] Fase 4: tests (Vitest, 15 tests del clasificador heuristico)
- [x] Bloque A: saneamiento documental (README, SESSION-STATE, AUDITORIA, DATABASE)
- [ ] Fase 5: configuracion OAuth + Gemini en .env

## Proximos 3 pasos

1. Fase 5: configurar .env con GEMINI_API_KEY + GMAIL_CLIENT_ID + GMAIL_CLIENT_SECRET (requiere intervencion de Pedro)
2. Probar con Gmail real (OAuth flow completo)
3. Decidir Bloque C: rate limiting (recomendado) vs helmet vs refactor server.ts

## Bloqueantes

- Ninguno para documentacion (completada).
- Para uso funcional real: variables de entorno no configuradas.

## Deuda pendiente

- ~~multer@1.4.5-lts.1 con CVEs conocidos -> actualizar a 2.x~~ RESUELTO (commit 9760d58)
- ~~README.md promete "Gemini 3.8 Flash" (modelo inexistente)~~ RESUELTO (Bloque A, commit bacf4ec)
- ~~SESSION-STATE.md desactualizado~~ RESUELTO (Bloque A, commit bacf4ec)
- ~~AUDITORIA.md lista multer como pendiente~~ RESUELTO (Bloque A, commit bacf4ec)
- ~~DATABASE.md con fences rotos (\\\ ypescript)~~ RESUELTO (Bloque A, commit bacf4ec)
- server.ts monolitico (~1440 lineas) -> refactor a modulos
- server.ts con CRLF -> normalizar cuando se toque server.ts
- Rate limiting en endpoints Gemini (pendiente, deuda SEGURIDAD.md)
- Headers de seguridad con helmet (pendiente, deuda AUDITORIA.md)

## Metricas del proyecto

- Version: 2.0.0
- Node: v24.19.0
- Dependencias: 173 packages, 0 vulnerabilidades npm
- Documentos CDD: 22 completos
- Tests: 15/15 verdes (clasificador heuristico)

## Documentacion CDD (estado final)

- docs/contexto/: ROL, CONVENCIONES, DECISIONES, GLOSARIO, AI-RULES, SESSION-PROTOCOL (6)
- docs/proyecto/: ARCHITECTURE, BUSINESS-LOGIC, BITACORA, CLIENTE, SESSION-STATE, SPEC, STATUS, API, DATABASE (9)
- docs/calidad/: ENCODING, SEGURIDAD, TESTS (3)
- docs/ciclo-de-vida/: AUDITORIA, CHANGELOG, MANTENIMIENTO (3)
- docs/audits/: auditoria inicial (1)
- PROMPT.md (raiz)
'@

$statusLf = $statusContent -replace "`r`n", "`n"
[System.IO.File]::WriteAllText($status, $statusLf, $utf8NoBom)
Write-Host "STATUS.md: reescrito al estado post-Bloque A." -ForegroundColor Green

# Verificar sin BOM
$bytes = [System.IO.File]::ReadAllBytes($bitacora)[0..2]
Write-Host "BITACORA primeros bytes: $($bytes -join ',')"
$bytes = [System.IO.File]::ReadAllBytes($status)[0..2]
Write-Host "STATUS primeros bytes: $($bytes -join ',')"

if ($NoCommit) {
  Write-Host "`n[Dry-run] No se hace commit. Revisar con: git diff docs/proyecto/" -ForegroundColor Cyan
  exit 0
}