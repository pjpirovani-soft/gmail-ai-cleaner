# Gmail AI Cleaner

Aplicación web con IA para buscar, analizar y limpiar correos electrónicos de forma inteligente.

## Características

- 🔍 **Búsqueda flexible**: Filtra correos mediante consultas como `older_than:1y`, `from:newsletter`, `larger:10M`, o texto libre.
- 🤖 **Clasificación con Gemini**: Analiza y categoriza cada correo en tres acciones recomendadas:
  - **Eliminar**: Correos promocionales caducados, spam o notificaciones antiguas.
  - **Archivar**: Boletines leídos, facturas antiguas y confirmaciones históricas.
  - **Conservar**: Mensajes personales, laborales y alertas críticas.
- ⚡ **Modos de ejecución**:
  - **Simulación**: Revisa las acciones planificadas sin realizar cambios.
  - **Ejecutar automático**: Aplica las acciones directamente.
  - **Modo interactivo**: Revisa y confirma cada acción.

## Configuración

Copia `.env.example` a `.env` y añade tu clave de API de Gemini si deseas usar el modelo en la nube:
```env
GEMINI_API_KEY=tu_clave_aqui
```
