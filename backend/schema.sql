CREATE TABLE leads (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(40) NULL,
  name VARCHAR(120) NULL,
  intent VARCHAR(20) NOT NULL,
  purchase_window VARCHAR(20) NOT NULL,
  recommended_category VARCHAR(80) NOT NULL,
  usage_type VARCHAR(20) NOT NULL,
  questionnaire_version VARCHAR(40) NOT NULL,
  recommendation_version VARCHAR(40) NOT NULL,
  consent_result BOOLEAN NOT NULL,
  consent_commercial BOOLEAN NOT NULL DEFAULT FALSE,
  consent_at DATETIME NOT NULL,
  verified_at DATETIME NULL,
  verification_token_hash CHAR(64) NULL,
  verification_expires_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_leads_email (email),
  INDEX idx_leads_intent_window (intent, purchase_window)
);

CREATE TABLE purchase_requests (
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

CREATE TABLE purchase_request_consents (
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

CREATE TABLE purchase_request_invites (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT UNSIGNED NOT NULL,
  dealer_id BIGINT UNSIGNED NULL,
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

CREATE TABLE purchase_offers (
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

CREATE TABLE crm_cases (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, lead_id BIGINT UNSIGNED NULL, purchase_request_id BIGINT UNSIGNED NULL,
  public_token_hash CHAR(64) NULL, stage VARCHAR(40) NOT NULL DEFAULT 'visitor', source VARCHAR(40) NOT NULL DEFAULT 'manual', journey_version VARCHAR(40) NOT NULL DEFAULT 'crm-v1', consent_snapshot JSON NULL, assigned_to VARCHAR(80) NULL, priority VARCHAR(16) NOT NULL DEFAULT 'normal', next_action_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, closed_at DATETIME NULL, deleted_at DATETIME NULL,
  UNIQUE KEY uq_crm_cases_public_token_hash (public_token_hash), INDEX idx_crm_cases_stage_updated (stage, updated_at),
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL, FOREIGN KEY (purchase_request_id) REFERENCES purchase_requests(id) ON DELETE SET NULL
);
CREATE TABLE crm_dealers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, legal_name VARCHAR(180) NOT NULL, trade_name VARCHAR(180) NULL, tax_id VARCHAR(40) NULL, website VARCHAR(255) NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'draft', verification_status VARCHAR(24) NOT NULL DEFAULT 'not_started', service_areas JSON NULL, specialties JSON NULL, contract_status VARCHAR(24) NOT NULL DEFAULT 'not_started', data_processing_status VARCHAR(24) NOT NULL DEFAULT 'pending_review',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, archived_at DATETIME NULL, INDEX idx_crm_dealers_status (status, verification_status)
);
CREATE TABLE crm_dealer_contacts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, dealer_id BIGINT UNSIGNED NOT NULL, contact_name VARCHAR(160) NOT NULL, role VARCHAR(100) NULL, email VARCHAR(255) NULL, phone VARCHAR(40) NULL, whatsapp VARCHAR(40) NULL, preferred_channel VARCHAR(24) NULL, consent_status VARCHAR(24) NOT NULL DEFAULT 'pending_review',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, deleted_at DATETIME NULL, INDEX idx_crm_dealer_contacts_dealer (dealer_id, deleted_at), FOREIGN KEY (dealer_id) REFERENCES crm_dealers(id) ON DELETE CASCADE
);
CREATE TABLE crm_case_dealers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, case_id BIGINT UNSIGNED NOT NULL, dealer_id BIGINT UNSIGNED NOT NULL, relationship_state VARCHAR(24) NOT NULL DEFAULT 'candidate', contact_authorized_at DATETIME NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_crm_case_dealer (case_id, dealer_id), FOREIGN KEY (case_id) REFERENCES crm_cases(id) ON DELETE CASCADE, FOREIGN KEY (dealer_id) REFERENCES crm_dealers(id) ON DELETE CASCADE
);
CREATE TABLE crm_case_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, case_id BIGINT UNSIGNED NOT NULL, from_stage VARCHAR(40) NULL, to_stage VARCHAR(40) NOT NULL, actor_type VARCHAR(24) NOT NULL DEFAULT 'system', actor_id VARCHAR(80) NULL, reason VARCHAR(255) NULL, metadata JSON NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX idx_crm_case_events_case (case_id, created_at), FOREIGN KEY (case_id) REFERENCES crm_cases(id) ON DELETE CASCADE
);
CREATE TABLE crm_aftercare_tasks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, case_id BIGINT UNSIGNED NOT NULL, task_type VARCHAR(32) NOT NULL, status VARCHAR(24) NOT NULL DEFAULT 'open', owner_type VARCHAR(24) NOT NULL DEFAULT 'internal', owner_id VARCHAR(80) NULL, due_at DATETIME NULL, notes VARCHAR(500) NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, INDEX idx_crm_aftercare_case_status (case_id, status, due_at), FOREIGN KEY (case_id) REFERENCES crm_cases(id) ON DELETE CASCADE
);
ALTER TABLE purchase_request_invites ADD CONSTRAINT fk_purchase_request_invites_dealer FOREIGN KEY (dealer_id) REFERENCES crm_dealers(id) ON DELETE SET NULL;
