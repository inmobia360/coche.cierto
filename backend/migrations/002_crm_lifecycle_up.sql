CREATE TABLE IF NOT EXISTS crm_cases (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  lead_id BIGINT UNSIGNED NULL,
  purchase_request_id BIGINT UNSIGNED NULL,
  public_token_hash CHAR(64) NULL,
  stage VARCHAR(40) NOT NULL DEFAULT 'visitor',
  source VARCHAR(40) NOT NULL DEFAULT 'manual',
  journey_version VARCHAR(40) NOT NULL DEFAULT 'crm-v1',
  consent_snapshot JSON NULL,
  assigned_to VARCHAR(80) NULL,
  priority VARCHAR(16) NOT NULL DEFAULT 'normal',
  next_action_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  closed_at DATETIME NULL,
  deleted_at DATETIME NULL,
  UNIQUE KEY uq_crm_cases_public_token_hash (public_token_hash),
  INDEX idx_crm_cases_stage_updated (stage, updated_at),
  CONSTRAINT fk_crm_cases_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
  CONSTRAINT fk_crm_cases_purchase_request FOREIGN KEY (purchase_request_id) REFERENCES purchase_requests(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS crm_dealers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  legal_name VARCHAR(180) NOT NULL,
  trade_name VARCHAR(180) NULL,
  tax_id VARCHAR(40) NULL,
  website VARCHAR(255) NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'draft',
  verification_status VARCHAR(24) NOT NULL DEFAULT 'not_started',
  service_areas JSON NULL,
  specialties JSON NULL,
  contract_status VARCHAR(24) NOT NULL DEFAULT 'not_started',
  data_processing_status VARCHAR(24) NOT NULL DEFAULT 'pending_review',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  archived_at DATETIME NULL,
  INDEX idx_crm_dealers_status (status, verification_status)
);

ALTER TABLE purchase_request_invites ADD COLUMN IF NOT EXISTS dealer_id BIGINT UNSIGNED NULL;
ALTER TABLE purchase_request_invites ADD CONSTRAINT fk_purchase_request_invites_dealer FOREIGN KEY (dealer_id) REFERENCES crm_dealers(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS crm_dealer_contacts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  dealer_id BIGINT UNSIGNED NOT NULL,
  contact_name VARCHAR(160) NOT NULL,
  role VARCHAR(100) NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(40) NULL,
  whatsapp VARCHAR(40) NULL,
  preferred_channel VARCHAR(24) NULL,
  consent_status VARCHAR(24) NOT NULL DEFAULT 'pending_review',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  INDEX idx_crm_dealer_contacts_dealer (dealer_id, deleted_at),
  CONSTRAINT fk_crm_dealer_contacts_dealer FOREIGN KEY (dealer_id) REFERENCES crm_dealers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS crm_case_dealers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  case_id BIGINT UNSIGNED NOT NULL,
  dealer_id BIGINT UNSIGNED NOT NULL,
  relationship_state VARCHAR(24) NOT NULL DEFAULT 'candidate',
  contact_authorized_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_crm_case_dealer (case_id, dealer_id),
  CONSTRAINT fk_crm_case_dealers_case FOREIGN KEY (case_id) REFERENCES crm_cases(id) ON DELETE CASCADE,
  CONSTRAINT fk_crm_case_dealers_dealer FOREIGN KEY (dealer_id) REFERENCES crm_dealers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS crm_case_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  case_id BIGINT UNSIGNED NOT NULL,
  from_stage VARCHAR(40) NULL,
  to_stage VARCHAR(40) NOT NULL,
  actor_type VARCHAR(24) NOT NULL DEFAULT 'system',
  actor_id VARCHAR(80) NULL,
  reason VARCHAR(255) NULL,
  metadata JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_crm_case_events_case (case_id, created_at),
  CONSTRAINT fk_crm_case_events_case FOREIGN KEY (case_id) REFERENCES crm_cases(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS crm_aftercare_tasks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  case_id BIGINT UNSIGNED NOT NULL,
  task_type VARCHAR(32) NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'open',
  owner_type VARCHAR(24) NOT NULL DEFAULT 'internal',
  owner_id VARCHAR(80) NULL,
  due_at DATETIME NULL,
  notes VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_crm_aftercare_case_status (case_id, status, due_at),
  CONSTRAINT fk_crm_aftercare_case FOREIGN KEY (case_id) REFERENCES crm_cases(id) ON DELETE CASCADE
);
