import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

if (process.env.CRM_MIGRATION_CONFIRM !== 'APPLY_CRM_002') {
  console.error('Migración no ejecutada. Define CRM_MIGRATION_CONFIRM=APPLY_CRM_002 de forma privada para continuar.');
  process.exitCode = 2;
} else if (!process.env.MYSQL_HOST || !process.env.MYSQL_DATABASE || !process.env.MYSQL_USER) {
  console.error('Migración no ejecutada. Faltan MYSQL_HOST, MYSQL_DATABASE o MYSQL_USER.');
  process.exitCode = 2;
} else {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(here, '..', 'migrations', '002_crm_lifecycle_up.sql');
  const sql = await fs.readFile(file, 'utf8');
  const statements = sql.split(';').map((statement) => statement.trim()).filter(Boolean);
  const connection = await mysql.createConnection({ host: process.env.MYSQL_HOST, port: Number(process.env.MYSQL_PORT || 3306), database: process.env.MYSQL_DATABASE, user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD });
  try {
    for (const statement of statements) {
      const isDealerInviteForeignKey = /^ALTER TABLE purchase_request_invites ADD CONSTRAINT fk_purchase_request_invites_dealer/i.test(statement);
      if (isDealerInviteForeignKey) {
        const [constraints] = await connection.execute('SELECT 1 FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ? LIMIT 1', ['purchase_request_invites', 'fk_purchase_request_invites_dealer']);
        if (constraints[0]) { console.log('CRM 002: vínculo de invitación ya presente; se omite sin error.'); continue; }
      }
      await connection.query(statement);
    }
    console.log(`OK: migración CRM 002 aplicada (${statements.length} sentencias).`);
  } catch (error) {
    console.error(`Migración CRM 002 detenida; revisa el estado y aplica el rollback documentado si procede: ${error.message}`);
    process.exitCode = 1;
  } finally { await connection.end(); }
}
