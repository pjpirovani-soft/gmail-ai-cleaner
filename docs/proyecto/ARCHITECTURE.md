# ARCHITECTURE - gmail-ai-cleaner

## Stack

- Backend: Node.js + Express + TypeScript (tsx para ejecucion directa)
- Frontend: EJS + Material Design 3 (CSS) + JS vanilla
- IA: Google Gemini SDK (@google/genai)
- Auth: Passport.js + passport-google-oauth20
- Sesiones: express-session
- PWA: Service Worker + manifest
- Deploy: Vercel (vercel.json)
- Sin base de datos (correos en memoria)

## Estructura

public/ - CSS, JS, manifest, iconos
views/ - templates EJS (index, resultados, partials)
server.ts - Express + endpoints + Gemini + OAuth
service-worker.js - PWA (App Shell + offline)
vercel.json - config de deploy
docs/ - documentacion CDD

## Flujo de datos

1. Usuario entra a http://localhost:3000
2. Si no esta autenticado, redirige a /auth/google (OAuth)
3. Google devuelve access_token via /auth/google/callback
4. Sesion guarda access_token + datos del usuario
5. Usuario escribe filtro Gmail + instrucciones para Gemini
6. POST /api/limpieza-total/preparar -> fetchRealGmailMessages()
7. Gemini (o fallback heuristico) clasifica cada correo
8. Usuario elige modo: Simular / Automatico / Interactivo
9. POST /api/limpieza-total/ejecutar -> trashRealGmailMessage() o archiveRealGmailMessage()

## Integraciones externas

- gmail.googleapis.com - lectura y modificacion de correos
- oauth2.googleapis.com - OAuth2 flow
- generativelanguage.googleapis.com - Gemini API
- fonts.googleapis.com - Roboto y Material Symbols

## Decisiones clave (ADR)

Ver docs/contexto/DECISIONES.md (ADR-001 a ADR-006).

## Modo fallback (sin OAuth/Gemini)

- Sin GMAIL_CLIENT_ID/SECRET: correos mock (200 generados)
- Sin GEMINI_API_KEY: clasificador heuristico por palabras clave
- App arranca igual, con warnings en log