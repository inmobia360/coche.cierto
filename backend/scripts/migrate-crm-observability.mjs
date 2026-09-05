import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

if (process.env.CRM_MIGRATION_CONFIRM !== 'APPLY_CRM_003') {
  console.error('Migración no ejecutada. Define CRM_MIGRATION_CONFIRM=APPLY_CRM_003 de forma privada para continuar.');
  process.exitCode = 2;
} else if (!process.env.MYSQL_HOST || !process.env.MYSQL_DATABASE || !process.env.MYSQL_USER) {
  console.error('Migración no ejecutada. Faltan MYSQL_HOST, MYSQL_DATABASE o MYSQL_USER.');
  process.exitCode = 2;
} else {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const sql = await fs.readFile(path.join(here, '..', 'migrations', '003_crm_observability_up.sql'), 'utf8');
  const connection = await mysql.createConnection({ host: process.env.MYSQL_HOST, port: Number(process.env.MYSQL_PORT || 3306), database: process.env.MYSQL_DATABASE, user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD });
  try { for (const statement of sql.split(';').map((item) => item.trim()).filter(Boolean)) await connection.query(statement); console.log('OK: migración CRM 003 aplicada.'); }
  catch (error) { console.error(`CRM 003 detenida: ${error.message}`); process.exitCode = 1; }
  finally { await connection.end(); }
}
