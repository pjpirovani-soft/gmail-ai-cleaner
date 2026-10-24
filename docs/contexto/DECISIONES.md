# DECISIONES - gmail-ai-cleaner

## Prioridades (en orden)

1. Seguridad. Nunca comprometer API keys, OAuth, o validacion por velocidad.
2. Funcionalidad. Que el MVP funcione, aunque no sea elegante.
3. Mantenibilidad. Codigo legible > codigo clever.
4. Performance. Optimizar solo cuando hay problema medible.
5. Estetica. Ultima prioridad.

## Cuando preguntar vs. cuando asumir

Preguntar:
- Ambiguedad en requisitos.
- Decisiones de negocio (que pasa si X).
- Trade-offs con impacto en el cliente.
- Cambios a reglas de clasificacion (SPEC.md o BUSINESS-LOGIC.md).

Asumir (y documentar en DECISIONES.md):
- Decisiones tecnicas con default claro.
- Convenciones de codigo (naming, estructura).
- Librerias estandar del stack.
- Nombres de archivos y carpetas segun el studio.

## Trade-offs documentados (ADR)

Cada decision con impacto va a este archivo como ADR:
- Contexto: que problema.
- Decision: que se eligio.
- Alternativas: que se descarto y por que.
- Consecuencias: que implica.

## ADRs registrados

### ADR-001: Gemini SDK sobre OpenAI
Fecha: 2026-09
Decision: Usar @google/genai en vez de OpenAI.
Razon: Integracion nativa con Google Workspace, cuota gratuita generosa, preferencia por stack Google para herramientas Gmail.

### ADR-002: Material Design 3 sobre Bootstrap/Tailwind
Fecha: 2026-09
Decision: M3 oficial de Google.
Razon: Coherencia visual con Gmail/Google, componentes ya especificados.

### ADR-003: Fallback heuristico obligatorio
Fecha: 2026-09
Decision: Si no hay GEMINI_API_KEY, usar reglas locales.
Razon: Permitir uso sin cuenta Google, evitar que la app deje de funcionar si la API falla.

### ADR-004: PWA sobre app nativa
Fecha: 2026-09
Decision: Progressive Web App.
Razon: Instalable en Android/iOS sin publicar en stores, mantenimiento simple.

### ADR-005: OAuth2 + Gmail API via fetch directo
Fecha: 2026-09
Decision: Usar fetch directo a gmail.googleapis.com en vez de googleapis SDK.
Razon: Menor peso de dependencias, control total del request/response. SDK oficial requiere googleapis (agrega ~2MB).

### ADR-006 (pendiente): Tests con Vitest
Estado: Propuesto
Decision: Agregar Vitest + cobertura del clasificador heuristico.
Razon: Sin tests, refactor de server.ts es riesgoso. Ver docs/calidad/TESTS.md.

## Anti-patrones (evitar)

- Over-engineering: capas de abstraccion que no se usan.
- Premature optimization: indices en tablas vacias (no aplica, sin DB).
- Copy-paste sin entender.
- Silent failures: catch {} vacio.
- Secretos en codigo.
- any sin justificar.
- Magic numbers sin constante.