/**
 * Gmail AI Cleaner - Progressive Web App Service Worker
 * Version: 2.0.0
 * Strategy:
 *  - Core App Shell & Static Assets: Cache-First / Pre-cache
 *  - Page Navigations: Network-First with Offline Fallback
 *  - External Google Fonts & Icons: Stale-While-Revalidate
 *  - API Endpoints: Network-Only with Offline JSON fallback
 */

const CACHE_NAME = 'gmail-ai-cleaner-v2.0.0';
const STATIC_CACHE_NAME = 'gmail-ai-cleaner-static-v2.0.0';

// Core assets to pre-cache on service worker installation
const PRECACHE_ASSETS = [
  '/',
  '/css/material.css',
  '/js/script.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-512x512.png',
  '/icons/icon.svg',
  '/icons/apple-touch-icon.png',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200'
];

// 1. INSTALL EVENT - Pre-cache critical application assets
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker v2.0.0...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaché de activos estáticos iniciado');
        // Usamos cache.addAll con tolerancia a fallos individuales
        return Promise.allSettled(
          PRECACHE_ASSETS.map((url) =>
            cache.add(url).catch((err) => {
              console.warn(`[SW] No se pudo cachear el recurso: ${url}`, err);
            })
          )
        );
      })
      .then(() => {
        console.log('[SW] Precaché completado con éxito');
        return self.skipWaiting();
      })
  );
});

// 2. ACTIVATE EVENT - Clean up outdated caches & claim clients immediately
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker v2.0.0...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            console.log(`[SW] Eliminando caché antigua: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Reclamando control de clientes');
      return self.clients.claim();
    })
  );
});

// 3. FETCH EVENT - Smart routing based on request type
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar peticiones no HTTP/HTTPS (por ejemplo chrome-extension://)
  if (!url.protocol.startsWith('http')) return;

  // Estrategia A: API Endpoints (POST o rutas dinámicas como /analizar, /accion-lote)
  if (request.method !== 'GET' || url.pathname.startsWith('/analizar') || url.pathname.startsWith('/accion-lote')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({
            error: 'Modo sin conexión',
            message: 'No tienes conexión a Internet. Las acciones con Gemini AI requieren conectividad activa.',
            offline: true
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json; charset=utf-8' }
          }
        );
      })
    );
    return;
  }

  // Estrategia B: Navegación de páginas HTML (Network-First con fallback a caché)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          console.log('[SW] Red no disponible, buscando página en caché:', request.url);
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback al cascarón principal (App Shell)
          const fallbackShell = await caches.match('/');
          if (fallbackShell) {
            return fallbackShell;
          }
          return new Response(
            `<!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Sin conexión - Gmail AI Cleaner</title>
              <style>
                body { font-family: -apple-system, Roboto, sans-serif; background: #F8F9FA; color: #1F1F1F; text-align: center; padding: 48px 24px; }
                .card { max-width: 480px; margin: 0 auto; background: #FFF; padding: 32px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
                h1 { font-size: 24px; color: #1A73E8; margin-bottom: 12px; }
                p { color: #444746; line-height: 1.6; }
                button { background: #1A73E8; color: #FFF; border: none; padding: 12px 24px; border-radius: 20px; font-weight: 500; cursor: pointer; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="card">
                <h1>📬 Modo Sin Conexión</h1>
                <p>No tienes conexión a internet actualmente. Revisa tu señal Wi-Fi o datos móviles para continuar limpiando tu bandeja con Gemini AI.</p>
                <button onclick="window.location.reload()">Reintentar conexión</button>
              </div>
            </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // Estrategia C: Archivos estáticos locales (CSS, JS, Imágenes, Iconos) -> Cache-First
  if (
    url.pathname.startsWith('/css/') ||
    url.pathname.startsWith('/js/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.json')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Revalidación en segundo plano (Stale-While-Revalidate)
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          }).catch(() => {});
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(STATIC_CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return networkResponse;
        });
      })
    );
    return;
  }

  // Estrategia D: Google Fonts & CDNs -> Stale-While-Revalidate
  if (url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, networkResponse));
          }
          return networkResponse;
        }).catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Estrategia por defecto: Red con fallback a caché
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// 4. MESSAGE EVENT - Permitir al cliente solicitar actualización inmediata
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Mensaje recibido: SKIP_WAITING');
    self.skipWaiting();
  }
});
