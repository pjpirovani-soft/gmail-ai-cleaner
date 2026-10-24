# SESSION-PROTOCOL — gmail-ai-cleaner

## Al iniciar sesión
1. cd C:\Users\Admin\Documents\gmail-ai-cleaner
2. git pull
3. Leer docs/proyecto/STATUS.md (estado actual)
4. Leer últimas 3 entradas de docs/proyecto/BITACORA.md
5. Leer docs/proyecto/SPEC.md (alcance)
6. npm run dev para verificar que arranca

## Durante la sesión
- Un bloque a la vez, verificar output.
- Commits pequeños (un feature = un commit).
- Actualizar STATUS.md si cambia el estado.
- Documentar decisiones nuevas en docs/contexto/DECISIONES.md.

## Al cerrar sesión
1. Tests verdes (si los hay)
2. npm run build (si aplica)
3. Actualizar docs/proyecto/BITACORA.md con resumen
4. Actualizar docs/proyecto/STATUS.md
5. git add -A && git commit -m "..." (Conventional Commits)
6. git push