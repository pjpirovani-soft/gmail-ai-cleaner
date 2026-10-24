# BUSINESS-LOGIC - gmail-ai-cleaner

## Dominio

Clasificar y limpiar bandejas de entrada de Gmail para lograr Inbox Zero.

## Reglas de negocio (inmutables)

1. Clasificacion estricta en 3 categorias:
   - UTIL (Conservar): trabajo, banco, familia, servicios esenciales, 2FA, facturas pendientes
   - ARCHIVABLE (Archivar): confirmaciones de compra, facturas pagadas, notificaciones no urgentes
   - DESECHABLE (Eliminar): spam, promociones, newsletters viejos, redes sociales, marketing
2. Regla de oro: si no encaja con certeza -> DESECHABLE (forzar Inbox Zero).
3. Respuesta estricta: solo "Conservar", "Archivar" o "Eliminar".
4. Instrucciones personalizadas del usuario (500 chars max) tienen prioridad maxima.
5. Fallback heuristico si no hay GEMINI_API_KEY.

## Entidades principales

| Entidad | Descripcion | Campos clave |
|---|---|---|
| EmailItem | Correo individual | id, remitente, asunto, resumen, sizeBytes, date, categoria, clasificacion, motivo |
| AppUser | Usuario autenticado | id, displayName, email, avatar, accessToken, refreshToken |

## Flujos clave

1. Analisis: filtro -> fetch Gmail -> Gemini clasifica -> tabla con acciones
2. Simulacion: reporte sin tocar correos reales
3. Ejecucion: aplicar acciones (trash/archive) en Gmail real

## Roles y permisos

- Usuario autenticado (OAuth Gmail): puede leer y modificar sus correos
- Sin autenticacion: modo demo con correos mock