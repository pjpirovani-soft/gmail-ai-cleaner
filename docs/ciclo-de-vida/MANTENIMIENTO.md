# Mantenimiento — gmail-ai-cleaner

> Runbook post-entrega. Leer cuando algo falla o cuando toca mantenimiento rutinario.

## Rutina semanal

- [ ] Revisar logs de Vercel (errores 500, latencia alta)
- [ ] Revisar npm audit --omit=dev (nuevas vulnerabilidades)
- [ ] Verificar backup de Supabase (si aplica)

## Rutina mensual

- [ ] Actualizar dependencias patch/minor (npm update)
- [ ] Revisar Core Web Vitals en Vercel Speed Insights
- [ ] Revisar costos (Vercel, Supabase, servicios externos)
- [ ] Revisar logs de errores acumulados

## Runbook de incidentes

### El sitio no carga
1. Verificar status de Vercel (vercel.com/status)
2. Revisar ultimo deployment en Vercel (Rollback si es necesario)
3. Revisar logs de runtime

### La base de datos no responde
1. Verificar status de Supabase
2. Revisar conexiones activas (dashboard Supabase)
3. Verificar si hay migracion pendiente

### CVE critico en dependencia
1. Verificar si afecta produccion (npm audit --omit=dev)
2. Si afecta: actualizar dependencia, test, deploy
3. Si no afecta: documentar en STATUS y monitorear

## Actualizacion de dependencias

- Patch/minor: actualizar en sesion de mantenimiento
- Major: planificar sesion dedicada con tests
- No actualizar en viernes ni antes de entrega

## Contactos

- Responsable tecnico: (nombre, email)
- Cliente: (nombre, email)
- Escalacion: (a quien acudir si no se resuelve)

## Historial de mantenimiento

- Fecha | Que se hizo | Quien