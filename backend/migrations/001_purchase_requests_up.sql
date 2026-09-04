-- CocheCierto — migración 001
-- Peticiones privadas, invitaciones y ofertas estructuradas.
-- Ejecutar únicamente después de revisar el entorno MySQL y realizar copia de seguridad.

CREATE TABLE IF NOT EXISTS purchase_requests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  owner_token_hash CHAR(64) NOT NULL,
  share_token_hash CHAR(64) NOT NULL,
  payload JSON NOT NULL,
  state VARCHAR(24) NOT NULL DEFAULT 'active',
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at DATETIME NULL,
  UNIQUE KEY uq_purchase_requests_owner_token_hash (owner_token_hash),
  UNIQUE KEY uq_purchase_requests_share_token_hash (share_token_hash),
  INDEX idx_purchase_requests_state_expiry (state, expires_at)
);

CREATE TABLE IF NOT EXISTS purchase_request_consents (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT UNSIGNED NOT NULL,
  consent_type VARCHAR(40) NOT NULL,
  granted BOOLEAN NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_purchase_request_consents_request
    FOREIGN KEY (request_id) REFERENCES purchase_requests(id)
    ON DELETE CASCADE,
  INDEX idx_purchase_request_consents_request (request_id)
);

CREATE TABLE IF NOT EXISTS purchase_request_invites (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  dealer_name VARCHAR(160) NULL,
  state VARCHAR(24) NOT NULL DEFAULT 'active',
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_purchase_request_invites_token_hash (token_hash),
  INDEX idx_purchase_request_invites_request (request_id),
  CONSTRAINT fk_purchase_request_invites_request
    FOREIGN KEY (request_id) REFERENCES purchase_requests(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS purchase_offers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT UNSIGNED NOT NULL,
  invite_id BIGINT UNSIGNED NOT NULL,
  version INT UNSIGNED NOT NULL DEFAULT 1,
  payload JSON NOT NULL,
  state VARCHAR(24) NOT NULL DEFAULT 'received',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_purchase_offers_request (request_id, created_at),
  CONSTRAINT fk_purchase_offers_request
    FOREIGN KEY (request_id) REFERENCES purchase_requests(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_purchase_offers_invite
    FOREIGN KEY (invite_id) REFERENCES purchase_request_invites(id)
    ON DELETE CASCADE
);
