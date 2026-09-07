# 📜 Historial de Cambios (Changelog)

Todas las modificaciones notables realizadas en el proyecto **Gmail AI Cleaner** están documentadas en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y este proyecto se adhiere a [Semantic Versioning (SemVer)](https://semver.org/lang/es/).

---

## [2.0.0] - 2026-09-07

### 🚀 Resumen del Lanzamiento
Lanzamiento mayor que transforma por completo la aplicación con un rediseño integral basado en **Google Material Design 3 (M3)**, migración de la arquitectura base a **Node.js, Express y TypeScript**, integración del SDK oficial de **Gemini AI**, y un paquete exhaustivo de documentación profesional.

### ✨ Nuevas Características
- **Interfaz Google Material Design 3 (M3)**:
  - App Bar superior con tipografía oficial Roboto, logo distintivo y menú de usuario con avatar.
  - Paleta cromática oficial de Google: Azul Google (`#1A73E8`), Verde (`#34A853`), Rojo (`#EA4335`) y Amarillo (`#FBBC04`).
  - Sistema de sombras con elevaciones matemáticas 1 a 4 según la especificación de Material.
  - Campos de entrada con **etiquetas flotantes** animadas (`.md-floating-label`).
  - Efecto interactivo **Ripple** en todos los botones, chips de filtro y controles.
  - Iconos vectoriales estándar mediante **Google Material Symbols**.
- **Panel de Métricas y Resumen**:
  - Tres tarjetas elevadas con contadores dinámicos para "Para eliminar", "Para archivar" y "Para conservar".
- **Tabla de Datos Avanzada**:
  - Casillas de verificación con soporte para selección global, individual e indeterminada.
  - Paginación interactiva del lado del cliente con selector de filas por página (5, 10, 25).
  - Selectores desplegables por fila para cambiar la acción sugerida por la IA en tiempo real.
- **Chips de Filtro Rápido**:
  - Atajos rápidos con un solo clic para `older_than:1y`, `from:newsletter`, `larger:10M` y `from:ofertas`.
- **Barra de Progreso Lineal de Material**:
  - Animación de avance en tiempo real durante la consulta con Gemini AI.
- **Notificaciones Snackbar**:
  - Sistema de alertas flotantes no intrusivas con auto-cierre y soporte para tipos éxito, aviso, error e información.
- **Acciones en Lote**:
  - Botones dedicados para "Eliminar seleccionados" y "Archivar seleccionados" con actualización inmediata de estado.
- **Tres Modos de Limpieza**:
  - Soporte para Modo Simulación (auditoría sin cambios), Modo Automático y Modo Interactivo.
- **Endpoint de Monitoreo**:
  - Nueva ruta `GET /health` que expone estado, versión y tiempo de actividad para plataformas cloud (Railway, Render, Fly.io).

### 🔄 Cambios y Mejoras
- Migración de la arquitectura backend de Python a **Node.js / Express con TypeScript nativo**.
- Actualización del motor de clasificación al SDK oficial `@google/genai` con modelo `gemini-2.5-flash`.
- Inclusión de motor heurístico de respaldo que garantiza el funcionamiento completo sin necesidad de API Key.
- Sistema de logs estructurados con niveles `[INFO]`, `[DEBUG]`, `[WARN]` y `[ERROR]`.

### 📚 Documentación
- Creación de `GUIA_DE_USUARIO.md` con manual detallado de sintaxis de Gmail y mejores prácticas de Inbox Zero.
- Creación de `GUIA_DE_DESPLIEGUE.md` con instrucciones paso a paso para Railway, Render, Docker, Fly.io y VPS.
- Creación de `CONTRIBUTING.md` con lineamientos de código y flujo de trabajo.
- Creación de archivo de licencia `LICENSE` (MIT).

---

## [1.0.0] - 2026-03-15

### 🚀 Lanzamiento Inicial
- Prototipo inicial de la aplicación.
- Búsqueda simple de correos en Gmail.
- Clasificación preliminar en tres categorías.
- Interfaz básica con Tailwind CSS.
