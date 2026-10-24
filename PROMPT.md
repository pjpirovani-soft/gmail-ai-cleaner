# PROMPT — gmail-ai-cleaner

## Antes de actuar

Leer en orden:
1. docs/contexto/ROL.md — quién sos y cómo pensás.
2. docs/contexto/CONVENCIONES.md — cómo escribir código.
3. docs/contexto/DECISIONES.md — cómo decidir.
4. docs/contexto/GLOSARIO.md — vocabulario del dominio.
5. docs/proyecto/STATUS.md — estado actual.
6. docs/proyecto/SPEC.md — alcance del proyecto.

Después de leer, confirmar entendimiento y proponer el primer bloque.

Soy Pedro J. Pirovani, desarrollador freelance (Paraguay). Este proyecto es **gmail-ai-cleaner** (tipo: web-app).

## ⚠️ Contexto crítico del proyecto

**Demo funcional, NO conectado a Gmail real.** Los correos mostrados son mock.
Requiere OAuth2 + Gmail API para ser funcional end-to-end.
Ver docs/proyecto/STATUS.md para pendientes.

## Metodología obligatoria (20 reglas)

1. Recon primero: leer archivos antes de tocarlos.
2. Scripts en bloques cortos (max 60 lineas). Evitar here-strings gigantes.
3. Verificar con git status, git log, Test-Path antes de asumir.
4. Sin BOM: usar [System.IO.File]::WriteAllText con UTF8Encoding(false).
5. Un commit por feature o grupo lógico.
6. Documentar cada sesión en BITACORA.md + STATUS.md.
7. Explicar el por qué de cada decisión.
8. Si un Replace falla por CRLF, normalizar a LF antes.
9. Si hay mojibake, reescribir archivo completo con UTF-8 sin BOM.
10. Un bloque a la vez. Esperar output antes del siguiente.
11. Nunca imprimir el VALOR de GEMINI_API_KEY. Solo el NOMBRE. Prohibido: cat .env, Get-Content .env, git show de .env.
12. Here-strings: abre con at-comilla, cierra con comilla-at al inicio de línea. Verificar antes de guardar.
13. Line endings: detectar CRLF vs LF antes de modificar. Nunca asumir LF.
14. Invocar scripts: powershell -ExecutionPolicy Bypass -File scripts/.../NN.ps1.
15. Scripts de fix: aceptar -NoCommit (dry-run). Correr con -NoCommit primero.
16. Nomenclatura: crear-*.ps1, actualizar-*.ps1, verificar-*.ps1, orquestar-*.ps1.
17. Scripts >150 líneas: crear/editar en VS Code. NUNCA pegar en consola.
18. Commits: Conventional Commits (feat, fix, docs, chore, security, perf, test).
19. Historial: git filter-repo (no git filter-branch).
20. vercel env ls miente con valores Sensitive. Verificar con env pull o dashboard.

## Stack del proyecto

Express + TypeScript (server.ts), EJS (views/), Material Design 3 (public/), @google/genai (Gemini SDK), PWA (service-worker.js), Vercel (vercel.json).

## Reglas de negocio inmutables

1. Si no encaja con certeza → DESECHABLE (forzar Inbox Zero).
2. Respuesta estricta: solo "Conservar", "Archivar" o "Eliminar".
3. Instrucciones personalizadas del usuario (500 chars) = prioridad máxima.
4. Fallback heurístico si no hay GEMINI_API_KEY.

## Protocolo de sesión

1. **Empezar:** leer STATUS.md + últimas 3 entradas de BITACORA.md + SPEC.md.
2. **Durante:** un bloque a la vez, verificar output antes del siguiente.
3. **Terminar:** tests verdes + build verde + BITACORA + STATUS + commit + push.

## Protocolo de cierre de sesión

1. git status limpio.
2. npm test + npm run build verdes (si existen).
3. Actualizar docs/proyecto/BITACORA.md (con plantilla).
4. Actualizar docs/proyecto/STATUS.md (progreso + próximos 3 pasos).
5. Commit + push.
6. Próximos 3 pasos anotados.

## Lo que NO va en este repo

- Código con secretos reales → .env del proyecto (nunca commitear).
- Datos personales de correos reales → no aplica (usa mock).
- Credenciales OAuth de Gmail → cuando se integre, .env + gestor de secretos.

## Comandos

npm install
Copy-Item .env.example .env   # editar GEMINI_API_KEY
npm run dev                    # http://localhost:3000

## Pendientes críticos (ver docs/proyecto/STATUS.md)

- Gmail API + OAuth2 (integrar de verdad)
- Actualizar multer@1.4.5 → 2.x (vulnerabilidades)
- Refactor server.ts monolítico
- Tests (Vitest, referencia: blueprints/web-app)

## Primer paso

Leer docs/proyecto/STATUS.md y docs/proyecto/SPEC.md antes de cualquier acción.
Luego, proponer un plan de 3 bloques cortos para la tarea en curso.