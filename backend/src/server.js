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
const airtable = process.env.AIRTABLE_TOKEN && process.env.AIRTABLE_BASE_ID ? {
  token: process.env.AIRTABLE_TOKEN,
  base: process.env.AIRTABLE_BASE_ID,
  leadsTable: process.env.AIRTABLE_LEADS_TABLE || 'Leads'
} : null;
const airtableUrl = (table) => `https://api.airtable.com/v0/${airtable.base}/${encodeURIComponent(table)}`;
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
      recommendedCategory: report.category,
      priority: report.priority,
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
  return { email: fields.Email, category: details.recommendedCategory, usageType: details.usageType, purchaseWindow: details.purchaseWindow, priority: details.priority || 'No indicada', consentCommercial: details.consentCommercial === true, expiresAt: new Date(details.expiresAt).getTime(), verified: fields.Status === 'validada' };
};

app.use(helmet());
app.use(cors({ origin: (requestOrigin, callback) => callback(null, !requestOrigin || requestOrigin === origin || (process.env.NODE_ENV !== 'production' && requestOrigin === 'null')), methods: ['GET', 'POST'] }));
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
const writeReportPdf = async (res, report) => {
  const qr = await QRCode.toDataURL('https://cochecierto.com/recursos/', { margin: 1, width: 96 });
  const doc = new PDFDocument({ size: 'A4', margin: 48, info: { Title: 'Informe de orientación CocheCierto', Author: 'CocheCierto' } });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="informe-cochecierto.pdf"');
  doc.pipe(res);
  drawBrandLogo(doc);
  doc.moveDown(1).fillColor('#ff4d00').fontSize(10).font('Helvetica-Bold').text('INFORME DE ORIENTACIÓN · VERSIÓN BETA');
  doc.moveDown(.5).fillColor('#082333').fontSize(24).text('Una decisión explicada, no una cifra aislada');
  doc.fillColor('#58717d').fontSize(11).font('Helvetica').text('Este informe es orientativo y se genera a partir de las respuestas aportadas. No es una tasación, peritaje ni aprobación de financiación.');
  doc.moveDown(1).fillColor('#082333').fontSize(14).font('Helvetica-Bold').text('Resumen de tu orientación');
  doc.fontSize(11).font('Helvetica').text(`Categoría a estudiar: ${report.category}`);
  doc.text(`Uso declarado: ${report.usageType === 'professional' ? 'profesional o comercial' : 'particular'}`);
  doc.text(`Horizonte de compra: ${report.purchaseWindow}`);
  doc.text(`Motivo principal: ${report.priority}`);
  doc.moveDown(.7).font('Helvetica-Bold').text('Qué conviene hacer ahora');
  doc.font('Helvetica').text('Compara varias unidades equivalentes, pide documentación verificable y reserva margen para seguro, puesta a punto e imprevistos. Antes de pagar, considera una inspección independiente.');
  doc.moveDown(1).font('Helvetica-Bold').text('Recursos de CocheCierto');
  const startX = doc.x, col = [150, 175, 145];
  const headers = ['Nombre del recurso', 'Solución que aporta', 'Por qué usarlo'];
  doc.fontSize(9).fillColor('#ffffff').rect(startX, doc.y, col.reduce((a,b)=>a+b,0), 22).fill('#082333');
  let x = startX; headers.forEach((h,i)=>{ doc.fillColor('#ffffff').text(h, x+5, doc.y+7, { width: col[i]-10 }); x += col[i]; }); doc.y += 26;
  resources.forEach((row, ri) => { const y=doc.y; const h=42; doc.fillColor(ri%2?'#f3f7f6':'#ffffff').rect(startX,y,col.reduce((a,b)=>a+b,0),h).fill(); x=startX; row.forEach((cell,i)=>{doc.fillColor('#082333').font('Helvetica').text(cell,x+5,y+7,{width:col[i]-10,height:h-8});x+=col[i];});doc.y=y+h; });
  doc.moveDown(1).fillColor('#082333').font('Helvetica-Bold').fontSize(10).text('Continúa con más herramientas: https://cochecierto.com/recursos/', doc.x + 92, doc.y, { width: 385, lineGap: 2 });
  const infoY = doc.y;
  doc.image(qr, doc.x, infoY - 2, { width: 52 });
  doc.font('Helvetica').fontSize(10).fillColor('#58717d')
    .text('Escanea el QR para acceder a Recursos.', doc.x + 92, doc.y, { width: 385, lineGap: 2 })
    .text('Presencia social: Facebook · Instagram · YouTube · TikTok · LinkedIn · X', { width: 385, lineGap: 2 })
    .text('cochecierto.com · hola@cochecierto.com', { width: 385, lineGap: 2 })
    .text('Informe beta sujeto a validación. El enlace privado es válido durante 7 días.', { width: 385, lineGap: 2 });
  doc.end();
};

app.get('/health', async (_req, res) => {
  let database = 'not-configured';
  if (pool) { try { await pool.query('SELECT 1'); database = 'ok'; } catch { database = 'unavailable'; } }
  res.json({ ok: true, service: 'cochecierto-backend', database });
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

app.post('/api/leads', async (req, res) => {
  if (!rateLimit(req.ip || 'unknown')) return res.status(429).json({ error: 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.' });
  const body = req.body || {};
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
