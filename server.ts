import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';
const USER_NAME = process.env.USER_NAME || 'Pedro José Pirovani';
const USER_EMAIL = process.env.USER_EMAIL || 'pirovanipedrojose@gmail.com';

const upload = multer();

// Logger helper for structured console output
const logger = {
  info: (msg: string, meta?: any) => console.log(`[GMAIL-AI-CLEANER] [INFO] [${new Date().toISOString()}] ${msg}`, meta ? meta : ''),
  debug: (msg: string, meta?: any) => {
    if (NODE_ENV !== 'production' || process.env.DEBUG) {
      console.log(`[GMAIL-AI-CLEANER] [DEBUG] [${new Date().toISOString()}] ${msg}`, meta ? meta : '');
    }
  },
  warn: (msg: string, meta?: any) => console.warn(`[GMAIL-AI-CLEANER] [WARN] [${new Date().toISOString()}] ${msg}`, meta ? meta : ''),
  error: (msg: string, meta?: any) => console.error(`[GMAIL-AI-CLEANER] [ERROR] [${new Date().toISOString()}] ${msg}`, meta ? meta : ''),
};

// View Engine Configuration
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload.none()); // To support multipart/form-data sent via FormData
app.use(express.static(path.join(process.cwd(), 'public')));

// PWA Service Worker & Manifest routes with required PWA headers
app.get('/service-worker.js', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(process.cwd(), 'service-worker.js'));
});

app.get('/manifest.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.sendFile(path.join(process.cwd(), 'public', 'manifest.json'));
});

interface EmailItem {
  id: string;
  remitente: string;
  asunto: string;
  resumen: string;
  sizeBytes: number;
  date: string;
  isOlderThan1Year: boolean;
  clasificacion?: 'Eliminar' | 'Archivar' | 'Conservar';
}

// In-memory seed database of emails
const INITIAL_EMAILS: EmailItem[] = [
  {
    id: 'msg_01_techweekly',
    remitente: 'newsletter@techweekly.com',
    asunto: 'Resumen Semanal de Tecnología #142: Novedades en IA',
    resumen: 'Este boletín contiene artículos antiguos sobre avances en desarrollo de software y noticias semanales ya desactualizadas.',
    sizeBytes: 85000,
    date: '2023-02-14',
    isOlderThan1Year: true
  },
  {
    id: 'msg_02_superpromo',
    remitente: 'ofertas@tiendaonline.com',
    asunto: '¡Mega descuento exclusivo solo por hoy! 70% OFF',
    resumen: 'Aprovecha las ofertas flash de la semana pasada en miles de productos seleccionados.',
    sizeBytes: 250000,
    date: '2023-06-20',
    isOlderThan1Year: true
  },
  {
    id: 'msg_03_backup_video',
    remitente: 'cloudbackup@storage.io',
    asunto: 'Archivo adjunto de video de conferencia 4K grabado',
    resumen: 'Video de backup de la conferencia anual. Archivo adjunto muy pesado que ocupa espacio crítico.',
    sizeBytes: 15728640, // 15MB
    date: '2023-01-10',
    isOlderThan1Year: true
  },
  {
    id: 'msg_04_billing',
    remitente: 'billing@cloudservice.com',
    asunto: 'Factura mensual y comprobante de pago #9482',
    resumen: 'Recibo oficial de pago del servicio de infraestructura del año pasado. Documento contable archivado.',
    sizeBytes: 12582912, // 12MB
    date: '2023-08-01',
    isOlderThan1Year: true
  },
  {
    id: 'msg_05_linkedin',
    remitente: 'notifications@linkedin.com',
    asunto: 'Tienes 8 nuevas recomendaciones de empleo y visitas a tu perfil',
    resumen: 'Mira quién ha visitado tu perfil profesional y las ofertas de empleo sugeridas.',
    sizeBytes: 32000,
    date: '2023-11-15',
    isOlderThan1Year: true
  },
  {
    id: 'msg_06_personal',
    remitente: 'carlos.m@empresa.org',
    asunto: 'Minuta de la reunión de estrategia y próximos pasos',
    resumen: 'Comparto el resumen de acuerdos con los puntos clave del proyecto y asignación de tareas.',
    sizeBytes: 64000,
    date: '2024-05-10',
    isOlderThan1Year: false
  },
  {
    id: 'msg_07_newsletter_ai',
    remitente: 'editor@newsletter.ai',
    asunto: 'Newsletter AI Digest: Modelos generativos y agentes',
    resumen: 'Edición mensual con análisis de papers científicos y nuevas herramientas para desarrolladores.',
    sizeBytes: 110000,
    date: '2023-04-18',
    isOlderThan1Year: true
  },
  {
    id: 'msg_08_heavy_photos',
    remitente: 'familia@correo.com',
    asunto: 'Álbum fotográfico de la reunión familiar en alta resolución',
    resumen: 'Adjunto las fotos familiares en formato RAW y alta resolución para que las descargues.',
    sizeBytes: 18874368, // 18MB
    date: '2023-03-05',
    isOlderThan1Year: true
  },
  {
    id: 'msg_09_security',
    remitente: 'no-reply@accounts.google.com',
    asunto: 'Alerta de seguridad: confirmación de acceso en nuevo dispositivo',
    resumen: 'Se ha detectado un inicio de sesión en tu cuenta de Google. Verifica que hayas sido tú.',
    sizeBytes: 18000,
    date: '2024-08-20',
    isOlderThan1Year: false
  },
  {
    id: 'msg_10_hotel',
    remitente: 'reservas@hotelcity.com',
    asunto: 'Confirmación de reserva de alojamiento #HT-48291',
    resumen: 'Detalles de tu estadía y recibo electrónico de confirmación de reserva.',
    sizeBytes: 42000,
    date: '2023-09-12',
    isOlderThan1Year: true
  }
];

// In-memory state
let correosProcesados: Array<{
  id: string;
  remitente: string;
  asunto: string;
  resumen: string;
  clasificacion: 'Eliminar' | 'Archivar' | 'Conservar';
}> = [];

function fallbackClassification(correo: { asunto: string; remitente: string; resumen: string }): 'Eliminar' | 'Archivar' | 'Conservar' {
  const text = `${correo.remitente} ${correo.asunto} ${correo.resumen}`.toLowerCase();
  
  if (text.includes('descuento') || text.includes('oferta') || text.includes('promo') || 
      text.includes('notifications@') || text.includes('notificacion') || text.includes('70% off') ||
      text.includes('publicidad') || text.includes('spam')) {
    return 'Eliminar';
  }
  
  if (text.includes('newsletter') || text.includes('boletín') || text.includes('boletin') ||
      text.includes('factura') || text.includes('recibo') || text.includes('reserva') ||
      text.includes('confirmación') || text.includes('confirmacion') || text.includes('digest')) {
    return 'Archivar';
  }
  
  return 'Conservar';
}

async function clasificarConGemini(correo: { asunto: string; remitente: string; resumen: string }): Promise<'Eliminar' | 'Archivar' | 'Conservar'> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.debug('No GEMINI_API_KEY detected, applying intelligent heuristic classifier');
    return fallbackClassification(correo);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Actúa como un organizador inteligente de correos de Gmail con precisión estricta.
Clasifica este correo exactamente en una de estas 3 opciones:
- "Eliminar": Si es publicidad vieja, promociones caducadas, spam, notificaciones automáticas o newsletters que ya no aportan valor.
- "Archivar": Si es un boletín/newsletter leído, factura o recibo antiguo, confirmación de compra o reserva útil como historial contable/personal pero no urgente.
- "Conservar": Si es un correo personal, laboral importante, alerta de seguridad o información vigente imprescindible.

Detalles del correo:
Remitente: ${correo.remitente}
Asunto: ${correo.asunto}
Contenido/Resumen: ${correo.resumen}

Responde ÚNICAMENTE con una sola palabra: Eliminar, Archivar o Conservar.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const output = response.text?.trim() || '';
    if (/eliminar/i.test(output)) return 'Eliminar';
    if (/archivar/i.test(output)) return 'Archivar';
    if (/conservar/i.test(output)) return 'Conservar';
    return fallbackClassification(correo);
  } catch (error: any) {
    logger.warn('Gemini API call failed, falling back to heuristic:', error.message);
    return fallbackClassification(correo);
  }
}

// Routes
app.get('/', (req, res) => {
  logger.debug('Rendering index view');
  res.render('index', { userName: USER_NAME, userEmail: USER_EMAIL });
});

app.get('/resultados', (req, res) => {
  logger.debug('Rendering resultados view');
  res.render('resultados', { userName: USER_NAME, userEmail: USER_EMAIL });
});

// Health check endpoint for container / cloud deployment monitors
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Gmail AI Cleaner',
    version: '2.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Endpoint to search and analyze emails
app.post('/analizar', async (req, res) => {
  try {
    const query = (req.body.query || '').trim();
    const limite = parseInt(req.body.limite, 10) || 10;

    logger.info(`Analyzing emails with query="${query}", limit=${limite}`);

    if (!query) {
      return res.status(400).json({ error: 'Filtro de búsqueda vacío. Ingresa un término o filtro de Gmail.' });
    }

    const lowerQuery = query.toLowerCase();

    // Filter emails based on query (e.g. older_than:1y, from:newsletter, larger:10M, from:ofertas, or keyword matching)
    let filtered = INITIAL_EMAILS.filter(correo => {
      if (lowerQuery.includes('older_than:1y')) {
        return correo.isOlderThan1Year;
      }
      if (lowerQuery.includes('from:newsletter')) {
        return correo.remitente.toLowerCase().includes('newsletter');
      }
      if (lowerQuery.includes('larger:10m')) {
        return correo.sizeBytes >= 10 * 1024 * 1024;
      }
      if (lowerQuery.includes('from:ofertas')) {
        return correo.remitente.toLowerCase().includes('ofertas') || correo.asunto.toLowerCase().includes('descuento');
      }
      // General text matching
      const combined = `${correo.remitente} ${correo.asunto} ${correo.resumen}`.toLowerCase();
      return combined.includes(lowerQuery);
    });

    // If query didn't match any specific tag, fallback to matching items or all
    if (filtered.length === 0 && !lowerQuery.includes(':')) {
      filtered = INITIAL_EMAILS;
    }

    // Apply limit
    const toProcess = filtered.slice(0, Math.min(limite, 100));

    if (toProcess.length === 0) {
      logger.info('No emails found for query');
      return res.json({ correos: [], total: 0, mensaje: 'No se encontraron correos para el filtro especificado.' });
    }

    logger.info(`Classifying ${toProcess.length} emails...`);

    // Process classification (parallel with Gemini / heuristic)
    correosProcesados = await Promise.all(
      toProcess.map(async correo => {
        const clasificacion = await clasificarConGemini(correo);
        return {
          id: correo.id,
          remitente: correo.remitente,
          asunto: correo.asunto,
          resumen: correo.resumen,
          clasificacion
        };
      })
    );

    logger.info(`Successfully analyzed ${correosProcesados.length} emails`);

    return res.json({
      correos: correosProcesados,
      total: correosProcesados.length,
      query
    });
  } catch (error: any) {
    logger.error('Error in /analizar endpoint:', error);
    return res.status(500).json({ error: error.message || 'Error interno al analizar correos' });
  }
});

// Endpoint to execute cleaning modes
app.post('/limpiar', (req, res) => {
  try {
    const modo = req.body.modo || 'simulacion';
    logger.info(`Executing cleaning mode="${modo}" on ${correosProcesados.length} items`);

    if (!correosProcesados || correosProcesados.length === 0) {
      return res.status(400).json({ error: 'No hay correos analizados para procesar. Realiza una búsqueda primero.' });
    }

    const resultados = correosProcesados.map(item => {
      const accion = item.clasificacion;

      if (modo === 'simulacion') {
        return {
          id: item.id,
          asunto: item.asunto,
          accion: accion,
          estado: 'Simulación (sin cambios)'
        };
      }

      if (modo === 'automatico') {
        if (accion === 'Eliminar') {
          return { id: item.id, asunto: item.asunto, accion: '🗑️ Eliminar', estado: 'Eliminado de Gmail' };
        } else if (accion === 'Archivar') {
          return { id: item.id, asunto: item.asunto, accion: '📁 Archivar', estado: 'Archivado en Todos' };
        } else {
          return { id: item.id, asunto: item.asunto, accion: '✅ Conservar', estado: 'Conservado en Bandeja' };
        }
      }

      // Modo interactivo
      if (accion === 'Eliminar') {
        return { id: item.id, asunto: item.asunto, accion: '🗑️ Eliminar', estado: 'Confirmado y Eliminado' };
      } else if (accion === 'Archivar') {
        return { id: item.id, asunto: item.asunto, accion: '📁 Archivar', estado: 'Confirmado y Archivado' };
      } else {
        return { id: item.id, asunto: item.asunto, accion: '✅ Conservar', estado: 'Confirmado y Conservado' };
      }
    });

    return res.json({ resultados, modo });
  } catch (error: any) {
    logger.error('Error in /limpiar endpoint:', error);
    return res.status(500).json({ error: error.message || 'Error interno al limpiar correos' });
  }
});

// Batch action endpoint (e.g. Delete or Archive selected items)
app.post('/accion-lote', (req, res) => {
  try {
    const accion = req.body.accion as 'Eliminar' | 'Archivar' | 'Conservar';
    let ids: string[] = [];

    if (typeof req.body.ids === 'string') {
      try {
        ids = JSON.parse(req.body.ids);
      } catch {
        ids = [req.body.ids];
      }
    } else if (Array.isArray(req.body.ids)) {
      ids = req.body.ids;
    }

    if (!ids || ids.length === 0) {
      return res.status(400).json({ error: 'No se enviaron identificadores de correos para procesar.' });
    }

    logger.info(`Batch action "${accion}" applied to ${ids.length} emails:`, ids);

    // Update in-memory processed items
    if (accion === 'Eliminar') {
      correosProcesados = correosProcesados.filter(c => !ids.includes(c.id));
    } else {
      correosProcesados.forEach(c => {
        if (ids.includes(c.id)) {
          c.clasificacion = accion;
        }
      });
    }

    return res.json({
      success: true,
      accion,
      processedCount: ids.length,
      remainingCount: correosProcesados.length
    });
  } catch (error: any) {
    logger.error('Error in /accion-lote endpoint:', error);
    return res.status(500).json({ error: error.message || 'Error interno al procesar acción por lote' });
  }
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled express exception:', err);
  res.status(500).json({
    error: 'Ocurrió un error inesperado en el servidor.',
    details: NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Gmail AI Cleaner v2.0 corriendo en http://0.0.0.0:${PORT}`);
  logger.info(`Entorno: ${NODE_ENV} | Gemini API: ${process.env.GEMINI_API_KEY ? 'Configurada' : 'Heurística fallback activa'}`);
});
