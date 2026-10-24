# Seguridad — gmail-ai-cleaner

## RLS (Row Level Security) — OBLIGATORIO

- **Toda tabla con datos de usuario tiene RLS habilitado.** Sin excepción.
- Tabla sin RLS = datos abiertos al mundo con la anon key.
- Políticas: SELECT, INSERT, UPDATE, DELETE separadas. No usar FOR ALL salvo casos simples.
- Cada política usa uth.uid() o uth.jwt() para identificar al usuario.
- Testear RLS con pgTAP. Si no se testea, no existe.

## Service Role

- **NUNCA en cliente.** Bypasea RLS. Solo en server actions/API routes.
- Si una operación necesita service_role, documentar por qué en ARCHITECTURE.md.

## Validación

- **Zod en boundaries:** API routes, server actions, formularios.
- Validar en servidor, no solo en cliente (cliente se bypasea con DevTools).
- Schemas compartidos: lib/schema.ts exporta schema + tipo inferido.

## Auth

- **Server-side validation:** usar getClaims() en server, no getSession(). [citation:4]
- httpOnly cookies para sesión (Supabase lo maneja por defecto).
- Mensajes de error genéricos en login/registro: 'Email o contraseña inválidos'. No revelar si el email existe.
- Rate limiting en login/register (ej. 5 intentos por minuto).

## Headers

- CSP, HSTS, X-Frame-Options en 
ext.config.ts. [citation:4]

## Rate limiting

- Implementar en login, registro, formularios públicos, API routes sensibles.
- Usar Upstash Redis o similar en producción.

## Git y CI

- Nunca commitear .env* ni secretos.
- GitHub Actions pinneadas a SHA, no a tags mutables. [citation:5]
- 
pm ci en CI, no 
pm install (reproducible).

## Checklist antes de deploy

- [ ] RLS habilitado en todas las tablas
- [ ] RLS testeado con pgTAP
- [ ] Sin service_role en cliente
- [ ] Zod en todos los boundaries
- [ ] Auth server-side en rutas protegidas
- [ ] Rate limiting en login/register
- [ ] Headers de seguridad configurados
- [ ] .env.local en .gitignore"

## Regla de oro: keys nunca expuestas

**Nunca ejecutar un comando que imprima el VALOR de una key. Solo el NOMBRE.**

### Comandos PROHIBIDOS (exponen valores)

- `cat .env.local` / `Get-Content .env.local` / `type .env.local` (imprime keys)
- `git show HEAD:.env.local` (imprime keys del commit)
- `vercel env pull` sin `--yes` (escribe .env.local con valores reales)
- `vercel env ls` (la columna 'Value' puede mostrar fragmentos de keys)
- `echo $env:API_KEY` / `Write-Host $env:API_KEY` (imprime el valor)
- `printenv` / `env` / `Get-ChildItem Env:` (imprime TODAS las variables)
- `npm config list` (puede imprimir tokens de registry)
- `git log -p -- .env*` (imprime diffs con keys)
- Pasting .env.local en el chat de la IA

### Comandos PERMITIDOS (solo nombres)

- `Get-Content .env.local | ForEach-Object { ($_ -split '=',2)[0] }` (solo nombres)
- `Select-String -Path .env.local -Pattern '^[A-Z_]+'` (solo nombres)
- `vercel env ls` con grep a solo nombres: `vercel env ls | Select-String -Pattern '^[A-Z_]+'`n- `git ls-files | Select-String '.env'` (verifica que .env no esté trackeado)
- `git check-ignore .env.local` (verifica que esté ignorado)

### Regla para la IA

- Si necesitás una key para un comando, pedile al humano que la ejecute él, o usá una variable de entorno ya cargada (``) SIN imprimirla.
- Si el humano pega una key en el chat, **no la repitas**. Decile que la rote.
- Antes de cualquier comando que pueda imprimir keys, preguntate: **¿esto va a mostrar el valor?** Si la respuesta es sí o no sé, no lo ejecutes.
- En dumps para nuevas sesiones: solo nombres, nunca valores.

### Checklist antes de pegar en el chat

- [ ] No hay strings que empiecen con `eyJ` (JWT de Supabase)
- [ ] No hay strings que empiecen con `re_` (Resend)
- [ ] No hay strings que empiecen con `sk-` (OpenAI/Stripe)
- [ ] No hay strings que empiecen con `ghp_` (GitHub PAT)
- [ ] No hay passwords en texto plano
- [ ] No hay connection strings con usuario:password

**Si ves alguno de estos patrones en un output, NO lo pegues. Rotá la key.**
