# 🚀 Guía de Despliegue - Gmail AI Cleaner v2.0

Esta guía detalla el proceso completo para poner en producción **Gmail AI Cleaner v2.0** en plataformas modernas de nube como **Railway**, **Render**, **Fly.io**, **Google Cloud Run** o en tu propio servidor VPS con **Docker**.

---

## 📑 Tabla de Contenidos

1. [Variables de Entorno Requeridas](#1-variables-de-entorno-requeridas)
2. [Despliegue en Railway](#2-despliegue-en-railway)
3. [Despliegue en Render](#3-despliegue-en-render)
4. [Despliegue con Docker](#4-despliegue-con-docker)
5. [Despliegue en Fly.io](#5-despliegue-en-flyio)
6. [Despliegue en VPS (Ubuntu/Debian con PM2 y Nginx)](#6-despliegue-en-vps-ubuntudebian-con-pm2-y-nginx)
7. [Health Check y Monitoreo](#7-health-check-y-monitoreo)
8. [Resolución de Problemas (Troubleshooting)](#8-resolución-de-problemas-troubleshooting)

---

## 1. Variables de Entorno Requeridas

Antes de desplegar en cualquier plataforma, asegúrate de tener configuradas las siguientes variables:

| Variable | Obligatoria | Valor por Defecto | Descripción |
| :--- | :---: | :--- | :--- |
| `PORT` | Sí (auto) | `3000` | Puerto en el que escucha el servidor Express (muchos PaaS lo inyectan automáticamente). |
| `NODE_ENV` | Sí | `production` | Modo de ejecución de Node.js. |
| `GEMINI_API_KEY` | Recomendada | *Ninguna* | Clave de API de Google AI Studio para clasificación semántica profunda. |
| `USER_NAME` | No | `Pedro José Pirovani` | Nombre visible en el avatar de usuario de la App Bar. |
| `USER_EMAIL` | No | `pirovanipedrojose@gmail.com` | Dirección de correo asociada a la sesión. |

---

## 2. Despliegue en Railway

[Railway](https://railway.app/) ofrece soporte nativo para proyectos Node.js y TypeScript sin necesidad de Dockerfile adicional.

### Pasos:

1. **Crear proyecto**:
   - Inicia sesión en [Railway](https://railway.app/).
   - Haz clic en **"New Project"** -> **"Deploy from GitHub repo"**.
   - Selecciona el repositorio `pjpirovani-soft/gmail-ai-cleaner`.

2. **Configurar Variables de Entorno**:
   - Ve a la pestaña **Variables** de tu servicio en Railway.
   - Agrega:
     - `NODE_ENV` = `production`
     - `GEMINI_API_KEY` = `tu_clave_de_gemini`
     - `USER_NAME` = `Tu Nombre`
     - `USER_EMAIL` = `tu_correo@gmail.com`

3. **Verificar Comandos de Construcción e Inicio**:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start` *(o `node --loader ts-node/esm server.ts` / `node server.ts`)*

4. **Configurar Dominio**:
   - En **Settings** -> **Networking**, haz clic en **"Generate Domain"**.
   - ¡Tu aplicación estará en línea con HTTPS automático!

5. **Health Check Path**:
   - Configura el path de verificación de salud en: `/health`

---

## 3. Despliegue en Render

[Render](https://render.com/) es una excelente alternativa para alojar aplicaciones web gratuitas o de bajo costo.

### Pasos:

1. Inicia sesión en [Render Dashboard](https://dashboard.render.com/).
2. Haz clic en **"New +"** -> **"Web Service"**.
3. Conecta tu cuenta de GitHub y selecciona el repositorio `gmail-ai-cleaner`.
4. Configura los siguientes parámetros:
   - **Name**: `gmail-ai-cleaner`
   - **Region**: Selecciona la más cercana a tu ubicación (ej. *Oregon (US West)* o *Frankfurt (EU)*).
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. En la sección **Environment Variables**, añade:
   - `NODE_ENV` = `production`
   - `GEMINI_API_KEY` = `tu_api_key_de_gemini`
6. En la sección **Advanced**:
   - **Health Check Path**: `/health`
7. Haz clic en **"Create Web Service"**.

---

## 4. Despliegue con Docker

Si prefieres contenedores portables o despliegues en Kubernetes / AWS ECS / Google Cloud Run, puedes usar el siguiente `Dockerfile`:

### Dockerfile de Producción (Multi-etapa)
```dockerfile
# Etapa 1: Construcción
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa 2: Imagen final liviana
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/views ./views
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.ts ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["npm", "start"]
```

### Comandos de construcción y ejecución local:
```bash
# Construir imagen
docker build -t gmail-ai-cleaner:v2.0 .

# Ejecutar contenedor
docker run -d -p 3000:3000 \
  -e GEMINI_API_KEY="tu_api_key" \
  -e NODE_ENV="production" \
  --name gmail-cleaner \
  gmail-ai-cleaner:v2.0
```

---

## 5. Despliegue en Fly.io

Para desplegar en la red global de [Fly.io](https://fly.io/):

1. Instala la CLI de Flyctl:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```
2. Inicia sesión:
   ```bash
   fly auth login
   ```
3. Lanza la aplicación:
   ```bash
   fly launch --name gmail-ai-cleaner
   ```
4. Define los secretos de entorno:
   ```bash
   fly secrets set GEMINI_API_KEY="tu_clave_gemini"
   ```
5. Despliega:
   ```bash
   fly deploy
   ```

---

## 6. Despliegue en VPS (Ubuntu/Debian con PM2 y Nginx)

Para servidores propios (DigitalOcean, Hetzner, AWS EC2, Linode):

### 1. Instalar Node.js y PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git
sudo npm install -g pm2
```

### 2. Clonar y construir la app
```bash
cd /var/www
git clone https://github.com/pjpirovani-soft/gmail-ai-cleaner.git
cd gmail-ai-cleaner
npm install
npm run build
cp .env.example .env
nano .env  # Configurar variables
```

### 3. Iniciar con PM2
```bash
pm2 start npm --name "gmail-ai-cleaner" -- start
pm2 save
pm2 startup
```

### 4. Configurar proxy inverso en Nginx
Edita `/etc/nginx/sites-available/gmail-cleaner`:
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Habilita el sitio y recarga Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/gmail-cleaner /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 7. Health Check y Monitoreo

El servicio incluye una ruta de monitoreo HTTP estándar:

- **Endpoint**: `GET /health`
- **Respuesta esperada**: `200 OK`
```json
{
  "status": "ok",
  "app": "Gmail AI Cleaner",
  "version": "2.0.0",
  "uptime": 124.52,
  "timestamp": "2026-09-07T01:52:49.664Z"
}
```

Configura este endpoint en monitores externos como **UptimeRobot**, **Better Uptime** o los health checks nativos de tu proveedor cloud.

---

## 8. Resolución de Problemas (Troubleshooting)

| Síntoma | Causa Probable | Solución |
| :--- | :--- | :--- |
| Error 502 Bad Gateway | El servidor Node.js no ha iniciado en el puerto esperado | Revisa `pm2 logs` o los logs de Railway/Render. Confirma que la variable `PORT` esté correctamente asignada. |
| Clasificación lenta o con fallback | Quota o clave de Gemini no configurada | Verifica que `GEMINI_API_KEY` esté presente en las variables de entorno sin comillas extras ni espacios. |
| Los estilos Material no cargan | Fallo en la entrega de estáticos | Confirma que la carpeta `public` exista y tenga permisos de lectura en el contenedor o servidor. |
