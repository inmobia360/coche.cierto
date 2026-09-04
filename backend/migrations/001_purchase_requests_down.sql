-- Reversión de 001_purchase_requests_up.sql.
-- Ejecutar solo con autorización explícita: elimina peticiones, invitaciones y ofertas.

DROP TABLE IF EXISTS purchase_offers;
DROP TABLE IF EXISTS purchase_request_invites;
DROP TABLE IF EXISTS purchase_request_consents;
DROP TABLE IF EXISTS purchase_requests;
