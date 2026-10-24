# actualizar-session-state.ps1
# Reescribe docs/proyecto/SESSION-STATE.md con el estado real post-sesion
# Uso: powershell -ExecutionPolicy Bypass -File .\scripts\actualizar-session-state.ps1 -NoCommit

param(
  [switch]$NoCommit
)

$ErrorActionPreference = 'Stop'
$root = 'C:\Users\Admin\Documents\gmail-ai-cleaner'
$target = Join-Path $root 'docs\proyecto\SESSION-STATE.md'

if (-not (Test-Path $target)) {
  Write-Error "No existe $target"
  exit 1
}

$content = @'
# SESSION-STATE - gmail-ai-cleaner

Actualizado: 2026-10-24 (post-sesion Bloque A)

> Handoff entre sesiones. Leerlo primero al arrancar. Actualizarlo al cerrar.

## Estado actual (30 segundos)

- Fase: Fase 5 pendiente (configuracion OAuth + Gemini en .env)
- Trabajando en: Bloque A (saneamiento documental post-tests)
- Bloqueado por: nada

## Open Loops (acciones sin verificar)

- [x] Bloque A1: README.md corregido (Gemini 3.8 Flash -> Gemini 2.5 Flash)
- [ ] Bloque A2: SESSION-STATE.md (este archivo)
- [ ] Bloque A3: AUDITORIA.md (marcar multer resuelto)
- [ ] Bloque A4: DATABASE.md (fix mojibake en code fences)
- [ ] Commit unico del Bloque A

## Follow-ups (tareas diferidas)

- [ ] Configurar .env con GEMINI_API_KEY + GMAIL_CLIENT_ID + GMAIL_CLIENT_SECRET (Fase 5)
- [ ] Probar OAuth flow completo con Gmail real
- [ ] Refactor server.ts (monolitico -> modulos)
- [ ] Rate limiting en endpoints Gemini (deuda SEGURIDAD.md)
- [ ] Headers de seguridad con helmet (deuda AUDITORIA.md)

## Decisiones de la sesion

- Bloque A agrupa los 4 fixes documentales en un solo commit (docs:).
- No se toca server.ts en esta sesion (AI-RULES: requiere permiso explicito).
- Dry-run (-NoCommit) primero en cada script de fix.

## Lecciones (que fallo y como evitarlo)

- Pegar el OUTPUT de la consola de vuelta en la consola -> errores de parseo. Solo pegar bloques de COMANDO, nunca el output.
- Modo multilinea (>>) se activa si hay comilla o bloque sin cerrar. Ctrl+C para volver al prompt limpio.
- VS Code: verificar barra de estado (UTF-8 / LF) antes de guardar scripts.
- files.encoding=utf8 + files.eol=\n en settings.json evita BOM y CRLF por default.

## Proximos 3 pasos (para la proxima sesion)

1. Cerrar Bloque A (A2, A3, A4) + commit unico
2. Fase 5: configurar .env con credenciales reales (requiere intervencion de Pedro)
3. Decidir Bloque C: rate limiting (recomendado) vs helmet vs refactor
'@

# Escribir UTF-8 sin BOM, LF puro
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$contentLf = $content -replace "`r`n", "`n"
[System.IO.File]::WriteAllText($target, $contentLf, $utf8NoBom)

# Verificar
$size = (Get-Item $target).Length
$firstLine = (Get-Content $target -TotalCount 1)
Write-Host "OK: SESSION-STATE.md actualizado ($size bytes). Primera linea:" -ForegroundColor Green
Write-Host "  $firstLine"

if ($NoCommit) {
  Write-Host "`n[Dry-run] No se hace commit. Revisar con: git diff docs/proyecto/SESSION-STATE.md" -ForegroundColor Cyan
  exit 0
}