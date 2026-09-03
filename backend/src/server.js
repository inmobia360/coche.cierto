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

const app = express();
const port = Number(process.env.PORT || 3000);
const origin = process.env.APP_ORIGIN || 'http://localhost:5500';
const allowedOrigins = new Set([origin, 'https://cochecierto.com', 'https://www.cochecierto.com']);
const pool = process.env.MYSQL_HOST ? mysql.createPool({ host: process.env.MYSQL_HOST, port: Number(process.env.MYSQL_PORT || 3306), database: process.env.MYSQL_DATABASE, user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD, waitForConnections: true, connectionLimit: 5 }) : null;
const mailer = process.env.MAIL_HOST ? nodemailer.createTransport({ host: process.env.MAIL_HOST, port: Number(process.env.MAIL_PORT || 587), secure: Number(process.env.MAIL_PORT) === 465, auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASSWORD } }) : null;
if (mailer) {
  const sendMail = mailer.sendMail.bind(mailer);
  mailer.sendMail = (options) => {
    const verificationUrl = String(options.text || '').replace(/^Valida tu email:\s*/i, '').trim();
    const html = `<!doctype html><html lang="es"><body style="margin:0;background:#f3f7f6;color:#082333;font-family:Arial,sans-serif"><div style="max-width:620px;margin:32px auto;padding:0 16px"><div style="background:#082333;border-radius:18px 18px 0 0;padding:24px 28px;color:#fff;font-size:22px;font-weight:700">Coche<span style="color:#ff4d00">Cierto</span></div><div style="background:#fff;padding:32px 28px;border:1px solid #d7e2df;border-top:0;border-radius:0 0 18px 18px"><p style="margin-top:0;color:#ff4d00;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">Tu informe empieza aquí</p><h1 style="font-size:28px;line-height:1.15;margin:0 0 16px">Confirma tu email</h1><p style="font-size:16px;line-height:1.6">Hemos recibido tu solicitud. Confirma tu dirección para poder enviarte el resultado de tu valoración.</p><p style="text-align:center;margin:28px 0"><a href="${verificationUrl}" style="display:inline-block;background:#ff4d00;color:#fff;text-decoration:none;padding:14px 24px;border-radius:999px;font-weight:700">Validar mi email</a></p><p style="font-size:13px;line-height:1.5;color:#58717d">Si el botón no funciona, copia y pega este enlace en tu navegador:</p><p style="font-size:12px;line-height:1.5;word-break:break-all"><a href="${verificationUrl}" style="color:#0b6f9c">${verificationUrl}</a></p><hr style="border:0;border-top:1px solid #e5ecea;margin:28px 0"><p style="font-size:12px;line-height:1.5;color:#58717d;margin-bottom:0">Este mensaje responde a una solicitud realizada en CocheCierto. La orientación es informativa y no sustituye una inspección profesional, asesoramiento financiero o jurídico.</p></div></div></body></html>`;
    return sendMail({ ...options, html });
  };
}
const attempts = new Map();
const pendingReports = new Map();
const REPORT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const resourcesUrl = `${process.env.REPORT_BASE_URL || 'https://cochecierto.com'}/guias/`;
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
const allowedAnswerKeys = ['intent', 'window', 'situation', 'use', 'km', 'people', 'parking', 'zbe', 'budget', 'priority', 'risk'];
const cleanAnswers = (answers) => Object.fromEntries(allowedAnswerKeys
  .filter((key) => typeof answers?.[key] === 'string' && answers[key].length <= 80)
  .map((key) => [key, answers[key]]));
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
  return { email: fields.Email, category: details.recommendedCategory, usageType: details.usageType, purchaseWindow: details.purchaseWindow, priority: details.priority || 'No indicada', situation: details.situation || 'unknown', answers: cleanAnswers(details.answers), narrative: details.narrative || null, consentCommercial: details.consentCommercial === true, expiresAt: new Date(details.expiresAt).getTime(), verified: fields.Status === 'validada' };
};

app.use(helmet());
app.use(cors({ origin: (requestOrigin, callback) => callback(null, !requestOrigin || allowedOrigins.has(requestOrigin) || (process.env.NODE_ENV !== 'production' && requestOrigin === 'null')), methods: ['GET', 'POST'] }));
app.use(express.json({ limit: '32kb' }));

const required = (body, fields) => fields.filter((field) => typeof body[field] !== 'string' || !body[field].trim());
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const rateLimit = (key) => { const now = Date.now(); const recent = (attempts.get(key) || []).filter((time) => now - time < 60_000); if (recent.length >= 10) return false; recent.push(now); attempts.set(key, recent); return true; };
const createReportToken = () => crypto.randomBytes(32).toString('hex');
const cleanReports = () => { const now = Date.now(); for (const [token, report] of pendingReports) if (report.expiresAt <= now) pendingReports.delete(token); };
const addReport = (token, report) => { cleanReports(); pendingReports.set(token, { ...report, expiresAt: Date.now() + REPORT_TTL_MS }); };
const getReport = (token) => { cleanReports(); const report = pendingReports.get(token); return report && report.expiresAt > Date.now() ? report : null; };
const drawBrandLogo = (doc) => {
  const x = doc.x;
  const y = doc.y;
  doc.save().lineWidth(4).strokeColor('#082333').circle(x + 14, y + 14, 12).stroke()
    .lineWidth(3.5).strokeColor('#fc4c02').moveTo(x + 8, y + 14).lineTo(x + 13, y + 19).lineTo(x + 22, y + 9).stroke().restore();
  doc.fillColor('#082333').font('Helvetica-Bold').fontSize(18).text('Coche', x + 34, y + 5, { continued: true })
    .fillColor('#fc4c02').text('Cierto');
  doc.y = y + 34;
};
const drawMetricCard = (doc, x, y, width, label, value, note, accent) => {
  doc.save().fillColor('#ffffff').strokeColor('#d7e2df').lineWidth(1).roundedRect(x, y, width, 72, 8).fillAndStroke().restore();
  doc.fillColor('#58717d').font('Helvetica').fontSize(8).text(label, x + 10, y + 10, { width: width - 20 });
  doc.fillColor(accent || '#082333').font('Helvetica-Bold').fontSize(18).text(value, x + 10, y + 27, { width: width - 20 });
  doc.fillColor('#58717d').font('Helvetica').fontSize(8).text(note, x + 10, y + 52, { width: width - 20 });
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
    doc.moveDown(.45).font('Helvetica-Bold').fillColor('#fc4c02').text('□', { continued: true }).fillColor('#082333').font('Helvetica').text(` ${item}`);
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
  doc.save().lineWidth(4).strokeColor(PDF_COLORS.navy).circle(x + 14, 60, 12).stroke()
    .lineWidth(3.5).strokeColor(PDF_COLORS.orange).moveTo(x + 8, 60).lineTo(x + 13, 65).lineTo(x + 22, 55).stroke().restore();
    pdfText(doc, 'Coche', x + 34, 51, 82, { color: PDF_COLORS.navy, font: 'Helvetica-Bold', size: 17, lineBreak: false });
    pdfText(doc, 'Cierto', x + 112, 51, 78, { color: PDF_COLORS.orange, font: 'Helvetica-Bold', size: 17, lineBreak: false });
  pdfRule(doc, x, 91, width, PDF_COLORS.orange);
};
const writeReportPdfStyled = async (res, inputReport) => {
  const report = completeReportContext(inputReport);
  report.narrative = cleanNarrative(enforceNarrativeGuardrails(report, report.narrative));
  const situation = situationPack(report);
  const budget = budgetGuidance(report.answers?.budget);
  const qr = await QRCode.toDataURL(resourcesUrl, { margin: 1, width: 132 });
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
  const smallCard = (label, value, note, cx, cy, cw, accent) => { pdfCard(doc, cx, cy, cw, 70, { accent }); pdfText(doc, label, cx + 12, cy + 11, cw - 24, { color: PDF_COLORS.muted, size: 8 }); pdfText(doc, value, cx + 12, cy + 28, cw - 24, { color: accent || PDF_COLORS.navy, font: 'Helvetica-Bold', size: 14 }); pdfText(doc, note, cx + 12, cy + 51, cw - 24, { color: PDF_COLORS.muted, size: 7.5 }); };

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
  y += 95;
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
  docs.forEach((item, i) => { const ry = y + 40 + i * 40; pdfCard(doc, x, ry, contentWidth, 34, { fill: i % 2 ? PDF_COLORS.pale : PDF_COLORS.white, radius: 3 }); pdfText(doc, item, x + 16, ry + 9, 230, { color: PDF_COLORS.ink, font: 'Helvetica-Bold', size: 8.5 }); pdfText(doc, i < 3 ? 'Identidad, vigencia y coincidencia' : 'Documento, fecha, titular y limitaciones', x + 265, ry + 9, 130, { color: PDF_COLORS.muted, size: 7.5 }); pdfText(doc, '□ Correcto   □ Falta   □ Duda', x + 407, ry + 9, 75, { color: PDF_COLORS.navy, size: 7.2 }); });
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
  pdfText(doc, 'Resultado de la visita:  □ Avanzar   □ Pedir más evidencia   □ Inspección   □ Descartar', x + 18, y + 69, contentWidth - 36, { color: PDF_COLORS.navy, font: 'Helvetica-Bold', size: 8.5 });

  // 8. Cierre.
  y = newPage('07 · Compra', 'Negociación y cierre seguro', 'Negocia después de verificar. El objetivo no es solo bajar el precio: es dejar claras las condiciones y conservar trazabilidad.');
  const closeCards = [['Negocia con evidencia', ['Usa defectos documentados y mantenimiento pendiente', 'Compara unidades equivalentes', 'No negocies desde el límite absoluto'], PDF_COLORS.orange], ['Señal con condiciones', ['Identifica partes, vehículo e importe', 'Define finalidad, fecha y desistimiento', 'No pagues si faltan documentos críticos'], PDF_COLORS.red], ['Entrega ordenada', ['Pago trazable y contrato / factura', 'Llaves, documentación y garantía', 'Seguro y titularidad antes de circular'], PDF_COLORS.green]];
  closeCards.forEach(([label, items, accent], i) => { const cx = x + i * (colW + 8); pdfCard(doc, cx, y, colW, 180, { fill: PDF_COLORS.white, accent }); pdfText(doc, label, cx + 15, y + 16, colW - 30, { color: accent, font: 'Helvetica-Bold', size: 9 }); items.forEach((item, j) => pdfBullet(doc, item, cx + 15, y + 48 + j * 35, colW - 30)); });
  y += 207;
  pdfCard(doc, x, y, contentWidth, 102, { fill: '#fff7f2', stroke: '#f4c8b7', accent: PDF_COLORS.orange });
  pdfText(doc, 'Condiciones que deben quedar escritas', x + 18, y + 16, contentWidth - 36, { color: PDF_COLORS.orange, font: 'Helvetica-Bold', size: 9 });
  pdfText(doc, 'Partes: ____________________   Vehículo: ____________________   Importe: __________', x + 18, y + 39, contentWidth - 36, { size: 9 });
  pdfText(doc, 'Finalidad de la señal: ____________________   Fecha: __________   Desistimiento: ____________________', x + 18, y + 62, contentWidth - 36, { size: 9 });
  pdfText(doc, 'Decisión:  □ Comprar   □ Negociar   □ Inspección   □ Seguir buscando   □ Descartar', x + 18, y + 84, contentWidth - 36, { color: PDF_COLORS.navy, font: 'Helvetica-Bold', size: 8.5 });

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
  ['Encaje con uso, ocupantes, vías y ZBE', 'Precio total, gastos y reserva', 'Historial, documentación y garantía', 'Estado físico y mecánico pendiente', 'Seguridad, consumo y mantenimiento', 'Confianza y condiciones de cierre'].forEach((label, i) => { const ry = y + 45 + i * 31; pdfCard(doc, x, ry, contentWidth, 27, { fill: i % 2 ? PDF_COLORS.pale : PDF_COLORS.white, radius: 2 }); pdfText(doc, label, x + 14, ry + 8, 190, { color: PDF_COLORS.ink, size: 7.8 }); candidates.forEach((_, j) => pdfText(doc, '□ Sí  □ Pend.', x + 207 + j * 90, ry + 8, 82, { color: PDF_COLORS.muted, size: 7.2, align: 'center' })); });
  y += 45 + 6 * 31 + 22;
  pdfCard(doc, x, y, contentWidth, 75, { fill: '#fff7f2', stroke: '#f4c8b7', accent: PDF_COLORS.orange });
  pdfText(doc, 'MI DECISIÓN', x + 18, y + 14, 150, { color: PDF_COLORS.orange, font: 'Helvetica-Bold', size: 8, characterSpacing: .7 });
  pdfText(doc, '□ Comprar   □ Negociar   □ Solicitar inspección   □ Seguir buscando   □ Descartar', x + 18, y + 33, contentWidth - 36, { color: PDF_COLORS.navy, font: 'Helvetica-Bold', size: 9 });
  pdfText(doc, 'Motivo: __________________________________________________________________________________', x + 18, y + 53, contentWidth - 36, { color: PDF_COLORS.ink, size: 8.5 });
  y += 98;
  pdfCard(doc, x, y, contentWidth, 112, { fill: PDF_COLORS.navy, stroke: PDF_COLORS.navy });
  pdfText(doc, 'CONTINÚA CON MÁS HERRAMIENTAS', x + 18, y + 16, 280, { color: PDF_COLORS.orange, font: 'Helvetica-Bold', size: 8, characterSpacing: .7 });
  doc.image(qr, x + 18, y + 35, { width: 78 });
  pdfText(doc, 'Guías, listas de comprobación y fuentes oficiales para seguir tomando decisiones con criterio.', x + 115, y + 38, 350, { color: PDF_COLORS.white, size: 9.5, lineGap: 2 });
  pdfText(doc, resourcesUrl, x + 115, y + 70, 350, { color: '#c5d7de', font: 'Helvetica-Bold', size: 9 });
  pdfText(doc, 'El enlace privado será válido durante 7 días; la caducidad afecta al enlace, no al PDF descargado.', x + 115, y + 87, 350, { color: '#c5d7de', size: 7.5, lineGap: 1 });
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

app.post('/api/leads', async (req, res) => {
  if (!rateLimit(req.ip || 'unknown')) return res.status(429).json({ error: 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.' });
  const body = req.body || {};
  const formStartedAt = Number(body.formStartedAt);
  if (typeof body.website === 'string' && body.website.trim()) return res.status(400).json({ error: 'No se ha podido validar la solicitud.' });
  if (Number.isFinite(formStartedAt) && Date.now() - formStartedAt < 1500) return res.status(400).json({ error: 'Completa la solicitud con algo más de tiempo.' });
  const missing = required(body, ['email', 'intent', 'purchaseWindow', 'recommendedCategory', 'questionnaireVersion', 'recommendationVersion']);
  if (missing.length || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) return res.status(400).json({ error: 'Datos del lead incompletos o email no válido.', fields: missing });
  const email = body.email.trim().toLowerCase();
  const lead = { email, phone: typeof body.phone === 'string' ? body.phone.trim() : null, name: typeof body.name === 'string' ? body.name.trim() : null, intent: body.intent, purchaseWindow: body.purchaseWindow, recommendedCategory: body.recommendedCategory, usageType: body.usageType === 'professional' ? 'professional' : 'private', questionnaireVersion: body.questionnaireVersion, recommendationVersion: body.recommendationVersion, consentResult: body.consentResult === true, consentCommercial: body.consentCommercial === true, consentAt: new Date() };
  if (!lead.consentResult) return res.status(400).json({ error: 'Es necesario aceptar el consentimiento para enviar el informe.' });
  if (pool) {
    await pool.execute('INSERT INTO leads (email, phone, name, intent, purchase_window, recommended_category, usage_type, questionnaire_version, recommendation_version, consent_result, consent_commercial, consent_at, verified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)', [lead.email, lead.phone, lead.name, lead.intent, lead.purchaseWindow, lead.recommendedCategory, lead.usageType, lead.questionnaireVersion, lead.recommendationVersion, lead.consentResult, lead.consentCommercial, lead.consentAt]);
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
  if (pool) await pool.execute('UPDATE leads SET verification_token_hash = ?, verification_expires_at = ? WHERE email = ? AND verified_at IS NULL ORDER BY id DESC LIMIT 1', [hash(verifyToken), expires, email]);
  if (mailer) await mailer.sendMail({ from: process.env.MAIL_FROM, to: email, subject: 'Valida tu email para recibir tu informe CocheCierto', text: `Valida tu email: ${process.env.REPORT_BASE_URL}/verify-email.html?token=${verifyToken}` });
  res.status(202).json({ accepted: true, message: 'Solicitud recibida. Revisa tu email para validar la dirección.' });
});

app.get('/api/verify-email', async (req, res) => {
  const received = String(req.query.token || '');
  if (!received || received.length !== 64) return res.status(400).json({ error: 'Enlace de validación no válido o caducado.' });
  let report = getReport(received);
  if (!report) { try { report = await loadAirtableReport(received); if (report) addReport(received, report); } catch (error) { console.error('No se pudo consultar Airtable:', error.message); } }
  if (!report) return res.status(400).json({ error: 'Enlace de validación no válido o caducado.' });
  report.verified = true;
  res.json({ verified: true, message: 'Email validado. Ya puedes descargar el informe.', downloadUrl: `/api/report.pdf?token=${received}`, expiresAt: new Date(report.expiresAt).toISOString() });
});

app.get('/api/report.pdf', async (req, res) => {
  const token = String(req.query.token || '');
  const report = getReport(token);
  if (!report || !report.verified) return res.status(403).json({ error: 'Primero valida tu email o solicita un nuevo informe.' });
  await writeReportPdfStyled(res, report);
});

app.listen(port, () => console.log(`CocheCierto API escuchando en http://localhost:${port}`));
