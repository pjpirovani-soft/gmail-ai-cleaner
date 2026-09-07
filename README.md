# 📬 Gmail AI Cleaner v2.0

> **Analizador y limpiador inteligente de bandejas de entrada de Gmail potenciado con Inteligencia Artificial (Google Gemini) y una experiencia visual moderna basada en Google Material Design 3 (M3).**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](CHANGELOG.md)
[![Design](https://img.shields.io/badge/Design-Material%20Design%203-1a73e8.svg)](https://m3.material.io/)
[![Node.js](https://img.shields.io/badge/Node.js-22+-green.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 📖 Descripción General

**Gmail AI Cleaner** es una aplicación web diseñada para transformar una bandeja de entrada caótica en una experiencia limpia y organizada ("Inbox Zero"). Permite a los usuarios buscar correos mediante la sintaxis nativa de Gmail, procesarlos en lote y clasificarlos con precisión en tres acciones clave:

1. 🗑️ **Eliminar**: Publicidad antigua, spam, notificaciones obsoletas y correos basura.
2. 📁 **Archivar**: Facturas, confirmaciones de compras, reservas de viajes y newsletters leídos con valor histórico.
3. ✅ **Conservar**: Mensajes personales directos, acuerdos de trabajo, contratos y alertas críticas de seguridad.

---

## ✨ Características Principales (Versión 2.0)

- **🎨 Diseño Google Material Design 3 (M3)**:
  - Paleta cromática oficial de Google: Azul (#1A73E8), Verde (#34A853), Rojo (#EA4335) y Amarillo (#FBBC04).
  - Tipografía oficial **Roboto** e iconos vectoriales mediante **Google Material Symbols**.
  - Elevaciones dinámicas (1 a 4) y sombras según la especificación de Material.
  - Campos de texto con **etiquetas flotantes** animadas y transiciones fluidas.
  - Efecto interactivo **Ripple** en botones, chips y filas.
- **🔍 Búsqueda Flexible y Chips Rápidos**:
  - Filtros directos con un solo clic: `older_than:1y` (antiguos), `from:newsletter` (boletines), `larger:10M` (pesados) y `from:ofertas`.
  - Soporte de sintaxis nativa de Gmail combinable.
- **🤖 Clasificación con Gemini AI**:
  - Evaluación semántica del asunto, remitente y contenido mediante el modelo **Gemini 2.5 Flash**.
  - Motor heurístico inteligente de respaldo en caso de no contar con clave de API.
- **📊 Panel de Métricas y Resumen**:
  - Tres tarjetas elevadas con contadores en tiempo real para las categorías de acción.
- **📋 Tabla de Datos Interactiva**:
  - Selección individual y global con casillas de verificación animadas.
  - Cambio de acción en tiempo real por fila mediante menús desplegables.
  - Paginación dinámica (5 correos por vista) con controles Material.
- **📱 Progressive Web App (PWA) e Instalación Móvil**:
  - Totalmente instalable en celulares Android (Chrome) e iOS (Safari).
  - Soporte offline inteligente con Service Worker y precaché de App Shell.
  - Web App Manifest con iconos de alta resolución (192px, 512px y maskable).
  - Consulta la [Guía de Instalación PWA (GUIA_PWA.md)](GUIA_PWA.md).
  - Paginación dinámica con selección de tamaño de página (5, 10, 25).
- **⚡ Tres Modos de Limpieza Segura**:
  - **🔍 Simulación**: Genera un reporte detallado de lo que ocurriría sin tocar tus correos reales.
  - **🚀 Ejecución Automática**: Aplica las acciones en lote de manera rápida.
  - **🔄 Modo Interactivo**: Permite confirmar y ajustar las decisiones antes de aplicarlas.
- **🔔 Notificaciones Snackbar de Material**:
  - Alertas no intrusivas en pantalla para feedback inmediato con cierre manual y desvanecimiento automático.

---

## 📸 Capturas de Pantalla

<!-- SCREENSHOT_PLACEHOLDER: Vista General del Dashboard v2.0 con Material Design 3 -->
```
+-------------------------------------------------------------------------------+
| [📬] Gmail AI Cleaner  [v2.0 M3]                           (P) Pedro José [v] |
+-------------------------------------------------------------------------------+
|                                                                               |
|  [✨ Potenciado con Gemini AI]                                                 |
|  Organiza tu bandeja de entrada con IA                                        |
|                                                                               |
|  Filtros rápidos: [📅 Correos antiguos] [📰 Newsletters] [📎 Correos pesados] |
|                                                                               |
|  [🔍 older_than:1y               ]  [10]  [🤖 Analizar]                       |
|                                                                               |
|  +-------------------+  +-------------------+  +-------------------+          |
|  | [🗑️] 4            |  | [📁] 4            |  | [✅] 2            |          |
|  | Para eliminar     |  | Para archivar     |  | Para conservar    |          |
|  +-------------------+  +-------------------+  +-------------------+          |
|                                                                               |
|  [x] Asunto                      | Remitente            | Acción              |
|  -------------------------------------------------------------------------    |
|  [v] Mega descuento 70% OFF      | ofertas@tienda.com   | [🗑️ Eliminar   v]  |
|  [v] Resumen Semanal IA          | newsletter@tech.com  | [📁 Archivar   v]  |
|  [ ] Minuta de Reunión           | carlos@empresa.org   | [✅ Conservar  v]  |
|                                                                               |
|  [🗑️ Eliminar (2)] [📁 Archivar (2)]   [🔍 Simular] [🚀 Automático] [🔄 Interactivo]|
+-------------------------------------------------------------------------------+
```

---

## 🚀 Requisitos Previos

- **Node.js**: Versión 20.x o 22.x LTS (o superior).
- **npm** o **bun**: Gestor de paquetes compatible.
- *(Opcional)* **Google Gemini API Key**: Para activar el análisis semántico con IA de última generación. Puedes obtener una clave gratuita en [Google AI Studio](https://aistudio.google.com/).

---

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/pjpirovani-soft/gmail-ai-cleaner.git
cd gmail-ai-cleaner
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia la plantilla de ejemplo y configura tu entorno:
```bash
cp .env.example .env
```

Edita `.env` con tu editor preferido:
```env
# Puerto del servidor
PORT=3000

# Entorno
NODE_ENV=development

# Clave de Gemini (Opcional - si no se provee, la app usa el clasificador heurístico)
GEMINI_API_KEY=tu_clave_de_gemini_aqui

# Datos de usuario para la interfaz
USER_NAME="Pedro José Pirovani"
USER_EMAIL="pirovanipedrojose@gmail.com"
```

### 4. Iniciar en modo desarrollo
```bash
npm run dev
```

Abre tu navegador en:
👉 `http://localhost:3000`

---

## 🧑‍💻 Guías Adicionales

- 📘 [**Guía de Usuario Detallada**](GUIA_DE_USUARIO.md): Manual paso a paso de uso, sintaxis de filtros y estrategias para alcanzar Inbox Zero.
- 🚀 [**Guía de Despliegue en la Nube**](GUIA_DE_DESPLIEGUE.md): Instrucciones completas para desplegar en Railway, Render, Fly.io o Docker.
- 🤝 [**Guía de Contribución**](CONTRIBUTING.md): Normas de estilo, creación de issues y pull requests.
- 📜 [**Historial de Cambios**](CHANGELOG.md): Registro de versiones y notas de la versión 2.0.0.

---

## 🏗️ Arquitectura Técnica

```
├── public/
│   ├── css/
│   │   └── material.css       # Sistema de diseño Material Design 3 (M3)
│   └── js/
│       └── script.js          # Ripple, paginación, modales, snackbars y lógica cliente
├── views/
│   ├── index.ejs              # Vista principal con tabla y paneles M3
│   ├── resultados.ejs         # Vista secundaria de resultados
│   └── partials/
│       ├── header.ejs         # App Bar, logo, menú de usuario y tipografía
│       └── footer.ejs         # Pie de página y contenedor de Snackbars
├── .env.example               # Plantilla de variables de entorno
├── server.ts                  # Servidor Express, endpoints REST y conector Gemini AI
├── metadata.json              # Metadatos del entorno AI Studio
├── package.json               # Dependencias y scripts de ejecución
└── tsconfig.json              # Configuración de TypeScript
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

## 👥 Créditos y Agradecimientos

- **Autor**: Pedro José Pirovani ([@pjpirovani-soft](https://github.com/pjpirovani-soft))
- **Google Material Design 3**: Por las especificaciones de diseño, componentes y elevaciones.
- **Google DeepMind & Gemini**: Por el SDK `@google/genai` y los modelos fundacionales para clasificación de texto.
