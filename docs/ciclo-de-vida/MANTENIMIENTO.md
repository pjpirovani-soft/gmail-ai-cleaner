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