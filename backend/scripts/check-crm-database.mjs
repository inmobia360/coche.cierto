import 'dotenv/config';
import mysql from 'mysql2/promise';

if (process.env.CRM_DB_CHECK_CONFIRM !== 'CHECK_CRM_002') {
  console.error('Comprobación no ejecutada. Define CRM_DB_CHECK_CONFIRM=CHECK_CRM_002 de forma privada.');
  process.exitCode = 2;
} else if (!process.env.MYSQL_HOST || !process.env.MYSQL_DATABASE || !process.env.MYSQL_USER) {
  console.error('Comprobación no ejecutada. Faltan MYSQL_HOST, MYSQL_DATABASE o MYSQL_USER.');
  process.exitCode = 2;
} else {
  const connection = await mysql.createConnection({ host: process.env.MYSQL_HOST, port: Number(process.env.MYSQL_PORT || 3306), database: process.env.MYSQL_DATABASE, user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD });
  try {
    const expectedTables = ['crm_cases', 'crm_dealers', 'crm_dealer_contacts', 'crm_case_dealers', 'crm_case_events', 'crm_aftercare_tasks'];
    const [rows] = await connection.query('SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN (?)', [expectedTables]);
    const present = new Set(rows.map((row) => row.TABLE_NAME));
    const missing = expectedTables.filter((table) => !present.has(table));
    if (missing.length) throw new Error(`faltan tablas CRM: ${missing.join(', ')}`);
    const [columns] = await connection.query('SELECT TABLE_NAME, COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN (?)', [expectedTables]);
    const required = { crm_cases: ['stage', 'lead_id', 'purchase_request_id'], crm_dealers: ['legal_name', 'status', 'data_processing_status'], crm_dealer_contacts: ['dealer_id', 'contact_name', 'email'], crm_case_events: ['case_id', 'to_stage'], crm_aftercare_tasks: ['case_id', 'task_type', 'status'] };
    for (const [table, fields] of Object.entries(required)) { const names = new Set(columns.filter((column) => column.TABLE_NAME === table).map((column) => column.COLUMN_NAME)); const absent = fields.filter((field) => !names.has(field)); if (absent.length) throw new Error(`${table} carece de: ${absent.join(', ')}`); }
    console.log('OK: estructura CRM presente; no se han leído registros de negocio.');
  } catch (error) { console.error(`Comprobación CRM fallida: ${error.message}`); process.exitCode = 1; } finally { await connection.end(); }
}
