# CONVENCIONES — gmail-ai-cleaner

## Código
- TypeScript en server.ts, JS en public/js/.
- EJS para templates.
- Material Design 3 (paleta oficial: #1A73E8, #34A853, #EA4335, #FBBC04).
- Tipografía: Roboto. Iconos: Google Material Symbols.
- Sin BOM. UTF-8 sin BOM (ver docs/calidad/ENCODING.md).
- Line endings: LF.

## Commits
Conventional Commits: feat, fix, docs, chore, security, perf, test.
Ejemplo: feat(clasificacion): añadir fallback para correos del banco

## Ramas
- main → producción (deploy Vercel)
- feat/xxx → features
- fix/xxx → fixes

## Scripts PowerShell
- Nomenclatura: crear-*.ps1, actualizar-*.ps1, verificar-*.ps1, orquestar-*.ps1.
- Máx 60 líneas por bloque pegado en consola.
- Ejecutar con powershell -ExecutionPolicy Bypass -File scripts/.../NN.ps1.