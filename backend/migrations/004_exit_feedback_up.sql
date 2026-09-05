CREATE TABLE IF NOT EXISTS exit_feedback (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  session_id CHAR(36) NOT NULL,
  page VARCHAR(255) NOT NULL,
  device ENUM('desktop', 'mobile', 'tablet', 'unknown') NOT NULL DEFAULT 'unknown',
  source VARCHAR(120) NULL,
  completed_report BOOLEAN NOT NULL DEFAULT FALSE,
  usefulness ENUM('helpful', 'uncertain', 'not_yet') NOT NULL,
  reason VARCHAR(80) NULL,
  comment VARCHAR(300) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_exit_feedback_date (created_at),
  INDEX idx_exit_feedback_usefulness (usefulness)
);
