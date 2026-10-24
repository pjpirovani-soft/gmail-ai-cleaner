<#
.SYNOPSIS
  Bloque 2b parte 1: reescribe docs/calidad/*, docs/ciclo-de-vida/AUDITORIA, CHANGELOG.
.PARAMETER NoCommit
  Dry-run.
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

# --- SEGURIDAD.md ---
$seguridad = @"
# SEGURIDAD - gmail-ai-cleaner

## Regla de oro: keys nunca expuestas

Nunca ejecutar un comando que imprima el VALOR de una key. Solo el NOMBRE.

### Comandos PROHIBIDOS

- cat .env / Get-Content .env / type .env
- git show HEAD:.env
- vercel env pull sin --yes
- vercel env ls (puede mostrar fragmentos)
- echo $env:GEMINI_API_KEY / Write-Host $env:GEMINI_API_KEY
- printenv / env / Get-ChildItem Env:
- npm config list (puede imprimir tokens)
- git log -p -- .env*
- Pegar .env en el chat

### Comandos PERMITIDOS (solo nombres)

- Get-Content .env | ForEach-Object { ($_ -split '=',2)[0] }
- Select-String -Path .env -Pattern '^[A-Z_]+'
- git ls-files | Select-String '.env' (verifica que no este trackeado)
- git check-ignore .env (verifica que este ignorado)

## Variables de entorno

| Variable | Requerida | Uso |
|---|---|---|
| GMAIL_CLIENT_ID | Si (para OAuth) | OAuth2 con Google |
| GMAIL_CLIENT_SECRET | Si (para OAuth) | OAuth2 con Google |
| GMAIL_REDIRECT_URI | No (default /auth/google/callback) | Callback |
| GEMINI_API_KEY | No (fallback heuristico) | Clasificacion IA |
| SESSION_SECRET | Recomendado | Sesiones express-session |
| PORT | No (default 3000) | Puerto |
| NODE_ENV | No (default development) | Entorno |
| USER_NAME | No | Display |
| USER_EMAIL | No | Display |

## Dependencias con vulnerabilidades conocidas

| Paquete | Version actual | CVE | Accion |
|---|---|---|---|
| multer | 1.4.5-lts.1 | Multiples CVEs | URGENTE: actualizar a 2.x |

## OAuth2 - Reglas

- Scopes minimos: gmail.modify (no usar gmail.full).
- access_token en sesion server-side, NUNCA en localStorage.
- httpOnly cookies para sesion.
- SESSION_SECRET debe ser aleatorio en produccion (no el default del codigo).
- Redirect URI debe coincidir exactamente con Google Cloud Console.

## Gemini API - Reglas

- GEMINI_API_KEY server-side, NUNCA en cliente.
- Rate limiting en endpoints que llaman a Gemini (pendiente).
- Si no hay key, fallback heuristico (no falla).

## Gmail API - Reglas

- Solo operaciones sobre correos del usuario autenticado (users/me).
- trash: mover a papelera (reversible).
- modify: quitar label INBOX (archivar, reversible).
- NUNCA delete permanente sin confirmacion explicita.

## Checklist antes de deploy

- [ ] .env en .gitignore (verificado)
- [ ] GEMINI_API_KEY no en logs
- [ ] GMAIL_CLIENT_SECRET no en logs
- [ ] npm audit --omit=dev sin high/critical
- [ ] SESSION_SECRET aleatorio en Vercel env vars
- [ ] Redirect URI coincide con Google Cloud Console
- [ ] HTTPS en produccion (Vercel lo hace por default)
"@
Write-Doc "docs\calidad\SEGURIDAD.md" $seguridad

# --- TESTS.md ---
$tests = @"
# TESTS - gmail-ai-cleaner

## Estado actual

NO hay tests configurados. package.json no tiene script "test".

## Plan de testing (Vitest)

### Unitarios (prioridad alta)

- Clasificador heuristico: funcion pura, facil de testear.
  - Input: EmailItem
  - Output: "Conservar" | "Archivar" | "Eliminar"
  - Casos: newsletter -> Eliminar, factura -> Archivar, jefe -> Conservar, default -> Eliminar

- Parsing de respuesta de Gemini: texto -> categoria.
  - Casos: "Conservar", "Archivar", "Eliminar", texto invalido -> fallback

### Integracion (prioridad media)

- POST /analizar con mock de Gemini SDK.
- POST /api/limpieza-total/ejecutar en modo simulacion (no toca Gmail).

### E2E (futuro, Playwright)

- Flujo completo: OAuth -> filtro -> analizar -> simular.

## Configuracion

1. Instalar Vitest:
   npm install -D vitest @vitest/coverage-v8

2. Crear vitest.config.ts:
   import { defineConfig } from 'vitest/config'
   export default defineConfig({ test: { environment: 'node' } })

3. Agregar a package.json:
   "scripts": {
     "test": "vitest",
     "test:coverage": "vitest --coverage"
   }

## Cobertura minima

- Clasificador heuristico: 100% (funcion pura, barato de testear)
- Endpoints REST: 80%
- Total: 70%

## CI (GitHub Actions)

- npm ci
- npm run build
- npm test
- (futuro) deploy a Vercel si verde
"@
Write-Doc "docs\calidad\TESTS.md" $tests

# --- AUDITORIA.md ---
$auditoria = @"
# AUDITORIA - gmail-ai-cleaner

> Checklist obligatorio antes de cada release o deploy.

## 1. Pre-flight (siempre)

- [ ] git status limpio (todo commiteado)
- [ ] npm run build exitoso
- [ ] npm run dev arranca sin errores
- [ ] GET http://localhost:3000 responde 200
- [ ] npm audit --omit=dev sin vulnerabilidades high/critical

## 2. Seguridad

- [ ] .env en .gitignore (git check-ignore .env)
- [ ] GEMINI_API_KEY no aparece en logs
- [ ] GMAIL_CLIENT_SECRET no aparece en logs
- [ ] SESSION_SECRET aleatorio en produccion
- [ ] OAuth scopes minimos (solo gmail.modify)
- [ ] Redirect URI coincide con Google Cloud Console
- [ ] HTTPS en produccion
- [ ] Headers de seguridad (pendiente en server.ts)

## 3. Dependencias

- [ ] npm outdated revisado
- [ ] multer@1.4.5 -> 2.x (URGENTE por CVEs)
- [ ] CVEs conocidos evaluados
- [ ] No aplicar npm audit fix --force sin revisar

## 4. Codigo

- [ ] Sin console.log con datos sensibles (usar logger estructurado)
- [ ] Sin any sin justificar
- [ ] Sin TODO/FIXME sin documentar en STATUS.md
- [ ] Sin secretos hardcodeados
- [ ] server.ts con CRLF (pendiente de normalizar con tests verdes)

## 5. Frontend

- [ ] Sin innerHTML con datos del usuario (XSS)
- [ ] PWA instalable en Android + iOS
- [ ] Service worker actualiza correctamente

## 6. Deploy (Vercel)

- [ ] Env vars configuradas en dashboard
- [ ] Health check responde (GET /)
- [ ] Dominio funcionando
- [ ] CI verde en el ultimo push
- [ ] Rollback plan documentado

## Resultado

- Fecha:
- Auditor:
- Aprobado: SI / NO
- Notas:
"@
Write-Doc "docs\ciclo-de-vida\AUDITORIA.md" $auditoria

# --- CHANGELOG.md ---
$changelog = @"
# CHANGELOG - gmail-ai-cleaner

Formato: Keep a Changelog + Semantic Versioning.

## [Unreleased]

### Added (2026-10-24)
- Documentacion CDD del studio:
  - docs/contexto/: ROL, CONVENCIONES, DECISIONES, GLOSARIO, AI-RULES, SESSION-PROTOCOL
  - docs/proyecto/: ARCHITECTURE, BUSINESS-LOGIC, CLIENTE, SESSION-STATE, SPEC, STATUS
  - docs/calidad/: ENCODING, SEGURIDAD, TESTS
  - docs/ciclo-de-vida/: AUDITORIA, CHANGELOG, MANTENIMIENTO
  - docs/audits/: auditoria inicial 2026-10-24
- Scripts PowerShell de mantenimiento:
  - actualizar-encoding-md.ps1
  - normalizar-crlf.ps1
  - dump-proyecto.ps1
  - actualizar-bloque1.ps1
  - actualizar-bloque2a.ps1
- .gitignore completo (node_modules, .env, build, etc.)
- .gitattributes (LF en repo, CRLF en .ps1)
- package-lock.json (reproducibilidad)

## [2.1.0] - 2026-09-07

### Added
- Taxonomia estricta de 3 categorias (UTIL / ARCHIVABLE / DESECHABLE)
- Regla de descarte por defecto (si no encaja -> DESECHABLE)
- Restriccion univoca de salida ("Conservar" | "Archivar" | "Eliminar")
- Campo de instrucciones personalizadas para Gemini (500 chars)
- Persistencia de instrucciones en localStorage
- Inyeccion prioritaria de instrucciones en prompt de Gemini

### Changed
- README.md, GUIA_DE_USUARIO.md, CHANGELOG.md documentan las 3 categorias

## [2.0.0] - 2026-09-07

### Added
- Rediseno completo Material Design 3 (M3)
- Migracion de Python a Node.js + Express + TypeScript
- Integracion con @google/genai (Gemini)
- Panel de metricas con 3 tarjetas
- Tabla interactiva con paginacion (5, 10, 25)
- Chips de filtro rapido (older_than:1y, from:newsletter, etc.)
- 3 modos de limpieza (Simulacion, Automatico, Interactivo)
- PWA instalable (Android + iOS)
- Service Worker con offline
- Notificaciones Snackbar Material
- Endpoint /health para monitoreo
- Motor heuristico de respaldo (sin API key)
- 200 correos mock para testing

### Changed
- OAuth2 Gmail implementado con passport-google-oauth20
- Gmail API via fetch directo a gmail.googleapis.com
- Scopes: userinfo.profile, userinfo.email, gmail.modify

### Documentation
- GUIA_DE_USUARIO.md, GUIA_DE_DESPLIEGUE.md, GUIA_PWA.md, CONTRIBUTING.md, LICENSE

## [1.0.0] - 2026-03-15

### Added
- Prototipo inicial
- Busqueda simple de correos
- Clasificacion preliminar en 3 categorias
- UI basica con Tailwind CSS
"@
Write-Doc "docs\ciclo-de-vida\CHANGELOG.md" $changelog

# --- MANTENIMIENTO.md ---
$mantenimiento = @"
# MANTENIMIENTO - gmail-ai-cleaner

> Runbook post-release. Leer cuando algo falla o cuando toca mantenimiento.

## Rutina semanal

- [ ] Revisar logs de Vercel (errores 500, latencia)
- [ ] npm audit --omit=dev (nuevas vulnerabilidades)
- [ ] Verificar cuotas Gemini API (Google AI Studio)
- [ ] Verificar cuotas Gmail API (Google Cloud Console)

## Rutina mensual

- [ ] Actualizar dependencias patch/minor (npm update)
- [ ] Revisar @google/genai (nuevas versiones del SDK)
- [ ] Revisar modelo Gemini en uso (gemini-2.5-flash actual)
- [ ] Revisar costos (Vercel, Google Cloud, Gemini)
- [ ] Probar PWA en dispositivos reales (Android + iOS)

## Rutina trimestral

- [ ] Auditoria completa (ver AUDITORIA.md)
- [ ] Rotar SESSION_SECRET
- [ ] Rotar GEMINI_API_KEY si hubo exposicion
- [ ] Revisar OAuth scopes (minimos necesarios)
- [ ] Revisar Google Cloud Console (credenciales activas)

## Runbook de incidentes

### El sitio no carga (Vercel)

1. Verificar status de Vercel (vercel.com/status)
2. Revisar ultimo deployment (rollback si es necesario)
3. Revisar logs de runtime

### Gmail API responde 401

1. Verificar que access_token no expiro (1h)
2. Verificar refresh_token valido
3. Si refresh_token revocado, usuario debe re-autenticarse
4. Revisar OAuth consent screen en Google Cloud Console

### Gmail API responde 403

1. Verificar scopes (debe tener gmail.modify)
2. Verificar cuota diaria (10.000 unidades/dia gratis)
3. Si supera cuota, esperar reset o solicitar aumento

### Gemini API responde 429

1. Verificar cuota (free tier: 15 req/min, 1500 req/dia)
2. Si supera, fallback heuristico se activa automaticamente
3. Considerar upgrade a paid tier si es recurrente

### CVE critico en dependencia

1. npm audit --omit=dev para ver severidad
2. Si afecta produccion: actualizar, test, deploy
3. Si no afecta: documentar en STATUS y monitorear

## Actualizacion de dependencias

- Patch/minor: sesion de mantenimiento
- Major: sesion dedicada con tests
- No actualizar viernes ni antes de entrega/demo

## Contactos

- Responsable tecnico: Pedro J. Pirovani (pirovanipedrojose@gmail.com)
- Repo: https://github.com/pjpirovani-soft/gmail-ai-cleaner

## Historial de mantenimiento

| Fecha | Que se hizo | Quien |
|---|---|---|
| 2026-10-24 | Aplicacion CDD del studio, docs completas | Pedro + IA |
"@
Write-Doc "docs\ciclo-de-vida\MANTENIMIENTO.md" $mantenimiento

# --- API.md ---
$api = @"
# API - gmail-ai-cleaner

> Contrato de endpoints REST. Ver server.ts para implementacion.

## Autenticacion (OAuth2 Gmail)

### GET /auth/google

Redirige a Google para iniciar sesion y autorizar gmail.modify.

**Response:** 302 a accounts.google.com

### GET /auth/google/callback

Callback de Google. Intercambia code por tokens.

**Query params:** code, state
**Response:** 302 a / (con sesion creada)

### GET /auth/logout

Cierra sesion.

**Response:** 302 a /

## Endpoints de analisis (requieren auth)

### POST /analizar

Analiza correos con Gemini o fallback heuristico.

**Headers:** Cookie de sesion (obligatorio)
**Body:**
\`\`\`json
{
  "query": "older_than:1y",
  "limite": 50,
  "instrucciones": "No elimines correos del banco"
}
\`\`\`

**Response 200:**
\`\`\`json
{
  "correos": [
    {
      "id": "...",
      "remitente": "ofertas@tienda.com",
      "asunto": "Mega descuento 70%",
      "clasificacion": "Eliminar",
      "motivo": "Promocion comercial"
    }
  ],
  "metricas": { "eliminar": 4, "archivar": 4, "conservar": 2 }
}
\`\`\`

**Response 401:** No autenticado
**Response 400:** Filtro vacio

### POST /api/limpieza-total/preparar

Prepara lista de correos a procesar (no modifica nada).

**Body:** { "filterType": "viejos", "customQuery": "older_than:1y" }
**Response 200:** { "items": [...] }

### POST /api/limpieza-total/procesar-lote

Procesa un lote con clasificacion Gemini.

**Body:** { "items": [...], "instrucciones": "..." }
**Response 200:** { "items": [...con clasificacion...] }

### POST /api/limpieza-total/ejecutar

Ejecuta acciones reales en Gmail (trash/archive).

**Body:**
\`\`\`json
{
  "items": [
    { "id": "msg_id", "accion": "Eliminar" },
    { "id": "msg_id2", "accion": "Archivar" }
  ]
}
\`\`\`

**Response 200:**
\`\`\`json
{
  "trashed": 2,
  "archived": 1,
  "liberado": "15.2 MB"
}
\`\`\`

**Response 401:** No autenticado

## Endpoints de PWA

### GET /service-worker.js

Sirve el service worker con headers PWA.

### GET /manifest.json

Sirve el manifest PWA.

## Endpoints de salud

### GET /health

Health check para monitoreo.

**Response 200:** { "status": "ok", "version": "2.0.0", "uptime": 3600 }

## Codigos de error comunes

| Codigo | Significado |
|---|---|
| 200 | OK |
| 302 | Redirect (OAuth) |
| 400 | Bad request (validacion) |
| 401 | No autenticado |
| 500 | Error interno |

## Rate limiting

- Pendiente de implementar.
- Gemini free tier: 15 req/min, 1500 req/dia.
- Gmail API: 250 unidades/usuario/segundo.
"@
Write-Doc "docs\proyecto\API.md" $api

# --- DATABASE.md ---
$database = @"
# DATABASE - gmail-ai-cleaner

> Estado actual: SIN base de datos. Los correos viven en memoria (mock o Gmail real via API).

## Estado actual

- Sin base de datos persistente.
- Sin migraciones SQL.
- Sin RLS (no aplica).
- Los correos se obtienen de:
  1. Gmail API (si OAuth configurado)
  2. generateRealisticInbox() (200 mock, si no hay OAuth)

## Modelo de datos (interfaces TypeScript)

### EmailItem

\`\`\`typescript
interface EmailItem {
  id: string;
  remitente: string;
  asunto: string;
  resumen: string;
  sizeBytes: number;
  date: string;
  categoria: 'promociones' | 'social' | 'viejos' | 'pesados' | 'inbox';
  isOlderThan1Year: boolean;
  clasificacion?: 'Eliminar' | 'Archivar' | 'Conservar';
  motivo?: string;
  inTrash?: boolean;
  archived?: boolean;
}
\`\`\`

### AppUser

\`\`\`typescript
interface AppUser {
  id: string;
  displayName: string;
  email: string;
  avatar?: string;
  accessToken: string;
  refreshToken?: string;
}
\`\`\`

## Persistencia de sesion

- express-session con MemoryStore (default).
- En produccion: usar store persistente (Redis, DB) si se necesita.
- Actualmente, sesiones se pierden al reiniciar el server.

## Cuando agregar base de datos

Casos que justificarian una DB:
- Historial de acciones (que se elimino, cuando, por que).
- Multiples usuarios con preferencias guardadas.
- Instrucciones personalizadas por usuario (actualmente localStorage).
- Cache de clasificaciones (evitar re-clasificar con Gemini).

Stack sugerido si se agrega DB:
- PostgreSQL (Supabase o Neon) + RLS.
- Migraciones SQL numeradas.
- Zod para validacion.
- Ver docs/calidad/SEGURIDAD.md para reglas.

## Datos sensibles

- access_token de Gmail: en sesion server-side, nunca en cliente.
- refresh_token: en sesion server-side.
- GEMINI_API_KEY: en .env, nunca en codigo.
"@
Write-Doc "docs\proyecto\DATABASE.md" $database

Write-Host ""
Write-Host "=== BLOQUE 2B COMPLETO (7 de 7 archivos) ===" -ForegroundColor Cyan