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

\\\	ypescript
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
\\\

### AppUser

\\\	ypescript
interface AppUser {
  id: string;
  displayName: string;
  email: string;
  avatar?: string;
  accessToken: string;
  refreshToken?: string;
}
\\\

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