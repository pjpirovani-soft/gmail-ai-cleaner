# TESTS - gmail-ai-cleaner

## Estado actual

NO hay tests configurados. package.json no tiene script "test".

## Plan de testing (Vitest)

### Unitarios (prioridad alta)

- Clasificador heuristico: funcion pura, facil de testear.
  - Input: EmailItem
  - Output: "Conservar" | "Archivar" | "Eliminar"
  - Casos: newsletter -> Eliminar, factura -> Archivar, jefe -> Conservar, default -> Eliminar

- Parsing de respuesta de Gemini: texto -> categoria.
  - Casos: "Conservar", "Archivar", "Eliminar", texto invalido -> fallback

### Integracion (prioridad media)

- POST /analizar con mock de Gemini SDK.
- POST /api/limpieza-total/ejecutar en modo simulacion (no toca Gmail).

### E2E (futuro, Playwright)

- Flujo completo: OAuth -> filtro -> analizar -> simular.

## Configuracion

1. Instalar Vitest:
   npm install -D vitest @vitest/coverage-v8

2. Crear vitest.config.ts:
   import { defineConfig } from 'vitest/config'
   export default defineConfig({ test: { environment: 'node' } })

3. Agregar a package.json:
   "scripts": {
     "test": "vitest",
     "test:coverage": "vitest --coverage"
   }

## Cobertura minima

- Clasificador heuristico: 100% (funcion pura, barato de testear)
- Endpoints REST: 80%
- Total: 70%

## CI (GitHub Actions)

- npm ci
- npm run build
- npm test
- (futuro) deploy a Vercel si verde