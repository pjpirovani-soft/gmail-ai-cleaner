<#
.SYNOPSIS
  Bloque 2a: reescribe docs/proyecto/* con contenido real de gmail-ai-cleaner.
.PARAMETER NoCommit
  Dry-run: solo muestra que haria.
#>
[CmdletBinding()]
param([switch]$NoCommit)

$base = "C:\Users\Admin\Documents\gmail-ai-cleaner"
$enc = [System.Text.UTF8Encoding]::new($false)

function Write-Doc {
    param([string]$relPath, [string]$content)
    $dest = Join-Path $base $relPath
    $dir = Split-Path $dest -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    if ($NoCommit) {
        Write-Host "[DRY-RUN] Escribiria: $relPath ($($content.Length) chars)" -ForegroundColor Yellow
        return
    }
    [System.IO.File]::WriteAllText($dest, $content, $enc)
    Write-Host "OK: $relPath" -ForegroundColor Green
}

# --- ARCHITECTURE.md ---
$architecture = @"
# ARCHITECTURE - gmail-ai-cleaner

## Stack

- Backend: Node.js + Express + TypeScript (tsx para ejecucion directa)
- Frontend: EJS + Material Design 3 (CSS) + JS vanilla
- IA: Google Gemini SDK (@google/genai)
- Auth: Passport.js + passport-google-oauth20
- Sesiones: express-session
- PWA: Service Worker + manifest
- Deploy: Vercel (vercel.json)
- Sin base de datos (correos en memoria)

## Estructura

public/ - CSS, JS, manifest, iconos
views/ - templates EJS (index, resultados, partials)
server.ts - Express + endpoints + Gemini + OAuth
service-worker.js - PWA (App Shell + offline)
vercel.json - config de deploy
docs/ - documentacion CDD

## Flujo de datos

1. Usuario entra a http://localhost:3000
2. Si no esta autenticado, redirige a /auth/google (OAuth)
3. Google devuelve access_token via /auth/google/callback
4. Sesion guarda access_token + datos del usuario
5. Usuario escribe filtro Gmail + instrucciones para Gemini
6. POST /api/limpieza-total/preparar -> fetchRealGmailMessages()
7. Gemini (o fallback heuristico) clasifica cada correo
8. Usuario elige modo: Simular / Automatico / Interactivo
9. POST /api/limpieza-total/ejecutar -> trashRealGmailMessage() o archiveRealGmailMessage()

## Integraciones externas

- gmail.googleapis.com - lectura y modificacion de correos
- oauth2.googleapis.com - OAuth2 flow
- generativelanguage.googleapis.com - Gemini API
- fonts.googleapis.com - Roboto y Material Symbols

## Decisiones clave (ADR)

Ver docs/contexto/DECISIONES.md (ADR-001 a ADR-006).

## Modo fallback (sin OAuth/Gemini)

- Sin GMAIL_CLIENT_ID/SECRET: correos mock (200 generados)
- Sin GEMINI_API_KEY: clasificador heuristico por palabras clave
- App arranca igual, con warnings en log
"@
Write-Doc "docs\proyecto\ARCHITECTURE.md" $architecture

# --- BUSINESS-LOGIC.md ---
$business = @"
# BUSINESS-LOGIC - gmail-ai-cleaner

## Dominio

Clasificar y limpiar bandejas de entrada de Gmail para lograr Inbox Zero.

## Reglas de negocio (inmutables)

1. Clasificacion estricta en 3 categorias:
   - UTIL (Conservar): trabajo, banco, familia, servicios esenciales, 2FA, facturas pendientes
   - ARCHIVABLE (Archivar): confirmaciones de compra, facturas pagadas, notificaciones no urgentes
   - DESECHABLE (Eliminar): spam, promociones, newsletters viejos, redes sociales, marketing
2. Regla de oro: si no encaja con certeza -> DESECHABLE (forzar Inbox Zero).
3. Respuesta estricta: solo "Conservar", "Archivar" o "Eliminar".
4. Instrucciones personalizadas del usuario (500 chars max) tienen prioridad maxima.
5. Fallback heuristico si no hay GEMINI_API_KEY.

## Entidades principales

| Entidad | Descripcion | Campos clave |
|---|---|---|
| EmailItem | Correo individual | id, remitente, asunto, resumen, sizeBytes, date, categoria, clasificacion, motivo |
| AppUser | Usuario autenticado | id, displayName, email, avatar, accessToken, refreshToken |

## Flujos clave

1. Analisis: filtro -> fetch Gmail -> Gemini clasifica -> tabla con acciones
2. Simulacion: reporte sin tocar correos reales
3. Ejecucion: aplicar acciones (trash/archive) en Gmail real

## Roles y permisos

- Usuario autenticado (OAuth Gmail): puede leer y modificar sus correos
- Sin autenticacion: modo demo con correos mock
"@
Write-Doc "docs\proyecto\BUSINESS-LOGIC.md" $business

# --- CLIENTE.md ---
$cliente = @"
# CLIENTE - gmail-ai-cleaner

## Contacto

- Nombre: Pedro J. Pirovani (proyecto interno, uso personal)
- Email: pirovanipedrojose@gmail.com
- GitHub: pjpirovani-soft
- Canal: desarrollo propio

## Proyecto

- Tipo: web-app (herramienta personal)
- Repo: https://github.com/pjpirovani-soft/gmail-ai-cleaner (publico)
- Deploy: https://gmail-ai-cleaner-nu.vercel.app
- Licencia: MIT
- Proposito: Inbox Zero personal + demo tecnica de clasificacion con Gemini

## Historial de cambios de alcance

- 2026-03-15: v1.0.0 inicial (Tailwind, Python backend)
- 2026-09-07: v2.0.0 (Material 3, Express + Gemini, PWA)
- 2026-09-07: v2.1.0 (3 categorias estrictas, instrucciones personalizadas)
- 2026-10-24: aplicacion del sistema CDD del studio
"@
Write-Doc "docs\proyecto\CLIENTE.md" $cliente

# --- SESSION-STATE.md ---
$sessionState = @"
# SESSION-STATE - gmail-ai-cleaner

Actualizado: 2026-10-24

> Handoff entre sesiones. Leerlo primero al arrancar. Actualizarlo al cerrar.

## Estado actual (30 segundos)

- Fase: documentacion CDD (aplicando studio)
- Trabajando en: Bloque 2 (reescritura docs/proyecto, calidad, ciclo-de-vida)
- Bloqueado por: nada

## Open Loops (acciones sin verificar)

- [x] Commit 8 (script Bloque 1) pusheado a origin/main
- [ ] Bloque 2a: docs/proyecto/* (6 archivos)
- [ ] Bloque 2b: docs/calidad/*, docs/ciclo-de-vida/*, API.md, DATABASE.md (8 archivos)
- [ ] Bloque 3: BITACORA + STATUS + verificacion final

## Follow-ups (tareas diferidas)

- [ ] Configurar .env con GEMINI_API_KEY + OAuth (GMAIL_CLIENT_ID/SECRET)
- [ ] Tests con Vitest (clasificador heuristico)
- [ ] Refactor server.ts (monolitico -> modulos)
- [ ] Actualizar multer@1.4.5-lts.1 -> 2.x (CVE)

## Decisiones de la sesion

- Bloque 2 dividido en 2a (proyecto) y 2b (calidad + ciclo + nuevos) por limite de 150 lineas.
- Trabajar directo en main (repo personal, sin colaboradores).

## Lecciones (que fallo y como evitarlo)

- Pegar texto de `git status` como si fueran comandos -> errores de parseo. Solo pegar bloques PowerShell.
- Here-strings con `@"..."@` anidados y backticks -> errores de escape. Crear scripts por partes.
- `core.autocrlf=true` (default Windows) -> warnings. Configurar `core.autocrlf=input` + `.gitattributes`.

## Proximos 3 pasos (para la proxima sesion)

1. Terminar Bloque 2a (docs/proyecto/*)
2. Ejecutar Bloque 2b (docs/calidad/* + ciclo-de-vida + API.md + DATABASE.md)
3. Bloque 3: BITACORA + STATUS + verificacion + push
"@
Write-Doc "docs\proyecto\SESSION-STATE.md" $sessionState

# --- SPEC.md ---
$spec = @"
# SPEC - gmail-ai-cleaner

## Objetivo

Clasificar y limpiar bandejas de Gmail con IA para lograr Inbox Zero.

## Alcance

### Incluido en MVP (v2.0.0)

- Lectura de correos reales via Gmail API (con OAuth configurado)
- Clasificacion estricta en 3 categorias (Util / Archivable / Desechable)
- Fallback heuristico sin GEMINI_API_KEY
- Correos mock (200) sin OAuth configurado
- Instrucciones personalizadas para Gemini (500 chars)
- Tres modos de limpieza (Simulacion / Automatico / Interactivo)
- UI Material Design 3
- PWA instalable (Android + iOS)
- Deploy en Vercel

### Excluido del MVP (futuro)

- Persistencia de acciones en DB
- Multiples usuarios (cada uno con su cuenta)
- Historial de acciones
- Programacion de limpieza automatica (cron)
- Filtros guardados

## Funcionalidades

### Portal publico (autenticado via OAuth)

- Login con Google
- Filtro de busqueda Gmail (sintaxis nativa)
- Instrucciones personalizadas para Gemini
- Tabla de correos con clasificacion
- Seleccion masiva + accion por fila
- 3 modos de limpieza

### Panel de metricas

- Contador de correos a eliminar / archivar / conservar
- Espacio liberable estimado

## Criterios de aceptacion (v2.0.0)

- [x] Clasificacion con Gemini (o fallback heuristico)
- [x] UI Material Design 3
- [x] PWA instalable
- [x] Instrucciones personalizadas (500 chars)
- [x] 3 modos de limpieza
- [x] Build pasa (npm run build)
- [x] Dev arranca (npm run dev)
- [ ] Tests (pendiente, ver docs/calidad/TESTS.md)
- [ ] OAuth + Gemini configurados en .env (pendiente)

## Fases

1. Demo con mock (actual) - completado
2. Configuracion OAuth + Gemini real - proximo
3. Tests (Vitest) - pendiente
4. Refactor server.ts (modulos) - pendiente
"@
Write-Doc "docs\proyecto\SPEC.md" $spec

# --- STATUS.md ---
$status = @"
# STATUS - gmail-ai-cleaner

Actualizado: 2026-10-24

## Progreso

- [x] Fase 1: setup inicial (repo clonado, deps instaladas, build + dev OK)
- [x] Fase 2: features core (v2.0.0 con OAuth + Gemini + fallback + PWA)
- [x] Fase 3: v2.1.0 (3 categorias estrictas, instrucciones personalizadas)
- [ ] Fase 4: tests (Vitest para clasificador heuristico)
- [ ] Fase 5: configuracion OAuth + Gemini en .env
- [x] Documentacion CDD (Bloque 1: contexto + auditoria; Bloque 2: proyecto)
- [ ] Bloque 3: BITACORA + STATUS final + push

## Proximos 3 pasos

1. Terminar Bloque 2 (docs/proyecto, calidad, ciclo-de-vida, API.md, DATABASE.md)
2. Bloque 3: BITACORA + STATUS + verificacion + push
3. Configurar .env con GEMINI_API_KEY + OAuth (fuera de esta sesion de docs)

## Bloqueantes

- Ninguno para documentacion.
- Para uso funcional real: configurar GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GEMINI_API_KEY en .env.

## Deuda pendiente

- multer@1.4.5-lts.1 con CVEs conocidos -> actualizar a 2.x
- server.ts monolitico (~1440 lineas) -> refactor a modulos
- Tests no existen -> agregar Vitest
- README.md promete "Gemini 3.8 Flash" (modelo inexistente) -> corregir en sesion futura
- server.ts con CRLF -> normalizar cuando haya tests

## Metricas del proyecto

- Version: 2.0.0
- Node: v24.19.0
- Dependencias: 173 packages
- Vulnerabilidades npm: 0
- Commits en main: 8 (esta sesion)
- Documentos CDD: 20 (11 completos, 9 pendientes de reescribir)
"@
Write-Doc "docs\proyecto\STATUS.md" $status

Write-Host ""
Write-Host "=== BLOQUE 2A COMPLETO (6 de 6 archivos) ===" -ForegroundColor Cyan