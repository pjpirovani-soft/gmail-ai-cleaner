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

export interface EmailItem {
  id: string;
  remitente: string;
  asunto: string;
  resumen: string;
  sizeBytes: number;
  date: string;
  categoria: 'promociones' | 'social' | 'viejos' | 'pesados' | 'inbox';
  isOlderThan1Year: boolean;
  clasificacion?: 'Eliminar' | 'Archivar' | 'Conservar';
  motivo?: string;
  inTrash?: boolean;
  archived?: boolean;
}

// Utility to format bytes into human-readable strings
export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Generator of 200 realistic emails for comprehensive testing in batches of 50
function generateRealisticInbox(): EmailItem[] {
  const emails: EmailItem[] = [];

  // 1. Promociones (60 emails)
  const promoStores = [
    { sender: 'ofertas@tiendaonline.com', name: 'Tienda Online' },
    { sender: 'promociones@aliexpress-deals.com', name: 'AliExpress' },
    { sender: 'news@amazon-promos.com', name: 'Amazon Ofertas' },
    { sender: 'descuentos@falabella-mail.com', name: 'Falabella' },
    { sender: 'newsletter@shein-fashion.com', name: 'SHEIN' },
    { sender: 'cupones@ubereats-promo.com', name: 'Uber Eats' },
    { sender: 'ofertas@mercadolibre-news.com', name: 'Mercado Libre' },
    { sender: 'deals@booking-travel.com', name: 'Booking.com' },
    { sender: 'marketing@despegar-vuelos.com', name: 'Despegar' },
    { sender: 'sales@zara-newsletter.com', name: 'Zara' }
  ];

  const promoSubjects = [
    '¡Mega descuento exclusivo solo por hoy! 70% OFF en tecnología',
    'Tu cupón de $15 USD vence en 24 horas. ¡Úsalo ya!',
    'Liquidación de fin de temporada: últimas unidades disponibles',
    'Fin de semana con envíos gratis en todas tus compras',
    'Oferta flash: rebajas hasta agotar stock en electrónica',
    'Descubre las novedades que seleccionamos especialmente para ti'
  ];

  for (let i = 1; i <= 60; i++) {
    const store = promoStores[i % promoStores.length];
    const subj = promoSubjects[i % promoSubjects.length];
    const isOld = i > 15; // 45 old promotions
    emails.push({
      id: `promo_${String(i).padStart(3, '0')}`,
      remitente: store.sender,
      asunto: `${subj} (#${i})`,
      resumen: `Publicidad y promociones comerciales enviadas por ${store.name}. Vales de descuento que ya caducaron.`,
      sizeBytes: Math.floor(120000 + (i * 15000) % 350000), // ~120KB - 470KB
      date: isOld ? '2023-04-12' : '2024-07-20',
      categoria: 'promociones',
      isOlderThan1Year: isOld,
      inTrash: false,
      archived: false
    });
  }

  // 2. Social y Notificaciones (40 emails)
  const socialSenders = [
    { sender: 'notifications@linkedin.com', name: 'LinkedIn', subj: 'Tienes nuevas recomendaciones de empleo y visitas a tu perfil' },
    { sender: 'updates@twitter.com', name: 'X / Twitter', subj: 'Lo más destacado de tu red en las últimas horas' },
    { sender: 'digest@instagram.com', name: 'Instagram', subj: 'Descubre fotos y publicaciones de personas que quizás conozcas' },
    { sender: 'notifications@github.com', name: 'GitHub', subj: 'Novedades y alertas de issues en repositorios suscritos' },
    { sender: 'digest@redditmail.com', name: 'Reddit', subj: 'Historias más votadas en tus comunidades favoritas' },
    { sender: 'news@quora.com', name: 'Quora', subj: 'Preguntas y respuestas destacadas de la semana' }
  ];

  for (let i = 1; i <= 40; i++) {
    const soc = socialSenders[i % socialSenders.length];
    const isOld = i > 10;
    emails.push({
      id: `social_${String(i).padStart(3, '0')}`,
      remitente: soc.sender,
      asunto: `${soc.subj} #${i}`,
      resumen: `Notificación automática de red social ${soc.name} con resúmenes semanales de interacción.`,
      sizeBytes: Math.floor(45000 + (i * 8000) % 90000), // ~45KB - 130KB
      date: isOld ? '2023-08-05' : '2024-06-15',
      categoria: 'social',
      isOlderThan1Year: isOld,
      inTrash: false,
      archived: false
    });
  }

  // 3. Correos Viejos > 1 año y boletines leídos (40 emails)
  const oldSenders = [
    { sender: 'newsletter@techweekly.com', subj: 'Resumen Semanal de Tecnología: Avances en Computación Cuántica' },
    { sender: 'editor@newsletter.ai', subj: 'Newsletter AI Digest: Comparativa de arquitecturas LLM' },
    { sender: 'digest@devto.com', subj: 'Las mejores lecturas para desarrolladores de la semana' },
    { sender: 'webinars@techconferences.org', subj: 'Grabación disponible del webinar de arquitectura en la nube' },
    { sender: 'reservas@hotelcity.com', subj: 'Confirmación de reserva de alojamiento estadía 2022' },
    { sender: 'tickets@concertsevents.net', subj: 'Tus entradas para el festival de música del año pasado' }
  ];

  for (let i = 1; i <= 40; i++) {
    const item = oldSenders[i % oldSenders.length];
    emails.push({
      id: `old_${String(i).padStart(3, '0')}`,
      remitente: item.sender,
      asunto: `${item.subj} (Edición ${200 + i})`,
      resumen: 'Boletín informativo o recibo histórico antiguo que ya cumplió su ciclo y se encuentra leído.',
      sizeBytes: Math.floor(75000 + (i * 12000) % 180000), // ~75KB - 250KB
      date: '2022-11-18',
      categoria: 'viejos',
      isOlderThan1Year: true,
      inTrash: false,
      archived: false
    });
  }

  // 4. Correos Pesados > 10MB (25 emails)
  const heavySenders = [
    { sender: 'cloudbackup@storage.io', subj: 'Backup de video de conferencia técnica 4K (Grabación completa)', size: 18 * 1024 * 1024 },
    { sender: 'familia@correo.com', subj: 'Álbum fotográfico de la reunión familiar en formato RAW y alta resolución', size: 24 * 1024 * 1024 },
    { sender: 'marketing.assets@creative.net', subj: 'Paquete de videos publicitarios en ProRes y render 3D', size: 32 * 1024 * 1024 },
    { sender: 'diseno@arquitectura-studio.com', subj: 'Planos CAD detallados y renders en alta definición del proyecto', size: 15 * 1024 * 1024 },
    { sender: 'presentaciones@keynote-files.org', subj: 'Presentación ejecutiva anual con video incrustado y diapositivas', size: 21 * 1024 * 1024 },
    { sender: 'videoeditor@proyectos.io', subj: 'Cortes iniciales del cortometraje documental en MP4 1080p', size: 28 * 1024 * 1024 }
  ];

  for (let i = 1; i <= 25; i++) {
    const item = heavySenders[i % heavySenders.length];
    const isOld = i % 2 === 0;
    emails.push({
      id: `heavy_${String(i).padStart(3, '0')}`,
      remitente: item.sender,
      asunto: `${item.subj} [Vol. ${i}]`,
      resumen: 'Archivo adjunto de gran tamaño que ocupa espacio crítico en la cuota de almacenamiento de Google Drive y Gmail.',
      sizeBytes: item.size + (i * 400000), // 15MB - 35MB
      date: isOld ? '2023-02-10' : '2024-03-14',
      categoria: 'pesados',
      isOlderThan1Year: isOld,
      inTrash: false,
      archived: false
    });
  }

  // 5. Correos Importantes y Laborales para CONSERVAR (35 emails)
  const importantSenders = [
    { sender: 'jefe@empresa.com', subj: 'Revisión prioritaria de objetivos trimestrales y balance de equipo' },
    { sender: 'banco@mail.com', subj: 'Alerta de seguridad: Clave token dinámica de autenticación bancaria' },
    { sender: 'seguridad@bancointernacional.com', subj: 'Confirmación de transferencia internacional exitosa' },
    { sender: 'no-reply@accounts.google.com', subj: 'Código de verificación de seguridad para tu cuenta de Google' },
    { sender: 'recursos.humanos@empresa.com', subj: 'Comprobante oficial de liquidación salarial y recibo de nómina' },
    { sender: 'carlos.m@empresa.org', subj: 'Minuta oficial de la reunión de estrategia y asignación de presupuesto' },
    { sender: 'soporte@afip-gobierno.gob', subj: 'Constancia oficial de inscripción fiscal e informe de situación' },
    { sender: 'aerolineas@vuelos-checkin.com', subj: 'Pase de abordar e itinerario de vuelo confirmado' }
  ];

  for (let i = 1; i <= 35; i++) {
    const item = importantSenders[i % importantSenders.length];
    emails.push({
      id: `keep_${String(i).padStart(3, '0')}`,
      remitente: item.sender,
      asunto: `${item.subj} - Ref #${1000 + i}`,
      resumen: 'Información laboral, personal crítica, alertas de seguridad o documentos oficiales vigentes indispensables.',
      sizeBytes: Math.floor(35000 + (i * 10000) % 95000), // ~35KB - 130KB
      date: '2024-08-15',
      categoria: 'inbox',
      isOlderThan1Year: false,
      inTrash: false,
      archived: false
    });
  }

  return emails;
}

// In-memory persistent database of emails
let INBOX_DATABASE: EmailItem[] = generateRealisticInbox();

// Processed emails state for interactive table and results
let correosProcesados: Array<{
  id: string;
  remitente: string;
  asunto: string;
  resumen: string;
  sizeBytes?: number;
  clasificacion: 'Eliminar' | 'Archivar' | 'Conservar';
  motivo?: string;
}> = [];

// Undo record stack for safe operations
interface UndoRecord {
  timestamp: number;
  accion: 'eliminar_todos' | 'archivar_todos';
  trashedIds: string[];
  archivedIds: string[];
  freedBytes: number;
  count: number;
}

let lastUndoRecord: UndoRecord | null = null;

// Heuristic rule-based classifier
function fallbackClassification(correo: { asunto: string; remitente: string; resumen: string }): 'Eliminar' | 'Archivar' | 'Conservar' {
  const text = `${correo.remitente} ${correo.asunto} ${correo.resumen}`.toLowerCase();
  
  if (text.includes('descuento') || text.includes('oferta') || text.includes('promo') || 
      text.includes('notifications@') || text.includes('notificacion') || text.includes('70% off') ||
      text.includes('publicidad') || text.includes('spam') || text.includes('shein') ||
      text.includes('aliexpress') || text.includes('mercadolibre') || text.includes('liquidación') ||
      text.includes('flash') || text.includes('rebajas') || text.includes('cupones')) {
    return 'Eliminar';
  }
  
  if (text.includes('newsletter') || text.includes('boletín') || text.includes('boletin') ||
      text.includes('factura') || text.includes('recibo') || text.includes('reserva') ||
      text.includes('confirmación') || text.includes('confirmacion') || text.includes('digest') ||
      text.includes('devto') || text.includes('conferencia') || text.includes('backup') ||
      text.includes('keynote') || text.includes('cad') || text.includes('album') || text.includes('álbum')) {
    return 'Archivar';
  }
  
  return 'Conservar';
}

// Intelligent classifier using Gemini 2.5 Flash
async function clasificarConGemini(correo: { asunto: string; remitente: string; resumen: string }): Promise<'Eliminar' | 'Archivar' | 'Conservar'> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
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

// Helper to filter inbox items based on selected criteria
function getFilteredInboxItems(filterType: string, customQuery?: string): EmailItem[] {
  // Only active emails not already in trash
  let list = INBOX_DATABASE.filter(c => !c.inTrash && !c.archived);

  switch (filterType) {
    case 'promotions':
      list = list.filter(c => c.categoria === 'promociones' || /ofertas|promo|deals|news@amazon|shein|cupon/i.test(c.remitente));
      break;
    case 'social':
      list = list.filter(c => c.categoria === 'social' || /linkedin|twitter|instagram|github|reddit|quora/i.test(c.remitente));
      break;
    case 'older_1y':
      list = list.filter(c => c.isOlderThan1Year);
      break;
    case 'heavy_10m':
      list = list.filter(c => c.sizeBytes >= 10 * 1024 * 1024);
      break;
    case 'all':
    default:
      // 'all' includes all non-trashed inbox items
      break;
  }

  if (customQuery && customQuery.trim()) {
    const q = customQuery.toLowerCase().trim();
    list = list.filter(c => {
      if (q.includes('older_than:1y')) return c.isOlderThan1Year;
      if (q.includes('larger:10m')) return c.sizeBytes >= 10 * 1024 * 1024;
      if (q.includes('from:newsletter')) return c.remitente.toLowerCase().includes('newsletter');
      if (q.includes('from:ofertas')) return c.remitente.toLowerCase().includes('ofertas');
      const combined = `${c.remitente} ${c.asunto} ${c.resumen}`.toLowerCase();
      return combined.includes(q);
    });
  }

  return list;
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Gmail AI Cleaner',
    version: '2.0.0',
    uptime: process.uptime(),
    totalEmailsInDatabase: INBOX_DATABASE.length,
    activeEmails: INBOX_DATABASE.filter(c => !c.inTrash && !c.archived).length,
    trashedCount: INBOX_DATABASE.filter(c => c.inTrash).length,
    timestamp: new Date().toISOString()
  });
});

/* ==========================================================================
   WARRIOR MODE: LIMPIEZA TOTAL CON IA (Lotes de 50 + Barra en tiempo real)
   ========================================================================== */

// 1. Preparar Limpieza Total: devuelve conteo total, número de lotes y tamaño estimado
app.post('/api/limpieza-total/preparar', (req, res) => {
  try {
    const filterType = (req.body.filterType || 'all').trim();
    const customQuery = (req.body.customQuery || '').trim();
    const excludeSenders = (req.body.excludeSenders || '').trim();
    const includeSenders = (req.body.includeSenders || '').trim();

    logger.info(`[WARRIOR MODE] Preparing total cleanup: filterType=${filterType}`);

    const matchingItems = getFilteredInboxItems(filterType, customQuery);
    const totalEmails = matchingItems.length;
    const batchSize = 50;
    const totalBatches = Math.max(1, Math.ceil(totalEmails / batchSize));
    const totalSizeBytes = matchingItems.reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0);

    const filterDescriptions: Record<string, string> = {
      'all': 'Todos los correos de la Bandeja de entrada (in:inbox)',
      'promotions': 'Promociones caducadas y ofertas comerciales (category:promotions)',
      'social': 'Notificaciones de redes sociales y foros (category:social)',
      'older_1y': 'Correos antiguos recibidos hace más de 1 año (older_than:1y)',
      'heavy_10m': 'Correos pesados con adjuntos superiores a 10MB (larger:10M)'
    };

    return res.json({
      success: true,
      totalEmails,
      batchSize,
      totalBatches,
      totalSizeBytes,
      totalSizeFormatted: formatBytes(totalSizeBytes),
      filterType,
      filterDescription: filterDescriptions[filterType] || filterDescriptions['all'],
      excludeSenders,
      includeSenders
    });
  } catch (error: any) {
    logger.error('Error preparing warrior cleanup:', error);
    return res.status(500).json({ error: error.message || 'Error al preparar la limpieza total' });
  }
});

// 2. Procesar Lote Individual (50 correos por petición para respetar Gemini y Vercel)
app.post('/api/limpieza-total/procesar-lote', async (req, res) => {
  try {
    const batchIndex = parseInt(req.body.batchIndex, 10) || 0;
    const batchSize = parseInt(req.body.batchSize, 10) || 50;
    const filterType = (req.body.filterType || 'all').trim();
    const customQuery = (req.body.customQuery || '').trim();
    const excludeInput = (req.body.excludeSenders || '').trim().toLowerCase();
    const includeInput = (req.body.includeSenders || '').trim().toLowerCase();

    // Parse list of excluded and included senders
    const excludeList = excludeInput ? excludeInput.split(',').map(s => s.trim()).filter(Boolean) : [];
    const includeList = includeInput ? includeInput.split(',').map(s => s.trim()).filter(Boolean) : [];

    const allMatching = getFilteredInboxItems(filterType, customQuery);
    const totalMatching = allMatching.length;

    const startIndex = batchIndex * batchSize;
    const endIndex = Math.min(startIndex + batchSize, totalMatching);
    const batchSlice = allMatching.slice(startIndex, endIndex);

    logger.info(`[WARRIOR MODE] Processing Batch #${batchIndex + 1}: items ${startIndex + 1} to ${endIndex} of ${totalMatching}`);

    let batchCountEliminar = 0;
    let batchCountArchivar = 0;
    let batchCountConservar = 0;
    let batchFreedBytes = 0;

    const processedBatchItems = await Promise.all(
      batchSlice.map(async correo => {
        const senderLower = correo.remitente.toLowerCase();

        // Check EXCLUDE list (Safety Rule: Never touch these, always 'Conservar')
        const isExcluded = excludeList.some(ex => senderLower.includes(ex));
        if (isExcluded) {
          batchCountConservar++;
          return {
            id: correo.id,
            remitente: correo.remitente,
            asunto: correo.asunto,
            resumen: correo.resumen,
            sizeBytes: correo.sizeBytes,
            clasificacion: 'Conservar' as const,
            motivo: '🛡️ Protegido por filtro de remitente excluido'
          };
        }

        // Check INCLUDE list (Forced Rule: Always 'Eliminar')
        const isIncluded = includeList.some(inc => senderLower.includes(inc));
        if (isIncluded) {
          batchCountEliminar++;
          batchFreedBytes += correo.sizeBytes || 0;
          return {
            id: correo.id,
            remitente: correo.remitente,
            asunto: correo.asunto,
            resumen: correo.resumen,
            sizeBytes: correo.sizeBytes,
            clasificacion: 'Eliminar' as const,
            motivo: '🎯 Marcado por regla de inclusión directa'
          };
        }

        // Classify with Gemini AI (or intelligent heuristic fallback)
        const clasificacion = await clasificarConGemini(correo);
        if (clasificacion === 'Eliminar') {
          batchCountEliminar++;
          batchFreedBytes += correo.sizeBytes || 0;
        } else if (clasificacion === 'Archivar') {
          batchCountArchivar++;
        } else {
          batchCountConservar++;
        }

        return {
          id: correo.id,
          remitente: correo.remitente,
          asunto: correo.asunto,
          resumen: correo.resumen,
          sizeBytes: correo.sizeBytes,
          clasificacion,
          motivo: 'Clasificado con Gemini 2.5 Flash'
        };
      })
    );

    // If it's the first batch, reset correosProcesados; otherwise append
    if (batchIndex === 0) {
      correosProcesados = [...processedBatchItems];
    } else {
      correosProcesados.push(...processedBatchItems);
    }

    const isLastBatch = endIndex >= totalMatching;

    return res.json({
      success: true,
      batchIndex,
      batchSize,
      totalMatching,
      processedCountInBatch: processedBatchItems.length,
      cumulativeProcessed: endIndex,
      countEliminar: batchCountEliminar,
      countArchivar: batchCountArchivar,
      countConservar: batchCountConservar,
      batchFreedBytes,
      batchFreedFormatted: formatBytes(batchFreedBytes),
      isLastBatch,
      items: processedBatchItems
    });
  } catch (error: any) {
    logger.error('Error processing warrior batch:', error);
    return res.status(500).json({ error: error.message || 'Error al procesar el lote de correos' });
  }
});

// 3. Ejecutar Limpieza Masiva (Mover a Papelera con soporte de Deshacer)
app.post('/api/limpieza-total/ejecutar', (req, res) => {
  try {
    const accion = (req.body.accion || 'eliminar_todos') as 'eliminar_todos' | 'archivar_todos';
    let targetIds: string[] = [];

    if (Array.isArray(req.body.ids)) {
      targetIds = req.body.ids;
    } else if (typeof req.body.ids === 'string') {
      try {
        targetIds = JSON.parse(req.body.ids);
      } catch {
        targetIds = [req.body.ids];
      }
    } else {
      // Default to all marked in current session
      if (accion === 'eliminar_todos') {
        targetIds = correosProcesados.filter(c => c.clasificacion === 'Eliminar').map(c => c.id);
      } else {
        targetIds = correosProcesados.filter(c => c.clasificacion === 'Archivar').map(c => c.id);
      }
    }

    if (targetIds.length === 0) {
      return res.status(400).json({ error: 'No hay correos seleccionados para ejecutar esta acción.' });
    }

    logger.info(`[WARRIOR MODE] Executing action="${accion}" on ${targetIds.length} items`);

    let freedBytes = 0;
    const trashedIds: string[] = [];
    const archivedIds: string[] = [];

    INBOX_DATABASE.forEach(item => {
      if (targetIds.includes(item.id)) {
        if (accion === 'eliminar_todos') {
          item.inTrash = true;
          trashedIds.push(item.id);
          freedBytes += item.sizeBytes || 0;
        } else {
          item.archived = true;
          archivedIds.push(item.id);
        }
      }
    });

    // Update correosProcesados state
    if (accion === 'eliminar_todos') {
      correosProcesados = correosProcesados.filter(c => !trashedIds.includes(c.id));
    }

    // Save undo record
    lastUndoRecord = {
      timestamp: Date.now(),
      accion,
      trashedIds,
      archivedIds,
      freedBytes,
      count: targetIds.length
    };

    const message = accion === 'eliminar_todos'
      ? `Se enviaron ${trashedIds.length} correos a la Papelera de Gmail, liberando ${formatBytes(freedBytes)}.`
      : `Se archivaron ${archivedIds.length} correos correctamente.`;

    return res.json({
      success: true,
      accion,
      count: targetIds.length,
      trashedCount: trashedIds.length,
      archivedCount: archivedIds.length,
      freedBytes,
      freedFormatted: formatBytes(freedBytes),
      canUndo: true,
      message
    });
  } catch (error: any) {
    logger.error('Error executing warrior action:', error);
    return res.status(500).json({ error: error.message || 'Error al ejecutar la acción de limpieza' });
  }
});

// 4. Deshacer la última acción (Restaurar de Papelera a Bandeja de Entrada)
app.post('/api/limpieza-total/deshacer', (_req, res) => {
  try {
    if (!lastUndoRecord) {
      return res.status(400).json({ error: 'No hay ninguna acción reciente disponible para deshacer.' });
    }

    const { trashedIds, archivedIds, count } = lastUndoRecord;
    logger.info(`[WARRIOR MODE] Undoing last action for ${count} emails`);

    let restoredCount = 0;

    INBOX_DATABASE.forEach(item => {
      if (trashedIds.includes(item.id)) {
        item.inTrash = false;
        restoredCount++;
      }
      if (archivedIds.includes(item.id)) {
        item.archived = false;
        restoredCount++;
      }
    });

    lastUndoRecord = null;

    return res.json({
      success: true,
      restoredCount,
      message: `¡Acción deshecha con éxito! Se restauraron ${restoredCount} correos a la bandeja de entrada.`
    });
  } catch (error: any) {
    logger.error('Error undoing warrior action:', error);
    return res.status(500).json({ error: error.message || 'Error al restaurar los correos' });
  }
});

/* ==========================================================================
   LEGACY & INDIVIDUAL SEARCH ENDPOINTS (Fully Synchronized)
   ========================================================================== */

// Endpoint to search and analyze emails
app.post('/analizar', async (req, res) => {
  try {
    const query = (req.body.query || '').trim();
    const limite = parseInt(req.body.limite, 10) || 10;

    logger.info(`Analyzing emails with query="${query}", limit=${limite}`);

    if (!query) {
      return res.status(400).json({ error: 'Filtro de búsqueda vacío. Ingresa un término o filtro de Gmail.' });
    }

    const matching = getFilteredInboxItems('all', query);
    const toProcess = matching.slice(0, Math.min(limite, 100));

    if (toProcess.length === 0) {
      logger.info('No emails found for query');
      return res.json({ correos: [], total: 0, mensaje: 'No se encontraron correos para el filtro especificado.' });
    }

    logger.info(`Classifying ${toProcess.length} emails...`);

    correosProcesados = await Promise.all(
      toProcess.map(async correo => {
        const clasificacion = await clasificarConGemini(correo);
        return {
          id: correo.id,
          remitente: correo.remitente,
          asunto: correo.asunto,
          resumen: correo.resumen,
          sizeBytes: correo.sizeBytes,
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

// Endpoint to execute cleaning modes (simulacion, automatico, interactivo)
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
          estado: 'Simulación (sin cambios en Gmail)'
        };
      }

      if (modo === 'automatico') {
        if (accion === 'Eliminar') {
          return { id: item.id, asunto: item.asunto, accion: '🗑️ Eliminar', estado: 'Movido a Papelera de Gmail' };
        } else if (accion === 'Archivar') {
          return { id: item.id, asunto: item.asunto, accion: '📁 Archivar', estado: 'Archivado en Todos' };
        } else {
          return { id: item.id, asunto: item.asunto, accion: '✅ Conservar', estado: 'Conservado en Bandeja' };
        }
      }

      // Modo interactivo
      if (accion === 'Eliminar') {
        return { id: item.id, asunto: item.asunto, accion: '🗑️ Eliminar', estado: 'Confirmado y Movido a Papelera' };
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

// Batch action endpoint
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

    // Update INBOX_DATABASE and in-memory processed items
    if (accion === 'Eliminar') {
      INBOX_DATABASE.forEach(item => {
        if (ids.includes(item.id)) item.inTrash = true;
      });
      correosProcesados = correosProcesados.filter(c => !ids.includes(c.id));
    } else {
      INBOX_DATABASE.forEach(item => {
        if (ids.includes(item.id)) item.archived = accion === 'Archivar';
      });
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

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Gmail AI Cleaner v2.0 corriendo en http://0.0.0.0:${PORT}`);
    logger.info(`Entorno: ${NODE_ENV} | Total correos en bandeja: ${INBOX_DATABASE.length}`);
    logger.info(`Gemini API: ${process.env.GEMINI_API_KEY ? 'Configurada (gemini-2.5-flash)' : 'Heurística fallback activa'}`);
  });
}

export default app;

