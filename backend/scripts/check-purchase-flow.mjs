import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const backend = path.resolve(here, '..');
const read = (relative) => fs.readFileSync(path.join(backend, relative), 'utf8');
const server = read('src/server.js');
const schema = read('schema.sql');
const migration = read('migrations/001_purchase_requests_up.sql');
const rollback = read('migrations/001_purchase_requests_down.sql');
const checks = [];
const assert = (condition, message) => { if (!condition) throw new Error(message); checks.push(message); };

for (const route of [
  "app.post('/api/purchase-requests'",
  "app.get('/api/purchase-requests/:token'",
  "app.post('/api/purchase-requests/:token/revoke'",
  "app.delete('/api/purchase-requests/:token'",
  "app.post('/api/purchase-requests/:token/invitations'",
  "app.get('/api/purchase-offer-invites/:token'",
  "app.post('/api/purchase-offer-invites/:token/offers'",
  "app.get('/api/purchase-requests/:token/offers'"
]) assert(server.includes(route), `ruta presente: ${route}`);

for (const invariant of [
  "res.setHeader('Cache-Control', 'no-store')",
  "methods: ['GET', 'POST', 'DELETE']",
  "owner_token_hash",
  "share_token_hash",
  "consent?.saveRequest",
  "consent?.manualShare",
  "consent?.receiveOffers",
  "UPDATE purchase_requests SET state = ? WHERE id = ?"
]) assert(server.includes(invariant), `invariante presente: ${invariant}`);

for (const table of ['purchase_requests', 'purchase_request_consents', 'purchase_request_invites', 'purchase_offers']) {
  assert(schema.includes(`CREATE TABLE ${table}`), `tabla en schema.sql: ${table}`);
  assert(migration.includes(`CREATE TABLE IF NOT EXISTS ${table}`), `tabla en migracion: ${table}`);
  assert(rollback.indexOf(`DROP TABLE IF EXISTS ${table}`) >= 0, `tabla en rollback: ${table}`);
}

assert(rollback.indexOf('DROP TABLE IF EXISTS purchase_offers;') < rollback.indexOf('DROP TABLE IF EXISTS purchase_request_invites;'), 'rollback respeta dependencias de ofertas');
assert(rollback.indexOf('DROP TABLE IF EXISTS purchase_request_invites;') < rollback.indexOf('DROP TABLE IF EXISTS purchase_requests;'), 'rollback respeta dependencias de peticiones');
assert(!/UPDATE purchase_requests\s+SET\s+state\s*=\s*\?\s+WHERE\s+token_hash/.test(server), 'caducidad no usa columna token_hash inexistente en purchase_requests');

console.log(`OK: ${checks.length} invariantes del flujo comprador-concesionario verificadas (sin conexión a base de datos).`);
