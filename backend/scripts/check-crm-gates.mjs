import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const backend = path.resolve(here, '..');
const root = path.resolve(backend, '..');
const gates = [
  ['Migración CRM disponible', fs.existsSync(path.join(backend, 'migrations', '002_crm_lifecycle_up.sql')), 'archivo local'],
  ['Comprobador estructural disponible', fs.existsSync(path.join(backend, 'scripts', 'check-crm-database.mjs')), 'script local'],
  ['CRM cerrado en el ejemplo', fs.readFileSync(path.join(backend, '.env.example'), 'utf8').includes('CRM_ENABLED=false'), 'valor por defecto'],
  ['Esquema cerrado en el ejemplo', fs.readFileSync(path.join(backend, '.env.example'), 'utf8').includes('CRM_SCHEMA_READY=false'), 'valor por defecto'],
  ['MySQL staging configurado', Boolean(process.env.MYSQL_HOST && process.env.MYSQL_DATABASE && process.env.MYSQL_USER), 'solo configuración, no conexión'],
  ['Confirmación de migración presente', process.env.CRM_MIGRATION_CONFIRM === 'APPLY_CRM_002', 'no se ejecuta desde este comprobador'],
  ['Confirmación de comprobación presente', process.env.CRM_DB_CHECK_CONFIRM === 'CHECK_CRM_002', 'no se ejecuta desde este comprobador'],
  ['Revisión legal/RGPD', false, 'requiere evidencia externa'],
  ['Piloto autorizado', false, 'requiere decisión expresa'],
];

console.log('Puertas CRM (solo lectura; no migra ni modifica datos):');
for (const [name, ok, note] of gates) console.log(`${ok ? 'OK ' : 'PENDIENTE '} ${name} — ${note}`);
if (gates.some(([, ok]) => !ok)) process.exitCode = 1;
