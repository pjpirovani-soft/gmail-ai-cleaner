# DECISIONES — gmail-ai-cleaner (ADRs)

## ADR-001: Gemini SDK sobre OpenAI
Fecha: 2026-09
Decisión: Usar @google/genai en vez de OpenAI.
Razón: Integración nativa con Google Workspace, cuota gratuita generosa, preferencia por stack Google para herramientas Gmail.

## ADR-002: Material Design 3 sobre Bootstrap/Tailwind
Fecha: 2026-09
Decisión: M3 oficial de Google.
Razón: Coherencia visual con Gmail/Google, componentes ya especificados.

## ADR-003: Fallback heurístico obligatorio
Fecha: 2026-09
Decisión: Si no hay GEMINI_API_KEY, usar reglas locales.
Razón: Permitir uso sin cuenta Google, evitar que la app deje de funcionar si la API falla.

## ADR-004: PWA sobre app nativa
Fecha: 2026-09
Decisión: Progressive Web App.
Razón: Instalable en Android/iOS sin publicar en stores, mantenimiento simple.

## ADR-005 (pendiente): Gmail API + OAuth2
Estado: Propuesto
Decisión: Integrar googleapis con scopes gmail.readonly + gmail.modify.
Razón: Sin esto la app es solo demo. Ver docs/proyecto/STATUS.md.