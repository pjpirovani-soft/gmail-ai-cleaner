# AUDITORIA - gmail-ai-cleaner

> Checklist obligatorio antes de cada release o deploy.

## 1. Pre-flight (siempre)

- [ ] git status limpio (todo commiteado)
- [ ] npm run build exitoso
- [ ] npm run dev arranca sin errores
- [ ] GET http://localhost:3000 responde 200
- [ ] npm audit --omit=dev sin vulnerabilidades high/critical

## 2. Seguridad

- [ ] .env en .gitignore (git check-ignore .env)
- [ ] GEMINI_API_KEY no aparece en logs
- [ ] GMAIL_CLIENT_SECRET no aparece en logs
- [ ] SESSION_SECRET aleatorio en produccion
- [ ] OAuth scopes minimos (solo gmail.modify)
- [ ] Redirect URI coincide con Google Cloud Console
- [ ] HTTPS en produccion
- [ ] Headers de seguridad (pendiente en server.ts)

## 3. Dependencias

- [ ] npm outdated revisado
- [ ] multer@1.4.5 -> 2.x (URGENTE por CVEs)
- [ ] CVEs conocidos evaluados
- [ ] No aplicar npm audit fix --force sin revisar

## 4. Codigo

- [ ] Sin console.log con datos sensibles (usar logger estructurado)
- [ ] Sin any sin justificar
- [ ] Sin TODO/FIXME sin documentar en STATUS.md
- [ ] Sin secretos hardcodeados
- [ ] server.ts con CRLF (pendiente de normalizar con tests verdes)

## 5. Frontend

- [ ] Sin innerHTML con datos del usuario (XSS)
- [ ] PWA instalable en Android + iOS
- [ ] Service worker actualiza correctamente

## 6. Deploy (Vercel)

- [ ] Env vars configuradas en dashboard
- [ ] Health check responde (GET /)
- [ ] Dominio funcionando
- [ ] CI verde en el ultimo push
- [ ] Rollback plan documentado

## Resultado

- Fecha:
- Auditor:
- Aprobado: SI / NO
- Notas: