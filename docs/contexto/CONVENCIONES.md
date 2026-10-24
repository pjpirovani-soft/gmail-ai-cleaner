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