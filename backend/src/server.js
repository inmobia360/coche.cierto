import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

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
const resourcesUrl = `${process.env.REPORT_BASE_URL || 'https://cochecierto.com'}/recursos/`;
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
  key: process.env.LLM_API_KEY || ''
} : null;
const allowedAnswerKeys = ['intent', 'window', 'situation', 'use', 'km', 'people', 'parking', 'zbe', 'budget', 'priority', 'risk'];
const cleanAnswers = (answers) => Object.fromEntries(allowedAnswerKeys
  .filter((key) => typeof answers?.[key] === 'string' && answers[key].length <= 80)
  .map((key) => [key, answers[key]]));
const fallbackNarrative = (report) => ({
  summary: report.situation === 'first-car' ? 'Como sería tu primer coche, conviene priorizar sencillez, documentación clara y margen para los gastos que aparecen después de comprar.' : 'Esta orientación te ayuda a comparar opciones con más contexto y a detectar qué debes confirmar antes de comprometer dinero.',
  priorities: ['Compara el coste total y no solo el precio anunciado.', 'Pide documentación verificable antes de desplazarte.', 'Conserva margen para seguro, puesta a punto e imprevistos.'],
  nextStep: report.situation === 'professional' ? 'Calcula cuánto te costaría un día sin vehículo y confirma mantenimiento, garantía y factura.' : 'Compara varias unidades equivalentes y confirma la documentación antes de entregar dinero.',
  profileReading: report.situation === 'first-car' ? 'Necesitas una primera compra comprensible, con margen y comprobaciones sencillas.' : 'Tu decisión debe partir del uso real y del coste total, no solo del anuncio.',
  risks: ['Datos del anuncio sin confirmar', 'Costes iniciales fuera del precio', 'Estado físico pendiente de revisar'],
  decisionPlan: ['Define el coste total que puedes sostener.', 'Compara opciones equivalentes.', 'Verifica documentación y estado antes de pagar.']
});
const requestLlmNarrative = async (report) => {
  if (!llm) return { narrative: fallbackNarrative(report), status: 'disabled' };
  const context = { situation: report.situation, category: report.category, usageType: report.usageType, purchaseWindow: report.purchaseWindow, priority: report.priority, answers: report.answers };
  const prompt = `Redacta una guía práctica y cercana para un comprador de coches en España. Devuelve SOLO JSON válido con las claves summary (string), profileReading (string), priorities (array de 3 strings), risks (array de 3 strings), decisionPlan (array de 3 strings) y nextStep (string). Usa únicamente el contexto proporcionado. No inventes cifras, marcas, modelos, fuentes, garantías ni diagnósticos mecánicos. Distingue siempre orientación de hechos y recuerda que hace falta documentación e inspección. Contexto: ${JSON.stringify(context)}`;
  try {
    const response = await fetch(`${llm.url}/v1/chat/completions`, { method: 'POST', signal: AbortSignal.timeout(8000), headers: { 'Content-Type': 'application/json', ...(llm.key ? { Authorization: `Bearer ${llm.key}` } : {}) }, body: JSON.stringify({ model: llm.model, temperature: 0.2, max_tokens: 420, messages: [{ role: 'system', content: 'Eres un redactor prudente de informes de compra. No inventes datos.' }, { role: 'user', content: prompt }] }) });
    if (!response.ok) throw new Error(`LLM ${response.status}`);
    const content = (await response.json())?.choices?.[0]?.message?.content;
    const parsed = JSON.parse(String(content || '').replace(/^```json\s*|```$/g, '').trim());
    if (typeof parsed.summary !== 'string' || !Array.isArray(parsed.priorities) || parsed.priorities.length < 3 || typeof parsed.nextStep !== 'string') throw new Error('LLM invalid shape');
    return { narrative: { summary: parsed.summary.slice(0, 900), profileReading: String(parsed.profileReading || '').slice(0, 500), priorities: parsed.priorities.slice(0, 3).map((item) => String(item).slice(0, 240)), risks: (Array.isArray(parsed.risks) ? parsed.risks : []).slice(0, 3).map((item) => String(item).slice(0, 220)), decisionPlan: (Array.isArray(parsed.decisionPlan) ? parsed.decisionPlan : []).slice(0, 3).map((item) => String(item).slice(0, 220)), nextStep: parsed.nextStep.slice(0, 500) }, status: 'ok' };
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
const writeReportPdf = async (res, report) => {
  const situation = situationPack(report);
  const qr = await QRCode.toDataURL('https://cochecierto.com/recursos/', { margin: 1, width: 96 });
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
  const doc = new PDFDocument({ size: 'A4', margin: 48, info: { Title: 'Informe de orientación CocheCierto', Author: 'CocheCierto' } });
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
  }
  doc.moveDown(1).fillColor('#082333').fontSize(14).font('Helvetica-Bold').text('Resumen de tu orientación');
  doc.fontSize(11).font('Helvetica').text(`Categoría a estudiar: ${report.category}`);
  doc.text(`Uso declarado: ${report.usageType === 'professional' ? 'profesional o comercial' : 'particular'}`);
  doc.text(`Horizonte de compra: ${report.purchaseWindow}`);
  doc.text(`Motivo principal: ${report.priority}`);
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
  doc.moveDown(.5).font('Helvetica-Bold').text('Contexto oficial del INE');
  doc.font('Helvetica').text(`IPC nacional, variación anual: ${ineContext}. Fuente: INE, tabla ${INE_TABLE_ID}. Este dato contextualiza precios agregados y no sustituye tus datos ni predice tu gasto personal.`);
  doc.moveDown(.7).font('Helvetica-Bold').text('Qué conviene hacer ahora');
  doc.font('Helvetica').text('Compara varias unidades equivalentes, pide documentación verificable y reserva margen para seguro, puesta a punto e imprevistos. Antes de pagar, considera una inspección independiente.');
  doc.addPage();
  drawBrandLogo(doc);
  doc.fillColor('#ff4d00').font('Helvetica-Bold').fontSize(10).text('DECISIÓN Y PRESUPUESTO');
  doc.moveDown(.4).fillColor('#082333').fontSize(22).text('Qué significa esta orientación');
  doc.font('Helvetica').fontSize(11);
  doc.font('Helvetica').fontSize(11).fillColor('#58717d').text('Este informe ordena tus respuestas para ayudarte a comparar opciones. No elige una unidad concreta ni confirma su estado mecánico.');
  doc.moveDown(1).fillColor('#082333').font('Helvetica-Bold').fontSize(14).text('Tu límite debe proteger tu margen');
  doc.font('Helvetica').fontSize(11).text('Separa el precio del vehículo de los gastos de compra, el seguro, la puesta a punto y una reserva para imprevistos. El precio prudente es el que te permite seguir teniendo margen después de comprar.');
  const budgetRows = [['Presupuesto total', 'Lo que puedes destinar sin comprometer otros gastos'], ['Precio máximo absoluto', 'Límite que no conviene superar'], ['Precio prudente', 'Importe que conserva margen para el primer año'], ['Gastos iniciales', 'Transferencia, seguro, puesta a punto y consumibles'], ['Reserva mínima', 'Colchón para una avería o gasto no previsto']];
  doc.moveDown(.7).font('Helvetica-Bold').text('Cómo leer tu presupuesto');
  budgetRows.forEach(([label, value]) => { doc.font('Helvetica-Bold').text(label, { continued: true }).font('Helvetica').text(`: ${value}`); });
  doc.moveDown(1).font('Helvetica-Bold').text('Tres caminos para comparar');
  [['Conservador', 'Menor desembolso y más margen económico.'], ['Equilibrado', 'Balance entre coste, seguridad, uso y previsibilidad.'], ['Aspiracional', 'Más espacio o equipamiento, con mayor exigencia económica.']].forEach(([label, value]) => { doc.moveDown(.3).font('Helvetica-Bold').text(label, { continued: true }).font('Helvetica').text(`: ${value}`); });
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
  doc.font('Helvetica').fontSize(9).fillColor('#58717d').text('https://cochecierto.com/recursos/', infoX + 70, infoY + 15, { width: 380 });
  doc.text('Escanea el QR para abrir recursos y fuentes oficiales.', infoX + 70, infoY + 30, { width: 380 });
  doc.text('cochecierto.com · hola@cochecierto.com', infoX + 70, infoY + 45, { width: 380 });
  doc.text('Informe beta sujeto a validación. El enlace privado es válido durante 7 días.', infoX + 70, infoY + 60, { width: 380 });
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
  const report = { category: typeof body.category === 'string' ? body.category.slice(0, 80) : 'pendiente', usageType: body.usageType === 'professional' ? 'professional' : 'private', purchaseWindow: typeof body.purchaseWindow === 'string' ? body.purchaseWindow.slice(0, 40) : 'unknown', priority: typeof body.priority === 'string' ? body.priority.slice(0, 80) : 'No indicada', situation: typeof body.situation === 'string' ? body.situation.slice(0, 80) : 'unknown', answers: cleanAnswers(body.answers) };
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
  await writeReportPdf(res, report);
});

app.listen(port, () => console.log(`CocheCierto API escuchando en http://localhost:${port}`));
