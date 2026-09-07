import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const PORT = 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const USER_NAME = process.env.USER_NAME || 'Pedro José Pirovani';
const USER_EMAIL = process.env.USER_EMAIL || 'pirovanipedrojose@gmail.com';

// Google OAuth 2.0 Credentials (for Vercel & local development)
const GOOGLE_CLIENT_ID = process.env.GMAIL_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GMAIL_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI || '/auth/google/callback';
const SESSION_SECRET = process.env.SESSION_SECRET || 'gmail-ai-cleaner-session-secret-2026';

export interface AppUser {
  id: string;
  displayName: string;
  email: string;
  avatar?: string;
  accessToken: string;
  refreshToken?: string;
}

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

// Express Session Configuration
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: 'auto',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// Passport Authentication Configuration
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  logger.info('Inicializando GoogleStrategy con clientID configurado.');
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_REDIRECT_URI,
      },
      (_accessToken, _refreshToken, profile, done) => {
        const user: AppUser = {
          id: profile.id,
          displayName: profile.displayName || (profile.name ? `${profile.name.givenName || ''} ${profile.name.familyName || ''}`.trim() : 'Usuario'),
          email: profile.emails && profile.emails[0] ? profile.emails[0].value : '',
          avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
          accessToken: _accessToken,
          refreshToken: _refreshToken,
        };
        logger.info(`Google OAuth exitoso para: ${user.email} (${user.displayName})`);
        return done(null, user);
      }
    )
  );
} else {
  logger.warn('Google OAuth no configurado (GMAIL_CLIENT_ID y GMAIL_CLIENT_SECRET vacíos). Configura estas variables en Vercel para sincronizar Gmail real.');
}

// User Context Middleware: passes user info and authentication state to all EJS templates
app.use((req: Request, res: Response, next: NextFunction) => {
  const sessionUser = (req.session as any)?.user as AppUser | undefined;
  const currentUser = (req.user as AppUser) || sessionUser || null;
  const sessionToken = (req.session as any)?.accessToken || currentUser?.accessToken;
  const isAuthenticated = Boolean(currentUser && sessionToken);

  res.locals.user = currentUser;
  res.locals.isAuthenticated = isAuthenticated;
  res.locals.userName = isAuthenticated ? (currentUser?.displayName || 'Usuario') : '';
  res.locals.userEmail = isAuthenticated ? (currentUser?.email || '') : '';
  res.locals.userAvatar = currentUser?.avatar || '';
  res.locals.accessToken = sessionToken || '';
  next();
});

// Middleware de verificación de autenticación para rutas protegidas
function requireGmailAuth(req: Request, res: Response, next: NextFunction) {
  const sessionUser = (req.session as any)?.user as AppUser | undefined;
  const currentUser = (req.user as AppUser) || sessionUser;
  const sessionToken = (req.session as any)?.accessToken || currentUser?.accessToken;
  const isAuth = Boolean(currentUser && sessionToken);

  if (!isAuth) {
    logger.warn(`Acceso sin autenticación a ruta protegida: ${req.path}`);
    if (req.xhr || req.headers.accept?.includes('application/json') || req.path.startsWith('/api/')) {
      return res.status(401).json({
        error: 'No autenticado',
        message: 'Debes iniciar sesión con tu cuenta de Google para acceder a tu bandeja de Gmail.',
        redirectTo: '/auth/google'
      });
    }
    return res.redirect('/auth/google');
  }
  next();
}

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

// Heuristic rule-based classifier aligned with strict 3-tier categorization
function fallbackClassification(
  correo: { asunto: string; remitente: string; resumen: string },
  instruccionesPersonalizadas?: string
): 'Eliminar' | 'Archivar' | 'Conservar' {
  const text = `${correo.remitente} ${correo.asunto} ${correo.resumen}`.toLowerCase();
  
  // 1. Prioritize user custom instructions if present
  if (instruccionesPersonalizadas && instruccionesPersonalizadas.trim()) {
    const inst = instruccionesPersonalizadas.toLowerCase();
    
    // Protection heuristics (boss, bank, work, family, essential services)
    if ((inst.includes('no elimines') || inst.includes('no borrar') || inst.includes('conserva') || inst.includes('no tocar')) &&
        ((inst.includes('banco') && (text.includes('banco') || text.includes('santander') || text.includes('bbva') || text.includes('galicia'))) ||
         (inst.includes('jefe') && (text.includes('jefe') || text.includes('gerente') || text.includes('director') || text.includes('boss'))) ||
         (inst.includes('trabajo') && (text.includes('trabajo') || text.includes('proyecto') || text.includes('laboral') || text.includes('work'))) ||
         (inst.includes('familia') && (text.includes('familia') || text.includes('mamá') || text.includes('papá') || text.includes('hijo'))))) {
      return 'Conservar';
    }

    // Archive heuristics
    if (inst.includes('archiva') || inst.includes('archivar')) {
      if (inst.includes('factura') && (text.includes('factura') || text.includes('recibo') || text.includes('comprobante') || text.includes('ticket'))) {
        return 'Archivar';
      }
    }
  }

  // 2. CATEGORÍA "ÚTIL" (Conservar):
  // - Correos de trabajo (jefes, colegas, clientes, proyectos activos)
  // - Correos del banco (alertas de seguridad, movimientos, transferencias)
  // - Correos de familiares y amigos cercanos
  // - Correos de servicios esenciales (agua, luz, internet, seguros)
  // - Facturas y documentos importantes pendientes
  // - Alertas de seguridad y verificación de cuentas
  const isUtil = 
    text.includes('jefe') || text.includes('balance de equipo') || text.includes('minuta oficial') ||
    text.includes('banco') || text.includes('token dinámica') || text.includes('transferencia') ||
    text.includes('código de verificación') || text.includes('alerta de seguridad') ||
    text.includes('recursos humanos') || text.includes('liquidación salarial') || text.includes('recibo de nómina') ||
    text.includes('afip') || text.includes('inscripción fiscal') || text.includes('pase de abordar') ||
    text.includes('vuelos-checkin') || text.includes('familia@') || text.includes('reunión familiar') ||
    text.includes('agua') || text.includes('luz') || text.includes('edenor') || text.includes('edesur') ||
    text.includes('aysa') || text.includes('metrogas') || text.includes('seguro');

  if (isUtil) {
    return 'Conservar';
  }

  // 3. CATEGORÍA "ARCHIVABLE" (Archivar):
  // - Confirmaciones de compras y pedidos
  // - Facturas pagadas y recibos
  // - Correos informativos de empresas de uso habitual
  // - Notificaciones de servicios que se usan (no urgentes)
  // - Reservas de hotel o viajes pasados
  const isArchivable = 
    text.includes('confirmación de reserva') || text.includes('reserva de alojamiento') ||
    text.includes('factura pagada') || text.includes('recibo histórico') || text.includes('entradas para') ||
    text.includes('grabación disponible') || text.includes('webinar de arquitectura') ||
    text.includes('backup de video') || text.includes('planos cad') || text.includes('presentación ejecutiva') ||
    text.includes('cortes iniciales') || text.includes('pedido confirmado') || text.includes('comprobante de compra');

  if (isArchivable) {
    return 'Archivar';
  }

  // 4. CATEGORÍA "DESECHABLE" (Eliminar):
  // - Spam y correos no solicitados
  // - Promociones, ofertas comerciales y publicidad (cupones, descuentos, rebajas)
  // - Newsletters que no se han abierto en meses
  // - Redes sociales (LinkedIn, Twitter/X, Instagram, Reddit, Quora, etc.)
  // - Marketing y ventas
  // - Vercel, GitHub o servicios que ya no se usan o no se necesitan
  // Si un correo no entra en ninguna de estas categorías, clasifícalo como "Desechable" (Eliminar) para mantener la bandeja limpia.
  return 'Eliminar';
}

let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Intelligent classifier using Gemini 3.8 Flash with strict 3-tier categorization
async function clasificarConGemini(
  correo: { asunto: string; remitente: string; resumen: string },
  instruccionesPersonalizadas?: string
): Promise<'Eliminar' | 'Archivar' | 'Conservar'> {
  const ai = getGeminiClient();
  if (!ai) {
    return fallbackClassification(correo, instruccionesPersonalizadas);
  }

  try {
    let userInstructionsBlock = '';
    if (instruccionesPersonalizadas && instruccionesPersonalizadas.trim()) {
      userInstructionsBlock = `Instrucciones personalizadas del usuario: ${instruccionesPersonalizadas.trim()}
IMPORTANTE: Debes dar MÁXIMA PRIORIDAD a estas instrucciones personalizadas del usuario sobre cualquier otra regla general de clasificación.

`;
    }

    const prompt = `${userInstructionsBlock}Eres un asistente de organización de correos electrónicos con acceso a TODA mi bandeja de entrada. Tu tarea es leer este correo y clasificarlo estrictamente en tres categorías:

1. "ÚTIL" (Conservar): Correos que son funcionales, importantes o necesarios para mi vida diaria. Incluye:
   - Correos de trabajo (jefes, colegas, clientes, proyectos activos).
   - Correos del banco (alertas de seguridad, movimientos, transferencias).
   - Correos de familiares y amigos cercanos.
   - Correos de servicios esenciales que uso (agua, luz, internet, seguros).
   - Facturas y documentos importantes.
   - Alertas de seguridad y verificación de cuentas.

2. "ARCHIVABLE" (Archivar): Correos que no son urgentes pero que podrían ser útiles en el futuro. Incluye:
   - Confirmaciones de compras y pedidos.
   - Facturas pagadas.
   - Correos informativos de empresas que uso.
   - Notificaciones de servicios que uso (pero no son urgentes).

3. "DESECHABLE" (Eliminar): Correos que NO son útiles y solo ocupan espacio. Incluye:
   - Spam y correos no solicitados.
   - Promociones, ofertas comerciales y publicidad.
   - Newsletters que no he abierto en meses.
   - Correos de redes sociales (notificaciones de Instagram, Facebook, LinkedIn, etc.).
   - Correos de marketing y ventas.
   - Correos de Vercel, GitHub o servicios que ya no uso o que no necesito.

Si un correo no entra en ninguna de estas categorías, clasifícalo como "Desechable" para mantener mi bandeja limpia.

Detalles del correo:
Remitente: ${correo.remitente}
Asunto: ${correo.asunto}
Contenido/Resumen: ${correo.resumen}

Responde ÚNICAMENTE con una de estas tres palabras: "Conservar", "Archivar" o "Eliminar".`;

    const callPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout al consultar Gemini')), 3000)
    );
    const response = await Promise.race([callPromise, timeoutPromise]);

    const output = response.text?.trim() || '';
    if (/conservar|útil|util/i.test(output)) return 'Conservar';
    if (/archivar|archivable/i.test(output)) return 'Archivar';
    if (/eliminar|desechable/i.test(output)) return 'Eliminar';
    return fallbackClassification(correo, instruccionesPersonalizadas);
  } catch (error: any) {
    logger.warn('Gemini API call failed, falling back to heuristic:', error.message);
    return fallbackClassification(correo, instruccionesPersonalizadas);
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
      if (q === 'in:inbox' || q === 'is:unread' || q === 'all' || q === '*') return true;
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

/* ==========================================================================
   GOOGLE GMAIL API INTEGRATION (Server-to-Google OAuth 2.0)
   ========================================================================== */

// Consultar mensajes reales de Gmail usando el token de acceso
async function fetchRealGmailMessages(accessToken: string, query: string, maxResults = 50): Promise<EmailItem[]> {
  try {
    const q = encodeURIComponent(query || 'in:inbox');
    const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${q}&maxResults=${maxResults}`;
    
    const listRes = await fetch(listUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!listRes.ok) {
      const errBody = await listRes.text();
      logger.warn(`Gmail API list error (${listRes.status}): ${errBody.slice(0, 200)}`);
      return [];
    }

    const listData = await listRes.json();
    const messages: Array<{ id: string; threadId: string }> = listData.messages || [];
    if (messages.length === 0) return [];

    logger.info(`Obteniendo detalles de ${messages.length} correos reales desde Gmail API...`);

    const items = await Promise.all(
      messages.map(async (m) => {
        try {
          const detailRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          if (!detailRes.ok) return null;
          const msg = await detailRes.json();
          const headers: Array<{ name: string; value: string }> = msg.payload?.headers || [];
          
          const from = headers.find(h => h.name?.toLowerCase() === 'from')?.value || 'Remitente desconocido';
          const subject = headers.find(h => h.name?.toLowerCase() === 'subject')?.value || '(Sin asunto)';
          const dateStr = headers.find(h => h.name?.toLowerCase() === 'date')?.value || '';
          
          let isOlder = false;
          if (dateStr) {
            const d = new Date(dateStr);
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            isOlder = d < oneYearAgo;
          }

          return {
            id: msg.id,
            remitente: from,
            asunto: subject,
            resumen: msg.snippet || 'Sin resumen disponible',
            sizeBytes: msg.sizeEstimate || 12000,
            date: dateStr ? new Date(dateStr).toISOString().split('T')[0] : '2025-01-01',
            categoria: 'inbox' as const,
            isOlderThan1Year: isOlder,
            inTrash: false,
            archived: false,
          };
        } catch (e) {
          return null;
        }
      })
    );

    return items.filter(Boolean) as EmailItem[];
  } catch (error: any) {
    logger.error('Error al consultar Gmail API:', error.message || error);
    return [];
  }
}

// Mover correo a la papelera en Gmail
async function trashRealGmailMessage(accessToken: string, id: string): Promise<boolean> {
  try {
    const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/trash`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.ok;
  } catch (e) {
    logger.error(`Error enviando correo ${id} a papelera en Gmail:`, e);
    return false;
  }
}

// Archivar correo en Gmail (remueve la etiqueta INBOX)
async function archiveRealGmailMessage(accessToken: string, id: string): Promise<boolean> {
  try {
    const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/modify`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        removeLabelIds: ['INBOX'],
      }),
    });
    return res.ok;
  } catch (e) {
    logger.error(`Error archivando correo ${id} en Gmail:`, e);
    return false;
  }
}

/* ==========================================================================
   AUTHENTICATION ROUTES (Google OAuth 2.0)
   ========================================================================== */

// 1. Redirigir a Google para iniciar sesión y autorizar acceso a Gmail
app.get('/auth/google', (req: Request, res: Response, next: NextFunction) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    logger.warn('Google OAuth no configurado. Faltan GMAIL_CLIENT_ID y GMAIL_CLIENT_SECRET.');
    return res.status(500).send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Google OAuth Requerido • Gmail AI Cleaner</title>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: Roboto, sans-serif; background: #f8f9fa; color: #202124; margin: 0; padding: 24px; display: flex; align-items: center; justify-content: center; min-height: 90vh; }
          .card { background: #ffffff; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); padding: 36px 32px; max-width: 540px; text-align: center; border: 1px solid #e0e0e0; }
          .icon { font-size: 40px; margin-bottom: 12px; }
          h1 { font-size: 20px; font-weight: 600; color: #ea4335; margin: 0 0 12px 0; }
          p { font-size: 14.5px; line-height: 1.6; color: #5f6368; margin: 0 0 20px 0; text-align: left; }
          .code-box { background: #f1f3f4; border-radius: 8px; padding: 14px; font-family: monospace; font-size: 13px; color: #202124; text-align: left; margin-bottom: 20px; word-break: break-all; }
          .btn-group { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
          .btn { display: inline-block; background: #1a73e8; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-size: 14px; font-weight: 500; }
          .btn-outline { background: transparent; color: #1a73e8; border: 1px solid #1a73e8; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">⚠️</div>
          <h1>Variables OAuth Requeridas en Vercel</h1>
          <p>Para conectar tu cuenta de Gmail real, debes ingresar a la configuración de tu proyecto en <strong>Vercel (Settings &gt; Environment Variables)</strong> y definir:</p>
          <div class="code-box">
            GMAIL_CLIENT_ID=&lt;tu_client_id_de_google_cloud&gt;<br>
            GMAIL_CLIENT_SECRET=&lt;tu_client_secret_de_google_cloud&gt;<br>
            GMAIL_REDIRECT_URI=https://gmail-ai-cleaner.vercel.app/auth/callback
          </div>
          <p style="font-size: 13px; color: #70757a;">
            Tanto <code>/auth/callback</code> como <code>/auth/google/callback</code> están soportados. Asegúrate de registrar el redirect URI en Google Cloud Console (APIs &amp; Services &gt; Credentials &gt; OAuth 2.0 Client IDs).
          </p>
          <div class="btn-group">
            <a href="/auth/demo-login" class="btn btn-outline">Probar con Sesión Demo</a>
            <a href="/" class="btn">Volver al inicio</a>
          </div>
        </div>
      </body>
      </html>
    `);
  }

  // Permite especificar el callbackURL o usar el configurado
  const callbackURL = (req.query.callback as string) || GOOGLE_REDIRECT_URI;

  passport.authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/gmail.modify',
    ],
    accessType: 'offline',
    prompt: 'consent',
    callbackURL,
  })(req, res, next);
});

// Helper para guardar el usuario y token en la sesión tras autenticación OAuth exitosa
const handleOAuthSuccess = (req: Request, res: Response) => {
  const user = req.user as AppUser;
  if (user) {
    (req.session as any).user = user;
    (req.session as any).accessToken = user.accessToken;
  }
  req.session.save((err) => {
    if (err) {
      logger.error('Error al persistir sesión en express-session:', err);
    }
    logger.info(`Sesión OAuth guardada en express-session para: ${user?.email} (${user?.displayName})`);
    res.redirect('/?auth=success');
  });
};

// 2. Callback de Google OAuth: /auth/google/callback
app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/?error=auth_failed',
  }),
  handleOAuthSuccess
);

// 2b. Callback de Google OAuth alternativo: /auth/callback (soluciona error de ruta inexistente)
app.get(
  '/auth/callback',
  passport.authenticate('google', {
    failureRedirect: '/?error=auth_failed',
  }),
  handleOAuthSuccess
);

// Endpoint para consultar el estado de la sesión actual
app.get('/auth/status', (req: Request, res: Response) => {
  const sessionUser = (req.session as any)?.user as AppUser | undefined;
  const currentUser = (req.user as AppUser) || sessionUser;
  const sessionToken = (req.session as any)?.accessToken || currentUser?.accessToken;
  const isAuthenticated = Boolean(currentUser && sessionToken);

  return res.json({
    isAuthenticated,
    user: isAuthenticated ? {
      id: currentUser?.id,
      displayName: currentUser?.displayName,
      email: currentUser?.email,
      avatar: currentUser?.avatar
    } : null
  });
});

// Endpoint de login demo para pruebas de interfaz sin credenciales GCP
app.get('/auth/demo-login', (req: Request, res: Response) => {
  const demoUser: AppUser = {
    id: 'demo_user_google_123',
    displayName: USER_NAME || 'Pedro José Pirovani',
    email: USER_EMAIL || 'pirovanipedrojose@gmail.com',
    avatar: '',
    accessToken: 'demo_gmail_access_token_valid_2026',
  };

  req.login(demoUser, (err) => {
    if (err) {
      logger.error('Error en req.login para demoUser:', err);
      return res.redirect('/?error=auth_failed');
    }
    (req.session as any).user = demoUser;
    (req.session as any).accessToken = demoUser.accessToken;
    req.session.save(() => {
      logger.info(`Sesión demo activada para ${demoUser.email}`);
      res.redirect('/?auth=success');
    });
  });
});

// 3. Cerrar sesión y destruir datos de sesión
app.get('/auth/logout', (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) {
      logger.error('Error al ejecutar req.logout:', err);
      return next(err);
    }
    if (req.session) {
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          logger.error('Error al destruir express-session:', destroyErr);
        }
        res.clearCookie('connect.sid');
        logger.info('Sesión cerrada y cookie eliminada con éxito.');
        res.redirect('/?logout=success');
      });
    } else {
      res.redirect('/?logout=success');
    }
  });
});

// Routes
app.get('/', (req, res) => {
  logger.debug('Rendering index view');
  res.render('index', { 
    userName: res.locals.userName, 
    userEmail: res.locals.userEmail, 
    userAvatar: res.locals.userAvatar, 
    isAuthenticated: res.locals.isAuthenticated, 
    user: res.locals.user 
  });
});

app.get('/resultados', (req, res) => {
  logger.debug('Rendering resultados view');
  res.render('resultados', { 
    userName: res.locals.userName, 
    userEmail: res.locals.userEmail, 
    userAvatar: res.locals.userAvatar, 
    isAuthenticated: res.locals.isAuthenticated, 
    user: res.locals.user 
  });
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

// Utilidad para construir la consulta de Gmail según el filtro seleccionado
function getGmailQueryForFilter(filterType: string, customQuery?: string): string {
  let baseQuery = 'in:inbox';
  if (filterType === 'promotions') baseQuery = 'category:promotions';
  else if (filterType === 'social') baseQuery = 'category:social';
  else if (filterType === 'older_1y') baseQuery = 'in:inbox older_than:1y';
  else if (filterType === 'heavy_10m') baseQuery = 'in:inbox larger:10M';

  if (customQuery && customQuery.trim()) {
    const q = customQuery.trim();
    if (q !== '*' && q !== 'all' && q !== 'in:inbox') {
      return `${baseQuery} ${q}`;
    }
  }
  return baseQuery;
}

// 1. Preparar Limpieza Total: devuelve conteo total, número de lotes y tamaño estimado
app.post('/api/limpieza-total/preparar', requireGmailAuth, async (req, res) => {
  try {
    const filterType = (req.body.filterType || 'all').trim();
    const customQuery = (req.body.customQuery || '').trim();
    const excludeSenders = (req.body.excludeSenders || '').trim();
    const includeSenders = (req.body.includeSenders || '').trim();
    const instruccionesPersonalizadas = (req.body.instruccionesPersonalizadas || req.body.customInstructions || '').toString().trim().slice(0, 500);

    const sessionUser = (req.session as any)?.user as AppUser | undefined;
    const currentUser = (req.user as AppUser) || sessionUser;
    const token = (req.session as any)?.accessToken || currentUser?.accessToken;

    logger.info(`[WARRIOR MODE] Preparando escaneo total: filterType=${filterType}, user=${currentUser?.email || 'anon'}`);

    let matchingItems: EmailItem[] = [];
    if (token && GOOGLE_CLIENT_ID && !token.startsWith('demo_')) {
      const gmailQuery = getGmailQueryForFilter(filterType, customQuery);
      logger.info(`[GMAIL API] Obteniendo lista preliminar con query: "${gmailQuery}"...`);
      const liveItems = await fetchRealGmailMessages(token, gmailQuery, 50);
      if (liveItems && liveItems.length > 0) {
        matchingItems = liveItems;
      } else {
        matchingItems = getFilteredInboxItems(filterType, customQuery);
      }
    } else {
      matchingItems = getFilteredInboxItems(filterType, customQuery);
    }

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
      includeSenders,
      hasCustomInstructions: Boolean(instruccionesPersonalizadas)
    });
  } catch (error: any) {
    logger.error('Error preparing warrior cleanup:', error);
    return res.status(500).json({ error: error.message || 'Error al preparar la limpieza total' });
  }
});

// 2. Procesar Lote Individual (50 correos por petición para respetar Gemini y Vercel)
app.post('/api/limpieza-total/procesar-lote', requireGmailAuth, async (req, res) => {
  try {
    const batchIndex = parseInt(req.body.batchIndex, 10) || 0;
    const batchSize = parseInt(req.body.batchSize, 10) || 50;
    const filterType = (req.body.filterType || 'all').trim();
    const customQuery = (req.body.customQuery || '').trim();
    const excludeInput = (req.body.excludeSenders || '').trim().toLowerCase();
    const includeInput = (req.body.includeSenders || '').trim().toLowerCase();
    const instruccionesPersonalizadas = (req.body.instruccionesPersonalizadas || req.body.customInstructions || '').toString().trim().slice(0, 500);

    const sessionUser = (req.session as any)?.user as AppUser | undefined;
    const currentUser = (req.user as AppUser) || sessionUser;
    const token = (req.session as any)?.accessToken || currentUser?.accessToken;

    // Parse list of excluded and included senders
    const excludeList = excludeInput ? excludeInput.split(',').map(s => s.trim()).filter(Boolean) : [];
    const includeList = includeInput ? includeInput.split(',').map(s => s.trim()).filter(Boolean) : [];

    let allMatching: EmailItem[] = [];
    if (token && GOOGLE_CLIENT_ID && !token.startsWith('demo_')) {
      const gmailQuery = getGmailQueryForFilter(filterType, customQuery);
      const liveItems = await fetchRealGmailMessages(token, gmailQuery, 50);
      if (liveItems && liveItems.length > 0) {
        allMatching = liveItems;
      } else {
        allMatching = getFilteredInboxItems(filterType, customQuery);
      }
    } else {
      allMatching = getFilteredInboxItems(filterType, customQuery);
    }
    const totalMatching = allMatching.length;

    const startIndex = batchIndex * batchSize;
    const endIndex = Math.min(startIndex + batchSize, totalMatching);
    const batchSlice = allMatching.slice(startIndex, endIndex);

    logger.info(`[WARRIOR MODE] Processing Batch #${batchIndex + 1}: items ${startIndex + 1} to ${endIndex} of ${totalMatching} (Custom instructions: ${instruccionesPersonalizadas ? 'YES' : 'NO'})`);

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

        // Classify with Gemini AI (or intelligent heuristic fallback) with user instructions
        const clasificacion = await clasificarConGemini(correo, instruccionesPersonalizadas);
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
          motivo: instruccionesPersonalizadas 
            ? 'Clasificado con Gemini (con instrucciones personalizadas)' 
            : 'Clasificado con Gemini 3.8 Flash'
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
app.post('/api/limpieza-total/ejecutar', requireGmailAuth, async (req, res) => {
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

    const currentUser = req.user as AppUser | undefined;
    if (currentUser && currentUser.accessToken) {
      logger.info(`[GMAIL API] Aplicando acción "${accion}" en Gmail real para ${currentUser.email}...`);
      await Promise.allSettled(
        targetIds.map(id => accion === 'eliminar_todos' 
          ? trashRealGmailMessage(currentUser.accessToken, id) 
          : archiveRealGmailMessage(currentUser.accessToken, id)
        )
      );
    }

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
app.post('/analizar', requireGmailAuth, async (req, res) => {
  try {
    const query = (req.body.query || '').trim();
    const limite = parseInt(req.body.limite, 10) || 10;
    const instruccionesPersonalizadas = (req.body.instruccionesPersonalizadas || req.body.customInstructions || '').toString().trim().slice(0, 500);

    logger.info(`Analyzing emails with query="${query}", limit=${limite}, hasCustomInstructions=${Boolean(instruccionesPersonalizadas)}`);

    if (!query) {
      return res.status(400).json({ error: 'Filtro de búsqueda vacío. Ingresa un término o filtro de Gmail.' });
    }

    const sessionUser = (req.session as any)?.user as AppUser | undefined;
    const currentUser = (req.user as AppUser) || sessionUser;
    const token = (req.session as any)?.accessToken || currentUser?.accessToken;
    let toProcess: EmailItem[] = [];

    if (token && GOOGLE_CLIENT_ID && !token.startsWith('demo_')) {
      logger.info(`[GMAIL API] Consultando correos reales de Gmail para ${currentUser?.email || 'usuario'} con query="${query}"...`);
      const liveItems = await fetchRealGmailMessages(token, query, Math.min(limite, 50));
      if (liveItems && liveItems.length > 0) {
        toProcess = liveItems;
      } else {
        const matching = getFilteredInboxItems('all', query);
        toProcess = matching.slice(0, Math.min(limite, 100));
      }
    } else {
      const matching = getFilteredInboxItems('all', query);
      toProcess = matching.slice(0, Math.min(limite, 100));
    }

    if (toProcess.length === 0) {
      logger.info('No emails found for query');
      return res.json({ correos: [], total: 0, mensaje: 'No se encontraron correos para el filtro especificado.' });
    }

    logger.info(`Classifying ${toProcess.length} emails (Custom instructions: ${instruccionesPersonalizadas ? 'YES' : 'NO'})...`);

    correosProcesados = await Promise.all(
      toProcess.map(async correo => {
        const clasificacion = await clasificarConGemini(correo, instruccionesPersonalizadas);
        return {
          id: correo.id,
          remitente: correo.remitente,
          asunto: correo.asunto,
          resumen: correo.resumen,
          sizeBytes: correo.sizeBytes,
          clasificacion,
          motivo: instruccionesPersonalizadas 
            ? 'Clasificado con Gemini (con instrucciones personalizadas)' 
            : 'Clasificado con Gemini 3.8 Flash'
        };
      })
    );

    logger.info(`Successfully analyzed ${correosProcesados.length} emails`);

    return res.json({
      correos: correosProcesados,
      total: correosProcesados.length,
      query,
      hasCustomInstructions: Boolean(instruccionesPersonalizadas)
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

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Gmail AI Cleaner v2.0 corriendo en http://0.0.0.0:${PORT}`);
  logger.info(`Entorno: ${NODE_ENV} | Total correos en bandeja: ${INBOX_DATABASE.length}`);
  logger.info(`Gemini API: ${process.env.GEMINI_API_KEY ? 'Configurada (gemini-3.8-flash)' : 'Heurística fallback activa'}`);
});

export default app;

