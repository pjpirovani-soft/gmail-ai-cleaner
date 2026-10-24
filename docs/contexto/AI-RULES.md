# AI-RULES — gmail-ai-cleaner

## Lo que la IA PUEDE hacer sin pedir permiso

- Leer cualquier archivo del repo.
- Crear/editar archivos en docs/, public/js/, views/.
- Correr npm test, npm run build, npm run lint (si existen).
- Proponer commits con Conventional Commits.
- Actualizar BITACORA.md y STATUS.md.

## Lo que la IA NO PUEDE hacer sin pedir permiso

- Modificar server.ts (código core de clasificación).
- Modificar .env, .env.example con valores reales.
- Pushear a main sin PR.
- Mergear PRs sin que el CI esté verde.
- Borrar archivos fuera de node_modules/ o dist/.
- Actualizar dependencias (package.json).
- Cambiar reglas de clasificación (SPEC.md o BUSINESS-LOGIC.md).

## Lo que la IA NUNCA debe hacer

- Imprimir el VALOR de GEMINI_API_KEY. Solo el NOMBRE.
- Generar scripts >150 líneas para pegar en consola.
- Asumir LF; verificar line ending antes de Replace.
- Confiar en vercel env ls para verificar valores Sensitive.
- Dejar la sesión sin actualizar BITACORA.md + STATUS.md.
- Commitear .env (siempre verificar .gitignore primero).
- Introducir dependencias sin justificar en DECISIONES.md.

## Protocolo de error

Si algo falla:
1. Pedir el output completo.
2. Diagnosticar sin adivinar.
3. Proponer el fix con explicación del por qué.
4. Si el fix toca server.ts o clasificación, pedir confirmación antes.