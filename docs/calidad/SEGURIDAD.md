# SEGURIDAD - gmail-ai-cleaner

## Regla de oro: keys nunca expuestas

Nunca ejecutar un comando que imprima el VALOR de una key. Solo el NOMBRE.

### Comandos PROHIBIDOS

- cat .env / Get-Content .env / type .env
- git show HEAD:.env
- vercel env pull sin --yes
- vercel env ls (puede mostrar fragmentos)
- echo  / Write-Host 
- printenv / env / Get-ChildItem Env:
- npm config list (puede imprimir tokens)
- git log -p -- .env*
- Pegar .env en el chat

### Comandos PERMITIDOS (solo nombres)

- Get-Content .env | ForEach-Object { ( -split '=',2)[0] }
- Select-String -Path .env -Pattern '^[A-Z_]+'
- git ls-files | Select-String '.env' (verifica que no este trackeado)
- git check-ignore .env (verifica que este ignorado)

## Variables de entorno

| Variable | Requerida | Uso |
|---|---|---|
| GMAIL_CLIENT_ID | Si (para OAuth) | OAuth2 con Google |
| GMAIL_CLIENT_SECRET | Si (para OAuth) | OAuth2 con Google |
| GMAIL_REDIRECT_URI | No (default /auth/google/callback) | Callback |
| GEMINI_API_KEY | No (fallback heuristico) | Clasificacion IA |
| SESSION_SECRET | Recomendado | Sesiones express-session |
| PORT | No (default 3000) | Puerto |
| NODE_ENV | No (default development) | Entorno |
| USER_NAME | No | Display |
| USER_EMAIL | No | Display |

## Dependencias con vulnerabilidades conocidas

| Paquete | Version actual | CVE | Accion |
|---|---|---|---|
| multer | 2.0.x | (resuelto 2026-10-24) | OK Actualizado |

## OAuth2 - Reglas

- Scopes minimos: gmail.modify (no usar gmail.full).
- access_token en sesion server-side, NUNCA en localStorage.
- httpOnly cookies para sesion.
- SESSION_SECRET debe ser aleatorio en produccion (no el default del codigo).
- Redirect URI debe coincidir exactamente con Google Cloud Console.

## Gemini API - Reglas

- GEMINI_API_KEY server-side, NUNCA en cliente.
- Rate limiting en endpoints que llaman a Gemini (pendiente).
- Si no hay key, fallback heuristico (no falla).

## Gmail API - Reglas

- Solo operaciones sobre correos del usuario autenticado (users/me).
- trash: mover a papelera (reversible).
- modify: quitar label INBOX (archivar, reversible).
- NUNCA delete permanente sin confirmacion explicita.

## Checklist antes de deploy

- [ ] .env en .gitignore (verificado)
- [ ] GEMINI_API_KEY no en logs
- [ ] GMAIL_CLIENT_SECRET no en logs
- [ ] npm audit --omit=dev sin high/critical
- [ ] SESSION_SECRET aleatorio en Vercel env vars
- [ ] Redirect URI coincide con Google Cloud Console
- [ ] HTTPS en produccion (Vercel lo hace por default)