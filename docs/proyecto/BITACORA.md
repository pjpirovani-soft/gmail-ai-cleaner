# BITACORA - gmail-ai-cleaner

## 2026-10-24 - Sesion de documentacion CDD

### Que se hizo

- Aplicacion del sistema CDD del studio al proyecto gmail-ai-cleaner.
- Auditoria inicial: 10 hallazgos documentados en docs/audits/2026-10-24-auditoria-inicial.md
- Normalizacion de encoding (CRLF -> LF en 6 .md, sin BOM, sin mojibake).
- Creacion de .gitignore completo (node_modules, .env, build).
- Creacion de .gitattributes (LF en repo, CRLF en .ps1).
- Scripts de mantenimiento: actualizar-encoding-md, normalizar-crlf, dump-proyecto.
- Documentacion completa:
  - docs/contexto/: ROL, CONVENCIONES, DECISIONES, GLOSARIO, AI-RULES, SESSION-PROTOCOL
  - docs/proyecto/: ARCHITECTURE, BUSINESS-LOGIC, CLIENTE, SESSION-STATE, SPEC, STATUS, API, DATABASE
  - docs/calidad/: ENCODING, SEGURIDAD, TESTS
  - docs/ciclo-de-vida/: AUDITORIA, CHANGELOG, MANTENIMIENTO
  - docs/audits/: auditoria inicial

### Hallazgos de la sesion

- El proyecto NO es solo demo mock: tiene OAuth Gmail + Gmail API implementados en server.ts via fetch directo.
- Los correos mock son fallback cuando OAuth no esta configurado.
- Los 200 correos mock se generan con generateRealisticInbox().
- package.json NO incluye googleapis SDK (usa fetch directo, menor peso).
- Faltaba .gitignore completo (node_modules y .env sin proteger).

### Commits

- 1a35aa7 chore(git): completa .gitignore con reglas del studio
- 747cb13 chore(encoding): normaliza CRLF a LF en docs
- c5c53c5 chore(git): agrega .gitattributes para forzar LF en repo
- b0d4448 chore(scripts): agrega scripts de mantenimiento
- c11dfaa docs(cdd): agrega estructura CDD y PROMPT maestro
- fa9eaf9 chore(deps): agrega package-lock.json
- 0d99096 docs(cdd): audita proyecto y completa docs/contexto
- 40ca6d0 chore(scripts): agrega actualizar-bloque1.ps1
- 9be4119 docs(cdd): reescribe docs/proyecto con contenido real
- a2e7d66 chore(scripts): agrega actualizar-bloque2a.ps1
- 98632d8 docs(cdd): reescribe calidad, ciclo-de-vida, agrega API y DATABASE
- bb6e2f9 chore(scripts): agrega actualizar-bloque2b.ps1

### Lecciones

- Pegar texto de git status como comandos -> errores de parseo. Solo pegar bloques PowerShell.
- Here-strings con @"..."@ anidados y backticks -> errores de escape. Crear scripts por partes.
- core.autocrlf=true (default Windows) -> warnings. Configurar core.autocrlf=input + .gitattributes.
- Asumir que era demo mock fue incorrecto: server.ts tiene OAuth + Gmail API implementados.

### Proximos pasos

1. Configurar .env con GEMINI_API_KEY + GMAIL_CLIENT_ID + GMAIL_CLIENT_SECRET.
2. Agregar tests con Vitest (clasificador heuristico).
3. Actualizar multer@1.4.5-lts.1 -> 2.x (CVE).
4. Refactor server.ts (monolitico -> modulos).

## 2026-10-24 - Sesion inicial (previa)

- Proyecto creado desde blueprint web-app.
- Documentacion base generada.

## 2026-10-24 - Sesion de tareas (multer + Vitest)

### Que se hizo

- Tarea 1: multer@1.4.5-lts.1 -> 2.x (CVE-2025-47935, CVE-2025-47944 resueltos)
- Tarea 2: Vitest + 15 tests del clasificador heuristico
- Normalizacion de tildes en fallbackClassification (bug encontrado por tests)
- Documentacion actualizada (SEGURIDAD.md, TESTS.md)

### Commits

- 9760d58 security(deps): actualiza multer a 2.x (CVE-2025-47935, CVE-2025-47944)
- 04366dd docs(seguridad): marca multer 2.x como resuelto
- a037a73 test: agrega Vitest con 15 tests del clasificador heuristico
- 9f80309 docs(tests): actualiza TESTS.md con cobertura real

### Hallazgos

- Vitest 15/15 tests pasan (clasificador heuristico cubierto al 100%)
- Bug encontrado: fallbackClassification no matcheaba sin tildes
- Fix: normalizeText() con NFD + quitar diacriticos
- package.json se corrompio por -replace con newlines (reparado con git checkout + ConvertFrom-Json)
- multer 2.x funciona sin cambios en server.ts (API de upload.none() compatible)

### Lecciones

- NUNCA usar -replace con regex para modificar package.json (rompe JSON). Usar ConvertFrom-Json/ConvertTo-Json o npm pkg set.
- Usar C:\Users\Admin\Documents\gmail-ai-cleaner.Path para construir rutas en scripts (no rutas relativas con [System.IO.File])
- Vitest requiere export explicito de las funciones a testear
- Tests del clasificador son baratos y de alto valor (logica de negocio core)

### Proximos pasos

1. Configurar .env con GEMINI_API_KEY + GMAIL_CLIENT_ID + GMAIL_CLIENT_SECRET (Tarea 3)
2. Probar con Gmail real (OAuth flow completo)
3. Considerar refactor de server.ts (monolitico -> modulos)

## 2026-10-24 - Bloque A (saneamiento documental)

### Que se hizo

- README.md: "Gemini 3.8 Flash" -> "Gemini 2.5 Flash" (modelo inexistente)
- SESSION-STATE.md: reescrito al estado real (Fase 5 pendiente, tests OK, multer OK)
- AUDITORIA.md: multer 2.x marcado como resuelto (commit 9760d58)
- DATABASE.md: fences rotos (\\\ ypescript) -> `	ypescript validos de Markdown
- 4 scripts nuevos en scripts/ (actualizar-readme-gemini, actualizar-session-state, actualizar-auditoria-multer, actualizar-database-fences)

### Commits

- bacf4ec docs: sincroniza README, SESSION-STATE, AUDITORIA y DATABASE con estado real

### Hallazgos

- DATABASE.md tenia fences con backslashes (\\\ en vez de `), no se renderizaban como code blocks
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
