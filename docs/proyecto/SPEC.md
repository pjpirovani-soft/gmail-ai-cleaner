# SPEC - gmail-ai-cleaner

## Objetivo

Clasificar y limpiar bandejas de Gmail con IA para lograr Inbox Zero.

## Alcance

### Incluido en MVP (v2.0.0)

- Lectura de correos reales via Gmail API (con OAuth configurado)
- Clasificacion estricta en 3 categorias (Util / Archivable / Desechable)
- Fallback heuristico sin GEMINI_API_KEY
- Correos mock (200) sin OAuth configurado
- Instrucciones personalizadas para Gemini (500 chars)
- Tres modos de limpieza (Simulacion / Automatico / Interactivo)
- UI Material Design 3
- PWA instalable (Android + iOS)
- Deploy en Vercel

### Excluido del MVP (futuro)

- Persistencia de acciones en DB
- Multiples usuarios (cada uno con su cuenta)
- Historial de acciones
- Programacion de limpieza automatica (cron)
- Filtros guardados

## Funcionalidades

### Portal publico (autenticado via OAuth)

- Login con Google
- Filtro de busqueda Gmail (sintaxis nativa)
- Instrucciones personalizadas para Gemini
- Tabla de correos con clasificacion
- Seleccion masiva + accion por fila
- 3 modos de limpieza

### Panel de metricas

- Contador de correos a eliminar / archivar / conservar
- Espacio liberable estimado

## Criterios de aceptacion (v2.0.0)

- [x] Clasificacion con Gemini (o fallback heuristico)
- [x] UI Material Design 3
- [x] PWA instalable
- [x] Instrucciones personalizadas (500 chars)
- [x] 3 modos de limpieza
- [x] Build pasa (npm run build)
- [x] Dev arranca (npm run dev)
- [ ] Tests (pendiente, ver docs/calidad/TESTS.md)
- [ ] OAuth + Gemini configurados en .env (pendiente)

## Fases

1. Demo con mock (actual) - completado
2. Configuracion OAuth + Gemini real - proximo
3. Tests (Vitest) - pendiente
4. Refactor server.ts (modulos) - pendiente