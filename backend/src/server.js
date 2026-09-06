import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reportVerificationEmail } from './email-templates.js';

const app = express();
const port = Number(process.env.PORT || 3000);
const origin = process.env.APP_ORIGIN || 'http://localhost:5500';
const allowedOrigins = new Set([origin, 'https://cochecierto.com', 'https://www.cochecierto.com', 'https://pro.cochecierto.com']);
const pool = process.env.MYSQL_HOST ? mysql.createPool({ host: process.env.MYSQL_HOST, port: Number(process.env.MYSQL_PORT || 3306), database: process.env.MYSQL_DATABASE, user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD, waitForConnections: true, connectionLimit: 5 }) : null;
const mailHost = process.env.MAIL_HOST || 'smtp.hostinger.com';
const mailPort = Number(process.env.MAIL_PORT || 465);
const mailUser = process.env.MAIL_USER || 'hola@cochecierto.com';
const mailer = process.env.MAIL_PASSWORD ? nodemailer.createTransport({ host: mailHost, port: mailPort, secure: mailPort === 465, auth: { user: mailUser, pass: process.env.MAIL_PASSWORD } }) : null;
if (mailer) {
  const sendMail = mailer.sendMail.bind(mailer);
  mailer.sendMail = (options) => {
    if (String(options.subject || '').includes('código de acceso al CRM')) {
      const code = String(options.text || '').match(/\b\d{6}\b/)?.[0] || '';
      const html = `<!doctype html><html lang="es"><body style="margin:0;background:#f3f7f6;color:#082333;font-family:Arial,sans-serif"><div style="max-width:620px;margin:32px auto;padding:0 16px"><div style="background:#082333;border-radius:18px 18px 0 0;padding:24px 28px;color:#fff;font-size:22px;font-weight:700">Coche<span style="color:#ff4d00">Cierto</span> · Staff</div><div style="background:#fff;padding:32px 28px;border:1px solid #d7e2df;border-top:0;border-radius:0 0 18px 18px"><p style="margin-top:0;color:#ff4d00;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">Acceso a la consola privada</p><h1 style="font-size:28px;line-height:1.15;margin:0 0 16px">Confirma tu acceso al CRM</h1><p style="font-size:16px;line-height:1.6">Has solicitado entrar en la consola interna de CocheCierto. Introduce este código en la pantalla de acceso:</p><div style="margin:28px 0;text-align:center;background:#fff7f2;border:2px solid #ff4d00;border-radius:16px;padding:24px"><div style="font-size:12px;color:#58717d;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px">Código de acceso</div><div style="font-size:48px;line-height:1;letter-spacing:10px;font-weight:800;color:#ff4d00">${code}</div></div><p style="text-align:center;font-size:13px;color:#58717d;line-height:1.5">Caduca en 10 minutos y solo puede utilizarse una vez.</p><hr style="border:0;border-top:1px solid #e5ecea;margin:28px 0"><p style="font-size:13px;line-height:1.5;color:#58717d;margin-bottom:0">Si no has solicitado este acceso, ignora este mensaje. No compartas este código con nadie.</p></div></div></body></html>`;
      return sendMail({ ...options, html });
    }
    return sendMail({ ...options, html: options.html || reportVerificationEmail({ verificationUrl: String(options.text || '').replace(/^Valida tu email:\s*/i, '').trim() }).html });
  };
}
const attempts = new Map();
const pendingReports = new Map();
const REPORT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const reportBaseUrl = process.env.REPORT_BASE_URL || 'https://cochecierto.com';
const resourcesUrl = `${reportBaseUrl}/recursos/`;
const requestBaseUrl = process.env.REQUEST_BASE_URL || reportBaseUrl;
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PDF_LOGO_PATH = path.join(projectRoot, 'valorador', 'brand-lockup-official.png');
const PDF_FONT_REGULAR = fs.existsSync('C:\\Windows\\Fonts\\arial.ttf') ? 'C:\\Windows\\Fonts\\arial.ttf' : 'Helvetica';
const PDF_FONT_BOLD = fs.existsSync('C:\\Windows\\Fonts\\arialbd.ttf') ? 'C:\\Windows\\Fonts\\arialbd.ttf' : 'Helvetica-Bold';
const resources = [
  ['Valorador de compra', 'Ordena uso, presupuesto y prioridades', 'Te ayuda a empezar con una orientación clara.'],
  ['Checklist de inspección en frío', 'Prepara la visita y las comprobaciones básicas', 'Reduce olvidos antes de comprometer dinero.'],
  ['Casos reales', 'Aprende de patrones y situaciones habituales', 'Aporta contexto para hacer mejores preguntas.'],
  ['Guías de compra', 'Explican costes, documentación y próximos pasos', 'Te permiten avanzar sin necesitar conocimientos técnicos.']
];
const INE_TABLE_ID = '50902';
const INE_SOURCE_URL = `https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/${INE_TABLE_ID}?nult=5`;
const INE_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
let ineCache = { expiresAt: 0, payload: null };
const airtable = process.env.AIRTABLE_TOKEN && process.env.AIRTABLE_BASE_ID ? {
  token: process.env.AIRTABLE_TOKEN,
  base: process.env.AIRTABLE_BASE_ID,
  leadsTable: process.env.AIRTABLE_LEADS_TABLE || 'Leads'
} : null;
const airtableUrl = (table) => `https://api.airtable.com/v0/${airtable.base}/${encodeURIComponent(table)}`;
const llm = process.env.LLM_BASE_URL && process.env.LLM_MODEL ? {
  url: process.env.LLM_BASE_URL.replace(/\/$/, ''),
  model: process.env.LLM_MODEL,
  key: process.env.LLM_API_KEY || '',
  mode: process.env.LLM_API_MODE || 'openai'
} : null;
const googlePlaces = process.env.GOOGLE_PLACES_API_KEY && process.env.GOOGLE_PLACES_ENABLED === 'true' ? {
  key: process.env.GOOGLE_PLACES_API_KEY,
  endpoint: 'https://places.googleapis.com/v1/places:searchNearby'
} : null;
const overpassEndpoints = (process.env.OVERPASS_ENDPOINTS || 'https://overpass-api.de/api/interpreter,https://overpass.kumi.systems/api/interpreter').split(',').map((value) => value.trim()).filter(Boolean);
const nearbyCategories = { dealer: { label: 'Concesionarios', filters: ['nwr["shop"="car"]'] }, repair: { label: 'Talleres mecánicos', filters: ['nwr["shop"="car_repair"]', 'nwr["craft"="car_repair"]'] }, itv: { label: 'Estaciones ITV', filters: ['nwr["amenity"="vehicle_inspection"]'] }, fuel: { label: 'Gasolineras', filters: ['nwr["amenity"="fuel"]'] }, scrapyard: { label: 'Desguaces', filters: ['nwr["shop"="car_parts"]', 'nwr["amenity"="recycling"]["recycling_type"="scrap_metal"]'] }, parts: { label: 'Repuestos', filters: ['nwr["shop"="car_parts"]'] }, wash: { label: 'Lavaderos', filters: ['nwr["amenity"="car_wash"]'] }, tyres: { label: 'Neumáticos', filters: ['nwr["shop"="tyres"]'] } };
const allowedAnswerKeys = ['intent', 'window', 'situation', 'use', 'km', 'people', 'parking', 'zbe', 'budget', 'priority', 'risk'];
const cleanAnswers = (answers) => Object.fromEntries(allowedAnswerKeys
  .filter((key) => typeof answers?.[key] === 'string' && answers[key].length <= 80)
  .map((key) => [key, answers[key]]));
const cleanAttribution = (value) => {
  if (!value || typeof value !== 'object') return {};
  return Object.fromEntries(['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
    .filter((key) => typeof value[key] === 'string' && value[key].length <= 120)
    .map((key) => [key, value[key].trim()]));
};
const completeReportContext = (report) => {
  const answers = report.answers || {};
  const inferredSituation = report.situation && report.situation !== 'unknown' ? report.situation
    : answers.use === 'work' ? 'professional-use'
      : answers.use === 'family' || answers.people === 'five-plus' || answers.people === '3-4' ? 'family-space'
        : answers.use === 'city' ? 'urban-use'
          : answers.budget === 'under-3' || answers.budget === '3-5' ? 'budget-tight' : 'unknown';
  return { ...report, intent: report.intent || answers.intent || 'buy', purchaseWindow: report.purchaseWindow && report.purchaseWindow !== 'unknown' ? report.purchaseWindow : answers.window || 'unknown', priority: report.priority && report.priority !== 'No indicada' ? report.priority : answers.priority || 'No indicada', situation: inferredSituation, answers };
};
const LLM_RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'profileReading', 'priorities', 'risks', 'decisionPlan', 'nextStep'],
  properties: {
    summary: { type: 'string' }, profileReading: { type: 'string' },
    priorities: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 },
    risks: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 },
    decisionPlan: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 },
    nextStep: { type: 'string' }
  }
};
const unsafeNarrative = (value) => /€|\b\d+(?:[.,]\d+)?\s*%?|\b(?:garantiza|garantizado|sin averías|aprobación de crédito|tasación|peritaje)\b/i.test(value);
const cleanNarrative = (narrative) => {
  const fields = ['summary', 'profileReading', 'nextStep']; const lists = ['priorities', 'risks', 'decisionPlan'];
  if (!narrative || fields.some((field) => typeof narrative[field] !== 'string') || lists.some((field) => !Array.isArray(narrative[field]) || narrative[field].length < 3)) throw new Error('LLM invalid shape');
  const result = { summary: narrative.summary.trim().slice(0, 900), profileReading: narrative.profileReading.trim().slice(0, 500), priorities: narrative.priorities.slice(0, 3).map((item) => String(item).trim().slice(0, 240)), risks: narrative.risks.slice(0, 3).map((item) => String(item).trim().slice(0, 220)), decisionPlan: narrative.decisionPlan.slice(0, 3).map((item) => String(item).trim().slice(0, 220)), nextStep: narrative.nextStep.trim().slice(0, 500) };
  if ([result.summary, result.profileReading, result.nextStep, ...result.priorities, ...result.risks, ...result.decisionPlan].some(unsafeNarrative)) throw new Error('LLM unsafe content');
  return result;
};
const fallbackNarrative = (report) => ({
  summary: report.situation === 'first-car' ? 'Como sería tu primer coche, conviene priorizar sencillez, documentación clara y margen para los gastos que aparecen después de comprar.' : report.intent === 'buy' && report.priority === 'repairs' ? 'Quieres comprar un coche, pero tu principal preocupación son las averías y los costes ocultos; la estrategia debe reducir esa incertidumbre antes de pagar.' : 'Esta orientación te ayuda a comparar opciones con más contexto y a detectar qué debes confirmar antes de comprometer dinero.',
  priorities: report.intent === 'buy' && report.priority === 'repairs' ? ['Prioriza historial y mantenimiento demostrables.', 'Reserva margen para una revisión y posibles gastos iniciales.', 'Compara la fiabilidad documental antes de enamorarte del precio.'] : ['Compara el coste total y no solo el precio anunciado.', 'Pide documentación verificable antes de desplazarte.', 'Conserva margen para seguro, puesta a punto e imprevistos.'],
  nextStep: report.situation === 'professional' ? 'Calcula cuánto te costaría un día sin vehículo y confirma mantenimiento, garantía y factura.' : report.intent === 'buy' && report.priority === 'repairs' ? 'Pide historial y facturas, pregunta por averías y reserva una inspección independiente antes de negociar.' : 'Compara varias unidades equivalentes y confirma la documentación antes de entregar dinero.',
  profileReading: report.situation === 'first-car' ? 'Necesitas una primera compra comprensible, con margen y comprobaciones sencillas.' : report.intent === 'buy' && report.priority === 'repairs' ? 'Buscas una compra asumible y quieres evitar que una avería inesperada desborde tu presupuesto.' : 'Tu decisión debe partir del uso real y del coste total, no solo del anuncio.',
  risks: report.intent === 'buy' && report.priority === 'repairs' ? ['Historial de mantenimiento incompleto o no verificable', 'Costes iniciales y reparaciones fuera del precio', 'Estado mecánico pendiente de una revisión profesional'] : ['Datos del anuncio sin confirmar', 'Costes iniciales fuera del precio', 'Estado físico pendiente de revisar'],
  decisionPlan: report.intent === 'buy' && report.priority === 'repairs' ? ['Filtra unidades con historial y mantenimiento demostrables.', 'Pregunta y documenta cualquier avería o reparación relevante.', 'No entregues dinero sin comprobar documentación y estado.'] : ['Define el coste total que puedes sostener.', 'Compara opciones equivalentes.', 'Verifica documentación y estado antes de pagar.']
});
const enforceNarrativeGuardrails = (report, narrative) => {
  const safeBase = fallbackNarrative(report);
  const candidate = { ...safeBase, ...(narrative || {}) };
  if (report.intent !== 'buy') return candidate;
  if (report.priority === 'repairs') return safeBase;
  if (report.priority === 'safety') return {
    ...candidate,
    summary: report.situation === 'family-space' ? 'Buscas una compra familiar segura, con espacio suficiente y margen para comprobar la unidad.' : 'Buscas comprar con seguridad y reducir el riesgo de una mala decisión.',
    profileReading: report.situation === 'family-space' ? 'Viajarán varias personas, por lo que la seguridad, el espacio y la facilidad de uso deben pesar más que el equipamiento.' : 'La seguridad es tu prioridad principal; necesitas comprobar tanto el vehículo como la documentación antes de decidir.',
    priorities: ['Prioriza sistemas de seguridad y una configuración adecuada al uso declarado.', 'Comprueba historial, mantenimiento y ausencia de daños relevantes.', 'Reserva margen para una inspección independiente antes de pagar.'],
    risks: ['Equipamiento de seguridad o versión exacta sin confirmar', 'Historial de daños o mantenimiento incompleto', 'Prueba insuficiente para valorar el estado real'],
    decisionPlan: ['Define los elementos de seguridad imprescindibles.', 'Compara unidades equivalentes con historial verificable.', 'No cierres la compra sin probar e inspeccionar la unidad.'],
    nextStep: 'Confirma la versión y el equipamiento de seguridad, pide el historial y programa una prueba con inspección independiente.'
  };
  if (report.priority === 'space' || report.situation === 'family-space') return {
    ...candidate,
    summary: 'Necesitas que el coche encaje en tu vida diaria y ofrezca espacio suficiente sin comprometer el margen de compra.',
    profileReading: 'El número de ocupantes y el uso familiar hacen que las plazas reales, el maletero y la facilidad de acceso sean criterios de decisión.',
    priorities: ['Comprueba plazas, acceso y maletero con tu uso real.', 'Prioriza seguridad y confort antes que extras secundarios.', 'Compara el coste total manteniendo margen para imprevistos.'],
    risks: ['Espacio o modularidad inferiores a lo esperado', 'Equipamiento y seguridad de la versión sin confirmar', 'Costes iniciales que reduzcan demasiado el margen'],
    decisionPlan: ['Prueba el coche con las personas y objetos habituales.', 'Verifica ficha, historial y mantenimiento.', 'Descarta cualquier unidad que obligue a agotar tu margen.'],
    nextStep: 'Prueba el acceso, las plazas y el maletero con tu uso real; después confirma historial, seguridad y coste total.'
  };
  if (report.priority === 'price') return {
    ...candidate,
    summary: 'Tu prioridad es proteger el presupuesto total y evitar que un precio atractivo oculte gastos posteriores.',
    profileReading: 'Necesitas comparar el coste completo de cada opción, conservando margen para seguro, puesta a punto e imprevistos.',
    priorities: ['Compara el coste total, no solo el precio anunciado.', 'Pide documentación e historial antes de desplazarte.', 'Conserva una reserva y no negocies desde el límite absoluto.'],
    nextStep: 'Calcula el coste total de dos o tres unidades equivalentes y descarta las que te dejen sin margen.'
  };
  return candidate;
};
const requestLlmNarrative = async (report) => {
  if (!llm) return { narrative: fallbackNarrative(report), status: 'disabled' };
  const context = { stage: 'orientation', objective: report.intent || 'buy', situation: report.situation, category: report.category, usageType: report.usageType, purchaseWindow: report.purchaseWindow, painPoint: report.priority, facts: { category: report.category, usageType: report.usageType, objective: report.intent || 'buy' }, assumptions: ['La orientación depende de las respuestas declaradas.', 'La unidad concreta, sus documentos y su estado aún no están verificados.'], uncertainties: ['costes finales', 'seguro', 'financiación', 'estado físico'], answers: report.answers };
  const prompt = `Responde SOLO JSON válido y compacto, sin markdown, con exactamente estas claves: summary, profileReading, priorities, risks, decisionPlan, nextStep. summary/profileReading/nextStep: una frase cada uno. priorities/risks/decisionPlan: exactamente 3 frases breves cada uno. Interpreta primero el objetivo y el punto de dolor. Si objective es buy, redacta siempre como una decisión de compra; painPoint=repairs significa miedo a averías o costes ocultos, nunca intención de reparar el vehículo actual. Usa solo el contexto. No inventes cifras, marcas, modelos ni diagnósticos. Contexto: ${JSON.stringify(context)}`;
  try {
    const messages = [{ role: 'system', content: 'Eres un redactor prudente de informes de compra. No inventes datos.' }, { role: 'user', content: prompt }];
    const isOllama = llm.mode.toLowerCase() === 'ollama';
    const endpoint = isOllama ? `${llm.url}/api/chat` : `${llm.url}/v1/chat/completions`;
    const ollamaModel = isOllama ? (process.env.LLM_FAST_MODEL || 'llama3.2:3b') : llm.model;
    const payload = isOllama
      ? { model: ollamaModel, stream: false, think: false, format: 'json', options: { temperature: 0.1, num_predict: 400 }, messages }
      : { model: llm.model, temperature: 0.2, max_tokens: 420, response_format: { type: 'json_schema', json_schema: { name: 'report_narrative_v1', strict: true, schema: LLM_RESPONSE_SCHEMA } }, messages };
    const response = await fetch(endpoint, { method: 'POST', signal: AbortSignal.timeout(isOllama ? 30000 : 8000), headers: { 'Content-Type': 'application/json', ...(llm.key ? { Authorization: `Bearer ${llm.key}` } : {}) }, body: JSON.stringify(payload) });
    if (!response.ok) throw new Error(`LLM ${response.status}`);
    const body = await response.json();
    const content = isOllama ? body?.message?.content : body?.choices?.[0]?.message?.content;
    const parsed = JSON.parse(String(content || '').replace(/^```json\s*|```$/g, '').trim());
    const safeBase = fallbackNarrative(report);
    const candidate = { ...safeBase, ...parsed };
    for (const field of ['priorities', 'risks', 'decisionPlan']) {
      if (!Array.isArray(candidate[field]) || candidate[field].length < 3) candidate[field] = safeBase[field];
    }
    for (const field of ['summary', 'profileReading', 'nextStep']) {
      if (typeof candidate[field] !== 'string' || !candidate[field].trim()) candidate[field] = safeBase[field];
    }
    return { narrative: cleanNarrative(enforceNarrativeGuardrails(report, candidate)), status: 'ok' };
  } catch (error) {
    console.warn('LLM narrative unavailable:', error.message);
    return { narrative: fallbackNarrative(report), status: 'fallback' };
  }
};
const airtableRequest = async (url, options = {}) => {
  const response = await fetch(url, { ...options, headers: { Authorization: `Bearer ${airtable.token}`, 'Content-Type': 'application/json', ...(options.headers || {}) } });
  if (!response.ok) {
    let detail = '';
    try { detail = (await response.json())?.error?.type || ''; } catch {}
    throw new Error(`Airtable ${response.status}${detail ? ` ${detail}` : ''}`);
  }
  return response.json();
};
const saveAirtableLead = async (report, token) => {
  if (!airtable) return null;
  // Estos nombres coinciden con los campos reales creados en la base beta.
  // El detalle técnico se conserva en Notes para no exigir más columnas ni
  // guardar el token en claro.
  const fields = {
    Name: token.slice(0, 12),
    Email: report.email,
    Origen: 'web',
    'Consentimiento privacidad': true,
    Notes: JSON.stringify({
      intent: report.intent,
      purchaseWindow: report.purchaseWindow,
      usageType: report.usageType,
      situation: report.situation || 'unknown',
      recommendedCategory: report.category,
      priority: report.priority,
      answers: report.answers,
      narrative: report.narrative,
      llmStatus: report.llmStatus,
      questionnaireVersion: 'v1',
      recommendationVersion: 'mvp-v1',
      consentCommercial: report.consentCommercial === true,
      tokenHash: hash(token),
      expiresAt: new Date(report.expiresAt).toISOString(),
      createdAt: new Date().toISOString()
    })
  };
  const created = await airtableRequest(airtableUrl(airtable.leadsTable), { method: 'POST', body: JSON.stringify({ records: [{ fields }] }) });
  return created.records?.[0]?.id || null;
};
const loadAirtableReport = async (token) => {
  if (!airtable) return null;
  const formula = encodeURIComponent(`FIND('${hash(token)}',{Notes})`);
  const result = await airtableRequest(`${airtableUrl(airtable.leadsTable)}?maxRecords=1&filterByFormula=${formula}`);
  const fields = result.records?.[0]?.fields;
  if (!fields) return null;
  let details = {};
  try { details = JSON.parse(fields.Notes || '{}'); } catch { return null; }
  if (!details.expiresAt || new Date(details.expiresAt).getTime() <= Date.now()) return null;
  return { airtableRecordId: result.records[0].id, email: fields.Email, category: details.recommendedCategory, usageType: details.usageType, purchaseWindow: details.purchaseWindow, priority: details.priority || 'No indicada', situation: details.situation || 'unknown', answers: cleanAnswers(details.answers), narrative: details.narrative || null, consentCommercial: details.consentCommercial === true, expiresAt: new Date(details.expiresAt).getTime(), verified: fields.Status === 'validada' };
};

app.use(helmet());
app.use(cors({ origin: (requestOrigin, callback) => callback(null, !requestOrigin || allowedOrigins.has(requestOrigin) || (process.env.NODE_ENV !== 'production' && requestOrigin === 'null')), credentials: true, methods: ['GET', 'POST', 'PATCH', 'DELETE'] }));
app.use(express.json({ limit: '32kb' }));
app.use('/api/purchase-', (_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
app.use('/api/crm', (_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });

const required = (body, fields) => fields.filter((field) => typeof body[field] !== 'string' || !body[field].trim());
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const rateLimit = (key) => { const now = Date.now(); const recent = (attempts.get(key) || []).filter((time) => now - time < 60_000); if (recent.length >= 10) return false; recent.push(now); attempts.set(key, recent); return true; };
app.post('/api/exit-feedback', async (req, res) => {
  if (!pool) return res.status(503).json({ ok: false, message: 'Base de datos no configurada.' });
  if (!rateLimit(`exit-feedback:${req.ip || 'unknown'}`)) return res.status(429).json({ ok: false, message: 'Demasiadas respuestas. Inténtalo más tarde.' });
  const body = req.body || {}, usefulness = crmText(body.usefulness, 20), sessionId = crmText(body.session_id, 64), page = crmText(body.page, 255);
  if (!/^[0-9a-f-]{36}$/i.test(sessionId || '') || !page?.startsWith('/') || !['helpful', 'uncertain', 'not_yet'].includes(usefulness)) return res.status(400).json({ ok: false, message: 'Datos de encuesta no válidos.' });
  try { await pool.execute('INSERT INTO exit_feedback (session_id, page, device, source, completed_report, usefulness, reason, comment) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [sessionId, page, ['desktop', 'mobile', 'tablet'].includes(body.device) ? body.device : 'unknown', crmText(body.source, 120), body.completed_report === true, usefulness, crmText(body.reason, 80), crmText(body.comment, 300)]); return res.status(201).json({ ok: true }); } catch (error) { console.error('Exit feedback unavailable:', error.message); return res.status(503).json({ ok: false, message: 'No se ha podido guardar la opinión.' }); }
});
const createReportToken = () => crypto.randomBytes(32).toString('hex');
const cleanReports = () => { const now = Date.now(); for (const [token, report] of pendingReports) if (report.expiresAt <= now) pendingReports.delete(token); };
const addReport = (token, report) => { cleanReports(); pendingReports.set(token, { ...report, expiresAt: Date.now() + REPORT_TTL_MS }); };
const getReport = (token) => { cleanReports(); const report = pendingReports.get(token); return report && report.expiresAt > Date.now() ? report : null; };
const requestStates = new Set(['active', 'withdrawn', 'expired']);
const requestProfileKeys = ['category', 'body', 'usage', 'kilometres', 'people', 'budget', 'priority', 'zbe'];
const cleanRequestProfile = (profile) => Object.fromEntries(requestProfileKeys
  .filter((key) => typeof profile?.[key] === 'string' && profile[key].trim().length <= 120)
  .map((key) => [key, profile[key].trim()]));
const requestPayload = (body) => {
  const radius = Number(body?.radius);
  const area = typeof body?.area === 'string' ? body.area.trim().slice(0, 80) : '';
  if (!area || ![5, 10, 25, 50].includes(radius)) return null;
  const profile = cleanRequestProfile(body.profile);
  return { area, radius, profile, version: 'request-v1' };
};
const validRequestToken = (value) => typeof value === 'string' && /^[a-f0-9]{64}$/i.test(value);
const dealerOffersEnabled = process.env.DEALER_OFFERS_ENABLED === 'true';
const crmSchemaReady = process.env.CRM_SCHEMA_READY === 'true';
const crmEnabled = process.env.CRM_ENABLED === 'true' && crmSchemaReady;
const crmRuntimeEnabled = crmEnabled;
const crmAdminToken = process.env.CRM_ADMIN_TOKEN || '';
const crmAdminUser = process.env.CRM_ADMIN_USER || 'admin_master';
const crmAdminEmail = (process.env.CRM_ADMIN_EMAIL || 'cochecierto@gmail.com').trim().toLowerCase();
const crmOtpChallenges = new Map();
const crmSessions = new Map();
const CRM_OTP_TTL_MS = 10 * 60 * 1000;
const CRM_SESSION_TTL_MS = 15 * 24 * 60 * 60 * 1000;
const cleanCrmAuthState = () => { const now = Date.now(); for (const [id, challenge] of crmOtpChallenges) if (challenge.expiresAt <= now || challenge.attempts >= 5) crmOtpChallenges.delete(id); for (const [id, session] of crmSessions) if (session.expiresAt <= now) crmSessions.delete(id); };
const crmAuthCleanup = setInterval(cleanCrmAuthState, 15 * 60 * 1000);
crmAuthCleanup.unref?.();
const crmStages = ['visitor', 'diagnostic_started', 'report_requested', 'report_verified', 'request_draft', 'request_active', 'shared_manual', 'offer_received', 'comparison', 'contact_authorized', 'visit_requested', 'test_requested', 'purchased', 'aftercare', 'closed', 'withdrawn', 'expired', 'blocked'];
const crmTransitions = {
  visitor: ['diagnostic_started', 'withdrawn', 'blocked'], diagnostic_started: ['report_requested', 'withdrawn', 'blocked'],
  report_requested: ['report_verified', 'withdrawn', 'blocked'], report_verified: ['request_draft', 'withdrawn', 'blocked'],
  request_draft: ['request_active', 'withdrawn', 'blocked'], request_active: ['shared_manual', 'withdrawn', 'blocked'],
  shared_manual: ['offer_received', 'withdrawn', 'blocked'], offer_received: ['comparison', 'withdrawn', 'blocked'],
  comparison: ['contact_authorized', 'withdrawn', 'blocked'], contact_authorized: ['visit_requested', 'withdrawn', 'blocked'],
  visit_requested: ['test_requested', 'purchased', 'withdrawn', 'blocked'], test_requested: ['purchased', 'withdrawn', 'blocked'],
  purchased: ['aftercare', 'closed', 'blocked'], aftercare: ['closed', 'blocked'], closed: [], withdrawn: [], blocked: []
};
const crmText = (value, max = 255) => typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : null;
const crmSessionCookie = (user, userAgent, expiresAt) => { const payload = Buffer.from(JSON.stringify({ user, exp: expiresAt, ua: hash(userAgent || '') })).toString('base64url'); const signature = crypto.createHmac('sha256', crmAdminToken).update(payload).digest('base64url'); return `${payload}.${signature}`; };
const readCrmSessionCookie = (value, userAgent) => { try { const [payload, suppliedSignature] = String(value || '').split('.'); if (!payload || !suppliedSignature || !crmAdminToken) return null; const expectedSignature = crypto.createHmac('sha256', crmAdminToken).update(payload).digest('base64url'); const expected = Buffer.from(expectedSignature); const actual = Buffer.from(suppliedSignature); if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null; const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')); return session.user === crmAdminUser && Number(session.exp) > Date.now() && session.ua === hash(userAgent || '') ? session : null; } catch { return null; } };
const crmOperationalNote = (value) => { const note = crmText(value, 500); if (!note) return null; return /[^\s@]+@[^\s@]+\.[^\s@]+|\d[\d\s().+-]{6,}\d/.test(note) ? null : note; };
const crmContactEmail = (value) => { const email = crmText(value, 255); return !email || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? email : null; };
const crmContactPhone = (value) => { const phone = crmText(value, 40); return !phone || /^[+\d][\d\s().-]{5,38}$/.test(phone) ? phone : null; };
const expireCrmRequest = async (requestId) => { if (!crmRuntimeEnabled || !pool || !requestId) return; try { const [cases] = await pool.execute('SELECT id, stage FROM crm_cases WHERE purchase_request_id = ? AND deleted_at IS NULL ORDER BY id DESC LIMIT 1', [requestId]); const current = cases[0]; if (current && !['closed', 'withdrawn', 'expired', 'blocked'].includes(current.stage)) { await pool.execute('UPDATE crm_cases SET stage = ? WHERE id = ?', ['expired', current.id]); await pool.execute('INSERT INTO crm_case_events (case_id, from_stage, to_stage, actor_type, reason) VALUES (?, ?, ?, ?, ?)', [current.id, current.stage, 'expired', 'system', 'Petición caducada']); } } catch (error) { console.error('CRM expiry tracking unavailable:', error.message); } };
const crmJson = (value) => Array.isArray(value) ? JSON.stringify(value.slice(0, 30).map((item) => crmText(item, 120)).filter(Boolean)) : null;
const crmAuthorized = (req) => {
  if (!crmRuntimeEnabled || !crmAdminToken) return false;
  const cookies = Object.fromEntries(String(req.get('cookie') || '').split(';').map((part) => part.trim().split('=').map(decodeURIComponent)).filter(([key, value]) => key && value));
  const session = readCrmSessionCookie(cookies.cc_crm_session, req.get('user-agent') || '');
  if (session) return true;
  if (cookies.cc_crm_session) crmSessions.delete(cookies.cc_crm_session);
  const suppliedUser = String(req.get('x-crm-user') || '').trim();
  const suppliedEmail = String(req.get('x-crm-email') || '').trim().toLowerCase();
  const validUsers = new Set([crmAdminUser, 'admin_master']);
  if (!suppliedUser || !validUsers.has(suppliedUser) || !suppliedEmail || suppliedEmail !== crmAdminEmail) return false;
  const supplied = String(req.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!/^[a-f0-9]{64}$/i.test(supplied) && supplied.length < 16) return false;
  const expected = Buffer.from(hash(crmAdminToken), 'hex');
  const actual = Buffer.from(hash(supplied), 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
};
const offerKeys = ['dealerName', 'companyId', 'vehicle', 'version', 'year', 'kilometres', 'condition', 'availability', 'finalCashPrice', 'priceBreakdown', 'financing', 'warranty', 'usedHistory', 'testAndInspection', 'deliveryConditions', 'reservationReturn', 'offerValidity', 'extras', 'notes', 'accuracyDeclaration'];
const cleanOffer = (offer) => Object.fromEntries(offerKeys
  .filter((key) => typeof offer?.[key] === 'string' && offer[key].trim().length <= 500)
  .map((key) => [key, offer[key].trim()]));
const drawBrandLogo = (doc) => {
  const x = doc.x;
  const y = doc.y;
  if (fs.existsSync(PDF_LOGO_PATH)) {
    doc.image(PDF_LOGO_PATH, x, y, { width: 150 });
    doc.y = y + 48;
    return;
  }
  doc.save().lineWidth(4).strokeColor('#082333').circle(x + 14, y + 14, 12).stroke()
    .lineWidth(3.5).strokeColor('#fc4c02').moveTo(x + 8, y + 14).lineTo(x + 13, y + 19).lineTo(x + 22, y + 9).stroke().restore();
  doc.fillColor('#082333').font('Helvetica-Bold').fontSize(18).text('Coche', x + 34, y + 5, { continued: true })
    .fillColor('#fc4c02').text('Cierto');
  doc.y = y + 34;
};
const drawMetricCard = (doc, x, y, width, label, value, note, accent) => {
  doc.save().fillColor('#ffffff').strokeColor('#d7e2df').lineWidth(1).roundedRect(x, y, width, 84, 8).fillAndStroke().restore();
  doc.fillColor('#58717d').font('Helvetica').fontSize(8).text(label, x + 10, y + 10, { width: width - 20 });
  doc.fillColor(accent || '#082333').font('Helvetica-Bold').fontSize(11.5).text(value, x + 10, y + 29, { width: width - 20, lineBreak: false });
  doc.fillColor('#58717d').font('Helvetica').fontSize(8).text(note, x + 10, y + 64, { width: width - 20, lineBreak: false });
};
const situationPack = (report) => {
  const packs = {
    'first-car': ['Primer coche', 'margen, seguro, sencillez y documentación', 'Compara tres unidades sencillas dentro del precio prudente y pide su documentación antes de desplazarte.'],
    'budget-tight': ['Presupuesto ajustado', 'precio prudente, reserva y coste de una avería', 'Define primero la reserva mínima y descarta cualquier unidad que te deje sin margen.'],
    'family-space': ['Compra familiar', 'espacio, seguridad, carga y cambios previsibles', 'Prueba el coche con el equipamiento familiar real antes de negociar.'],
    'professional-use': ['Uso profesional', 'coste por kilómetro, disponibilidad y tiempo parado', 'Calcula el coste de un día parado y confirma garantía, factura y mantenimiento.'],
    'urban-use': ['Uso urbano', 'maniobrabilidad, etiqueta, trayectos cortos y ZBE', 'Comprueba la etiqueta ambiental y calcula el coste con tus trayectos urbanos reales.']
  };
  return packs[report.situation] || ['Situación por concretar', 'uso, presupuesto y comprobaciones pendientes', 'Compara varias unidades equivalentes y confirma la documentación antes de desplazarte o entregar dinero.'];
};
const answerLabels = {
  budget: { 'under-3': 'Hasta 3.000 €', '3-5': '3.000–5.000 €', '5-8': '5.000–8.000 €', '8-15': '8.000–15.000 €', '15-25': '15.000–25.000 €', '25-40': '25.000–40.000 €', 'over-40': 'Más de 40.000 €', unknown: 'Prefiero no decirlo' },
  km: { low: 'Menos de 10.000 km/año', medium: '10.000–20.000 km/año', high: '20.000–30.000 km/año', 'very-high': 'Más de 30.000 km/año', unknown: 'No lo sé' },
  use: { city: 'Ciudad', mixed: 'Ciudad y carretera', road: 'Carretera', work: 'Trabajo', family: 'Familia' },
  priority: { price: 'Precio', fuel: 'Consumo', repairs: 'Averías', safety: 'Seguridad', space: 'Espacio', resale: 'Reventa' },
  window: { now: 'En los próximos 3 meses', '0-3': 'En los próximos 3 meses', soon: 'Entre 3 y 6 meses', '3-6': 'Entre 3 y 6 meses', later: 'Más adelante', unknown: 'Por concretar' }
};
const readableAnswer = (key, value) => answerLabels[key]?.[value] || ({ unknown: 'Por concretar', repairs: 'Averías' }[value] || value || 'No indicado');
const budgetGuidance = (value) => ({
  'under-3': ['Hasta 3.000 €', '1.800–2.200 €', '300–600 €', '500–900 €'],
  '3-5': ['3.000–5.000 €', '2.900–4.200 €', '400–800 €', '700–1.200 €'],
  '5-8': ['5.000–8.000 €', '4.600–6.800 €', '500–1.000 €', '1.000–1.500 €'],
  '8-15': ['8.000–15.000 €', '7.200–13.000 €', '600–1.200 €', '1.200–2.000 €'],
  '15-25': ['15.000–25.000 €', '13.500–22.000 €', '800–1.500 €', '1.500–2.500 €'],
  '25-40': ['25.000–40.000 €', '22.500–35.000 €', '1.000–1.800 €', '2.000–3.500 €'],
  'over-40': ['Más de 40.000 €', 'Pendiente de concretar', 'Pendiente de concretar', 'Pendiente de concretar']
}[value] || ['Por concretar', 'Pendiente de presupuesto', 'Pendientes de confirmar', 'Pendiente de confirmar']);
const roadmapFor = (report) => [
  ['1. Antes de buscar', 'Confirma que el presupuesto total y la reserva dejan margen después de gastos iniciales. Usa el precio prudente como filtro, no como objetivo de gasto.'],
  ['2. Antes de visitar', 'Pide por escrito anuncio, titularidad, informe DGT, ITV, cargas, historial y garantía. Si falta un documento clave, aplaza el desplazamiento.'],
  ['3. Durante la visita', 'Comprueba el coche en frío, realiza una prueba y anota cualquier incoherencia. Contrasta el uso, el coste y la etiqueta con tus necesidades reales.'],
  ['4. Antes de negociar', report.situation === 'professional-use' ? 'Calcula el coste por kilómetro y el impacto de un día parado. Confirma factura, garantía y mantenimiento.' : 'Compara al menos dos unidades equivalentes y negocia después de verificar, no solo por el precio anunciado.'],
  ['5. Antes de pagar', 'No entregues señal si existen cargas, documentación incompleta, incoherencias o rechazo a una inspección independiente.']
];
const writeReportPdfLegacy = async (res, report) => {
  report = completeReportContext(report);
  report.narrative = cleanNarrative(enforceNarrativeGuardrails(report, report.narrative));
  const situation = situationPack(report);
  const qr = await QRCode.toDataURL(resourcesUrl, { margin: 1, width: 132 });
  let ineContext = 'No disponible en esta consulta';
  try {
    const response = await fetch(INE_SOURCE_URL, { signal: AbortSignal.timeout(8000), headers: { Accept: 'application/json' } });
    if (response.ok) {
      const series = await response.json();
      const annual = Array.isArray(series) && series.find((item) => /variación anual/i.test(item.Nombre || ''));
      const latest = annual?.Data?.[0];
      if (latest && Number.isFinite(Number(latest.Valor))) ineContext = `${latest.Valor}% de variación anual (${latest.Anyo}-${String(latest.FK_Periodo).padStart(2, '0')})`;
    }
  } catch {}
  const doc = new PDFDocument({ size: 'A4', margin: 48, bufferPages: true, info: { Title: 'Informe de orientación CocheCierto', Author: 'CocheCierto', Subject: 'Guía personal de compra de coche de ocasión', Keywords: 'CocheCierto, compra, vehículo de ocasión' } });
  doc.registerFont('CCRegular', PDF_FONT_REGULAR).registerFont('CCBold', PDF_FONT_BOLD);
  const originalFont = doc.font.bind(doc);
  doc.font = (font, ...args) => originalFont(font === 'Helvetica' ? 'CCRegular' : font === 'Helvetica-Bold' ? 'CCBold' : font, ...args);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="informe-cochecierto.pdf"');
  doc.pipe(res);
  drawBrandLogo(doc);
  doc.moveDown(.3).fillColor('#082333').font('Helvetica-Bold').fontSize(12).text(`Situación de compra: ${situation[0]}`);
  doc.font('Helvetica').fontSize(10).fillColor('#58717d').text(`La valoración prioriza ${situation[1]}.`);
  const metricsY = doc.y + 12;
  const metricWidth = (doc.page.width - doc.page.margins.left - doc.page.margins.right - 18) / 4;
  drawMetricCard(doc, doc.page.margins.left, metricsY, metricWidth, 'Encaje', 'Orientativo', 'Según tus respuestas', '#2fae7b');
  drawMetricCard(doc, doc.page.margins.left + metricWidth + 6, metricsY, metricWidth, 'Incertidumbre', 'A vigilar', 'Confirma datos clave', '#fc4c02');
  drawMetricCard(doc, doc.page.margins.left + (metricWidth + 6) * 2, metricsY, metricWidth, 'Coste', 'Estimado', 'Antes de una unidad', '#082333');
  drawMetricCard(doc, doc.page.margins.left + (metricWidth + 6) * 3, metricsY, metricWidth, 'Categoría', report.category || 'Pendiente', 'No sustituye inspección', '#082333');
  doc.y = metricsY + 88;
  doc.x = doc.page.margins.left;
  doc.moveDown(1).fillColor('#ff4d00').fontSize(10).font('Helvetica-Bold').text('INFORME DE ORIENTACIÓN · VERSIÓN BETA');
  doc.moveDown(.5).fillColor('#082333').fontSize(24).text('Una decisión explicada, no una cifra aislada');
  doc.fillColor('#58717d').fontSize(11).font('Helvetica').text('Este informe es orientativo y se genera a partir de las respuestas aportadas. No es una tasación, peritaje ni aprobación de financiación.');
  if (report.narrative?.summary) {
    doc.moveDown(.7).fillColor('#082333').font('Helvetica-Bold').fontSize(13).text('Lectura personalizada');
    doc.font('Helvetica').fontSize(11).fillColor('#082333').text(report.narrative.summary);
    if (report.narrative.profileReading) doc.moveDown(.35).font('Helvetica').fontSize(10).fillColor('#58717d').text(report.narrative.profileReading);
  }
  doc.moveDown(1).fillColor('#082333').fontSize(14).font('Helvetica-Bold').text('Resumen de tu orientación');
  doc.fontSize(11).font('Helvetica').text(`Categoría a estudiar: ${report.category}`);
  doc.text(`Uso declarado: ${report.usageType === 'professional' ? 'profesional o comercial' : 'particular'}`);
  doc.text(`Horizonte de compra: ${readableAnswer('window', report.purchaseWindow)}`);
  doc.text(`Motivo principal: ${readableAnswer('priority', report.priority)}`);
  if (report.situation === 'first-car') {
    doc.moveDown(.5).font('Helvetica-Bold').text('Para tu primera compra');
    doc.font('Helvetica').text('Conserva margen para seguro, transferencia, puesta a punto y una primera reparación. Antes de entregar una señal, pide la documentación, comprueba el coche en frío y pregunta si acepta una inspección independiente.');
  }
  doc.moveDown(.5).font('Helvetica-Bold').text('Lectura inicial');
  doc.font('Helvetica').text(`Encaje orientativo: ${report.category ? 'compatible como punto de partida' : 'pendiente de concretar'}. Riesgo principal: confirmar documentación, estado real y coste total antes de entregar dinero.`);
  if (report.narrative?.priorities?.length) {
    doc.moveDown(.4).font('Helvetica-Bold').text('Prioridades para tu caso');
    report.narrative.priorities.forEach((priority) => doc.font('Helvetica').text(`- ${priority}`));
  }
  if (report.narrative?.risks?.length) {
    doc.moveDown(.4).font('Helvetica-Bold').text('Riesgos que conviene vigilar');
    report.narrative.risks.forEach((risk) => doc.font('Helvetica').text(`- ${risk}`));
  }
  doc.moveDown(.5).font('Helvetica-Bold').text('Trazabilidad de esta orientación');
  doc.font('Helvetica').text(`Sabemos: tus respuestas declaradas (${readableAnswer('budget', report.answers?.budget)}, ${readableAnswer('km', report.answers?.km)}, ${readableAnswer('use', report.answers?.use)}).`);
  doc.text('Estimamos: categoría, motorización, escenarios y prioridades de compra a partir de esas respuestas.');
  doc.text('Falta validar: unidad concreta, documentación, estado físico, seguro, financiación y costes finales.');
  doc.moveDown(.5).font('Helvetica-Bold').text('Contexto oficial consultado');
  doc.font('Helvetica').text(`INE: IPC nacional, variación anual ${ineContext}. Tabla ${INE_TABLE_ID}. Se muestra como contexto agregado y no predice tu gasto personal.`);
  doc.fillColor('#0b6f9c').text('Consultar INE', { link: 'https://www.ine.es/' });
  doc.fillColor('#082333').text('Las fuentes oficiales ayudan a contrastar información; CocheCierto no certifica su aplicación al caso individual.');
  doc.addPage();
  drawBrandLogo(doc);
  doc.fillColor('#ff4d00').font('Helvetica-Bold').fontSize(10).text('DECISIÓN Y PRESUPUESTO');
  doc.moveDown(.4).fillColor('#082333').fontSize(22).text('Qué significa esta orientación');
  doc.font('Helvetica').fontSize(11);
  doc.font('Helvetica').fontSize(11).fillColor('#58717d').text('Este informe ordena tus respuestas para ayudarte a comparar opciones. No elige una unidad concreta ni confirma su estado mecánico.');
  doc.moveDown(1).fillColor('#082333').font('Helvetica-Bold').fontSize(14).text('Tu límite debe proteger tu margen');
  doc.font('Helvetica').fontSize(11).text('Separa el precio del vehículo de los gastos de compra, el seguro, la puesta a punto y una reserva para imprevistos. El precio prudente es el que te permite seguir teniendo margen después de comprar.');
  const budget = budgetGuidance(report.answers?.budget);
  const budgetRows = [['Presupuesto total', budget[0]], ['Precio prudente del vehículo', budget[1]], ['Gastos iniciales estimados', budget[2]], ['Reserva mínima recomendada', budget[3]], ['Precio máximo absoluto', 'No superar el presupuesto total ni quedarse sin reserva']];
  doc.moveDown(.7).font('Helvetica-Bold').text('Tu presupuesto en cifras orientativas');
  budgetRows.forEach(([label, value]) => { doc.font('Helvetica-Bold').text(label, { continued: true }).font('Helvetica').text(`: ${value}`); });
  doc.moveDown(1).font('Helvetica-Bold').text('Tres caminos para comparar');
  [['Conservador', 'Menor desembolso y más margen económico.'], ['Equilibrado', 'Balance entre coste, seguridad, uso y previsibilidad.'], ['Aspiracional', 'Más espacio o equipamiento, con mayor exigencia económica.']].forEach(([label, value]) => { doc.moveDown(.3).font('Helvetica-Bold').text(label, { continued: true }).font('Helvetica').text(`: ${value}`); });
  doc.moveDown(1).font('Helvetica-Bold').text('Hoja de ruta asistida');
  doc.font('Helvetica').fontSize(10);
  const narrativePlan = report.narrative?.decisionPlan?.length ? report.narrative.decisionPlan : null;
  (narrativePlan ? narrativePlan.map((item, index) => [`Orientación ${index + 1}`, item]) : roadmapFor(report)).forEach(([step, instruction]) => { doc.moveDown(.35).font('Helvetica-Bold').text(step, { continued: true }).font('Helvetica').text(`: ${instruction}`); });
  if (narrativePlan) doc.moveDown(.35).font('Helvetica').text('La orientación automática se complementa con las comprobaciones operativas de este informe y nunca sustituye la verificación del vehículo.');
  doc.moveDown(.7).font('Helvetica-Bold').text('Fuentes para contrastar');
  doc.font('Helvetica').text('DGT: informe y situación administrativa del vehículo. ', { continued: true }).fillColor('#0b6f9c').text('Consultar DGT', { link: 'https://www.dgt.es/nuestros-servicios/tu-vehiculo/vas-a-comprar-o-vender-un-vehiculo-de-segunda-mano/comprar-un-vehiculo-de-segunda-mano/' });
  doc.fillColor('#082333').text('Banco de España: coste total de una financiación, no solo la cuota. ', { continued: true }).fillColor('#0b6f9c').text('Consultar Banco de España', { link: 'https://clientebancario.bde.es/pcb/es/blog/en_que_te_fijas_comprar_coche.html' });
  doc.addPage();
  drawBrandLogo(doc);
  doc.fillColor('#ff4d00').font('Helvetica-Bold').fontSize(10).text('COMPROBACIONES ANTES DE PAGAR');
  doc.moveDown(.4).fillColor('#082333').fontSize(22).text('Llega preparado a la visita');
  doc.font('Helvetica').fontSize(11);
  const checklist = report.situation === 'professional' ? ['Calcula el coste por kilómetro y de un día parado.', 'Confirma carga, etiqueta y acceso a tus zonas de trabajo.', 'Pide historial de uso intensivo y mantenimiento.', 'Pregunta por garantía, factura y vehículo de sustitución.', 'No entregues señal hasta revisar documentación y condiciones.'] : report.situation === 'first-car' ? ['Pide informe DGT, titularidad, cargas e ITV.', 'Solicita historial, facturas y fechas de mantenimiento.', 'Arranca el coche en frío y revisa testigos, humo y ruidos.', 'Comprueba frenos, dirección, neumáticos, embrague y cambio.', 'Confirma seguro, transferencia y aceptación de inspección independiente.'] : ['Pide informe DGT, titularidad, cargas e ITV.', 'Solicita historial, facturas y mantenimiento documentado.', 'Prueba el vehículo en frío y durante la conducción.', 'Comprueba neumáticos, frenos, dirección, cambio y equipamiento.', 'No entregues señal hasta aclarar los datos pendientes.'];
  checklist.forEach((item, index) => { doc.moveDown(.5).font('Helvetica-Bold').text(`${index + 1}.`, { continued: true }).font('Helvetica').text(` ${item}`); });
  doc.moveDown(1).font('Helvetica-Bold').text('Preguntas para el vendedor');
  const questions = report.situation === 'professional' ? ['¿La venta incluye factura y garantía por escrito?', '¿Puede facilitar el historial de mantenimiento y uso?', '¿Qué elementos se han sustituido recientemente?', '¿Acepta una inspección independiente?', '¿Qué gastos quedan fuera del precio anunciado?'] : ['¿Puedes enviar el informe de la DGT y confirmar la titularidad?', '¿Tienes historial de mantenimiento y facturas?', '¿Ha tenido accidentes o reparaciones estructurales?', '¿El motor puede arrancarse completamente en frío?', '¿Aceptas una inspección independiente antes de cerrar?'];
  questions.forEach((item) => { doc.moveDown(.4).font('Helvetica').text(`- ${item}`); });
  doc.moveDown(1).font('Helvetica-Bold').text('Semáforo de decisión');
  doc.font('Helvetica').text('VERDE · La información es coherente y puedes avanzar con comprobaciones.');
  doc.text('AMARILLO · Faltan documentos o hay costes que debes confirmar antes de negociar.');
  doc.text('ROJO · No entregues señal mientras existan cargas, incoherencias o rechazo a una revisión.');
  doc.moveDown(1).font('Helvetica-Bold').text('Tu siguiente paso');
  doc.font('Helvetica').text(report.narrative?.nextStep || (report.situation === 'first-car' ? 'Compara tres coches equivalentes dentro del precio prudente y pide la documentación antes de desplazarte.' : 'Compara varias unidades equivalentes y confirma la documentación antes de desplazarte o entregar dinero.'));
  doc.moveDown(.6).font('Helvetica-Bold').text('Regla de parada');
  doc.font('Helvetica').text('Si no puedes confirmar documentación, costes relevantes o aceptación de una inspección independiente, detén la compra y vuelve a comparar.');

  // Páginas operativas: el informe debe poder acompañar la compra, no quedarse en una recomendación.
  const reportPage = (kicker, title, intro) => {
    doc.addPage();
    drawBrandLogo(doc);
    doc.moveDown(.5).fillColor('#ff4d00').font('Helvetica-Bold').fontSize(10).text(kicker);
    doc.moveDown(.4).fillColor('#082333').fontSize(22).text(title);
    doc.font('Helvetica').fontSize(11).fillColor('#58717d').text(intro);
  };
  const writeCheckRows = (items) => items.forEach((item) => {
    doc.moveDown(.45).font('Helvetica-Bold').fillColor('#fc4c02').text('[ ]', { continued: true }).fillColor('#082333').font('Helvetica').text(` ${item}`);
  });
  reportPage('ANALIZAR UN ANUNCIO', 'Ficha reutilizable de una unidad', 'Rellénala para cada candidato y conserva la evidencia que el vendedor aporte.');
  doc.moveDown(.8).font('Helvetica-Bold').fillColor('#082333').text('Datos del anuncio');
  ['Marca y modelo: ____________________   Versión/motor: ____________________', 'Año: __________   Kilómetros: __________   Precio: __________', 'Vendedor y ubicación: ____________________   Enlace: ____________________', 'Equipamiento: __________________________________________________________', 'Historial declarado y defectos: _________________________________________', 'Gastos previsibles y observaciones: _____________________________________'].forEach((line) => doc.moveDown(.55).font('Helvetica').text(line));
  doc.moveDown(1).font('Helvetica-Bold').text('Semáforo de lectura');
  doc.font('Helvetica').text('VERDE · Datos coherentes y evidencia suficiente para continuar comprobando.');
  doc.text('ÁMBAR · Falta información: pedir documentos y respuestas antes de desplazarte.');
  doc.text('ROJO · No enviar dinero: cargas, incoherencias, presión o rechazo a inspección.');
  reportPage('PREGUNTAS Y DOCUMENTOS', 'Qué pedir antes de desplazarte', 'Una respuesta verbal no sustituye el documento o la evidencia que la respalda.');
  doc.moveDown(.8).font('Helvetica-Bold').fillColor('#082333').text('Preguntas adaptadas a tu caso');
  const tailoredQuestions = report.situation === 'professional-use' ? ['¿La operación incluye factura, garantía y mantenimiento por escrito?', '¿Qué uso intensivo ha tenido y qué piezas se han sustituido?', '¿Cuál sería el coste y el impacto de un día parado?', '¿Aceptas una inspección independiente antes de cerrar?'] : report.priority === 'space' ? ['¿Puedes mostrar el espacio con el equipamiento que transportaré?', '¿Qué mantenimiento y reparaciones están documentados?', '¿Puedo arrancarlo en frío y probarlo en carretera?', '¿Aceptas una inspección independiente antes de entregar dinero?'] : ['¿Puedes facilitar informe DGT, titularidad, ITV y cargas?', '¿Qué mantenimiento, accidentes o reparaciones están documentados?', '¿El precio incluye todos los gastos y qué queda fuera?', '¿Aceptas arrancarlo en frío y una inspección independiente?'];
  writeCheckRows(tailoredQuestions);
  doc.moveDown(1).font('Helvetica-Bold').text('Documentación mínima');
  writeCheckRows(['Identidad y titularidad del vendedor', 'Permiso de circulación y ficha técnica', 'ITV, informe DGT, cargas, embargos y reserva de dominio', 'Impuesto municipal, historial y facturas', 'Contrato o factura y garantía cuando corresponda']);
  reportPage('VISITA Y PRUEBA', 'Comprueba sin convertirlo en una garantía', 'La inspección ordena señales y pendientes; no certifica por sí sola el estado mecánico.');
  doc.moveDown(.8).font('Helvetica-Bold').fillColor('#082333').text('Antes y durante la prueba');
  writeCheckRows(['Antes de arrancar: fugas, daños, neumáticos, testigos y coherencia del kilometraje', 'Motor en frío: arranque, humo, ruidos, ralentí y temperatura', 'En marcha: frenos, dirección, embrague/cambio y comportamiento', 'Interior: climatización, luces, ayudas y equipamiento imprescindible', 'Al finalizar: anota diferencias, solicita evidencias y no cierres pendientes críticos']);
  doc.moveDown(1).font('Helvetica-Bold').text('Cuándo pedir ayuda profesional');
  doc.font('Helvetica').text('Si hay dudas, historial incompleto, antigüedad o kilometraje elevados, poco conocimiento mecánico o un valor económico relevante, reserva una inspección independiente antes de pagar.');
  reportPage('CIERRE Y POSTCOMPRA', 'Negocia, compra y controla el primer año', 'La decisión final debe conservar trazabilidad y dejar claro qué queda pendiente.');
  doc.moveDown(.8).font('Helvetica-Bold').fillColor('#082333').text('Antes de entregar una señal');
  writeCheckRows(['Identifica partes, vehículo, importe, finalidad, condiciones y desistimiento', 'Usa medios de pago trazables y conserva contrato, factura, llaves y documentos', 'Confirma seguro y cambio de titularidad antes de circular']);
  doc.moveDown(1).font('Helvetica-Bold').text('Primeras 72 horas');
  writeCheckRows(['Seguro activo y documentos guardados', 'Fotos del estado y kilometraje de entrega', 'Comunicación escrita de incidencias']);
  doc.moveDown(.7).font('Helvetica-Bold').text('Primeros 30 días y primer año');
  writeCheckRows(['Revisión inicial, mantenimiento pendiente y control de consumo', 'Registrar testigos, ruidos, reparaciones y gastos reales', 'Revisar ITV, seguro, impuesto y reserva para imprevistos']);
  reportPage('COMPARADOR', 'Decisión final entre candidatos', 'Utiliza esta tabla como apoyo: un dato pendiente no equivale a un dato correcto.');
  doc.moveDown(.8).font('Helvetica-Bold').fillColor('#082333').text('Compara hasta tres unidades');
  ['Candidato A: ____________________   Precio total: __________', 'Candidato B: ____________________   Precio total: __________', 'Candidato C: ____________________   Precio total: __________'].forEach((line) => doc.moveDown(.6).font('Helvetica').text(line));
  doc.moveDown(1).font('Helvetica-Bold').text('Criterios: marca como confirmado, pendiente o no aplicable');
  writeCheckRows(['Encaje con uso, ocupantes, vías y ZBE', 'Precio total, gastos iniciales y reserva', 'Historial, documentación y garantía', 'Estado físico y mecánico pendiente de verificar', 'Seguridad, consumo, mantenimiento y reventa', 'Confianza en el vendedor y condiciones de cierre']);
  doc.moveDown(1).font('Helvetica-Bold').text('Decisión');
  doc.font('Helvetica').text('Comprar / Negociar / Solicitar inspección / Seguir buscando / Descartar');
  doc.moveDown(.6).text('Motivo: _______________________________________________________________');
  doc.text('Pendiente más importante: ____________________________________________');
  reportPage('SEGUIMIENTO', 'Controla tu decisión con el tiempo', 'La compra no termina al firmar: registra lo que ocurra para conocer el coste real.');
  doc.moveDown(.8).font('Helvetica-Bold').fillColor('#082333').text('Primeras 72 horas');
  writeCheckRows(['Seguro activo y documentación conservada', 'Kilometraje y estado de entrega registrados', 'Incidencias comunicadas por escrito']);
  doc.moveDown(.8).font('Helvetica-Bold').text('Primeros 30 días');
  writeCheckRows(['Revisión inicial y mantenimiento pendiente', 'Control de consumo, testigos, ruidos y temperatura', 'Garantía, facturas y próximos vencimientos organizados']);
  doc.moveDown(.8).font('Helvetica-Bold').text('Primer año');
  writeCheckRows(['ITV, seguro e impuesto revisados', 'Reparaciones y coste por kilómetro registrados', 'Reserva para imprevistos mantenida y encaje reevaluado']);
  doc.addPage();
  drawBrandLogo(doc);
  doc.moveDown(.5).fillColor('#ff4d00').font('Helvetica-Bold').fontSize(10).text('RECURSOS PARA SEGUIR DECIDIENDO');
  doc.moveDown(.4).fillColor('#082333').fontSize(22).text('Herramientas prácticas de CocheCierto');
  doc.font('Helvetica').fontSize(11).fillColor('#58717d').text('Guías y fuentes para contrastar la información antes de visitar, negociar o comprar.');
  doc.moveDown(1).font('Helvetica-Bold').fontSize(12).fillColor('#082333').text('Recursos de CocheCierto');
  const startX = doc.x, col = [150, 175, 145];
  const headers = ['Nombre del recurso', 'Solución que aporta', 'Por qué usarlo'];
  doc.font('Helvetica').fontSize(9).fillColor('#ffffff').rect(startX, doc.y, col.reduce((a,b)=>a+b,0), 22).fill('#082333');
  const headerY = doc.y; let x = startX; headers.forEach((h,i)=>{ doc.fillColor('#ffffff').text(h, x+5, headerY+7, { width: col[i]-10 }); x += col[i]; }); doc.y = headerY + 26;
  resources.forEach((row, ri) => { const y=doc.y; const h=42; doc.fillColor(ri%2?'#f3f7f6':'#ffffff').rect(startX,y,col.reduce((a,b)=>a+b,0),h).fill(); x=startX; row.forEach((cell,i)=>{doc.fillColor('#082333').font('Helvetica').text(cell,x+5,y+7,{width:col[i]-10,height:h-8});x+=col[i];});doc.y=y+h; });
  doc.moveDown(1.2);
  const infoY = doc.y;
  const infoX = doc.page.margins.left;
  doc.image(qr, infoX, infoY, { width: 52 });
  doc.fillColor('#082333').font('Helvetica-Bold').fontSize(10).text('Continúa con más herramientas', infoX + 70, infoY, { width: 380 });
  doc.font('Helvetica').fontSize(9).fillColor('#58717d').text(resourcesUrl, infoX + 70, infoY + 15, { width: 380 });
  doc.text('Escanea el QR para abrir la guía de acompañamiento y fuentes oficiales.', infoX + 70, infoY + 30, { width: 380 });
  doc.text('cochecierto.com · hola@cochecierto.com', infoX + 70, infoY + 45, { width: 380 });
  doc.text('Informe beta sujeto a validación. El enlace privado es válido durante 7 días.', infoX + 70, infoY + 60, { width: 380 });
  const pageRange = doc.bufferedPageRange();
  for (let pageIndex = 0; pageIndex < pageRange.count; pageIndex += 1) {
    doc.switchToPage(pageRange.start + pageIndex);
    doc.save().font('Helvetica').fontSize(7.5).fillColor('#58717d')
      .text(`cochecierto.com · Guía personal de compra · Informe beta · Página ${pageIndex + 1} de ${pageRange.count}`, doc.page.margins.left, doc.page.height - 72, { width: doc.page.width - doc.page.margins.left - doc.page.margins.right, align: 'center', lineBreak: false })
      .fontSize(7).text('Orientación informativa. No sustituye una inspección mecánica, peritaje ni asesoramiento jurídico o fiscal individual.', doc.page.margins.left, doc.page.height - 60, { width: doc.page.width - doc.page.margins.left - doc.page.margins.right, align: 'center', lineBreak: false }).restore();
  }
  doc.end();
};

const PDF_COLORS = {
  navy: '#082333', ink: '#173746', muted: '#58717d', orange: '#fc4c02',
  blue: '#0b6f9c', green: '#2fae7b', amber: '#c98518', red: '#b83a32',
  pale: '#f3f7f6', line: '#d7e2df', white: '#ffffff'
};
const pdfText = (doc, value, x, y, width, options = {}) => {
  const { color = PDF_COLORS.ink, font = 'Helvetica', size = 10, ...rest } = options;
  return doc.fillColor(color).font(font).fontSize(size).text(String(value || ''), x, y, { width, ...rest });
};
const pdfCard = (doc, x, y, width, height, options = {}) => {
  const { fill = PDF_COLORS.white, stroke = PDF_COLORS.line, radius = 10, accent } = options;
  doc.save().fillColor(fill).strokeColor(stroke).lineWidth(1).roundedRect(x, y, width, height, radius).fillAndStroke();
  if (accent) doc.fillColor(accent).roundedRect(x, y, 5, height, radius).fill();
  doc.restore();
};
const pdfKicker = (doc, label, x, y, width) => pdfText(doc, label.toUpperCase(), x, y, width, { color: PDF_COLORS.orange, font: 'Helvetica-Bold', size: 8, characterSpacing: 1.1 });
const pdfTitle = (doc, title, x, y, width, size = 22) => pdfText(doc, title, x, y, width, { color: PDF_COLORS.navy, font: 'Helvetica-Bold', size, lineGap: 2 });
const pdfRule = (doc, x, y, width, color = PDF_COLORS.line) => doc.save().strokeColor(color).lineWidth(1).moveTo(x, y).lineTo(x + width, y).stroke().restore();
const pdfBullet = (doc, text, x, y, width, color = PDF_COLORS.ink) => {
  doc.save().fillColor(PDF_COLORS.orange).circle(x + 3, y + 6, 2).fill().restore();
  return pdfText(doc, text, x + 12, y, width - 12, { color, size: 9.5, lineGap: 1.5 });
};
const pdfField = (doc, label, x, y, width, lines = 1) => {
  pdfText(doc, label, x, y, width, { color: PDF_COLORS.muted, font: 'Helvetica-Bold', size: 8 });
  for (let i = 0; i < lines; i += 1) pdfRule(doc, x, y + 15 + i * 14, width, '#aebfbd');
};
const pdfPageTop = (doc, kicker, title, intro) => {
  const x = doc.page.margins.left;
  doc.x = x;
  doc.y = doc.page.margins.top;
  pdfKicker(doc, kicker, x, 111, 500);
  pdfTitle(doc, title, x, 129, 500, 22);
  if (intro) pdfText(doc, intro, x, 164, 500, { color: PDF_COLORS.muted, size: 10.5, lineGap: 2 });
  return 196;
};
const pdfHeaderFixed = (doc, x, width) => {
  if (fs.existsSync(PDF_LOGO_PATH)) doc.image(PDF_LOGO_PATH, x, 45, { width: 150 });
  else {
    doc.save().lineWidth(4).strokeColor(PDF_COLORS.navy).circle(x + 14, 60, 12).stroke().lineWidth(3.5).strokeColor(PDF_COLORS.orange).moveTo(x + 8, 60).lineTo(x + 13, 65).lineTo(x + 22, 55).stroke().restore();
    pdfText(doc, 'Coche', x + 34, 51, 82, { color: PDF_COLORS.navy, font: 'Helvetica-Bold', size: 17, lineBreak: false });
    pdfText(doc, 'Cierto', x + 112, 51, 78, { color: PDF_COLORS.orange, font: 'Helvetica-Bold', size: 17, lineBreak: false });
  }
  pdfRule(doc, x, 96, width, PDF_COLORS.orange);
};
const writeReportPdfStyled = async (res, inputReport) => {
  const report = completeReportContext(inputReport);
  report.narrative = cleanNarrative(enforceNarrativeGuardrails(report, report.narrative));
  const situation = situationPack(report);
  const budget = budgetGuidance(report.answers?.budget);
  // El informe ya no incluye enlaces privados para compartir. Mantenerlo
  // explícitamente vacío evita que una descarga dependa de esa funcionalidad.
  const qr = await QRCode.toDataURL(resourcesUrl, { margin: 2, width: 132, errorCorrectionLevel: 'M' });
  let ineContext = 'No disponible en esta consulta';
  try {
    const response = await fetch(INE_SOURCE_URL, { signal: AbortSignal.timeout(8000), headers: { Accept: 'application/json' } });
    if (response.ok) {
      const series = await response.json();
      const annual = Array.isArray(series) && series.find((item) => /variación anual/i.test(item.Nombre || ''));
      const latest = annual?.Data?.[0];
      if (latest && Number.isFinite(Number(latest.Valor))) ineContext = `${latest.Valor}% (${latest.Anyo}-${String(latest.FK_Periodo).padStart(2, '0')})`;
    }
  } catch {}
  const doc = new PDFDocument({ size: 'A4', margin: 46, bufferPages: true, info: { Title: 'Tu guía personal de compra - CocheCierto', Author: 'CocheCierto', Subject: 'Guía personal de compra de coche de ocasión', Keywords: 'CocheCierto, compra, vehículo de ocasión' } });
  doc.registerFont('CCRegular', PDF_FONT_REGULAR).registerFont('CCBold', PDF_FONT_BOLD);
  const originalFont = doc.font.bind(doc);
  doc.font = (font, ...args) => originalFont(font === 'Helvetica' ? 'CCRegular' : font === 'Helvetica-Bold' ? 'CCBold' : font, ...args);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="informe-cochecierto.pdf"');
  doc.pipe(res);
  const x = doc.page.margins.left;
  const contentWidth = doc.page.width - x - doc.page.margins.right;
  let renderedPages = 0;
  const newPage = (kicker, title, intro) => { if (renderedPages > 0) doc.addPage(); renderedPages += 1; return pdfPageTop(doc, kicker, title, intro); };
  const sectionLabel = (label, y) => pdfText(doc, label, x, y, contentWidth, { color: PDF_COLORS.navy, font: 'Helvetica-Bold', size: 12 });
  const smallCard = (label, value, note, cx, cy, cw, accent) => { pdfCard(doc, cx, cy, cw, 84, { accent }); pdfText(doc, label, cx + 12, cy + 11, cw - 24, { color: PDF_COLORS.muted, size: 8 }); pdfText(doc, value, cx + 12, cy + 29, cw - 24, { color: accent || PDF_COLORS.navy, font: 'Helvetica-Bold', size: 11.5, lineBreak: false }); pdfText(doc, note, cx + 12, cy + 64, cw - 24, { color: PDF_COLORS.muted, size: 7.5, lineBreak: false }); };

  // 1. Portada: una lectura editorial, no una pared de texto.
  let y = newPage('Informe de orientación · versión beta', `Tu guía personal de compra`, 'El coche que te conviene y cómo comprarlo con criterio. Una hoja de ruta basada en tus respuestas, con comprobaciones para una unidad concreta.');
  pdfCard(doc, x, y, contentWidth, 92, { fill: PDF_COLORS.navy, stroke: PDF_COLORS.navy, accent: PDF_COLORS.orange });
  pdfText(doc, situation[0], x + 20, y + 17, 250, { color: PDF_COLORS.orange, font: 'Helvetica-Bold', size: 9, characterSpacing: .7 });
  pdfText(doc, 'Tu punto de partida', x + 20, y + 38, 280, { color: PDF_COLORS.white, font: 'Helvetica-Bold', size: 17 });
  pdfText(doc, `${situation[1]}.`, x + 20, y + 62, 320, { color: '#c5d7de', size: 10 });
  pdfText(doc, 'ORIENTACIÓN', x + 392, y + 19, 90, { color: '#c5d7de', font: 'Helvetica-Bold', size: 7, align: 'right', characterSpacing: 1 });
  pdfText(doc, report.category || 'Pendiente', x + 300, y + 34, 182, { color: PDF_COLORS.white, font: 'Helvetica-Bold', size: 15, align: 'right', lineGap: 1 });
  pdfText(doc, 'categoría a estudiar', x + 300, y + 76, 182, { color: '#c5d7de', size: 8, align: 'right' });
  y += 111;
  const cw = (contentWidth - 18) / 4;
  smallCard('Uso declarado', readableAnswer('use', report.answers?.use), readableAnswer('km', report.answers?.km), x, y, cw, PDF_COLORS.blue);
  smallCard('Presupuesto', readableAnswer('budget', report.answers?.budget), 'total disponible', x + cw + 6, y, cw, PDF_COLORS.green);
  smallCard('Prioridad', readableAnswer('priority', report.priority), 'criterio principal', x + (cw + 6) * 2, y, cw, PDF_COLORS.orange);
  smallCard('Confianza', 'Orientativa', 'unidad por verificar', x + (cw + 6) * 3, y, cw, PDF_COLORS.navy);
  y += 108;
  sectionLabel('Lectura personalizada', y);
  pdfText(doc, report.narrative?.summary || 'Esta orientación ordena tus respuestas para ayudarte a decidir con más margen.', x, y + 23, contentWidth, { size: 11, lineGap: 3 });
  pdfText(doc, report.narrative?.profileReading || `Tu decisión debe priorizar ${situation[1]}.`, x, y + 55, contentWidth, { color: PDF_COLORS.muted, size: 10, lineGap: 2 });
  y += 96;
  pdfCard(doc, x, y, contentWidth, 96, { fill: '#fff7f2', stroke: '#f4c8b7', accent: PDF_COLORS.orange });
  pdfKicker(doc, 'Siguiente paso', x + 18, y + 15, 450);
  pdfText(doc, report.narrative?.nextStep || situation[2], x + 18, y + 34, contentWidth - 36, { color: PDF_COLORS.navy, font: 'Helvetica-Bold', size: 12, lineGap: 2 });
  pdfText(doc, 'No es una tasación, un peritaje ni una garantía mecánica. La unidad concreta y sus documentos quedan pendientes de verificar.', x + 18, y + 70, contentWidth - 36, { color: PDF_COLORS.muted, size: 8.5 });

  // 2. Objetivo de búsqueda.
  y = newPage('01 · Búsqueda', 'Esto es lo que deberías buscar', 'Convierte tu situación en un filtro de búsqueda. Lo imprescindible protege tu uso; lo negociable evita pagar por extras; el descarte protege tu margen.');
  const colW = (contentWidth - 16) / 3;
  const profileColumns = [
    ['IMPRESCINDIBLE', report.priority === 'space' ? ['Plazas y acceso adecuados para tus ocupantes', 'Maletero probado con tu carga habitual', 'Seguridad y mantenimiento documentables'] : report.situation === 'professional-use' ? ['Coste por kilómetro controlable', 'Disponibilidad y mantenimiento documentados', 'Factura y garantía por escrito'] : ['Compatibilidad con tu uso y vías', 'Historial y mantenimiento demostrables', 'Reserva después de la compra']],
    ['PUEDES NEGOCIAR', ['Color y extras no esenciales', 'Antigüedad dentro de un rango razonable', 'Equipamiento deseable si no eleva el coste total']],
    ['DEBES DESCARTAR', ['Cargas o titularidad sin aclarar', 'Incoherencias de kilometraje o historial', 'Presión para pagar o rechazo a inspección']]
  ];
  profileColumns.forEach(([label, items], index) => { const cx = x + index * (colW + 8); pdfCard(doc, cx, y, colW, 171, { fill: index === 2 ? '#fff8f7' : PDF_COLORS.white, stroke: index === 2 ? '#e8c1bc' : PDF_COLORS.line, accent: index === 0 ? PDF_COLORS.green : index === 1 ? PDF_COLORS.amber : PDF_COLORS.red }); pdfText(doc, label, cx + 15, y + 16, colW - 30, { color: index === 0 ? PDF_COLORS.green : index === 1 ? PDF_COLORS.amber : PDF_COLORS.red, font: 'Helvetica-Bold', size: 8, characterSpacing: .6 }); items.forEach((item, i) => pdfBullet(doc, item, cx + 15, y + 45 + i * 35, colW - 30)); });
  y += 198;
  sectionLabel('Por qué encaja contigo', y);
  pdfText(doc, `Has declarado ${readableAnswer('use', report.answers?.use).toLowerCase()}, ${readableAnswer('km', report.answers?.km).toLowerCase()} y una prioridad de ${readableAnswer('priority', report.priority).toLowerCase()}. Por eso la recomendación inicial es estudiar un ${report.category || 'vehículo por concretar'} y comparar su coste total antes de elegir una unidad.`, x, y + 23, contentWidth, { size: 10.5, lineGap: 3 });
  y += 82;
  pdfCard(doc, x, y, contentWidth, 151, { fill: PDF_COLORS.pale, accent: PDF_COLORS.blue });
  pdfText(doc, 'Motorización y antigüedad', x + 18, y + 16, 230, { color: PDF_COLORS.navy, font: 'Helvetica-Bold', size: 11 });
  pdfBullet(doc, `A estudiar: ${report.power || 'la opción que mejor responda a tus trayectos'}.`, x + 18, y + 42, 230);
  pdfBullet(doc, 'Precaución: la etiqueta, el estado real y el mantenimiento deben confirmarse sobre cada unidad.', x + 18, y + 76, 230);
  pdfBullet(doc, 'No fijamos una antigüedad o kilometraje exactos sin conocer la unidad, el historial y el presupuesto final.', x + 18, y + 112, 230);
  pdfText(doc, 'Regla', x + 280, y + 16, 90, { color: PDF_COLORS.orange, font: 'Helvetica-Bold', size: 8, characterSpacing: 1 });
  pdfText(doc, 'Una preferencia deja de ser buena elección cuando entra en conflicto con tu uso, tu zona o tu margen.', x + 280, y + 38, contentWidth - 300, { color: PDF_COLORS.navy, font: 'Helvetica-Bold', size: 11, lineGap: 3 });

  // 3. Presupuesto.
  y = newPage('02 · Dinero', 'Tu presupuesto real', 'El precio del anuncio es solo una parte. Esta página separa lo que sabes, lo que estimamos y lo que debes confirmar antes de pagar.');
  pdfCard(doc, x, y, contentWidth, 72, { fill: PDF_COLORS.navy, stroke: PDF_COLORS.navy, accent: PDF_COLORS.orange });
  pdfText(doc, 'PRESUPUESTO TOTAL DECLARADO', x + 18, y + 14, 240, { color: '#c5d7de', font: 'Helvetica-Bold', size: 8, characterSpacing: .6 });
  pdfText(doc, budget[0], x + 18, y + 32, 250, { color: PDF_COLORS.white, font: 'Helvetica-Bold', size: 18 });
  pdfText(doc, 'No es el precio máximo del vehículo.', x + 300, y + 32, 180, { color: '#c5d7de', size: 9, align: 'right' });
  y += 92;
  const budgetItems = [['Precio prudente del vehículo', budget[1], 'estimación'], ['Gastos iniciales', budget[2], 'estimación'], ['Reserva para imprevistos', budget[3], 'regla orientativa'], ['Seguro, financiación e impuestos', 'Pendiente de confirmar', 'depende de titular y unidad']];
  budgetItems.forEach(([label, value, note], i) => { const by = y + i * 48; pdfCard(doc, x, by, contentWidth, 38, { fill: i % 2 ? PDF_COLORS.pale : PDF_COLORS.white, radius: 6 }); pdfText(doc, label, x + 13, by + 9, 245, { font: 'Helvetica-Bold', size: 9 }); pdfText(doc, value, x + 270, by + 9, 125, { color: PDF_COLORS.navy, font: 'Helvetica-Bold', size: 9, align: 'right' }); pdfText(doc, note, x + 405, by + 10, contentWidth - 418, { color: PDF_COLORS.muted, size: 7.5, align: 'right' }); });
  y += 214;
  pdfCard(doc, x, y, contentWidth, 83, { fill: '#fff7f2', stroke: '#f4c8b7', accent: PDF_COLORS.orange });
  pdfText(doc, 'REGLA DE PROTECCIÓN', x + 18, y + 15, contentWidth - 36, { color: PDF_COLORS.orange, font: 'Helvetica-Bold', size: 8, characterSpacing: .8 });
  pdfText(doc, 'Si después de pagar el coche no puedes afrontar transferencia, seguro, revisión y una reserva razonable, esa unidad está por encima de tu presupuesto real.', x + 18, y + 35, contentWidth - 36, { color: PDF_COLORS.navy, font: 'Helvetica-Bold', size: 11, lineGap: 2 });
  y += 107;
  sectionLabel('Anota el coste de una unidad concreta', y);
  pdfField(doc, 'Precio del vehículo', x, y + 26, 155); pdfField(doc, 'Trámites e impuestos', x + 175, y + 26, 155); pdfField(doc, 'Seguro', x + 350, y + 26, contentWidth - 350);
  pdfField(doc, 'Revisión inicial / reparaciones', x, y + 70, 235); pdfField(doc, 'Reserva que conservarás', x + 255, y + 70, contentWidth - 255);
  pdfText(doc, `Supuesto: ${budget[2]} de gastos iniciales y ${budget[3]} de reserva para este tramo. Son estimaciones, no importes definitivos. Contexto INE consultado: ${ineContext}; no predice tu gasto personal.`, x, y + 122, contentWidth, { color: PDF_COLORS.muted, size: 8, lineGap: 2 });

  // 4. Ficha de anuncio.
  y = newPage('03 · Anuncio', 'Ficha para analizar un anuncio', 'Imprime esta página para cada candidato. Una ficha completa convierte la emoción del anuncio en evidencia comparable.');
  pdfCard(doc, x, y, contentWidth, 207, { fill: PDF_COLORS.white, accent: PDF_COLORS.blue });
  pdfText(doc, 'DATOS DEL CANDIDATO', x + 18, y + 16, 200, { color: PDF_COLORS.blue, font: 'Helvetica-Bold', size: 8, characterSpacing: .8 });
  pdfField(doc, 'Marca y modelo', x + 18, y + 39, 215); pdfField(doc, 'Versión / motor', x + 255, y + 39, 215);
  pdfField(doc, 'Matrícula / bastidor', x + 18, y + 82, 215); pdfField(doc, 'Año / kilómetros', x + 255, y + 82, 215);
  pdfField(doc, 'Precio anunciado', x + 18, y + 125, 215); pdfField(doc, 'Vendedor / ubicación', x + 255, y + 125, 215);
  pdfField(doc, 'Enlace del anuncio', x + 18, y + 168, 447);
  y += 232;
  pdfCard(doc, x, y, contentWidth, 144, { fill: PDF_COLORS.pale, accent: PDF_COLORS.green });
  pdfText(doc, 'LO QUE DICE EL ANUNCIO', x + 18, y + 16, 200, { color: PDF_COLORS.green, font: 'Helvetica-Bold', size: 8, characterSpacing: .8 });
  pdfField(doc, 'Equipamiento', x + 18, y + 39, 215, 2); pdfField(doc, 'Historial declarado', x + 255, y + 39, 215, 2); pdfField(doc, 'Defectos reconocidos / gastos previsibles', x + 18, y + 93, 447);
  y += 168;
  const lights = [['VERDE', 'Datos coherentes y evidencia suficiente para continuar.', PDF_COLORS.green], ['ÁMBAR', 'Falta información: pide documentos antes de desplazarte.', PDF_COLORS.amber], ['ROJO', 'Cargas, presión o rechazo a inspección: no envíes dinero.', PDF_COLORS.red]];
  lights.forEach(([label, text, color], i) => { const cx = x + i * (colW + 8); pdfCard(doc, cx, y, colW, 73, { fill: PDF_COLORS.white, stroke: color, accent: color, radius: 8 }); pdfText(doc, label, cx + 14, y + 12, colW - 28, { color, font: 'Helvetica-Bold', size: 8, characterSpacing: .6 }); pdfText(doc, text, cx + 14, y + 31, colW - 28, { color: PDF_COLORS.ink, size: 8.5, lineGap: 1.5 }); });

  // 5. Preguntas.
  y = newPage('04 · Vendedor', 'Preguntas que merecen evidencia', 'No anotes solo la respuesta. Registra qué documento, foto o comprobación la respalda y qué queda pendiente.');
  const qRows = report.situation === 'professional-use' ? ['¿La operación incluye factura, garantía y mantenimiento por escrito?', '¿Qué uso intensivo ha tenido y qué piezas se han sustituido?', '¿Cuál sería el coste y el impacto de un día parado?', '¿Aceptas una inspección independiente antes de cerrar?', '¿Qué gastos quedan fuera del precio anunciado?'] : ['¿Puedes facilitar informe DGT, titularidad, ITV y cargas?', '¿Qué mantenimiento, accidentes o reparaciones están documentados?', '¿El precio incluye todos los gastos y qué queda fuera?', '¿Puedes arrancarlo en frío y probarlo en carretera?', '¿Aceptas una inspección independiente antes de entregar dinero?'];
  qRows.forEach((question, i) => { const ry = y + i * 68; pdfCard(doc, x, ry, contentWidth, 56, { fill: i % 2 ? PDF_COLORS.pale : PDF_COLORS.white, radius: 7, accent: i === 0 ? PDF_COLORS.orange : PDF_COLORS.blue }); pdfText(doc, `${i + 1}`, x + 14, ry + 12, 22, { color: PDF_COLORS.orange, font: 'Helvetica-Bold', size: 12 }); pdfText(doc, question, x + 42, ry + 10, 255, { color: PDF_COLORS.navy, font: 'Helvetica-Bold', size: 8.8, lineGap: 1 }); pdfText(doc, 'Respuesta / evidencia', x + 310, ry + 9, 145, { color: PDF_COLORS.muted, font: 'Helvetica-Bold', size: 7.5 }); pdfRule(doc, x + 310, ry + 29, 155, '#aebfbd'); pdfText(doc, 'Pendiente', x + 310, ry + 36, 145, { color: PDF_COLORS.muted, size: 7.5 }); });
  y += qRows.length * 68 + 16;
  pdfCard(doc, x, y, contentWidth, 76, { fill: '#fff8f7', stroke: '#e8c1bc', accent: PDF_COLORS.red });
  pdfText(doc, 'REGLA DE PARADA', x + 18, y + 15, contentWidth - 36, { color: PDF_COLORS.red, font: 'Helvetica-Bold', size: 8, characterSpacing: .7 });
  pdfText(doc, 'Una respuesta verbal no sustituye la evidencia. Si el vendedor no aclara un punto crítico, aplaza la visita o descarta.', x + 18, y + 35, contentWidth - 36, { color: PDF_COLORS.navy, font: 'Helvetica-Bold', size: 10.5 });

  // 6. Documentación.
  y = newPage('05 · Documentos', 'Documentación antes de pagar', 'Marca cada elemento como correcto, falta o duda. La documentación no certifica el estado mecánico, pero sí evita errores administrativos y de titularidad.');
  const docs = ['Identidad y titularidad del vendedor', 'Permiso de circulación y ficha técnica', 'ITV y kilometraje registrado', 'Informe DGT y cargas', 'Embargos, precintos y reserva de dominio', 'Impuesto municipal al corriente', 'Historial de mantenimiento y facturas', 'Contrato / factura y garantía cuando corresponda'];
  pdfCard(doc, x, y, contentWidth, 38, { fill: PDF_COLORS.navy, stroke: PDF_COLORS.navy });
  pdfText(doc, 'DOCUMENTO', x + 16, y + 12, 230, { color: PDF_COLORS.white, font: 'Helvetica-Bold', size: 8 }); pdfText(doc, 'QUÉ CONFIRMAR', x + 265, y + 12, 125, { color: PDF_COLORS.white, font: 'Helvetica-Bold', size: 8 }); pdfText(doc, 'RESULTADO', x + 410, y + 12, 65, { color: PDF_COLORS.white, font: 'Helvetica-Bold', size: 8 });
  docs.forEach((item, i) => { const ry = y + 40 + i * 40; pdfCard(doc, x, ry, contentWidth, 34, { fill: i % 2 ? PDF_COLORS.pale : PDF_COLORS.white, radius: 3 }); pdfText(doc, item, x + 16, ry + 9, 230, { color: PDF_COLORS.ink, font: 'Helvetica-Bold', size: 8.5 }); pdfText(doc, i < 3 ? 'Identidad, vigencia y coincidencia' : 'Documento, fecha, titular y limitaciones', x + 265, ry + 9, 130, { color: PDF_COLORS.muted, size: 7.5 }); pdfText(doc, '[ ] Correcto   [ ] Falta   [ ] Duda', x + 407, ry + 9, 75, { color: PDF_COLORS.navy, size: 7.2 }); });
  y += 40 + docs.length * 40 + 22;
  pdfCard(doc, x, y, contentWidth, 66, { fill: '#fff7f2', stroke: '#f4c8b7', accent: PDF_COLORS.orange });
  pdfText(doc, 'Antes de desplazarte', x + 18, y + 14, 200, { color: PDF_COLORS.orange, font: 'Helvetica-Bold', size: 9 });
  pdfText(doc, 'Pide copias o datos verificables con antelación. Si aparece una carga, una titularidad incoherente o una reserva de dominio, no entregues señal hasta resolverlo.', x + 18, y + 33, contentWidth - 36, { color: PDF_COLORS.navy, size: 9.5, lineGap: 2 });

  // 7. Inspección.
  y = newPage('06 · Visita', 'Inspección y prueba de conducción', 'La prueba ordena señales y preguntas; no descarta por sí sola una avería. Si el riesgo o el valor lo justifican, paga una inspección independiente.');
  const visitGroups = [['Antes de arrancar', ['Fugas, daños, neumáticos, testigos y coherencia del kilometraje', 'Carrocería, lunas, luces y desgaste desigual']], ['Motor en frío', ['Arranque, humo, ruidos, ralentí y temperatura', 'Historial de mantenimiento y piezas sustituidas']], ['En marcha', ['Frenos, dirección, embrague/cambio y comportamiento', 'Ruidos, vibraciones, climatización y equipamiento']], ['Al finalizar', ['Anota diferencias y solicita evidencias', 'No cierres pendientes críticos por presión']]];
  const gW = (contentWidth - 10) / 2;
  visitGroups.forEach(([label, items], i) => { const gx = x + (i % 2) * (gW + 10); const gy = y + Math.floor(i / 2) * 126; pdfCard(doc, gx, gy, gW, 111, { fill: i === 3 ? '#fff8f7' : PDF_COLORS.white, accent: i === 3 ? PDF_COLORS.red : PDF_COLORS.blue }); pdfText(doc, label, gx + 16, gy + 15, gW - 32, { color: i === 3 ? PDF_COLORS.red : PDF_COLORS.blue, font: 'Helvetica-Bold', size: 9 }); items.forEach((item, j) => pdfBullet(doc, item, gx + 16, gy + 43 + j * 28, gW - 32)); });
  y += 266;
  pdfCard(doc, x, y, contentWidth, 92, { fill: PDF_COLORS.pale, accent: PDF_COLORS.green });
  pdfText(doc, 'Cuándo pedir ayuda profesional', x + 18, y + 16, contentWidth - 36, { color: PDF_COLORS.navy, font: 'Helvetica-Bold', size: 11 });
  pdfText(doc, 'Si hay dudas, historial incompleto, antigüedad o kilometraje elevados, pocos conocimientos mecánicos o un valor económico relevante, reserva una inspección independiente antes de pagar.', x + 18, y + 39, contentWidth - 36, { color: PDF_COLORS.ink, size: 9.5, lineGap: 2 });
  pdfText(doc, 'Resultado de la visita:  [ ] Avanzar   [ ] Pedir más evidencia   [ ] Inspección   [ ] Descartar', x + 18, y + 69, contentWidth - 36, { color: PDF_COLORS.navy, font: 'Helvetica-Bold', size: 8.5 });

  // 8. Cierre.
  y = newPage('07 · Compra', 'Negociación y cierre seguro', 'Negocia después de verificar. El objetivo no es solo bajar el precio: es dejar claras las condiciones y conservar trazabilidad.');
  const closeCards = [['Negocia con evidencia', ['Usa defectos documentados y mantenimiento pendiente', 'Compara unidades equivalentes', 'No negocies desde el límite absoluto'], PDF_COLORS.orange], ['Señal con condiciones', ['Identifica partes, vehículo e importe', 'Define finalidad, fecha y desistimiento', 'No pagues si faltan documentos críticos'], PDF_COLORS.red], ['Entrega ordenada', ['Pago trazable y contrato / factura', 'Llaves, documentación y garantía', 'Seguro y titularidad antes de circular'], PDF_COLORS.green]];
  closeCards.forEach(([label, items, accent], i) => { const cx = x + i * (colW + 8); pdfCard(doc, cx, y, colW, 180, { fill: PDF_COLORS.white, accent }); pdfText(doc, label, cx + 15, y + 16, colW - 30, { color: accent, font: 'Helvetica-Bold', size: 9 }); items.forEach((item, j) => pdfBullet(doc, item, cx + 15, y + 48 + j * 35, colW - 30)); });
  y += 207;
  pdfCard(doc, x, y, contentWidth, 102, { fill: '#fff7f2', stroke: '#f4c8b7', accent: PDF_COLORS.orange });
  pdfText(doc, 'Condiciones que deben quedar escritas', x + 18, y + 16, contentWidth - 36, { color: PDF_COLORS.orange, font: 'Helvetica-Bold', size: 9 });
  pdfText(doc, 'Partes: ____________________   Vehículo: ____________________   Importe: __________', x + 18, y + 39, contentWidth - 36, { size: 9 });
  pdfText(doc, 'Finalidad de la señal: ____________________   Fecha: __________   Desistimiento: ____________________', x + 18, y + 62, contentWidth - 36, { size: 9 });
  pdfText(doc, 'Decisión:  [ ] Comprar   [ ] Negociar   [ ] Inspección   [ ] Seguir buscando   [ ] Descartar', x + 18, y + 84, contentWidth - 36, { color: PDF_COLORS.navy, font: 'Helvetica-Bold', size: 8.5 });

  // 9. Postcompra.
  y = newPage('08 · Después', 'Las primeras horas también cuentan', 'Una compra segura conserva evidencias y convierte los primeros días en un control de seguridad, garantía y coste real.');
  const timeline = [['72 HORAS', PDF_COLORS.orange, ['Seguro activo y documentos guardados', 'Fotos del estado y kilometraje de entrega', 'Incidencias comunicadas por escrito']], ['30 DÍAS', PDF_COLORS.blue, ['Revisión inicial y mantenimiento pendiente', 'Control de consumo, testigos, ruidos y temperatura', 'Garantía, facturas y vencimientos organizados']], ['PRIMER AÑO', PDF_COLORS.green, ['ITV, seguro e impuesto revisados', 'Reparaciones y coste por kilómetro registrados', 'Reserva mantenida y encaje reevaluado']]];
  timeline.forEach(([label, accent, items], i) => { const tx = x + i * (colW + 8); pdfCard(doc, tx, y, colW, 205, { fill: PDF_COLORS.white, accent }); pdfText(doc, label, tx + 16, y + 17, colW - 32, { color: accent, font: 'Helvetica-Bold', size: 10, characterSpacing: .5 }); pdfRule(doc, tx + 16, y + 39, colW - 32, accent); items.forEach((item, j) => pdfBullet(doc, item, tx + 16, y + 58 + j * 42, colW - 32)); });
  y += 234;
  sectionLabel('Registro que te ayudará a conocer el coste real', y);
  pdfField(doc, 'Fecha / kilometraje', x, y + 26, 155); pdfField(doc, 'Incidencia o mantenimiento', x + 175, y + 26, 155); pdfField(doc, 'Importe / evidencia', x + 350, y + 26, contentWidth - 350);
  pdfField(doc, 'Siguiente vencimiento', x, y + 70, 235); pdfField(doc, 'Qué revisarás de nuevo', x + 255, y + 70, contentWidth - 255);

  // 10. Comparador + recursos.
  y = newPage('09 · Decisión', 'Comparador y decisión final', 'Un dato pendiente no equivale a un dato correcto. Compara hasta tres candidatos y decide solo cuando los riesgos importantes estén controlados.');
  const candidates = ['Candidato A', 'Candidato B', 'Candidato C'];
  pdfCard(doc, x, y, contentWidth, 43, { fill: PDF_COLORS.navy, stroke: PDF_COLORS.navy });
  pdfText(doc, 'CRITERIO', x + 14, y + 14, 190, { color: PDF_COLORS.white, font: 'Helvetica-Bold', size: 8 }); candidates.forEach((name, i) => pdfText(doc, name, x + 205 + i * 90, y + 14, 82, { color: PDF_COLORS.white, font: 'Helvetica-Bold', size: 8, align: 'center' }));
  ['Encaje con uso, ocupantes, vías y ZBE', 'Precio total, gastos y reserva', 'Historial, documentación y garantía', 'Estado físico y mecánico pendiente', 'Seguridad, consumo y mantenimiento', 'Confianza y condiciones de cierre'].forEach((label, i) => { const ry = y + 45 + i * 31; pdfCard(doc, x, ry, contentWidth, 27, { fill: i % 2 ? PDF_COLORS.pale : PDF_COLORS.white, radius: 2 }); pdfText(doc, label, x + 14, ry + 8, 190, { color: PDF_COLORS.ink, size: 7.8 }); candidates.forEach((_, j) => pdfText(doc, '[ ] Sí  [ ] Pend.', x + 207 + j * 90, ry + 8, 82, { color: PDF_COLORS.muted, size: 7.2, align: 'center' })); });
  y += 45 + 6 * 31 + 22;
  pdfCard(doc, x, y, contentWidth, 75, { fill: '#fff7f2', stroke: '#f4c8b7', accent: PDF_COLORS.orange });
  pdfText(doc, 'MI DECISIÓN', x + 18, y + 14, 150, { color: PDF_COLORS.orange, font: 'Helvetica-Bold', size: 8, characterSpacing: .7 });
  pdfText(doc, '[ ] Comprar   [ ] Negociar   [ ] Solicitar inspección   [ ] Seguir buscando   [ ] Descartar', x + 18, y + 33, contentWidth - 36, { color: PDF_COLORS.navy, font: 'Helvetica-Bold', size: 9 });
  pdfText(doc, 'Motivo: __________________________________________________________________________________', x + 18, y + 53, contentWidth - 36, { color: PDF_COLORS.ink, size: 8.5 });
  y += 98;
  pdfCard(doc, x, y, contentWidth, 132, { fill: PDF_COLORS.navy, stroke: PDF_COLORS.navy });
  pdfText(doc, 'CONTINÚA CON MÁS HERRAMIENTAS', x + 18, y + 16, 280, { color: PDF_COLORS.orange, font: 'Helvetica-Bold', size: 8, characterSpacing: .7 });
  doc.image(qr, x + 18, y + 39, { width: 72 });
  pdfText(doc, 'Guías, listas de comprobación y fuentes oficiales para seguir tomando decisiones con criterio.', x + 115, y + 38, 350, { color: PDF_COLORS.white, size: 9.5, lineGap: 2 });
  pdfText(doc, resourcesUrl, x + 115, y + 70, 350, { color: '#c5d7de', font: 'Helvetica-Bold', size: 8, lineGap: 1 });
  pdfText(doc, 'Acceso a recursos y listas de comprobación de CocheCierto.', x + 115, y + 91, 350, { color: '#c5d7de', size: 7.2, lineGap: 1 });
  const pageRange = doc.bufferedPageRange();
  for (let pageIndex = 0; pageIndex < pageRange.count; pageIndex += 1) {
    doc.switchToPage(pageRange.start + pageIndex);
    doc.x = doc.page.margins.left;
    doc.y = doc.page.margins.top;
    pdfHeaderFixed(doc, doc.page.margins.left, contentWidth);
    doc.save().font('Helvetica').fontSize(7.5).fillColor(PDF_COLORS.muted)
      .text(`cochecierto.com · Guía personal de compra · Informe beta · Página ${pageIndex + 1} de ${pageRange.count}`, doc.page.margins.left, doc.page.height - 72, { width: contentWidth, align: 'center', lineBreak: false })
      .fontSize(7).text('Orientación informativa. No sustituye una inspección mecánica, peritaje ni asesoramiento jurídico o fiscal individual.', doc.page.margins.left, doc.page.height - 60, { width: contentWidth, align: 'center', lineBreak: false }).restore();
  }
  doc.end();
};

app.get('/health', async (_req, res) => {
  let database = 'not-configured';
  if (pool) { try { await pool.query('SELECT 1'); database = 'ok'; } catch { database = 'unavailable'; } }
  res.json({ ok: true, service: 'cochecierto-backend', database });
});

app.get('/api/ine-context', async (_req, res) => {
  const now = Date.now();
  if (ineCache.payload && ineCache.expiresAt > now) return res.json(ineCache.payload);
  try {
    const response = await fetch(INE_SOURCE_URL, { signal: AbortSignal.timeout(8000), headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`INE ${response.status}`);
    const source = await response.json();
    const series = Array.isArray(source) ? source : [];
    const payload = {
      ok: true,
      indicator: 'Índice nacional de precios de consumo',
      meaning: 'Referencia agregada para contextualizar cambios de precios; no sustituye los datos económicos declarados por el usuario.',
      source: { institution: 'Instituto Nacional de Estadística', tableId: INE_TABLE_ID, url: INE_SOURCE_URL, consultedAt: new Date().toISOString() },
      scope: { geography: 'España', unit: 'índice o valor publicado por la serie', periodicity: 'según la serie oficial' },
      data: series.slice(0, 5).map((item) => ({ name: item.Nombre || item.NombreSerie || item.name || null, values: Array.isArray(item.Data) ? item.Data.slice(-5) : [] })),
      limitations: ['Dato oficial agregado.', 'No infiere ingresos, solvencia, empleo ni riesgo crediticio.', 'Si el INE no está disponible, el valorador continúa sin este contexto.']
    };
    ineCache = { expiresAt: now + INE_CACHE_TTL_MS, payload };
    return res.json(payload);
  } catch (error) {
    console.error('INE context unavailable:', error.message);
    return res.status(503).json({ ok: false, indicator: 'Índice nacional de precios de consumo', source: { institution: 'Instituto Nacional de Estadística', tableId: INE_TABLE_ID, url: INE_SOURCE_URL }, message: 'El contexto oficial del INE no está disponible temporalmente. El diagnóstico puede continuar sin este dato.', limitations: ['No se ha sustituido el dato por una estimación.'] });
  }
});

app.get('/api/airtable-status', async (_req, res) => {
  if (!airtable) return res.status(503).json({ configured: false, ok: false, reason: 'Airtable no configurado' });
  try {
    await airtableRequest(`${airtableUrl(airtable.leadsTable)}?maxRecords=1`);
    return res.json({ configured: true, ok: true, table: airtable.leadsTable });
  } catch (error) {
    console.error('Airtable status:', error.message);
    return res.status(502).json({ configured: true, ok: false, reason: error.message });
  }
});

app.post('/api/analyze', async (req, res) => {
  if (!rateLimit(req.ip || 'unknown')) return res.status(429).json({ error: 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.' });
  const body = req.body || {};
  const report = { intent: typeof body.intent === 'string' ? body.intent.slice(0, 40) : 'buy', category: typeof body.category === 'string' ? body.category.slice(0, 80) : 'pendiente', usageType: body.usageType === 'professional' ? 'professional' : 'private', purchaseWindow: typeof body.purchaseWindow === 'string' ? body.purchaseWindow.slice(0, 40) : 'unknown', priority: typeof body.priority === 'string' ? body.priority.slice(0, 80) : 'No indicada', situation: typeof body.situation === 'string' ? body.situation.slice(0, 80) : 'unknown', answers: cleanAnswers(body.answers) };
  const generated = await requestLlmNarrative(report);
  res.json({ narrative: generated.narrative, llmStatus: generated.status });
});

app.post('/api/purchase-requests', async (req, res) => {
  if (!pool) return res.status(503).json({ ok: false, configured: false, message: 'Las peticiones privadas aún no están configuradas.' });
  if (!rateLimit(req.ip || 'unknown')) return res.status(429).json({ ok: false, message: 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.' });
  if (req.body?.consent?.saveRequest !== true) return res.status(400).json({ ok: false, message: 'Debes confirmar que aceptas guardar la ficha privada.' });
  if (req.body?.consent?.manualShare !== true) return res.status(400).json({ ok: false, message: 'Debes confirmar por separado que compartirás la ficha manualmente.' });
  const payload = requestPayload(req.body);
  if (!payload) return res.status(400).json({ ok: false, message: 'La zona o el radio de referencia no son válidos.' });
  const ownerToken = createReportToken(), shareToken = createReportToken(), expiresAt = new Date(Date.now() + REPORT_TTL_MS);
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [result] = await connection.execute('INSERT INTO purchase_requests (owner_token_hash, share_token_hash, payload, state, expires_at) VALUES (?, ?, ?, ?, ?)', [hash(ownerToken), hash(shareToken), JSON.stringify(payload), 'active', expiresAt]);
    await connection.execute('INSERT INTO purchase_request_consents (request_id, consent_type, granted) VALUES (?, ?, ?)', [result.insertId, 'save_request', true]);
    await connection.execute('INSERT INTO purchase_request_consents (request_id, consent_type, granted) VALUES (?, ?, ?)', [result.insertId, 'manual_share', true]);
    await connection.commit();
    if (crmEnabled) {
      try { const [crmCase] = await pool.execute('INSERT INTO crm_cases (purchase_request_id, stage, source, consent_snapshot) VALUES (?, ?, ?, ?)', [result.insertId, 'request_active', 'purchase-request', JSON.stringify({ saveRequest: true, manualShare: true, capturedAt: new Date().toISOString() })]); await pool.execute('INSERT INTO crm_case_events (case_id, to_stage, actor_type, reason) VALUES (?, ?, ?, ?)', [crmCase.insertId, 'request_active', 'system', 'Petición privada creada']); } catch (error) { console.error('CRM purchase request tracking unavailable:', error.message); }
    }
    const base = requestBaseUrl.replace(/\/$/, '');
    return res.status(201).json({ ok: true, ownerToken, shareToken, ownerUrl: `${base}/solicitud/?token=${ownerToken}&role=owner`, shareUrl: `${base}/solicitud/?token=${shareToken}`, state: 'active', expiresAt: expiresAt.toISOString() });
  } catch (error) {
    if (connection) await connection.rollback().catch(() => {});
    console.error('Purchase request creation unavailable:', error.message);
    return res.status(503).json({ ok: false, message: 'No se ha podido guardar la petición. Inténtalo de nuevo más tarde.' });
  } finally { connection?.release(); }
});

app.get('/api/purchase-requests/:token', async (req, res) => {
  if (!pool) return res.status(503).json({ ok: false, configured: false, message: 'Las peticiones privadas aún no están configuradas.' });
  const token = req.params.token;
  if (!validRequestToken(token)) return res.status(404).json({ ok: false, message: 'Petición no disponible.' });
  try {
    const tokenHash = hash(token);
    const [rows] = await pool.execute('SELECT id, payload, state, expires_at, revoked_at, owner_token_hash FROM purchase_requests WHERE share_token_hash = ? OR owner_token_hash = ? LIMIT 1', [tokenHash, tokenHash]);
    const row = rows[0];
    if (!row) return res.status(404).json({ ok: false, message: 'Petición no disponible.' });
    const expired = new Date(row.expires_at).getTime() <= Date.now();
    if (expired && row.state === 'active') { await pool.execute('UPDATE purchase_requests SET state = ? WHERE id = ?', ['expired', row.id]); await expireCrmRequest(row.id); }
    if (row.state !== 'active' || expired || row.revoked_at) return res.status(410).json({ ok: false, state: row.state === 'active' && expired ? 'expired' : row.state, message: 'Esta petición ha caducado o ha sido retirada.' });
    const payload = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
    return res.json({ ok: true, role: row.owner_token_hash === tokenHash ? 'owner' : 'viewer', state: 'active', expiresAt: new Date(row.expires_at).toISOString(), request: payload });
  } catch (error) {
    console.error('Purchase request lookup unavailable:', error.message);
    return res.status(503).json({ ok: false, message: 'No se ha podido consultar la petición.' });
  }
});

app.post('/api/purchase-requests/:token/revoke', async (req, res) => {
  if (!pool) return res.status(503).json({ ok: false, configured: false, message: 'Las peticiones privadas aún no están configuradas.' });
  const token = req.params.token;
  if (!validRequestToken(token)) return res.status(404).json({ ok: false, message: 'Petición no disponible.' });
  try {
    const [result] = await pool.execute('UPDATE purchase_requests SET state = ?, revoked_at = CURRENT_TIMESTAMP WHERE owner_token_hash = ? AND state = ?', ['withdrawn', hash(token), 'active']);
    if (!result.affectedRows) return res.status(404).json({ ok: false, message: 'Petición no disponible o ya retirada.' });
    if (crmEnabled) { try { const [cases] = await pool.execute('SELECT id, stage FROM crm_cases WHERE purchase_request_id = (SELECT id FROM purchase_requests WHERE owner_token_hash = ? LIMIT 1) AND deleted_at IS NULL ORDER BY id DESC LIMIT 1', [hash(token)]); const current = cases[0]; if (current && crmTransitions[current.stage]?.includes('withdrawn')) { await pool.execute('UPDATE crm_cases SET stage = ? WHERE id = ?', ['withdrawn', current.id]); await pool.execute('INSERT INTO crm_case_events (case_id, from_stage, to_stage, actor_type, reason) VALUES (?, ?, ?, ?, ?)', [current.id, current.stage, 'withdrawn', 'user', 'Petición retirada por el propietario']); } } catch (error) { console.error('CRM withdrawal tracking unavailable:', error.message); }
    }
    return res.json({ ok: true, state: 'withdrawn' });
  } catch (error) {
    console.error('Purchase request revocation unavailable:', error.message);
    return res.status(503).json({ ok: false, message: 'No se ha podido retirar la petición.' });
  }
});

app.delete('/api/purchase-requests/:token', async (req, res) => {
  if (!pool) return res.status(503).json({ ok: false, configured: false, message: 'Las peticiones privadas aún no están configuradas.' });
  const token = req.params.token;
  if (!validRequestToken(token)) return res.status(404).json({ ok: false, message: 'Petición no disponible.' });
  try {
    const [requestRows] = await pool.execute('SELECT id FROM purchase_requests WHERE owner_token_hash = ? LIMIT 1', [hash(token)]);
    const requestId = requestRows[0]?.id;
    const [result] = await pool.execute('DELETE FROM purchase_requests WHERE owner_token_hash = ?', [hash(token)]);
    if (!result.affectedRows) return res.status(404).json({ ok: false, message: 'Petición no disponible.' });
    if (crmEnabled && requestId) { try { await pool.execute('DELETE FROM crm_cases WHERE purchase_request_id = ?', [requestId]); } catch (error) { console.error('CRM privacy cleanup unavailable:', error.message); } }
    return res.json({ ok: true, state: 'deleted' });
  } catch (error) {
    console.error('Purchase request deletion unavailable:', error.message);
    return res.status(503).json({ ok: false, message: 'No se ha podido eliminar la petición.' });
  }
});

app.post('/api/purchase-requests/:token/invitations', async (req, res) => {
  if (!pool) return res.status(503).json({ ok: false, configured: false, message: 'Las invitaciones aún no están configuradas.' });
  if (!rateLimit(req.ip || 'unknown')) return res.status(429).json({ ok: false, message: 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.' });
  const ownerToken = req.params.token;
  if (!validRequestToken(ownerToken)) return res.status(404).json({ ok: false, message: 'Petición no disponible.' });
  if (req.body?.consent?.receiveOffers !== true) return res.status(400).json({ ok: false, message: 'Debes confirmar por separado que aceptas recibir una oferta de este concesionario.' });
  const dealerName = typeof req.body?.dealerName === 'string' ? req.body.dealerName.trim().slice(0, 160) : null;
  const dealerId = req.body?.dealerId ? crmId(req.body.dealerId) : null;
  if (req.body?.dealerId && (!dealerId || !crmEnabled)) return res.status(400).json({ ok: false, message: 'El concesionario seleccionado no está disponible.' });
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [rows] = await connection.execute('SELECT id, expires_at FROM purchase_requests WHERE owner_token_hash = ? AND state = ? LIMIT 1', [hash(ownerToken), 'active']);
    const request = rows[0];
    if (!request || new Date(request.expires_at).getTime() <= Date.now()) { await connection.rollback(); return res.status(404).json({ ok: false, message: 'Petición no disponible.' }); }
    if (dealerId) { const [dealerRows] = await connection.execute('SELECT id, trade_name, legal_name FROM crm_dealers WHERE id = ? AND status = ? AND data_processing_status = ? AND archived_at IS NULL LIMIT 1', [dealerId, 'verified', 'approved']); if (!dealerRows[0]) { await connection.rollback(); return res.status(400).json({ ok: false, message: 'El concesionario seleccionado no está verificado.' }); } }
    const inviteToken = createReportToken(), expiresAt = new Date(Math.min(new Date(request.expires_at).getTime(), Date.now() + REPORT_TTL_MS));
    if (dealerId) await connection.execute('INSERT INTO purchase_request_invites (request_id, dealer_id, token_hash, dealer_name, expires_at) VALUES (?, ?, ?, ?, ?)', [request.id, dealerId, hash(inviteToken), dealerName || null, expiresAt]);
    else await connection.execute('INSERT INTO purchase_request_invites (request_id, token_hash, dealer_name, expires_at) VALUES (?, ?, ?, ?)', [request.id, hash(inviteToken), dealerName || null, expiresAt]);
    await connection.execute('INSERT INTO purchase_request_consents (request_id, consent_type, granted) VALUES (?, ?, ?)', [request.id, 'receive_offers', true]);
    await connection.commit();
    if (dealerId && crmEnabled) { try { const [cases] = await pool.execute('SELECT id FROM crm_cases WHERE purchase_request_id = ? AND deleted_at IS NULL ORDER BY id DESC LIMIT 1', [request.id]); if (cases[0]) await pool.execute('INSERT INTO crm_case_dealers (case_id, dealer_id, relationship_state) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE relationship_state = VALUES(relationship_state), updated_at = CURRENT_TIMESTAMP', [cases[0].id, dealerId, 'invited']); } catch (error) { console.error('CRM dealer association unavailable:', error.message); } }
    if (crmEnabled) {
      try { const [cases] = await pool.execute('SELECT id, stage FROM crm_cases WHERE purchase_request_id = ? AND deleted_at IS NULL ORDER BY id DESC LIMIT 1', [request.id]); const current = cases[0]; if (current && crmTransitions[current.stage]?.includes('shared_manual')) { await pool.execute('UPDATE crm_cases SET stage = ? WHERE id = ?', ['shared_manual', current.id]); await pool.execute('INSERT INTO crm_case_events (case_id, from_stage, to_stage, actor_type, reason) VALUES (?, ?, ?, ?, ?)', [current.id, current.stage, 'shared_manual', 'system', 'Invitación manual creada']); } } catch (error) { console.error('CRM invitation tracking unavailable:', error.message); }
    }
    return res.status(201).json({ ok: true, inviteToken, inviteUrl: `${requestBaseUrl.replace(/\/$/, '')}/respuesta-oferta/?token=${inviteToken}`, expiresAt: expiresAt.toISOString() });
  } catch (error) {
    if (connection) await connection.rollback().catch(() => {});
    console.error('Dealer invitation creation unavailable:', error.message);
    return res.status(503).json({ ok: false, message: 'No se ha podido crear la invitación.' });
  } finally { connection?.release(); }
});

app.get('/api/purchase-offer-invites/:token', async (req, res) => {
  if (!pool) return res.status(503).json({ ok: false, configured: false, message: 'Las invitaciones aún no están configuradas.' });
  const inviteToken = req.params.token;
  if (!validRequestToken(inviteToken)) return res.status(404).json({ ok: false, message: 'Invitación no disponible.' });
  try {
    const [rows] = await pool.execute('SELECT invite.dealer_name, invite.expires_at, request.payload FROM purchase_request_invites invite JOIN purchase_requests request ON request.id = invite.request_id WHERE invite.token_hash = ? AND invite.state = ? AND request.state = ? AND invite.expires_at > CURRENT_TIMESTAMP AND request.expires_at > CURRENT_TIMESTAMP LIMIT 1', [hash(inviteToken), 'active', 'active']);
    const row = rows[0];
    if (!row) return res.status(404).json({ ok: false, message: 'Invitación no disponible.' });
    const request = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
    return res.json({ ok: true, offersEnabled: dealerOffersEnabled, expiresAt: new Date(row.expires_at).toISOString(), dealerName: row.dealer_name || null, request });
  } catch (error) {
    console.error('Dealer invitation lookup unavailable:', error.message);
    return res.status(503).json({ ok: false, message: 'No se ha podido consultar la invitación.' });
  }
});

app.post('/api/purchase-offer-invites/:token/offers', async (req, res) => {
  if (!dealerOffersEnabled) return res.status(503).json({ ok: false, configured: false, message: 'La recepción de ofertas aún no está activa.' });
  if (!pool) return res.status(503).json({ ok: false, configured: false, message: 'La recepción de ofertas aún no está configurada.' });
  if (!rateLimit(req.ip || 'unknown')) return res.status(429).json({ ok: false, message: 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.' });
  const inviteToken = req.params.token;
  if (!validRequestToken(inviteToken)) return res.status(404).json({ ok: false, message: 'Invitación no disponible.' });
  const offer = cleanOffer(req.body?.offer);
  const requiredOfferFields = ['dealerName', 'vehicle', 'version', 'condition', 'availability', 'finalCashPrice', 'priceBreakdown', 'warranty', 'testAndInspection', 'offerValidity', 'accuracyDeclaration'];
  if (requiredOfferFields.some((key) => !offer[key])) return res.status(400).json({ ok: false, message: 'Completa los campos obligatorios de la oferta.', fields: requiredOfferFields.filter((key) => !offer[key]) });
  try {
    const [rows] = await pool.execute('SELECT invite.id, invite.request_id FROM purchase_request_invites invite JOIN purchase_requests request ON request.id = invite.request_id WHERE invite.token_hash = ? AND invite.state = ? AND request.state = ? AND invite.expires_at > CURRENT_TIMESTAMP AND request.expires_at > CURRENT_TIMESTAMP LIMIT 1', [hash(inviteToken), 'active', 'active']);
    const invite = rows[0];
    if (!invite) return res.status(404).json({ ok: false, message: 'Invitación no disponible.' });
    const [versionRows] = await pool.execute('SELECT COALESCE(MAX(version), 0) + 1 AS next_version FROM purchase_offers WHERE invite_id = ?', [invite.id]);
    const version = Number(versionRows[0]?.next_version || 1);
    const [result] = await pool.execute('INSERT INTO purchase_offers (request_id, invite_id, version, payload, state) VALUES (?, ?, ?, ?, ?)', [invite.request_id, invite.id, version, JSON.stringify({ ...offer, source: 'dealer-submission-v1' }), 'received']);
    if (crmEnabled) {
      try { const [cases] = await pool.execute('SELECT id, stage FROM crm_cases WHERE purchase_request_id = ? AND deleted_at IS NULL ORDER BY id DESC LIMIT 1', [invite.request_id]); const current = cases[0]; if (current && crmTransitions[current.stage]?.includes('offer_received')) { await pool.execute('UPDATE crm_cases SET stage = ? WHERE id = ?', ['offer_received', current.id]); await pool.execute('INSERT INTO crm_case_events (case_id, from_stage, to_stage, actor_type, reason) VALUES (?, ?, ?, ?, ?)', [current.id, current.stage, 'offer_received', 'system', 'Oferta recibida']); } } catch (error) { console.error('CRM offer tracking unavailable:', error.message); }
    }
    return res.status(201).json({ ok: true, offerId: result.insertId, version, state: 'received' });
  } catch (error) {
    console.error('Dealer offer creation unavailable:', error.message);
    return res.status(503).json({ ok: false, message: 'No se ha podido registrar la oferta.' });
  }
});

app.get('/api/purchase-requests/:token/offers', async (req, res) => {
  if (!pool) return res.status(503).json({ ok: false, configured: false, message: 'Las ofertas aún no están configuradas.' });
  const ownerToken = req.params.token;
  if (!validRequestToken(ownerToken)) return res.status(404).json({ ok: false, message: 'Petición no disponible.' });
  try {
    const [requests] = await pool.execute('SELECT id, state FROM purchase_requests WHERE owner_token_hash = ? AND state = ? AND expires_at > CURRENT_TIMESTAMP LIMIT 1', [hash(ownerToken), 'active']);
    const request = requests[0];
    if (!request) return res.status(404).json({ ok: false, message: 'Petición no disponible.' });
    const [offers] = await pool.execute('SELECT id, version, payload, state, created_at FROM purchase_offers WHERE request_id = ? ORDER BY created_at DESC, version DESC', [request.id]);
    return res.json({ ok: true, state: request.state, offers: offers.map((offer) => ({ id: offer.id, version: offer.version, state: offer.state, createdAt: offer.created_at, offer: typeof offer.payload === 'string' ? JSON.parse(offer.payload) : offer.payload })) });
  } catch (error) {
    console.error('Purchase offers lookup unavailable:', error.message);
    return res.status(503).json({ ok: false, message: 'No se han podido consultar las ofertas.' });
  }
});

app.post('/api/purchase-requests/:token/comparison-viewed', async (req, res) => {
  if (!pool) return res.status(503).json({ ok: false, configured: false, message: 'El seguimiento de comparación aún no está configurado.' });
  const ownerToken = req.params.token;
  if (!validRequestToken(ownerToken)) return res.status(404).json({ ok: false, message: 'Petición no disponible.' });
  try {
    const [cases] = await pool.execute('SELECT id, stage FROM crm_cases WHERE purchase_request_id = (SELECT id FROM purchase_requests WHERE owner_token_hash = ? AND state = \'active\' AND expires_at > CURRENT_TIMESTAMP LIMIT 1) AND deleted_at IS NULL ORDER BY id DESC LIMIT 1', [hash(ownerToken)]);
    const current = cases[0];
    if (crmEnabled && current && crmTransitions[current.stage]?.includes('comparison')) { await pool.execute('UPDATE crm_cases SET stage = ? WHERE id = ?', ['comparison', current.id]); await pool.execute('INSERT INTO crm_case_events (case_id, from_stage, to_stage, actor_type, reason) VALUES (?, ?, ?, ?, ?)', [current.id, current.stage, 'comparison', 'user', 'Comparador de ofertas abierto']); }
    return res.json({ ok: true, tracked: Boolean(crmEnabled && current), contactAuthorizationAvailable: Boolean(crmEnabled && current && crmTransitions[current.stage]?.includes('contact_authorized')) });
  } catch (error) { console.error('Comparison tracking unavailable:', error.message); return res.status(503).json({ ok: false, message: 'No se ha podido registrar la comparación.' }); }
});

app.post('/api/purchase-requests/:token/contact-authorized', async (req, res) => {
  if (!pool) return res.status(503).json({ ok: false, configured: false, message: 'La autorización de contacto aún no está configurada.' });
  const ownerToken = req.params.token;
  if (!validRequestToken(ownerToken)) return res.status(404).json({ ok: false, message: 'Petición no disponible.' });
  if (req.body?.consent?.contact !== true) return res.status(400).json({ ok: false, message: 'Debes confirmar por separado la autorización de contacto.' });
  try {
    const [cases] = await pool.execute('SELECT id, stage FROM crm_cases WHERE purchase_request_id = (SELECT id FROM purchase_requests WHERE owner_token_hash = ? AND state = \'active\' AND expires_at > CURRENT_TIMESTAMP LIMIT 1) AND deleted_at IS NULL ORDER BY id DESC LIMIT 1', [hash(ownerToken)]);
    const current = cases[0];
    if (!current) return res.status(404).json({ ok: false, message: 'Petición no disponible.' });
    if (!crmEnabled || !crmTransitions[current.stage]?.includes('contact_authorized')) return res.status(409).json({ ok: false, message: 'La autorización no está disponible en esta fase.' });
    await pool.execute('UPDATE crm_cases SET stage = ?, consent_snapshot = JSON_SET(COALESCE(consent_snapshot, JSON_OBJECT()), \'$.contact\', true, \'$.contactAt\', CURRENT_TIMESTAMP) WHERE id = ?', ['contact_authorized', current.id]);
    await pool.execute('INSERT INTO crm_case_events (case_id, from_stage, to_stage, actor_type, reason, metadata) VALUES (?, ?, ?, ?, ?, ?)', [current.id, current.stage, 'contact_authorized', 'user', 'Autorización explícita de contacto', JSON.stringify({ contact: true })]);
    return res.json({ ok: true, authorized: true, message: 'Autorización registrada. No se ha enviado ningún mensaje automáticamente.' });
  } catch (error) { console.error('Contact authorization unavailable:', error.message); return res.status(503).json({ ok: false, message: 'No se ha podido registrar la autorización.' }); }
});

const crmGuard = (req, res) => {
  if (!crmRuntimeEnabled) { res.status(503).json({ ok: false, configured: false, message: 'El CRM aún no está activado.' }); return false; }
  if (!pool) { res.status(503).json({ ok: false, configured: false, message: 'El CRM requiere MySQL configurado.' }); return false; }
  if (!crmAuthorized(req)) { if (!rateLimit(`crm:${req.ip || 'unknown'}`)) { res.status(429).json({ ok: false, message: 'Demasiados intentos de acceso al CRM.' }); return false; } res.status(401).json({ ok: false, message: 'Autorización interna requerida.' }); return false; }
  return true;
};
const crmId = (value) => /^\d+$/.test(String(value || '')) ? Number(value) : null;

// Public intake only records a collaboration request; approval and activation stay inside the CRM.
app.post('/api/partner-interest', async (req, res) => {
  if (!pool) return res.status(503).json({ ok: false, message: 'El registro de partners aún no está configurado.' });
  if (!rateLimit(`partner-interest:${req.ip || 'unknown'}`)) return res.status(429).json({ ok: false, message: 'Demasiadas solicitudes. Inténtalo más tarde.' });
  const legalName = crmText(req.body?.legalName || req.body?.businessName, 180)?.trim();
  const tradeName = crmText(req.body?.tradeName, 180)?.trim();
  const contactName = crmText(req.body?.contactName, 160)?.trim();
  const email = crmText(req.body?.email || req.body?.contactEmail, 255)?.trim().toLowerCase();
  const phone = crmText(req.body?.phone, 40)?.trim();
  const website = crmText(req.body?.website, 255)?.trim();
  const area = crmText(req.body?.area, 120)?.trim();
  if (!legalName || !contactName || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || req.body?.consent !== true) return res.status(400).json({ ok: false, message: 'Completa los datos obligatorios y acepta el contacto.' });
  try {
    const [existing] = await pool.execute('SELECT d.id FROM crm_dealers d JOIN crm_dealer_contacts c ON c.dealer_id = d.id AND c.deleted_at IS NULL WHERE LOWER(d.legal_name) = LOWER(?) OR LOWER(c.email) = LOWER(?) LIMIT 1', [legalName, email]);
    if (existing[0]) return res.status(202).json({ ok: true, status: 'already_received', message: 'Ya tenemos una solicitud con estos datos. El equipo la revisará.' });
    const [dealer] = await pool.execute('INSERT INTO crm_dealers (legal_name, trade_name, website, status, verification_status, service_areas, contract_status, data_processing_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [legalName, tradeName || null, website || null, 'pending_review', 'not_started', JSON.stringify({ source: 'landing_pro', area: area || null }), 'not_started', 'pending_review']);
    await pool.execute('INSERT INTO crm_dealer_contacts (dealer_id, contact_name, email, phone, preferred_channel, consent_status) VALUES (?, ?, ?, ?, ?, ?)', [dealer.insertId, contactName, email, phone || null, 'email', 'pending_review']);
    return res.status(201).json({ ok: true, status: 'pending_review', message: 'Solicitud recibida. El equipo revisará los datos antes de activar la colaboración.' });
  } catch (error) { console.error('Partner interest unavailable:', error.message); return res.status(503).json({ ok: false, message: 'No se ha podido registrar la solicitud.' }); }
});

app.post('/api/crm/auth/request-code', async (req, res) => {
  if (!crmRuntimeEnabled || !mailer) return res.status(503).json({ ok: false, message: 'El acceso temporal no está disponible.' });
  const user = crmText(req.body?.user, 80), email = crmText(req.body?.email, 255)?.toLowerCase();
  if (user !== crmAdminUser || email !== crmAdminEmail) return res.status(202).json({ ok: true, message: 'Si los datos son válidos, recibirás un código en el correo autorizado.' });
  const recent = crmOtpChallenges.get(`${req.ip || 'unknown'}:${user}`);
  if (recent && recent.sentAt > Date.now() - 60 * 1000) return res.status(429).json({ ok: false, message: 'Espera un minuto antes de solicitar otro código.' });
  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  const challengeId = crypto.randomBytes(24).toString('hex');
  crmOtpChallenges.set(challengeId, { user, email, codeHash: hash(code), expiresAt: Date.now() + CRM_OTP_TTL_MS, attempts: 0, sentAt: Date.now() });
  try {
    await mailer.sendMail({ from: process.env.MAIL_FROM || `CocheCierto <${mailUser}>`, to: email, subject: 'Tu código de acceso al CRM CocheCierto', text: `Tu código de acceso es: ${code}. Caduca en 10 minutos y solo puede utilizarse una vez.` });
  } catch (error) {
    crmOtpChallenges.delete(challengeId);
    console.error('CRM OTP delivery unavailable:', error.message);
    return res.status(503).json({ ok: false, message: 'No se pudo enviar el código. Revisa la configuración de correo del CRM.' });
  }
  return res.status(202).json({ ok: true, challengeId, message: 'Si los datos son válidos, recibirás un código en el correo autorizado.' });
});

app.post('/api/crm/auth/verify-code', (req, res) => {
  const challengeId = crmText(req.body?.challengeId, 64), code = crmText(req.body?.code, 6);
  const challenge = crmOtpChallenges.get(challengeId);
  if (!challenge || challenge.expiresAt < Date.now() || !/^\d{6}$/.test(code || '') || challenge.attempts >= 5) return res.status(401).json({ ok: false, message: 'El código no es válido o ha caducado.' });
  challenge.attempts += 1;
  if (!crypto.timingSafeEqual(Buffer.from(challenge.codeHash, 'hex'), Buffer.from(hash(code), 'hex'))) return res.status(401).json({ ok: false, message: 'El código no es válido o ha caducado.' });
  crmOtpChallenges.delete(challengeId);
  const expiresAt = Date.now() + CRM_SESSION_TTL_MS;
  const sessionCookie = crmSessionCookie(challenge.user, req.get('user-agent') || '', expiresAt);
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Set-Cookie', `cc_crm_session=${sessionCookie}; Max-Age=${CRM_SESSION_TTL_MS / 1000}; Path=/; HttpOnly; Secure; SameSite=Strict`);
  return res.json({ ok: true, message: 'Acceso validado.' });
});

app.get('/api/crm/status', (_req, res) => {
  const checks = { mysql: Boolean(pool), featureFlag: process.env.CRM_ENABLED === 'true', schemaReady: crmSchemaReady, adminCredential: Boolean(crmAdminToken) };
  const enabled = checks.mysql && checks.featureFlag && checks.schemaReady && checks.adminCredential;
  return res.json({ ok: true, enabled, message: enabled ? 'CRM preparado para acceso interno.' : 'CRM cerrado hasta completar las puertas de activación.' });
});

app.get('/api/crm/meta', (req, res) => {
  if (!crmGuard(req, res)) return;
  return res.json({ ok: true, stages: crmStages, transitions: crmTransitions, dealerStatuses: ['draft', 'pending_review', 'verified', 'suspended', 'archived'], relationshipStates: ['candidate', 'invited', 'responded', 'selected', 'declined', 'blocked'] });
});

// Meta Ads remains opt-in. Credentials, when added, must stay server-side.
app.get('/api/crm/ads', async (req, res) => {
  if (!crmGuard(req, res)) return;
  const days = Math.min(Math.max(Number(req.query.days || 30), 1), 90);
  const enabled = String(process.env.META_ADS_CONNECTOR_ENABLED || '').trim().toLowerCase() === 'true';
  if (!enabled) return res.json({ ok: true, status: 'disabled', message: 'Conector Meta desactivado.', detail: 'Actívalo solo después de aprobar credenciales, scopes y base legal.', period: { days }, metrics: { impressions: null, clicks: null, spend: null, conversions: null }, source: 'none' });
  const configured = Boolean(process.env.META_MARKETING_ACCESS_TOKEN && process.env.META_AD_ACCOUNT_ID && process.env.META_GRAPH_API_VERSION);
  if (!configured) return res.json({ ok: true, status: 'not_configured', message: 'Conector Meta sin configurar.', detail: 'Faltan credenciales server-side; no se muestran ceros como sustituto.', period: { days }, metrics: { impressions: null, clicks: null, spend: null, conversions: null }, source: 'none' });
  const end = new Date(), start = new Date(end.getTime() - days * 86400000), version = process.env.META_GRAPH_API_VERSION.replace(/^v/i, 'v'), account = process.env.META_AD_ACCOUNT_ID.startsWith('act_') ? process.env.META_AD_ACCOUNT_ID : `act_${process.env.META_AD_ACCOUNT_ID}`;
  const url = new URL(`https://graph.facebook.com/${version}/${account}/insights`); url.searchParams.set('fields', 'impressions,clicks,spend,actions'); url.searchParams.set('time_range', JSON.stringify({ since: start.toISOString().slice(0, 10), until: end.toISOString().slice(0, 10) }));
  try { const response = await fetch(url, { headers: { Authorization: `Bearer ${process.env.META_MARKETING_ACCESS_TOKEN}` }, signal: AbortSignal.timeout(10000) }); const payload = await response.json().catch(() => ({})); if (!response.ok || payload.error) throw new Error(payload.error?.message || 'Meta Graph API rechazó la consulta.'); const row = payload.data?.[0] || {}; const conversions = (row.actions || []).filter((action) => ['lead', 'complete_registration', 'purchase'].includes(action.action_type)).reduce((total, action) => total + Number(action.value || 0), 0); return res.json({ ok: true, status: 'ready', message: 'Datos de Meta disponibles.', detail: 'Insights agregados de la cuenta publicitaria.', period: { days, since: start.toISOString(), until: end.toISOString() }, metrics: { impressions: Number(row.impressions || 0), clicks: Number(row.clicks || 0), spend: row.spend == null ? null : Number(row.spend), conversions }, source: 'meta_marketing_api' }); } catch (error) { console.error('Meta Ads insights unavailable:', error.message); return res.status(502).json({ ok: false, status: 'error', message: 'No se pudieron consultar los datos de Meta.', detail: 'Revisa token, cuenta, versión de API y permiso ads_read.', period: { days }, metrics: { impressions: null, clicks: null, spend: null, conversions: null }, source: 'meta_marketing_api' }); }
});

app.get('/api/crm/summary', async (req, res) => {
  if (!crmGuard(req, res)) return;
  try {
    const [[cases]] = await pool.query('SELECT COUNT(*) AS total, SUM(stage IN (\'visitor\', \'diagnostic_started\', \'report_requested\', \'report_verified\')) AS diagnostics, SUM(stage IN (\'purchased\', \'aftercare\')) AS aftercare, SUM(next_action_at IS NOT NULL AND next_action_at < CURRENT_TIMESTAMP AND stage NOT IN (\'closed\', \'withdrawn\', \'blocked\')) AS overdue FROM crm_cases WHERE deleted_at IS NULL');
    const [stageRows] = await pool.query('SELECT stage, COUNT(*) AS total FROM crm_cases WHERE deleted_at IS NULL GROUP BY stage ORDER BY total DESC, stage ASC');
    const [[dealers]] = await pool.query('SELECT COUNT(*) AS total, SUM(status = \'verified\') AS verified FROM crm_dealers WHERE archived_at IS NULL');
    const [[tasks]] = await pool.query('SELECT COUNT(*) AS open FROM crm_aftercare_tasks WHERE status = \'open\'');
    return res.json({ ok: true, cases: { ...(cases || {}), byStage: Object.fromEntries(stageRows.map((row) => [row.stage, Number(row.total)])) }, dealers: dealers || {}, aftercare: tasks || {} });
  } catch (error) { console.error('CRM summary unavailable:', error.message); return res.status(503).json({ ok: false, message: 'No se ha podido consultar el resumen.' }); }
});

app.get('/api/crm/dealers', async (req, res) => {
  if (!crmGuard(req, res)) return;
  try {
    const [rows] = await pool.query('SELECT id, legal_name AS legalName, trade_name AS tradeName, website, status, verification_status AS verificationStatus, contract_status AS contractStatus, data_processing_status AS dataProcessingStatus, created_at AS createdAt FROM crm_dealers WHERE archived_at IS NULL ORDER BY updated_at DESC');
    return res.json({ ok: true, dealers: rows });
  } catch (error) { console.error('CRM dealers unavailable:', error.message); return res.status(503).json({ ok: false, message: 'No se han podido consultar los concesionarios.' }); }
});

app.get('/api/crm/dealers/:id/contacts', async (req, res) => {
  if (!crmGuard(req, res)) return;
  const dealerId = crmId(req.params.id);
  if (!dealerId) return res.status(400).json({ ok: false, message: 'Concesionario no válido.' });
  try {
    const [rows] = await pool.execute('SELECT id, contact_name AS contactName, role, email, phone, whatsapp, preferred_channel AS preferredChannel, consent_status AS consentStatus, created_at AS createdAt FROM crm_dealer_contacts WHERE dealer_id = ? AND deleted_at IS NULL ORDER BY created_at ASC, id ASC', [dealerId]);
    return res.json({ ok: true, dealerId, contacts: rows });
  } catch (error) { console.error('CRM dealer contacts unavailable:', error.message); return res.status(503).json({ ok: false, message: 'No se han podido consultar los contactos del concesionario.' }); }
});

app.get('/api/crm/cases', async (req, res) => {
  if (!crmGuard(req, res)) return;
  const stage = crmText(req.query.stage, 40), source = crmText(req.query.source, 40), assignedTo = crmText(req.query.assignedTo, 80), priority = crmText(req.query.priority, 16);
  try {
    const [rows] = await pool.execute('SELECT id, lead_id AS leadId, purchase_request_id AS purchaseRequestId, stage, source, assigned_to AS assignedTo, priority, next_action_at AS nextActionAt, created_at AS createdAt, updated_at AS updatedAt FROM crm_cases WHERE deleted_at IS NULL AND (? IS NULL OR stage = ?) AND (? IS NULL OR source = ?) AND (? IS NULL OR assigned_to = ?) AND (? IS NULL OR priority = ?) ORDER BY next_action_at IS NULL, next_action_at ASC, updated_at DESC LIMIT 200', [stage, stage, source, source, assignedTo, assignedTo, priority, priority]);
    return res.json({ ok: true, cases: rows });
  } catch (error) { console.error('CRM cases unavailable:', error.message); return res.status(503).json({ ok: false, message: 'No se han podido consultar los casos.' }); }
});

app.get('/api/crm/cases/:id', async (req, res) => {
  if (!crmGuard(req, res)) return;
  const caseId = crmId(req.params.id);
  if (!caseId) return res.status(400).json({ ok: false, message: 'Caso no válido.' });
  try {
    const [[caseRow]] = await pool.execute('SELECT id, lead_id AS leadId, purchase_request_id AS purchaseRequestId, stage, source, assigned_to AS assignedTo, priority, next_action_at AS nextActionAt, created_at AS createdAt, updated_at AS updatedAt, closed_at AS closedAt FROM crm_cases WHERE id = ? AND deleted_at IS NULL LIMIT 1', [caseId]);
    if (!caseRow) return res.status(404).json({ ok: false, message: 'Caso no encontrado.' });
    const [events] = await pool.execute('SELECT id, from_stage AS fromStage, to_stage AS toStage, actor_type AS actorType, reason, created_at AS createdAt FROM crm_case_events WHERE case_id = ? ORDER BY created_at ASC, id ASC', [caseId]);
    const [dealers] = await pool.execute('SELECT link.dealer_id AS dealerId, dealer.trade_name AS tradeName, dealer.legal_name AS legalName, link.relationship_state AS relationshipState, link.contact_authorized_at AS contactAuthorizedAt FROM crm_case_dealers link JOIN crm_dealers dealer ON dealer.id = link.dealer_id WHERE link.case_id = ? ORDER BY link.created_at ASC', [caseId]);
    const [tasks] = await pool.execute('SELECT id, task_type AS taskType, status, owner_type AS ownerType, due_at AS dueAt, notes, created_at AS createdAt FROM crm_aftercare_tasks WHERE case_id = ? ORDER BY status ASC, due_at ASC, id ASC', [caseId]);
    return res.json({ ok: true, case: caseRow, events, dealers, tasks });
  } catch (error) { console.error('CRM case detail unavailable:', error.message); return res.status(503).json({ ok: false, message: 'No se ha podido consultar el caso.' }); }
});

app.post('/api/crm/dealers', async (req, res) => {
  if (!crmGuard(req, res)) return;
  const body = req.body || {}, legalName = crmText(body.legalName, 180), contactName = crmText(body.contactName, 160);
  if (!legalName || !contactName) return res.status(400).json({ ok: false, message: 'La razón social y el contacto principal son obligatorios.' });
  const contactEmail = crmContactEmail(body.contactEmail), phone = crmContactPhone(body.phone), whatsapp = crmContactPhone(body.whatsapp);
  if ((body.contactEmail && !contactEmail) || (body.phone && !phone) || (body.whatsapp && !whatsapp)) return res.status(400).json({ ok: false, message: 'El email o teléfono del contacto no tiene un formato válido.' });
  try {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [dealer] = await connection.execute('INSERT INTO crm_dealers (legal_name, trade_name, tax_id, website, service_areas, specialties) VALUES (?, ?, ?, ?, ?, ?)', [legalName, crmText(body.tradeName, 180), crmText(body.taxId, 40), crmText(body.website, 255), crmJson(body.serviceAreas), crmJson(body.specialties)]);
      await connection.execute('INSERT INTO crm_dealer_contacts (dealer_id, contact_name, role, email, phone, whatsapp, preferred_channel) VALUES (?, ?, ?, ?, ?, ?, ?)', [dealer.insertId, contactName, crmText(body.contactRole, 100), contactEmail, phone, whatsapp, crmText(body.preferredChannel, 24)]);
      await connection.commit();
      return res.status(201).json({ ok: true, dealerId: dealer.insertId, status: 'draft', message: 'Concesionario guardado como borrador; pendiente de revisión.' });
    } catch (error) { await connection.rollback().catch(() => {}); throw error; } finally { connection.release(); }
  } catch (error) { console.error('CRM dealer creation unavailable:', error.message); return res.status(503).json({ ok: false, message: 'No se ha podido guardar el concesionario.' }); }
});

app.post('/api/crm/dealers/:id/status', async (req, res) => {
  if (!crmGuard(req, res)) return;
  const dealerId = crmId(req.params.id), status = crmText(req.body?.status, 24), verificationStatus = crmText(req.body?.verificationStatus, 24), dataProcessingStatus = crmText(req.body?.dataProcessingStatus, 24);
  if (!dealerId || !['draft', 'pending_review', 'verified', 'suspended', 'archived'].includes(status)) return res.status(400).json({ ok: false, message: 'Concesionario o estado no válidos.' });
  if (status === 'verified' && dataProcessingStatus !== 'approved') return res.status(400).json({ ok: false, message: 'No se puede verificar sin aprobación del estado de tratamiento de datos.' });
  try {
    if (status === 'verified') { const [[approvedContact]] = await pool.execute('SELECT COUNT(*) AS total FROM crm_dealer_contacts WHERE dealer_id = ? AND consent_status = ? AND deleted_at IS NULL', [dealerId, 'approved']); if (Number(approvedContact?.total || 0) < 1) return res.status(400).json({ ok: false, message: 'No se puede verificar sin al menos un contacto aprobado.' }); }
    const [result] = await pool.execute('UPDATE crm_dealers SET status = ?, verification_status = COALESCE(?, verification_status), data_processing_status = COALESCE(?, data_processing_status), archived_at = IF(? = \'archived\', CURRENT_TIMESTAMP, archived_at) WHERE id = ?', [status, verificationStatus, dataProcessingStatus, status, dealerId]);
    if (!result.affectedRows) return res.status(404).json({ ok: false, message: 'Concesionario no encontrado.' });
    return res.json({ ok: true, dealerId, status, verificationStatus: verificationStatus || null, dataProcessingStatus: dataProcessingStatus || null });
  } catch (error) { console.error('CRM dealer status unavailable:', error.message); return res.status(503).json({ ok: false, message: 'No se ha podido actualizar el estado del concesionario.' }); }
});

app.post('/api/crm/dealers/:id/contacts', async (req, res) => {
  if (!crmGuard(req, res)) return;
  const dealerId = crmId(req.params.id), contactName = crmText(req.body?.contactName, 160);
  if (!dealerId || !contactName) return res.status(400).json({ ok: false, message: 'Concesionario y nombre del contacto son obligatorios.' });
  const email = crmContactEmail(req.body?.email), phone = crmContactPhone(req.body?.phone), whatsapp = crmContactPhone(req.body?.whatsapp);
  if ((req.body?.email && !email) || (req.body?.phone && !phone) || (req.body?.whatsapp && !whatsapp)) return res.status(400).json({ ok: false, message: 'El email o teléfono del contacto no tiene un formato válido.' });
  try {
    const [dealerRows] = await pool.execute('SELECT id FROM crm_dealers WHERE id = ? AND archived_at IS NULL LIMIT 1', [dealerId]);
    if (!dealerRows[0]) return res.status(404).json({ ok: false, message: 'Concesionario no encontrado.' });
    const [result] = await pool.execute('INSERT INTO crm_dealer_contacts (dealer_id, contact_name, role, email, phone, whatsapp, preferred_channel) VALUES (?, ?, ?, ?, ?, ?, ?)', [dealerId, contactName, crmText(req.body?.role, 100), email, phone, whatsapp, crmText(req.body?.preferredChannel, 24)]);
    return res.status(201).json({ ok: true, contactId: result.insertId, status: 'pending_review' });
  } catch (error) { console.error('CRM dealer contact creation unavailable:', error.message); return res.status(503).json({ ok: false, message: 'No se ha podido guardar el contacto.' }); }
});

app.post('/api/crm/dealers/:id/contacts/:contactId/status', async (req, res) => {
  if (!crmGuard(req, res)) return;
  const dealerId = crmId(req.params.id), contactId = crmId(req.params.contactId), consentStatus = crmText(req.body?.consentStatus, 24);
  if (!dealerId || !contactId || !['pending_review', 'approved', 'rejected'].includes(consentStatus)) return res.status(400).json({ ok: false, message: 'Contacto o estado de autorización no válidos.' });
  try {
    const [result] = await pool.execute('UPDATE crm_dealer_contacts SET consent_status = ? WHERE id = ? AND dealer_id = ? AND deleted_at IS NULL', [consentStatus, contactId, dealerId]);
    if (!result.affectedRows) return res.status(404).json({ ok: false, message: 'Contacto no encontrado.' });
    return res.json({ ok: true, dealerId, contactId, consentStatus });
  } catch (error) { console.error('CRM dealer contact status unavailable:', error.message); return res.status(503).json({ ok: false, message: 'No se ha podido actualizar la autorización del contacto.' }); }
});

app.post('/api/crm/cases', async (req, res) => {
  if (!crmGuard(req, res)) return;
  const leadId = req.body?.leadId ? crmId(req.body.leadId) : null, requestId = req.body?.purchaseRequestId ? crmId(req.body.purchaseRequestId) : null;
  const stage = crmText(req.body?.stage, 40) || 'visitor';
  if (!crmStages.includes(stage)) return res.status(400).json({ ok: false, message: 'Etapa no válida.' });
  const priority = crmText(req.body?.priority, 16) || 'normal';
  if (!['low', 'normal', 'high'].includes(priority)) return res.status(400).json({ ok: false, message: 'Prioridad no válida.' });
  try {
    const [result] = await pool.execute('INSERT INTO crm_cases (lead_id, purchase_request_id, stage, source, assigned_to, priority, next_action_at, consent_snapshot) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [leadId, requestId, stage, crmText(req.body?.source, 40) || 'manual', crmText(req.body?.assignedTo, 80), priority, crmText(req.body?.nextActionAt, 32), req.body?.consentSnapshot ? JSON.stringify(req.body.consentSnapshot) : null]);
    await pool.execute('INSERT INTO crm_case_events (case_id, to_stage, actor_type, reason) VALUES (?, ?, ?, ?)', [result.insertId, stage, 'admin', 'Alta manual']);
    return res.status(201).json({ ok: true, caseId: result.insertId, stage });
  } catch (error) { console.error('CRM case creation unavailable:', error.message); return res.status(503).json({ ok: false, message: 'No se ha podido crear el caso.' }); }
});

app.post('/api/crm/cases/:id/events', async (req, res) => {
  if (!crmGuard(req, res)) return;
  const caseId = crmId(req.params.id), toStage = crmText(req.body?.toStage, 40), reason = crmOperationalNote(req.body?.reason);
  if (req.body?.reason && !reason) return res.status(400).json({ ok: false, message: 'El motivo no puede contener emails o teléfonos.' });
  if (!caseId || !crmStages.includes(toStage)) return res.status(400).json({ ok: false, message: 'Caso o etapa no válidos.' });
  try {
    const [rows] = await pool.execute('SELECT stage FROM crm_cases WHERE id = ? AND deleted_at IS NULL LIMIT 1', [caseId]);
    const current = rows[0];
    if (!current) return res.status(404).json({ ok: false, message: 'Caso no encontrado.' });
    if (!crmTransitions[current.stage]?.includes(toStage)) return res.status(409).json({ ok: false, message: `Transición no permitida: ${current.stage} → ${toStage}.` });
    if (toStage === 'closed') { const [[openTasks]] = await pool.execute('SELECT COUNT(*) AS total FROM crm_aftercare_tasks WHERE case_id = ? AND status = ?', [caseId, 'open']); if (Number(openTasks?.total || 0) > 0) return res.status(409).json({ ok: false, message: 'Completa las tareas abiertas antes de cerrar el caso.' }); }
    const connection = await pool.getConnection();
    try { await connection.beginTransaction(); await connection.execute('UPDATE crm_cases SET stage = ?, closed_at = IF(? = \'closed\', CURRENT_TIMESTAMP, closed_at) WHERE id = ?', [toStage, toStage, caseId]); await connection.execute('INSERT INTO crm_case_events (case_id, from_stage, to_stage, actor_type, reason) VALUES (?, ?, ?, ?, ?)', [caseId, current.stage, toStage, 'admin', reason]); await connection.commit(); } catch (error) { await connection.rollback().catch(() => {}); throw error; } finally { connection.release(); }
    return res.json({ ok: true, caseId, fromStage: current.stage, toStage });
  } catch (error) { console.error('CRM transition unavailable:', error.message); return res.status(503).json({ ok: false, message: 'No se ha podido actualizar el caso.' }); }
});

app.post('/api/crm/cases/:id/dealers', async (req, res) => {
  if (!crmGuard(req, res)) return;
  const caseId = crmId(req.params.id), dealerId = crmId(req.body?.dealerId);
  const relationshipState = crmText(req.body?.relationshipState, 24) || 'candidate';
  if (!caseId || !dealerId || !['candidate', 'invited', 'responded', 'selected', 'declined', 'blocked'].includes(relationshipState)) return res.status(400).json({ ok: false, message: 'Caso, concesionario o relación no válidos.' });
  try {
    const [[caseRow]] = await pool.execute('SELECT id FROM crm_cases WHERE id = ? AND deleted_at IS NULL LIMIT 1', [caseId]);
    if (!caseRow) return res.status(404).json({ ok: false, message: 'Caso no encontrado.' });
    const [[dealerRow]] = await pool.execute('SELECT id, status, data_processing_status AS dataProcessingStatus FROM crm_dealers WHERE id = ? AND archived_at IS NULL LIMIT 1', [dealerId]);
    if (!dealerRow) return res.status(404).json({ ok: false, message: 'Concesionario no encontrado.' });
    if (relationshipState === 'selected') {
      const [[approvedContact]] = await pool.execute('SELECT COUNT(*) AS total FROM crm_dealer_contacts WHERE dealer_id = ? AND consent_status = ? AND deleted_at IS NULL', [dealerId, 'approved']);
      if (dealerRow.status !== 'verified' || dealerRow.dataProcessingStatus !== 'approved' || Number(approvedContact?.total || 0) < 1) return res.status(409).json({ ok: false, message: 'Solo puede seleccionarse un concesionario verificado, con tratamiento aprobado y contacto aprobado.' });
    }
    await pool.execute('INSERT INTO crm_case_dealers (case_id, dealer_id, relationship_state) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE relationship_state = VALUES(relationship_state), updated_at = CURRENT_TIMESTAMP', [caseId, dealerId, relationshipState]);
    return res.status(201).json({ ok: true, caseId, dealerId, relationshipState });
  } catch (error) { console.error('CRM case dealer link unavailable:', error.message); return res.status(503).json({ ok: false, message: 'No se ha podido asociar el concesionario.' }); }
});

app.post('/api/crm/cases/:id/aftercare', async (req, res) => {
  if (!crmGuard(req, res)) return;
  const caseId = crmId(req.params.id), taskType = crmText(req.body?.taskType, 32);
  if (!caseId || !['documentation', 'inspection', 'insurance', 'transfer', 'delivery', 'finance_review', 'maintenance', 'first_service', 'warranty', 'warranty_claim', 'followup'].includes(taskType)) return res.status(400).json({ ok: false, message: 'Caso o tipo de tarea no válidos.' });
  const dueAt = crmText(req.body?.dueAt, 32), notes = crmOperationalNote(req.body?.notes);
  if (req.body?.notes && !notes) return res.status(400).json({ ok: false, message: 'La nota no puede contener emails o teléfonos; usa el contacto restringido.' });
  try {
    const [caseRows] = await pool.execute('SELECT id, stage FROM crm_cases WHERE id = ? AND deleted_at IS NULL LIMIT 1', [caseId]);
    const currentCase = caseRows[0];
    if (!currentCase) return res.status(404).json({ ok: false, message: 'Caso no encontrado.' });
    const [result] = await pool.execute('INSERT INTO crm_aftercare_tasks (case_id, task_type, owner_type, owner_id, due_at, notes) VALUES (?, ?, ?, ?, ?, ?)', [caseId, taskType, crmText(req.body?.ownerType, 24) || 'internal', crmText(req.body?.ownerId, 80), dueAt || null, notes]);
    if (currentCase.stage === 'purchased' && crmTransitions[currentCase.stage]?.includes('aftercare')) { await pool.execute('UPDATE crm_cases SET stage = ? WHERE id = ?', ['aftercare', caseId]); await pool.execute('INSERT INTO crm_case_events (case_id, from_stage, to_stage, actor_type, reason) VALUES (?, ?, ?, ?, ?)', [caseId, currentCase.stage, 'aftercare', 'admin', 'Tarea de poscompra creada']); }
    return res.status(201).json({ ok: true, taskId: result.insertId, status: 'open' });
  } catch (error) { console.error('CRM aftercare creation unavailable:', error.message); return res.status(503).json({ ok: false, message: 'No se ha podido crear la tarea.' }); }
});

app.post('/api/crm/aftercare/:id/complete', async (req, res) => {
  if (!crmGuard(req, res)) return;
  const taskId = crmId(req.params.id);
  if (!taskId) return res.status(400).json({ ok: false, message: 'Tarea no válida.' });
  try {
    const [[task]] = await pool.execute('SELECT task.id, task.case_id AS caseId, cases.stage FROM crm_aftercare_tasks task JOIN crm_cases cases ON cases.id = task.case_id WHERE task.id = ? AND task.status = \'open\' AND cases.deleted_at IS NULL LIMIT 1', [taskId]);
    if (!task) return res.status(404).json({ ok: false, message: 'Tarea no encontrada, ya completada o caso no disponible.' });
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.execute('UPDATE crm_aftercare_tasks SET status = \'completed\' WHERE id = ? AND status = \'open\'', [taskId]);
      await connection.execute('INSERT INTO crm_case_events (case_id, from_stage, to_stage, actor_type, reason, metadata) VALUES (?, ?, ?, ?, ?, ?)', [task.caseId, task.stage, task.stage, 'admin', 'Tarea de acompañamiento completada', JSON.stringify({ taskId })]);
      await connection.commit();
    } catch (error) { await connection.rollback().catch(() => {}); throw error; } finally { connection.release(); }
    return res.json({ ok: true, taskId, caseId: task.caseId, status: 'completed', tracked: true });
  } catch (error) { console.error('CRM aftercare completion unavailable:', error.message); return res.status(503).json({ ok: false, message: 'No se ha podido completar la tarea.' }); }
});

app.get('/api/crm/aftercare', async (req, res) => {
  if (!crmGuard(req, res)) return;
  const status = crmText(req.query.status, 24) || 'open';
  if (!['open', 'completed'].includes(status)) return res.status(400).json({ ok: false, message: 'Estado de tarea no válido.' });
  try {
    const [rows] = await pool.execute('SELECT task.id, task.case_id AS caseId, task.task_type AS taskType, task.status, task.owner_type AS ownerType, task.due_at AS dueAt, task.notes, crm.stage FROM crm_aftercare_tasks task JOIN crm_cases crm ON crm.id = task.case_id WHERE task.status = ? AND crm.deleted_at IS NULL ORDER BY task.due_at IS NULL, task.due_at ASC, task.id ASC LIMIT 200', [status]);
    return res.json({ ok: true, tasks: rows });
  } catch (error) { console.error('CRM aftercare list unavailable:', error.message); return res.status(503).json({ ok: false, message: 'No se han podido consultar las tareas.' }); }
});

app.post('/api/nearby-services', async (req, res) => {
  if (!rateLimit(req.ip || 'unknown')) return res.status(429).json({ ok: false, message: 'Demasiadas búsquedas. Inténtalo de nuevo más tarde.' });
  const body = req.body || {}, lat = Number(body.lat), lon = Number(body.lon), radius = Number(body.radius || 10000), category = String(body.category || 'dealer');
  if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lon) || lon < -180 || lon > 180 || ![2000, 5000, 10000, 25000].includes(radius) || !nearbyCategories[category]) return res.status(400).json({ ok: false, message: 'Ubicación, radio o categoría no válidos.' });
  const filters = nearbyCategories[category].filters.map((filter) => `${filter}(around:${radius},${lat},${lon});`).join('');
  const query = `[out:json][timeout:20];(${filters});out center tags 80;`;
  for (const endpoint of overpassEndpoints) { try { const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'CocheCierto/1.0 (https://cochecierto.com)' }, body: new URLSearchParams({ data: query }), signal: AbortSignal.timeout(15000) }); if (!response.ok) continue; const payload = await response.json(); const toRad = (value) => value * Math.PI / 180; const distance = (item) => { const point = item.lat != null ? item : item.center || {}; const a = Math.sin(toRad(Number(point.lat) - lat) / 2) ** 2 + Math.cos(toRad(lat)) * Math.cos(toRad(Number(point.lat))) * Math.sin(toRad(Number(point.lon) - lon) / 2) ** 2; return Math.round(6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))); }; const places = (payload.elements || []).map((item) => { const point = item.lat != null ? item : item.center || {}; const tags = item.tags || {}; return { id: `${item.type}-${item.id}`, osmType: item.type, name: tags.name || null, category: nearbyCategories[category].label, latitude: Number(point.lat), longitude: Number(point.lon), address: [tags['addr:street'], tags['addr:housenumber'], tags['addr:postcode'], tags['addr:city']].filter(Boolean).join(', ') || null, phone: tags.phone || tags['contact:phone'] || null, website: tags.website || tags['contact:website'] || null, openingHours: tags.opening_hours || null, distanceMeters: distance(point), source: 'OpenStreetMap' }; }).filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude)).sort((a, b) => a.distanceMeters - b.distanceMeters).slice(0, 50); return res.json({ ok: true, source: 'OpenStreetMap', category, radius, places }); } catch (error) { console.error('Nearby services unavailable:', error.message); } }
  return res.status(503).json({ ok: false, message: 'El servicio de mapas está temporalmente saturado. Inténtalo de nuevo en unos minutos.' });
});

app.post('/api/dealer-request-pdf', async (req, res) => {
  if (!rateLimit(req.ip || 'unknown')) return res.status(429).json({ ok: false, message: 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.' });
  const body = req.body || {}, profile = body.profile || {};
  const translations = { high: 'alto', medium: 'medio', low: 'bajo', mixed: 'ciudad y carretera', city: 'ciudad', road: 'carretera', work: 'trabajo', family: 'familia', 'one-two': '1–2', 'three-four': '3–4', 'five-plus': '5 o más', repairs: 'averías', price: 'precio', fuel: 'consumo', safety: 'seguridad', space: 'espacio', resale: 'reventa', yes: 'sí', sometimes: 'a veces', always: 'habitualmente', never: 'nunca', no: 'no', private: 'particular', professional: 'profesional', '0-3': 'En los próximos 3 meses', '3-6': 'Entre 3 y 6 meses', '6+': 'Más adelante', unknown: 'Por concretar' };
  const clean = (value) => { const text = typeof value === 'string' ? value.replace(/[\r\n]/g, ' ').trim() : ''; return (translations[text] || text || 'Por concretar').slice(0, 120); };
  const radiusValue = Number(body.radius), radiusKm = Number.isFinite(radiusValue) ? (radiusValue > 100 ? radiusValue / 1000 : radiusValue) : null;
  const radiusLabel = radiusKm == null ? 'por concretar' : `${radiusKm.toLocaleString('es-ES', { maximumFractionDigits: 1 })} km`;
  let resourcesQr = null;
  try { resourcesQr = await QRCode.toDataURL(resourcesUrl, { margin: 0, width: 96 }); } catch (error) { console.warn('Resources QR unavailable:', error.message); }
  const document = new PDFDocument({ size: 'A4', margins: { top: 52, bottom: 52, left: 54, right: 54 }, info: { Title: 'Petición orientativa para concesionario | CocheCierto', Author: 'CocheCierto', Subject: 'Necesidades declaradas para preparar una propuesta' } });
  res.setHeader('Content-Type', 'application/pdf'); res.setHeader('Content-Disposition', 'attachment; filename="ficha-oferta-ajustada-cochecierto.pdf"'); document.pipe(res);
  const navy = '#082d46', orange = '#fc4c02', muted = '#58717d', pale = '#eef8f4';
  const section = (title) => { document.moveDown(.8).font('Helvetica-Bold').fontSize(11).fillColor(orange).text(title.toUpperCase(), { characterSpacing: .7 }); document.moveDown(.25).font('Helvetica').fontSize(10).fillColor(navy); };
  document.rect(0, 0, 595, 126).fill(navy); const logoPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'brand-lockup-official.png'); if (fs.existsSync(logoPath)) document.image(logoPath, 54, 27, { width: 178 }); else document.fillColor('#ffffff').font('Helvetica-Bold').fontSize(24).text('CocheCierto', 54, 42); document.fillColor('#b8cbd2').font('Helvetica').fontSize(10).text('PETICIÓN ORIENTATIVA PARA CONCESIONARIO', 54, 86); if (resourcesQr) document.image(resourcesQr, 474, 20, { width: 72 }); document.fillColor(navy).font('Helvetica-Bold').fontSize(15).text('Confeccionado por CocheCierto para ayudar a compradores a encontrar su mejor opción según sus necesidades.', 54, 148, { width: 487, lineGap: 3 }); document.font('Helvetica').fontSize(10).text(`Zona aproximada: ${clean(body.area)}  |  Radio de referencia: ${radiusLabel}`, 54, 194);
  section('Objetivo de la petición'); document.text('Esta ficha resume las necesidades declaradas por la persona compradora para que un concesionario o vendedor pueda preparar un presupuesto y enviarlo a la persona interesada. No solicita una marca, modelo o precio concreto: pide alternativas y diferencias explicadas.');
  section('Perfil de uso'); [['Categoría', profile.category], ['Carrocería', profile.body], ['Uso principal', profile.usage], ['Horizonte de compra', profile.purchaseWindow], ['Kilómetros declarados', profile.kilometres], ['Personas habituales', profile.people], ['Presupuesto declarado', profile.budget], ['Prioridad', profile.priority], ['ZBE o restricciones', profile.zbe]].forEach(([label, value]) => document.fillColor(navy).font('Helvetica-Bold').text(`${label}: `, { continued: true }).font('Helvetica').text(clean(value)));
  section('Datos que debe incluir la oferta'); ['Vehículo propuesto, versión, motor y equipamiento incluido.', 'Precio final desglosado, impuestos, matriculación y gastos adicionales.', 'Disponibilidad, plazo de entrega y condiciones de reserva.', 'Garantía, historial, kilometraje y estado de la unidad si es usada.', 'Financiación solo si se solicita: entrada, TAE, plazo, cuota y coste total.', 'Elementos opcionales separados del equipamiento necesario.', 'Condiciones de prueba, inspección independiente y desistimiento.'].forEach((item) => document.text(`• ${item}`, { indent: 10, hanging: 5 }));
  section('Respuesta útil para comparar'); document.text('Para que la persona pueda decidir con criterio, presenta una opción principal y, si es posible, una alternativa. Explica en una línea qué necesidad resuelve cada una y qué diferencia de coste implica. Señala expresamente cualquier dato pendiente de confirmar.');
  section('Criterios de ajuste'); document.rect(54, document.y, 487, 50).fill(pale); document.fillColor(navy).font('Helvetica').text('Prioriza lo que resuelve el uso declarado. No añadas paquetes, servicios o extras sin explicar su utilidad y coste. Si un dato no está confirmado, indícalo como pendiente.', 68, document.y + 14, { width: 460 });
  section('Siguiente paso'); document.text('Preparar una propuesta clara, comparar al menos una alternativa y confirmar por escrito disponibilidad, condiciones y coste total antes de pagar.');
  document.moveDown(1.2).strokeColor('#d7e2df').moveTo(54, document.y).lineTo(541, document.y).stroke().moveDown(.5).fontSize(8).fillColor(muted).text('cochecierto.com  ·  Documento orientativo para facilitar una propuesta comercial.', { width: 487 }); document.moveDown(.35).fontSize(7.5).text('Aviso: este documento no es un documento oficial de ninguna asociación ni de la asociación de Freight. Es una ficha informativa confeccionada por CocheCierto para ayudar a un concesionario o vendedor a preparar un presupuesto según las necesidades declaradas. No constituye una oferta, tasación, certificación, garantía mecánica ni asesoramiento financiero o jurídico. La disponibilidad, el precio, las condiciones y el estado del vehículo deben confirmarse por escrito.'); document.end();
});

app.get('/api/crm/metrics', async (req, res) => {
  if (!crmGuard(req, res)) return;
  const days = Math.min(Math.max(Number(req.query.days || 30), 1), 365);
  try {
    const [[cases]] = await pool.query('SELECT COUNT(*) AS total, COALESCE(SUM(stage NOT IN (\'closed\', \'withdrawn\', \'blocked\')), 0) AS active, COALESCE(SUM(stage = \'purchased\' OR stage = \'aftercare\'), 0) AS won, COALESCE(SUM(stage IN (\'withdrawn\', \'blocked\')), 0) AS lost, COALESCE(SUM(next_action_at IS NOT NULL AND next_action_at < CURRENT_TIMESTAMP AND stage NOT IN (\'closed\', \'withdrawn\', \'blocked\')), 0) AS overdue FROM crm_cases WHERE deleted_at IS NULL AND created_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL ? DAY)', [days]);
    const [funnelRows] = await pool.query('SELECT stage, COUNT(*) AS total FROM crm_cases WHERE deleted_at IS NULL AND created_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL ? DAY) GROUP BY stage', [days]);
    const [[dealers]] = await pool.query('SELECT COUNT(*) AS total, COALESCE(SUM(status = \'active\' OR status = \'verified\'), 0) AS active, COALESCE(SUM(status = \'verified\'), 0) AS verified FROM crm_dealers WHERE archived_at IS NULL AND created_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL ? DAY)', [days]);
    const [[tasks]] = await pool.query('SELECT COUNT(*) AS total, COALESCE(SUM(status = \'open\'), 0) AS open, COALESCE(SUM(status = \'open\' AND due_at < CURRENT_TIMESTAMP), 0) AS overdue FROM crm_aftercare_tasks WHERE created_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL ? DAY)', [days]);
    const [[partnerFlow]] = await pool.query("SELECT COUNT(*) AS invited, COALESCE(SUM(relationship_state IN ('responded', 'selected')), 0) AS responded, COALESCE(SUM(relationship_state = 'selected'), 0) AS selected FROM crm_case_dealers WHERE created_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL ? DAY)", [days]);
    const [[consent]] = await pool.query("SELECT COALESCE(SUM(JSON_EXTRACT(consent_snapshot, '$.contact') = true), 0) AS authorized FROM crm_cases WHERE deleted_at IS NULL AND created_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL ? DAY)", [days]);
    const [eventRows] = await pool.query('SELECT event_type AS eventType, COUNT(*) AS total FROM crm_product_events WHERE created_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL ? DAY) GROUP BY event_type ORDER BY total DESC', [days]);
    const [attributionRows] = await pool.query("SELECT COALESCE(source, 'unknown') AS source, COUNT(*) AS total FROM crm_product_events WHERE event_type = 'lead_attributed' AND created_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL ? DAY) GROUP BY source ORDER BY total DESC", [days]);
    const funnel = Object.fromEntries(funnelRows.map((row) => [row.stage, Number(row.total)]));
    const total = Number(cases?.total || 0), won = Number(cases?.won || 0);
    const invited = Number(partnerFlow?.invited || 0), responded = Number(partnerFlow?.responded || 0);
    return res.json({ ok: true, period: { days }, cases: { ...(cases || {}), conversionToWon: total ? Number((won / total * 100).toFixed(1)) : null }, funnel, dealers: dealers || {}, tasks: tasks || {}, partnerFlow: { ...(partnerFlow || {}), responseRate: invited ? Number((responded / invited * 100).toFixed(1)) : null }, consent: consent || {}, events: Object.fromEntries(eventRows.map((row) => [row.eventType, Number(row.total)])), attribution: Object.fromEntries(attributionRows.map((row) => [row.source, Number(row.total)])), saas: { mrr: null, arr: null, churn: null, ltv: null, cac: null, status: 'not_available', reason: 'No hay suscripciones ni costes de adquisición conectados todavía.' }, definitions: { conversionToWon: 'casos ganados / casos creados en el periodo', partnerResponseRate: 'partners que respondieron o fueron seleccionados / invitaciones', attribution: 'leads con UTMs / leads registrados; unidad: lead atribuido', active: 'casos no cerrados, retirados o bloqueados', dataPolicy: 'Solo datos agregados; sin PII.' } });
  } catch (error) { console.error('CRM metrics unavailable:', error.message); return res.status(503).json({ ok: false, message: 'No se han podido calcular las métricas.' }); }
});

app.get('/api/crm/observability', async (req, res) => {
  if (!crmGuard(req, res)) return;
  const days = Math.min(Math.max(Number(req.query.days || 7), 1), 90);
  try {
    const [[events]] = await pool.query('SELECT COUNT(*) AS total, COUNT(DISTINCT event_type) AS types FROM crm_product_events WHERE created_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL ? DAY)', [days]);
    const [byType] = await pool.query('SELECT event_type AS eventType, COUNT(*) AS total FROM crm_product_events WHERE created_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL ? DAY) GROUP BY event_type ORDER BY total DESC', [days]);
    const [[failures]] = await pool.query("SELECT COUNT(*) AS total FROM crm_product_events WHERE event_type = 'social_sync_failed' AND created_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL ? DAY)", [days]);
    const [overdue] = await pool.query("SELECT id, case_id AS caseId, task_type AS taskType, due_at AS dueAt FROM crm_aftercare_tasks WHERE status = 'open' AND due_at < CURRENT_TIMESTAMP ORDER BY due_at ASC LIMIT 20");
    const alerts = [];
    if (Number(failures?.total || 0) > 0) alerts.push({ code: 'social_sync_failed', severity: 'warning', message: 'Hay sincronizaciones sociales fallidas.', action: 'Revisar credenciales y reintentar desde el adaptador autorizado.' });
    if (overdue.length) alerts.push({ code: 'overdue_tasks', severity: 'warning', message: `${overdue.length} tarea(s) de acompañamiento vencida(s).`, action: 'Asignar responsable y actualizar la próxima acción.' });
    return res.json({ ok: true, period: { days, since: new Date(Date.now() - days * 86400000).toISOString() }, definitions: { events: 'Eventos idempotentes registrados', emailSent: 'email_sent / total de email intentados', emailClicks: 'email_clicked / emails enviados', socialClicks: 'outbound_social_clicked / clics salientes desde la web', unit: 'evento' }, events: { ...(events || {}), byType: Object.fromEntries(byType.map((row) => [row.eventType, Number(row.total)])) }, integrations: { email: 'instrumentación preparada; proveedor desactivado', social: 'API desactivada hasta autorización específica' }, alerts, overdueTasks: overdue });
  } catch (error) { console.error('CRM observability unavailable:', error.message); return res.status(503).json({ ok: false, message: 'No se ha podido consultar la observabilidad. Aplica CRM 003 si falta el esquema.' }); }
});

app.get('/api/crm/exit-feedback', async (req, res) => {
  if (!crmGuard(req, res)) return;
  const days = Math.min(Math.max(Number(req.query.days || 30), 1), 365);
  try { const assistantOnly = req.query.assistant === '1'; const [rows] = await pool.execute(`SELECT usefulness, COUNT(*) AS total FROM exit_feedback WHERE created_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL ? DAY) ${assistantOnly ? "AND reason = 'clara_onboarding'" : ''} GROUP BY usefulness ORDER BY total DESC`, [days]); return res.json({ ok: true, period: { days }, rows: rows.map((row) => ({ usefulness: row.usefulness, total: Number(row.total) })), source: assistantOnly ? 'clara_onboarding' : 'own_feedback', definition: 'Respuestas agregadas; sin PII.' }); } catch (error) { console.error('CRM exit feedback unavailable:', error.message); return res.status(503).json({ ok: false, message: 'No se ha podido consultar el feedback.' }); }
});

app.get('/api/crm/voice', async (req, res) => {
  if (!crmGuard(req, res)) return;
  if (!pool) return res.status(503).json({ ok: false, message: 'CRM sin base de datos configurada.' });
  const days = Math.min(365, Math.max(1, Number(req.query.days || 30)));
  const maskEmail = (email) => { const [local, domain] = String(email || '').split('@'); return local && domain ? `${local.slice(0, 1)}***@${domain}` : '—'; };
  try {
    const [[totals]] = await pool.query(`SELECT COUNT(*) AS leads, SUM(email_status IN ('sent','verified')) AS emailsSent, SUM(verified_at IS NOT NULL) AS validated, SUM(pdf_downloaded_at IS NOT NULL) AS pdfDownloaded, SUM(verification_expires_at IS NOT NULL AND verification_expires_at < NOW() AND verified_at IS NULL) AS expired, SUM(email_status = 'send_failed') AS failed FROM leads WHERE created_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL ? DAY)`, [days]);
    const [rows] = await pool.query(`SELECT id, name, email, created_at AS createdAt, email_status AS emailStatus, verified_at AS verifiedAt, pdf_downloaded_at AS pdfDownloadedAt, verification_expires_at AS expiresAt, GREATEST(created_at, COALESCE(email_last_sent_at, created_at), COALESCE(verified_at, created_at), COALESCE(pdf_downloaded_at, created_at)) AS lastActivity FROM leads WHERE created_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL ? DAY) ORDER BY created_at DESC LIMIT 100`, [days]);
    const leads = rows.map((lead) => { const expired = !lead.verifiedAt && lead.expiresAt && new Date(lead.expiresAt) < new Date(); const state = lead.pdfDownloadedAt ? 'PDF descargado' : lead.verifiedAt ? 'Email validado' : expired ? 'Validación caducada' : lead.emailStatus === 'send_failed' ? 'Email fallido' : lead.emailStatus === 'sent' ? 'Email enviado' : 'Nuevo'; return { id: lead.id, name: lead.name || 'Sin nombre', email: maskEmail(lead.email), createdAt: lead.createdAt, state, emailStatus: lead.emailStatus, verified: Boolean(lead.verifiedAt), pdfDownloaded: Boolean(lead.pdfDownloadedAt), lastActivity: lead.lastActivity }; });
    return res.json({ ok: true, period: { days }, metrics: { leads: Number(totals.leads || 0), emailsSent: Number(totals.emailsSent || 0), validated: Number(totals.validated || 0), pdfDownloaded: Number(totals.pdfDownloaded || 0), expired: Number(totals.expired || 0), failed: Number(totals.failed || 0), feedback: null, averageRating: null }, leads, definitions: { feedback: 'Opiniones agregadas; no vinculadas a un lead individual.', averageRating: 'No disponible: la encuesta actual usa categorías, no una escala numérica.' } });
  } catch (error) { console.error('CRM voice unavailable:', error.message); return res.status(500).json({ ok: false, message: 'No se pudo consultar el seguimiento de leads.' }); }
});

app.get('/api/crm/newsletter', async (req, res) => {
  if (!crmGuard(req, res)) return;
  if (!pool) return res.status(503).json({ ok: false, message: 'CRM sin base de datos configurada.' });
  const days = Math.min(365, Math.max(1, Number(req.query.days || 30)));
  try {
    const [[totals]] = await pool.query(`SELECT SUM(newsletter_status IN ('pending_confirmation','subscribed')) AS optedIn, SUM(newsletter_status = 'pending_confirmation') AS pending, SUM(newsletter_status = 'paused') AS paused, SUM(newsletter_status = 'unsubscribed') AS unsubscribed, SUM(newsletter_consent_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL ? DAY)) AS newSignups FROM leads`, [days]);
    return res.json({ ok: true, active: false, period: { days }, metrics: { optedIn: Number(totals.optedIn || 0), pending: Number(totals.pending || 0), paused: Number(totals.paused || 0), unsubscribed: Number(totals.unsubscribed || 0), newSignups: Number(totals.newSignups || 0), deliveryRate: null, openRate: null, clickRate: null, unsubscribeRate: null }, definitions: { active: 'La suscripción requiere confirmación explícita; el envío masivo sigue desactivado en el MVP.' } });
  } catch (error) { console.error('CRM newsletter unavailable:', error.message); return res.status(500).json({ ok: false, message: 'No se pudo consultar la newsletter.' }); }
});

app.post('/api/crm/events', async (req, res) => {
  if (!crmGuard(req, res)) return;
  const eventId = crmText(req.body?.eventId, 64), eventType = crmText(req.body?.eventType, 48);
  const allowed = ['email_sent', 'email_clicked', 'outbound_social_clicked', 'share_created', 'share_opened', 'referred_user_activated', 'social_sync_failed'];
  if (!eventId || !eventType || !allowed.includes(eventType)) return res.status(400).json({ ok: false, message: 'Evento o event_id no válidos.' });
  try { const [result] = await pool.execute('INSERT IGNORE INTO crm_product_events (event_id, event_type, case_id, source, campaign, metadata) VALUES (?, ?, ?, ?, ?, ?)', [eventId, eventType, crmId(req.body?.caseId), crmText(req.body?.source, 80), crmText(req.body?.campaign, 120), req.body?.metadata ? JSON.stringify(req.body.metadata) : null]); return res.status(201).json({ ok: true, recorded: result.affectedRows === 1, duplicate: result.affectedRows === 0 }); }
  catch (error) { console.error('CRM event unavailable:', error.message); return res.status(503).json({ ok: false, message: 'No se ha podido registrar el evento.' }); }
});

app.post('/api/geocode', async (req, res) => {
  if (!rateLimit(req.ip || 'unknown')) return res.status(429).json({ ok: false, message: 'Demasiadas búsquedas. Inténtalo de nuevo más tarde.' });
  const address = typeof req.body?.address === 'string' ? req.body.address.trim().slice(0, 120) : '';
  if (!address) return res.status(400).json({ ok: false, message: 'Introduce una localidad o código postal.' });
  try { const url = new URL('https://nominatim.openstreetmap.org/search'); url.searchParams.set('q', address); url.searchParams.set('format', 'jsonv2'); url.searchParams.set('limit', '1'); url.searchParams.set('countrycodes', 'es'); const response = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'CocheCierto/1.0 (https://cochecierto.com)' }, signal: AbortSignal.timeout(10000) }); if (!response.ok) throw new Error(`Nominatim ${response.status}`); const first = (await response.json())[0]; if (!first) return res.status(404).json({ ok: false, message: 'No hemos encontrado esa zona.' }); return res.json({ ok: true, location: { latitude: Number(first.lat), longitude: Number(first.lon) }, formattedAddress: first.display_name }); } catch (error) { console.error('OSM geocode unavailable:', error.message); return res.status(502).json({ ok: false, message: 'No se ha podido localizar esa zona.' }); }
});

app.post('/api/dealers/search', async (req, res) => {
  if (!googlePlaces) return res.status(503).json({ ok: false, configured: false, message: 'La búsqueda local aún no está activa.' });
  if (!rateLimit(req.ip || 'unknown')) return res.status(429).json({ ok: false, message: 'Demasiadas búsquedas. Inténtalo de nuevo más tarde.' });
  const body = req.body || {};
  const latitude = Number(body.latitude), longitude = Number(body.longitude), radius = Number(body.radius || 10);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180 || ![5, 10, 25, 50].includes(radius)) {
    return res.status(400).json({ ok: false, message: 'Ubicación o radio no válidos.' });
  }
  try {
    const response = await fetch(googlePlaces.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': googlePlaces.key, 'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.nationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.types' },
      body: JSON.stringify({ includedPrimaryTypes: ['car_dealer'], maxResultCount: 20, rankPreference: 'DISTANCE', locationRestriction: { circle: { center: { latitude, longitude }, radius: radius * 1000 } } }),
      signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) throw new Error(`Places ${response.status}`);
    const payload = await response.json();
    const places = Array.isArray(payload.places) ? payload.places.map((place) => ({ id: place.id || null, name: place.displayName?.text || 'Concesionario sin nombre', address: place.formattedAddress || null, location: place.location || null, phone: place.nationalPhoneNumber || null, website: place.websiteUri || null, mapsUrl: place.googleMapsUri || null, types: Array.isArray(place.types) ? place.types : [] })) : [];
    return res.json({ ok: true, source: 'Google Places API (New)', radius, places });
  } catch (error) {
    console.error('Dealer search unavailable:', error.message);
    return res.status(502).json({ ok: false, message: 'No se han podido consultar opciones locales.' });
  }
});

app.post('/api/dealers/geocode', async (req, res) => {
  if (!googlePlaces) return res.status(503).json({ ok: false, configured: false, message: 'La búsqueda local aún no está activa.' });
  if (!rateLimit(req.ip || 'unknown')) return res.status(429).json({ ok: false, message: 'Demasiadas búsquedas. Inténtalo de nuevo más tarde.' });
  const address = typeof req.body?.address === 'string' ? req.body.address.trim().slice(0, 120) : '';
  if (!address) return res.status(400).json({ ok: false, message: 'Introduce una localidad o código postal.' });
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('address', address); url.searchParams.set('region', 'es'); url.searchParams.set('language', 'es'); url.searchParams.set('key', googlePlaces.key);
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error(`Geocoding ${response.status}`);
    const payload = await response.json();
    const first = payload.results?.[0];
    if (!first?.geometry?.location) return res.status(404).json({ ok: false, message: 'No hemos encontrado esa zona.' });
    return res.json({ ok: true, location: { latitude: first.geometry.location.lat, longitude: first.geometry.location.lng }, formattedAddress: first.formatted_address || address });
  } catch (error) {
    console.error('Dealer geocode unavailable:', error.message);
    return res.status(502).json({ ok: false, message: 'No se ha podido localizar esa zona.' });
  }
});

app.post('/api/leads', async (req, res) => {
  if (!rateLimit(req.ip || 'unknown')) return res.status(429).json({ error: 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.' });
  if (!mailer) return res.status(503).json({ error: 'El servicio de email no está configurado todavía. La solicitud no se ha registrado.' });
  const body = req.body || {};
  const formStartedAt = Number(body.formStartedAt);
  if (typeof body.website === 'string' && body.website.trim()) return res.status(400).json({ error: 'No se ha podido validar la solicitud.' });
  if (Number.isFinite(formStartedAt) && Date.now() - formStartedAt < 1500) return res.status(400).json({ error: 'Completa la solicitud con algo más de tiempo.' });
  const missing = required(body, ['email', 'intent', 'purchaseWindow', 'recommendedCategory', 'questionnaireVersion', 'recommendationVersion']);
  if (missing.length || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) return res.status(400).json({ error: 'Datos del lead incompletos o email no válido.', fields: missing });
  const email = body.email.trim().toLowerCase();
  const lead = { email, phone: typeof body.phone === 'string' ? body.phone.trim() : null, name: typeof body.name === 'string' ? body.name.trim() : null, intent: body.intent, purchaseWindow: body.purchaseWindow, recommendedCategory: body.recommendedCategory, usageType: body.usageType === 'professional' ? 'professional' : 'private', questionnaireVersion: body.questionnaireVersion, recommendationVersion: body.recommendationVersion, consentResult: body.consentResult === true, consentCommercial: body.consentCommercial === true, attribution: cleanAttribution(body.attribution), consentAt: new Date() };
  if (!lead.consentResult) return res.status(400).json({ error: 'Es necesario aceptar el consentimiento para enviar el informe.' });
  let leadId = null;
  if (pool) {
    const [leadResult] = await pool.execute('INSERT INTO leads (email, phone, name, intent, purchase_window, recommended_category, usage_type, questionnaire_version, recommendation_version, consent_result, consent_commercial, newsletter_status, newsletter_consent_at, newsletter_consent_source, newsletter_consent_version, consent_at, verified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)', [lead.email, lead.phone, lead.name, lead.intent, lead.purchaseWindow, lead.recommendedCategory, lead.usageType, lead.questionnaireVersion, lead.recommendationVersion, lead.consentResult, lead.consentCommercial, lead.consentCommercial ? 'pending_confirmation' : 'none', lead.consentCommercial ? lead.consentAt : null, lead.consentCommercial ? 'valorador' : null, lead.consentCommercial ? 'newsletter-v1' : null, lead.consentAt]);
    leadId = leadResult.insertId;
    if (crmEnabled) {
      try {
        const [crmCase] = await pool.execute('INSERT INTO crm_cases (lead_id, stage, source, consent_snapshot) VALUES (?, ?, ?, ?)', [leadId, 'diagnostic_started', 'valorador', JSON.stringify({ result: true, commercial: lead.consentCommercial, capturedAt: lead.consentAt.toISOString() })]);
        await pool.execute('INSERT INTO crm_case_events (case_id, to_stage, actor_type, reason) VALUES (?, ?, ?, ?)', [crmCase.insertId, 'diagnostic_started', 'system', 'Diagnóstico iniciado antes del registro']);
        if (Object.keys(lead.attribution).length) await pool.execute('INSERT INTO crm_product_events (event_id, event_type, case_id, source, metadata) VALUES (?, ?, ?, ?, ?)', [crypto.randomUUID(), 'lead_attributed', crmCase.insertId, lead.attribution.utm_source || 'unknown', JSON.stringify(lead.attribution)]);
        await pool.execute('UPDATE crm_cases SET stage = ? WHERE id = ?', ['report_requested', crmCase.insertId]);
        await pool.execute('INSERT INTO crm_case_events (case_id, from_stage, to_stage, actor_type, reason) VALUES (?, ?, ?, ?, ?)', [crmCase.insertId, 'diagnostic_started', 'report_requested', 'system', 'Informe solicitado tras consentimiento']);
      } catch (error) { console.error('CRM lead tracking unavailable:', error.message); }
    }
  }
  const verifyToken = createReportToken();
  const expires = new Date(Date.now() + REPORT_TTL_MS);
  const report = { email, intent: lead.intent, category: lead.recommendedCategory, usageType: lead.usageType, purchaseWindow: lead.purchaseWindow, priority: body.priority || 'No indicada', consentCommercial: lead.consentCommercial };
  report.situation = typeof body.situation === 'string' ? body.situation : 'unknown';
  report.answers = cleanAnswers(body.answers);
  const generated = await requestLlmNarrative(report);
  report.narrative = generated.narrative;
  report.llmStatus = generated.status;
  addReport(verifyToken, report);
  try { await saveAirtableLead({ ...report, expiresAt: Date.now() + REPORT_TTL_MS }, verifyToken); } catch (error) { console.error('No se pudo guardar el lead en Airtable:', error.message); }
  if (pool) await pool.execute('UPDATE leads SET verification_token_hash = ?, verification_expires_at = ?, email_status = \'pending\', email_last_sent_at = NOW(), email_send_attempts = email_send_attempts + 1 WHERE email = ? AND verified_at IS NULL ORDER BY id DESC LIMIT 1', [hash(verifyToken), expires, email]);
  if (mailer) {
    const verificationUrl = `${process.env.REPORT_BASE_URL || 'https://cochecierto.com'}/verify-email.html?token=${verifyToken}`;
    try {
      await mailer.sendMail({ from: process.env.MAIL_FROM || `CocheCierto <${mailUser}>`, to: email, ...reportVerificationEmail({ verificationUrl, name: lead.name }) });
      if (pool) await pool.execute('UPDATE leads SET email_status = \'sent\' WHERE email = ? AND verified_at IS NULL ORDER BY id DESC LIMIT 1', [email]);
    } catch (error) {
      if (pool) await pool.execute('UPDATE leads SET email_status = \'send_failed\' WHERE email = ? AND verified_at IS NULL ORDER BY id DESC LIMIT 1', [email]);
      console.error('Report email delivery failed:', error.message);
      return res.status(502).json({ error: 'No se ha podido enviar el email de validación. Inténtalo de nuevo más tarde.' });
    }
  }
  res.status(202).json({ accepted: true, message: 'Solicitud recibida. Revisa tu email para validar la dirección.' });
});

app.get('/api/verify-email', async (req, res) => {
  const received = String(req.query.token || '');
  if (!received || received.length !== 64) return res.status(400).json({ error: 'Enlace de validación no válido o caducado.' });
  let report = getReport(received);
  if (!report) { try { report = await loadAirtableReport(received); if (report) addReport(received, report); } catch (error) { console.error('No se pudo consultar Airtable:', error.message); } }
  if (!report) return res.status(400).json({ error: 'Enlace de validación no válido o caducado.' });
  report.verified = true;
  if (pool) {
    const [verified] = await pool.execute('UPDATE leads SET verified_at = NOW(), email_status = \'verified\', verification_used_at = NOW() WHERE verification_token_hash = ? AND verification_expires_at > NOW() AND verification_used_at IS NULL', [hash(received)]);
    if (!verified.affectedRows) return res.status(410).json({ error: 'Este enlace ya no está disponible. Solicita un nuevo enlace de validación.' });
    if (crmEnabled && verified.affectedRows) {
      try {
        const [cases] = await pool.execute('SELECT id, stage FROM crm_cases WHERE lead_id = (SELECT id FROM leads WHERE verification_token_hash = ? LIMIT 1) AND deleted_at IS NULL ORDER BY id DESC LIMIT 1', [hash(received)]);
        const current = cases[0];
        if (current && crmTransitions[current.stage]?.includes('report_verified')) { await pool.execute('UPDATE crm_cases SET stage = ? WHERE id = ?', ['report_verified', current.id]); await pool.execute('INSERT INTO crm_case_events (case_id, from_stage, to_stage, actor_type, reason) VALUES (?, ?, ?, ?, ?)', [current.id, current.stage, 'report_verified', 'system', 'Email validado']); }
      } catch (error) { console.error('CRM verification tracking unavailable:', error.message); }
    }
  }
  if (airtable && report.airtableRecordId) {
    try {
      await airtableRequest(`${airtableUrl(airtable.leadsTable)}/${report.airtableRecordId}`, { method: 'PATCH', body: JSON.stringify({ fields: { Status: 'validada' } }) });
    } catch (error) { console.error('No se pudo marcar el lead como validado en Airtable:', error.message); }
  }
  res.json({ verified: true, message: 'Email validado. Ya puedes descargar el informe.', downloadUrl: `/api/report.pdf?token=${received}`, expiresAt: new Date(report.expiresAt).toISOString() });
});

app.get('/api/report.pdf', async (req, res) => {
  const token = String(req.query.token || '');
  let report = getReport(token);
  if (!report) {
    try { report = await loadAirtableReport(token); if (report) addReport(token, report); }
    catch (error) { console.error('No se pudo recuperar el informe para descargarlo:', error.message); }
  }
  if (!report || !report.verified) return res.status(403).json({ error: 'Primero valida tu email o solicita un nuevo informe.' });
  await writeReportPdfStyled(res, report);
  if (pool) { try { await pool.execute('UPDATE leads SET pdf_downloaded_at = NOW() WHERE verification_token_hash = ? AND verified_at IS NOT NULL', [hash(token)]); } catch (error) { console.error('PDF download tracking unavailable:', error.message); } }
});

app.listen(port, () => console.log(`CocheCierto API escuchando en http://localhost:${port}`));
