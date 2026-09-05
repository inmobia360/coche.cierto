CREATE TABLE IF NOT EXISTS crm_product_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  event_id CHAR(64) NOT NULL,
  event_type VARCHAR(48) NOT NULL,
  case_id BIGINT UNSIGNED NULL,
  source VARCHAR(80) NULL,
  campaign VARCHAR(120) NULL,
  schema_version VARCHAR(24) NOT NULL DEFAULT 'crm-events-v1',
  metadata JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_crm_product_events_event_id (event_id),
  INDEX idx_crm_product_events_type_date (event_type, created_at),
  CONSTRAINT fk_crm_product_events_case FOREIGN KEY (case_id) REFERENCES crm_cases(id) ON DELETE SET NULL
);
