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