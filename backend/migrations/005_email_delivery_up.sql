ALTER TABLE leads
  ADD COLUMN email_status VARCHAR(24) NOT NULL DEFAULT 'pending' AFTER consent_at,
  ADD COLUMN email_last_sent_at DATETIME NULL AFTER email_status,
  ADD COLUMN email_send_attempts SMALLINT UNSIGNED NOT NULL DEFAULT 0 AFTER email_last_sent_at,
  ADD COLUMN verification_used_at DATETIME NULL AFTER verification_expires_at,
  ADD COLUMN pdf_downloaded_at DATETIME NULL AFTER verification_used_at;

CREATE INDEX idx_leads_email_status ON leads (email_status, email_last_sent_at);
