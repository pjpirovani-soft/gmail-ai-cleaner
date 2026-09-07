# 📱 Guía Oficial PWA - Gmail AI Cleaner v2.0

Esta guía detalla la implementación, enlace, pruebas móviles y conversión a APK de la **Progressive Web App (PWA)** de **Gmail AI Cleaner**.

---

## 1. Archivo `manifest.json` (`public/manifest.json`)

El archivo **Web App Manifest** define el comportamiento de instalación nativo, colores de interfaz e iconos del aplicativo:

```json
{
  "id": "/",
  "name": "Gmail AI Cleaner",
  "short_name": "GmailCleaner",
  "description": "Analizador y limpiador inteligente de correos de Gmail con Google Material Design 3 e Inteligencia Artificial",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "display_override": ["standalone", "minimal-ui"],
  "orientation": "any",
  "theme_color": "#FFFFFF",
  "background_color": "#F8F9FA",
  "lang": "es",
  "dir": "ltr",
  "categories": ["productivity", "utilities"],
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-maskable-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any"
    }
  ],
  "shortcuts": [
    {
      "name": "Analizar Correos",
      "short_name": "Analizar",
      "description": "Escanear correos con Gemini AI",
      "url": "/?action=analyze",
      "icons": [{ "src": "/icons/icon-192x192.png", "sizes": "192x192" }]
    },
    {
      "name": "Bandeja Principal",
      "short_name": "Bandeja",
      "description": "Ver lista y filtros de correos",
      "url": "/",
      "icons": [{ "src": "/icons/icon-192x192.png", "sizes": "192x192" }]
    }
  ]
}
```

### Propiedades destacadas:
- **`theme_color` (#FFFFFF)**: Color de la barra superior del sistema (status bar de Android y navegadores).
- **`background_color` (#F8F9FA)**: Color del splash screen inicial mientras carga la aplicación.
- **`display: standalone`**: Oculta la barra de direcciones del navegador, ejecutando la app como si fuera nativa.
- **`purpose: maskable`**: Icono con margen de seguridad del 15% para que Android recorte esquinas o círculos sin cortar el logo.

---

## 2. Archivo `service-worker.js` (`/service-worker.js` y `public/service-worker.js`)

El Service Worker gestiona el almacenamiento en caché, la navegación sin conexión y la actualización en segundo plano:

### Estrategias de Red implementadas:
1. **Precaché en `install`**: Almacena de inmediato el App Shell (`/`, `/css/material.css`, `/js/script.js`, `/manifest.json`, iconos y fuentes Roboto/Material Symbols).
2. **Navegación HTML (Network-First)**: Intenta cargar siempre la versión más fresca desde el servidor; si el dispositivo no tiene internet, muestra la copia en caché o la pantalla offline personalizada de Material Design.
3. **Activos Estáticos (Cache-First + Stale-While-Revalidate)**: CSS, JS e imágenes se sirven al instante desde la caché y se actualizan en segundo plano.
4. **Llamadas a la API (`/analizar`, `/accion-lote`)**: Requieren conexión activa para consultar a Gemini AI. Si la red falla, devuelven una respuesta JSON descriptiva sin que la app colapse.
5. **Control de versiones y limpieza**: En el evento `activate`, elimina cachés obsoletas y toma el control inmediato con `clients.claim()`.

---

## 3. Cómo enlazar el Manifest y el Service Worker en `index.ejs`

En una arquitectura con plantillas EJS, el código se encuentra centralizado en `views/partials/header.ejs` (para el `<head>`) y en `public/js/script.js` (para el registro y botón de instalación).

### Paso 1: En la etiqueta `<head>` de `views/index.ejs` (o `views/partials/header.ejs`):

```html
<!-- Progressive Web App (PWA) Manifest & Meta Tags -->
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#FFFFFF">
<meta name="background-color" content="#F8F9FA">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="GmailCleaner">

<!-- Iconos para navegadores e iOS Safari -->
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<link rel="icon" type="image/svg+xml" href="/icons/icon.svg">
<link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png">
```

### Paso 2: Registro del Service Worker en JavaScript (`public/js/script.js`):

```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      .then((registration) => {
        console.log('[PWA] Service Worker registrado exitosamente con scope:', registration.scope);

        // Detección de nuevas versiones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdatePrompt(newWorker);
            }
          });
        });
      })
      .catch((error) => console.warn('[PWA] Error al registrar Service Worker:', error));
  });
}
```

---

## 4. Instrucciones para Probar la PWA en el Celular

Tu aplicación desplegada en Vercel cuenta con protocolo **HTTPS obligatorio** (requisito indispensable para PWAs):
👉 **URL**: `https://gmail-ai-cleaner-six.vercel.app`

### A. Prueba en Android (Google Chrome)

1. Abre **Google Chrome** en tu teléfono Android.
2. Ingresa a `https://gmail-ai-cleaner-six.vercel.app`.
3. Verás aparecer el botón destacado **"Instalar App"** con icono móvil en la barra superior.
4. **Opción 1**: Pulsa directamente el botón **"Instalar App"** dentro de la interfaz de la aplicación.
5. **Opción 2**: Toca el menú de tres puntos verticales (`⋮`) en la esquina superior derecha de Chrome y selecciona **"Instalar aplicación"** o **"Agregar a pantalla principal"**.
6. Confirma pulsando **"Instalar"**.
7. ¡Listo! La app se añadirá al cajón de aplicaciones y a la pantalla de inicio con su icono de Material Design, ejecutándose a pantalla completa sin barra de navegación del navegador.

### B. Prueba en iPhone / iPad (Apple Safari)

> **Nota para iOS**: Apple no admite la API `beforeinstallprompt`, por lo que la instalación se realiza mediante el menú Compartir de Safari.

1. Abre **Safari** en tu iPhone o iPad (debe ser Safari, no navegadores de terceros).
2. Entra a `https://gmail-ai-cleaner-six.vercel.app`.
3. Pulsa el botón de la barra inferior **Compartir** (icono de cuadrado con flecha hacia arriba: 📤).
4. Desplázate por las opciones y selecciona **"Agregar a pantalla de inicio"** (*Add to Home Screen*).
5. Se mostrará el nombre ("GmailCleaner") y el icono oficial generado.
6. Pulsa **"Agregar"** en la esquina superior derecha.
7. Ábrela desde tu pantalla de inicio: se abrirá en modo Standalone sin la interfaz del navegador.

### C. Prueba de Funcionamiento Sin Conexión (Offline)

1. Con la PWA ya instalada o abierta en el celular, activa el **Modo Avión** o desactiva Wi-Fi y datos móviles.
2. Navega o recarga la aplicación: verás que la aplicación sigue cargando con su diseño Material Design 3 y se activa el chip amarillo **"Sin conexión"** en el encabezado.

---

## 5. Cómo Generar un APK para Android (con Nitron / PWABuilder)

Para publicar la app en Google Play Store o distribuir un archivo instalador `.apk` a usuarios Android sin que tengan que ingresar al navegador, existen las siguientes alternativas oficiales:

### Método 1: Usando Nitron / PWABuilder (Recomendado y más rápido)

**PWABuilder** (mantenido por Microsoft y compatible con Nitron / Trusted Web Activities):

1. Visita [https://www.pwabuilder.com/](https://www.pwabuilder.com/).
2. Ingresa la URL de tu aplicación: `https://gmail-ai-cleaner-six.vercel.app` y haz clic en **"Start"**.
3. PWABuilder auditará automáticamente:
   - ✅ Manifest válido (`manifest.json`)
   - ✅ Service Worker activo (`service-worker.js`)
   - ✅ Iconos 192px, 512px y maskable
   - ✅ Seguridad HTTPS
4. Haz clic en el botón verde **"Package For Stores"**.
5. Selecciona la plataforma **Android**:
   - Pulsa **"Generate"**.
   - Puedes configurar el Package ID (ej: `com.pjpirovani.gmailcleaner`).
   - Elige el modo de firma: **Signing key nueva** o automática.
6. Descarga el archivo `.zip`: contendrá tu archivo **`.apk`** listo para instalar en cualquier teléfono Android y el archivo **`.aab`** (Android App Bundle) listo para subir a Google Play Store.

### Método 2: Usando Google Bubblewrap CLI (Oficial de Google Chrome)

Google ofrece **Bubblewrap**, la herramienta oficial de línea de comandos para empaquetar PWAs como Trusted Web Activities (TWA):

```bash
# 1. Instalar la herramienta oficial de Google
npm install -g @bubblewrap/cli

# 2. Inicializar el proyecto con el manifest de tu app en Vercel
bubblewrap init --manifest https://gmail-ai-cleaner-six.vercel.app/manifest.json

# 3. Compilar el APK y el Android App Bundle
bubblewrap build
```

El comando generará el archivo `app-release-signed.apk` en la carpeta `build/`. Puedes enviarlo por WhatsApp, Telegram o Drive a cualquier dispositivo Android para instalarlo directamente activando "Instalar apps de fuentes desconocidas".
