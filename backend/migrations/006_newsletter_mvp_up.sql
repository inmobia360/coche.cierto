ALTER TABLE leads
  ADD COLUMN newsletter_status VARCHAR(16) NOT NULL DEFAULT 'none' AFTER consent_commercial,
  ADD COLUMN newsletter_consent_at DATETIME NULL AFTER newsletter_status,
  ADD COLUMN newsletter_consent_source VARCHAR(80) NULL AFTER newsletter_consent_at,
  ADD COLUMN newsletter_consent_version VARCHAR(24) NULL AFTER newsletter_consent_source,
  ADD COLUMN newsletter_paused_at DATETIME NULL AFTER newsletter_consent_version,
  ADD COLUMN newsletter_unsubscribed_at DATETIME NULL AFTER newsletter_paused_at;

CREATE INDEX idx_leads_newsletter_status ON leads (newsletter_status, newsletter_consent_at);
