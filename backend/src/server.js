import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';

const app = express();
const port = Number(process.env.PORT || 3000);
const origin = process.env.APP_ORIGIN || 'http://localhost:5500';
const pool = process.env.MYSQL_HOST ? mysql.createPool({ host: process.env.MYSQL_HOST, port: Number(process.env.MYSQL_PORT || 3306), database: process.env.MYSQL_DATABASE, user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD, waitForConnections: true, connectionLimit: 5 }) : null;
const mailer = process.env.MAIL_HOST ? nodemailer.createTransport({ host: process.env.MAIL_HOST, port: Number(process.env.MAIL_PORT || 587), secure: Number(process.env.MAIL_PORT) === 465, auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASSWORD } }) : null;
const attempts = new Map();

app.use(helmet());
app.use(cors({ origin: (requestOrigin, callback) => callback(null, !requestOrigin || requestOrigin === origin || (process.env.NODE_ENV !== 'production' && requestOrigin === 'null')), methods: ['GET', 'POST'] }));
app.use(express.json({ limit: '32kb' }));

const required = (body, fields) => fields.filter((field) => typeof body[field] !== 'string' || !body[field].trim());
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const rateLimit = (key) => { const now = Date.now(); const recent = (attempts.get(key) || []).filter((time) => now - time < 60_000); if (recent.length >= 10) return false; recent.push(now); attempts.set(key, recent); return true; };

app.get('/health', async (_req, res) => {
  let database = 'not-configured';
  if (pool) { try { await pool.query('SELECT 1'); database = 'ok'; } catch { database = 'unavailable'; } }
  res.json({ ok: true, service: 'cochecierto-backend', database });
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
  const verifyToken = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 30 * 60_000);
  if (pool) await pool.execute('UPDATE leads SET verification_token_hash = ?, verification_expires_at = ? WHERE email = ? AND verified_at IS NULL ORDER BY id DESC LIMIT 1', [hash(verifyToken), expires, email]);
  if (mailer) await mailer.sendMail({ from: process.env.MAIL_FROM, to: email, subject: 'Valida tu email para recibir tu informe CocheCierto', text: `Valida tu email: ${process.env.REPORT_BASE_URL}/verify-email.html?email=${encodeURIComponent(email)}&token=${verifyToken}` });
  res.status(202).json({ accepted: true, message: 'Solicitud recibida. Revisa tu email para validar la dirección.' });
});

app.get('/api/verify-email', async (req, res) => {
  const email = String(req.query.email || '').trim().toLowerCase();
  const received = String(req.query.token || '');
  if (!email || !received || received.length !== 64) return res.status(400).json({ error: 'Enlace de validación no válido o caducado.' });
  if (pool) { const [rows] = await pool.execute('SELECT id FROM leads WHERE email = ? AND verified_at IS NULL AND verification_expires_at > CURRENT_TIMESTAMP AND verification_token_hash = ? ORDER BY id DESC LIMIT 1', [email, hash(received)]); if (!rows.length) return res.status(400).json({ error: 'Enlace de validación no válido o caducado.' }); await pool.execute('UPDATE leads SET verified_at = CURRENT_TIMESTAMP, verification_token_hash = NULL, verification_expires_at = NULL WHERE id = ?', [rows[0].id]); }
  res.json({ verified: true, message: 'Email validado. Ya puedes recibir el informe.' });
});

app.listen(port, () => console.log(`CocheCierto API escuchando en http://localhost:${port}`));
