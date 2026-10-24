# Tests — gmail-ai-cleaner

## Pirámide de tests

1. **Unitarios (Vitest + RTL):** componentes, schemas Zod, utilidades. Rápidos, muchos.
2. **Integración (Vitest):** server actions, API routes. Mockean Supabase.
3. **RLS (pgTAP):** políticas de base de datos. Críticos para multi-tenant.
4. **E2E (Playwright):** flujos completos. Pocos, lentos, críticos.

## Unitarios (Vitest + RTL)

- **Componentes:** render, interacción, estado de error, estado de loading.
- **Schemas Zod:** válido, inválido, borde (campos vacíos, tipos incorrectos).
- **Server Actions:** éxito, error de validación, error de auth. Mockear createClient().
- **API Routes:** status codes (200, 400, 401, 500), validación de input, auth.

## RLS (pgTAP)

- **Obligatorio para tablas multi-tenant.** Supabase tiene supabase test db.
- Testear: usuario A NO ve datos de usuario B; usuario A NO puede modificar datos de B.
- Testear: anon NO puede insertar/update/delete.
- Testear: cada rol solo accede a lo suyo (comercio solo sus productos, cliente solo su carrito).

## E2E (Playwright)

- **Flujos críticos:** login, registro, crear entidad, editar, borrar, derivación a WhatsApp.
- No testear todo. Solo lo que rompe el negocio si falla.

## CI (GitHub Actions)

`yaml
npm ci
npm run lint
npm test
npm run test:rls   # supabase test db
npm run test:e2e   # playwright
npm run build
`

## Reglas

- Tests deben pasar antes de commit.
- Un test por feature crítica.
- Testear comportamiento, no implementación.
- Mockear Supabase en unitarios; usar DB real en RLS.
