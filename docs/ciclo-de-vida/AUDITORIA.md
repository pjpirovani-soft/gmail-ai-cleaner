# Auditoria — gmail-ai-cleaner

> Checklist obligatorio antes de cada entrega o release. Si algo falla, no se entrega.

## 1. Pre-flight (siempre)

- [ ] npm audit --omit=dev sin vulnerabilidades
- [ ] npm run lint sin errores ni warnings
- [ ] npm test todos verdes
- [ ] npm run build exitoso
- [ ] git status limpio (todo commiteado)

## 2. Seguridad

- [ ] RLS habilitado en todas las tablas con datos de usuario
- [ ] RLS testeado (usuario A no ve datos de B)
- [ ] Sin service_role en cliente
- [ ] .env.local en .gitignore, no trackeado
- [ ] Secrets no expuestos en codigo ni en logs
- [ ] Headers de seguridad configurados (CSP, HSTS, X-Frame-Options)
- [ ] Rate limiting en login/register

## 3. Dependencias

- [ ] npm outdated revisado (major pendientes documentados)
- [ ] CVEs conocidos evaluados (dev-only vs produccion)
- [ ] No aplicar npm audit fix --force sin revisar breaking changes

## 4. Codigo

- [ ] Sin console.log en produccion
- [ ] Sin any sin justificar
- [ ] Sin TODO/FIXME pendientes (o documentados en STATUS)
- [ ] Sin secretos hardcodeados

## 5. Deploy

- [ ] Env vars configuradas en Vercel
- [ ] Dominio funcionando (DNS propagado)
- [ ] Health check responde
- [ ] CI verde en el ultimo push

## Resultado

- Fecha:
- Auditor:
- Aprobado: SI / NO
- Notas: