# API - gmail-ai-cleaner

> Contrato de endpoints REST. Ver server.ts para implementacion.

## Autenticacion (OAuth2 Gmail)

### GET /auth/google

Redirige a Google para iniciar sesion y autorizar gmail.modify.

**Response:** 302 a accounts.google.com

### GET /auth/google/callback

Callback de Google. Intercambia code por tokens.

**Query params:** code, state
**Response:** 302 a / (con sesion creada)

### GET /auth/logout

Cierra sesion.

**Response:** 302 a /

## Endpoints de analisis (requieren auth)

### POST /analizar

Analiza correos con Gemini o fallback heuristico.

**Headers:** Cookie de sesion (obligatorio)
**Body:**
\\\json
{
  "query": "older_than:1y",
  "limite": 50,
  "instrucciones": "No elimines correos del banco"
}
\\\

**Response 200:**
\\\json
{
  "correos": [
    {
      "id": "...",
      "remitente": "ofertas@tienda.com",
      "asunto": "Mega descuento 70%",
      "clasificacion": "Eliminar",
      "motivo": "Promocion comercial"
    }
  ],
  "metricas": { "eliminar": 4, "archivar": 4, "conservar": 2 }
}
\\\

**Response 401:** No autenticado
**Response 400:** Filtro vacio

### POST /api/limpieza-total/preparar

Prepara lista de correos a procesar (no modifica nada).

**Body:** { "filterType": "viejos", "customQuery": "older_than:1y" }
**Response 200:** { "items": [...] }

### POST /api/limpieza-total/procesar-lote

Procesa un lote con clasificacion Gemini.

**Body:** { "items": [...], "instrucciones": "..." }
**Response 200:** { "items": [...con clasificacion...] }

### POST /api/limpieza-total/ejecutar

Ejecuta acciones reales en Gmail (trash/archive).

**Body:**
\\\json
{
  "items": [
    { "id": "msg_id", "accion": "Eliminar" },
    { "id": "msg_id2", "accion": "Archivar" }
  ]
}
\\\

**Response 200:**
\\\json
{
  "trashed": 2,
  "archived": 1,
  "liberado": "15.2 MB"
}
\\\

**Response 401:** No autenticado

## Endpoints de PWA

### GET /service-worker.js

Sirve el service worker con headers PWA.

### GET /manifest.json

Sirve el manifest PWA.

## Endpoints de salud

### GET /health

Health check para monitoreo.

**Response 200:** { "status": "ok", "version": "2.0.0", "uptime": 3600 }

## Codigos de error comunes

| Codigo | Significado |
|---|---|
| 200 | OK |
| 302 | Redirect (OAuth) |
| 400 | Bad request (validacion) |
| 401 | No autenticado |
| 500 | Error interno |

## Rate limiting

- Pendiente de implementar.
- Gemini free tier: 15 req/min, 1500 req/dia.
- Gmail API: 250 unidades/usuario/segundo.