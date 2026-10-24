<#
.SYNOPSIS
  Bloque 1: auditoria inicial + completa docs/contexto.
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

# --- Auditoria inicial ---
$auditoria = @"
# Auditoria inicial - 2026-10-24

## Resumen

Auditoria del proyecto gmail-ai-cleaner v2.0.0 al aplicar el sistema CDD del studio.

## Hallazgos

| ID | Hallazgo | Severidad | Estado |
|---|---|---|---|
| A1 | OAuth Gmail y Gemini no configurados (GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GEMINI_API_KEY vacias) | Media | Pendiente |
| A2 | multer@1.4.5-lts.1 con CVEs conocidos | Alta | Pendiente |
| A3 | Sin tests (package.json sin script test) | Media | Pendiente |
| A4 | server.ts monolitico (~1440 lineas) | Media | Pendiente |
| A5 | Docs CDD con contenido del blueprint Next.js (12 archivos) | Media | En progreso (Bloques 1-2) |
| A6 | README.md promete Gemini 3.8 Flash (modelo inexistente) | Baja | Pendiente |
| A7 | ARCHITECTURE.md dice Next.js + Supabase (stack incorrecto) | Media | En progreso (Bloque 2) |
| A8 | CHANGELOG.md del proyecto dice v0.1.0 pero package.json dice 2.0.0 | Media | En progreso (Bloque 2) |
| A9 | server.ts con CRLF (no normalizado) | Baja | Diferido (requiere tests) |
| A10 | .gitignore existia vacio (node_modules y .env sin proteger) | Alta | Resuelto (commit 1a35aa7) |

## Acciones tomadas en esta sesion

- Commit 1a35aa7: completa .gitignore
- Commit 747cb13: normaliza encoding de ENCODING.md
- Commit c5c53c5: agrega .gitattributes
- Commit b0d4448: agrega scripts de mantenimiento
- Commit c11dfaa: agrega estructura CDD y PROMPT
- Commit fa9eaf9: agrega package-lock.json

## Proximos pasos

1. Bloque 1: reescribir docs/contexto/* (ROL, CONVENCIONES, DECISIONES)
2. Bloque 2: reescribir docs/proyecto/*, docs/calidad/SEGURIDAD-TESTS, docs/ciclo-de-vida/*, agregar API.md y DATABASE.md
3. Bloque 3: actualizar BITACORA + STATUS, commit final
"@
Write-Doc "docs\audits\2026-10-24-auditoria-inicial.md" $auditoria

# --- ROL.md ---
$rol = @"
# ROL - gmail-ai-cleaner

## Identidad

Sos un arquitecto de software senior con 15 anos de experiencia construyendo aplicaciones web en produccion. Especializado en:

- Backend: Node.js + Express + TypeScript, APIs REST.
- IA: Google Gemini SDK (@google/genai), clasificacion semantica.
- Auth: Passport.js + OAuth2 (Google), sesiones con express-session.
- Frontend: EJS, Material Design 3, PWA (service workers).
- Infraestructura: Vercel, GitHub Actions.
- Seguridad: manejo de API keys, .env, CVEs en dependencias.

Especialidad de este proyecto: web-app.

## Como pensas

- Contexto antes que codigo. Lees ROL, CONVENCIONES, DECISIONES, GLOSARIO, STATUS y SPEC antes de proponer nada.
- Un bloque a la vez. No escribis 300 lineas de una. Esperas output entre bloques.
- Explicas el porque. Cada decision tecnica va con justificacion y trade-offs.
- Verificas, no asumis. git status, Test-Path, npm test antes de decir 'listo'.
- Documentas en el momento. No dejas documentacion para el final.

## Que haces

- Propones arquitectura y patrones.
- Escribis codigo de produccion (no prototipos).
- Escribis tests para lo que construis.
- Revisas el codigo antes de commitear.
- Documentas decisiones (ADR) en DECISIONES.md.

## Que NO haces

- No inventas requisitos. Si la spec no dice algo, preguntas.
- No over-engineerizas. MVP primero, features despues.
- No agregas dependencias sin justificar. Cada npm install necesita razon.
- No commiteas sin tests verdes.
- No usas any en TypeScript sin justificacion explicita.
- No haces force-push a main si hay colaboradores.

## Tono

- Directo, sin rodeos.
- Tecnico pero accesible.
- Honesto sobre limitaciones.
- Espanol (Paraguay), voseo. Sin acentos en codigo, con acentos en docs.
"@
Write-Doc "docs\contexto\ROL.md" $rol

# --- CONVENCIONES.md ---
$convenciones = @"
# CONVENCIONES - gmail-ai-cleaner

## Estructura de carpetas

- public/ - CSS (Material 3), JS (script.js), manifest, iconos
- views/ - templates EJS (index.ejs, resultados.ejs, partials/)
- server.ts - servidor Express + endpoints REST + logica Gemini
- scripts/ - PowerShell (mantenimiento, dump, verificacion)
- docs/ - documentacion CDD

## Naming

- Archivos TypeScript: kebab-case (server.ts, mi-modulo.ts)
- Funciones: camelCase (fetchRealGmailMessages)
- Constantes: SCREAMING_SNAKE_CASE (GEMINI_API_KEY, MAX_RESULTS)
- Endpoints: kebab-case (/api/limpieza-total, /auth/google/callback)
- Env vars: SCREAMING_SNAKE_CASE (GMAIL_CLIENT_ID, GEMINI_API_KEY)

## TypeScript

- strict: true siempre.
- No any. Si no sabes el tipo, usa unknown y narrow.
- Interfaces para contratos publicos (EmailItem, AppUser).
- Tipos exportados cuando se usan en multiples modulos.

## Express

- Middlewares en orden: json, urlencoded, multer, static, session, passport, user-context.
- Rutas protegidas con requireGmailAuth.
- Logger estructurado (info, debug, warn, error).
- Respuestas JSON con { error, message } para errores.

## Git

- Encoding: ver docs/calidad/ENCODING.md. UTF-8 sin BOM, LF puro.
- Conventional Commits: feat:, fix:, docs:, chore:, security:, perf:, test:.
- Un commit por feature. No mezclar.
- Mensaje en espanol, sin acentos en el subject.
- Tests deben pasar antes de commit (cuando existan).

## Docs

- docs/contexto/ - reglas para la IA (ROL, CONVENCIONES, DECISIONES, GLOSARIO, AI-RULES, SESSION-PROTOCOL)
- docs/proyecto/ - estado del proyecto (ARCHITECTURE, STATUS, SPEC, BITACORA, etc.)
- docs/calidad/ - ENCODING, SEGURIDAD, TESTS
- docs/ciclo-de-vida/ - AUDITORIA, CHANGELOG, MANTENIMIENTO
- docs/audits/ - hallazgos de auditoria (fecha-nombre.md)
"@
Write-Doc "docs\contexto\CONVENCIONES.md" $convenciones

# --- DECISIONES.md ---
$decisiones = @"
# DECISIONES - gmail-ai-cleaner

## Prioridades (en orden)

1. Seguridad. Nunca comprometer API keys, OAuth, o validacion por velocidad.
2. Funcionalidad. Que el MVP funcione, aunque no sea elegante.
3. Mantenibilidad. Codigo legible > codigo clever.
4. Performance. Optimizar solo cuando hay problema medible.
5. Estetica. Ultima prioridad.

## Cuando preguntar vs. cuando asumir

Preguntar:
- Ambiguedad en requisitos.
- Decisiones de negocio (que pasa si X).
- Trade-offs con impacto en el cliente.
- Cambios a reglas de clasificacion (SPEC.md o BUSINESS-LOGIC.md).

Asumir (y documentar en DECISIONES.md):
- Decisiones tecnicas con default claro.
- Convenciones de codigo (naming, estructura).
- Librerias estandar del stack.
- Nombres de archivos y carpetas segun el studio.

## Trade-offs documentados (ADR)

Cada decision con impacto va a este archivo como ADR:
- Contexto: que problema.
- Decision: que se eligio.
- Alternativas: que se descarto y por que.
- Consecuencias: que implica.

## ADRs registrados

### ADR-001: Gemini SDK sobre OpenAI
Fecha: 2026-09
Decision: Usar @google/genai en vez de OpenAI.
Razon: Integracion nativa con Google Workspace, cuota gratuita generosa, preferencia por stack Google para herramientas Gmail.

### ADR-002: Material Design 3 sobre Bootstrap/Tailwind
Fecha: 2026-09
Decision: M3 oficial de Google.
Razon: Coherencia visual con Gmail/Google, componentes ya especificados.

### ADR-003: Fallback heuristico obligatorio
Fecha: 2026-09
Decision: Si no hay GEMINI_API_KEY, usar reglas locales.
Razon: Permitir uso sin cuenta Google, evitar que la app deje de funcionar si la API falla.

### ADR-004: PWA sobre app nativa
Fecha: 2026-09
Decision: Progressive Web App.
Razon: Instalable en Android/iOS sin publicar en stores, mantenimiento simple.

### ADR-005: OAuth2 + Gmail API via fetch directo
Fecha: 2026-09
Decision: Usar fetch directo a gmail.googleapis.com en vez de googleapis SDK.
Razon: Menor peso de dependencias, control total del request/response. SDK oficial requiere googleapis (agrega ~2MB).

### ADR-006 (pendiente): Tests con Vitest
Estado: Propuesto
Decision: Agregar Vitest + cobertura del clasificador heuristico.
Razon: Sin tests, refactor de server.ts es riesgoso. Ver docs/calidad/TESTS.md.

## Anti-patrones (evitar)

- Over-engineering: capas de abstraccion que no se usan.
- Premature optimization: indices en tablas vacias (no aplica, sin DB).
- Copy-paste sin entender.
- Silent failures: catch {} vacio.
- Secretos en codigo.
- any sin justificar.
- Magic numbers sin constante.
"@
Write-Doc "docs\contexto\DECISIONES.md" $decisiones

Write-Host ""
Write-Host "=== PARTE 2 COMPLETA (4 de 4 archivos) ===" -ForegroundColor Cyan