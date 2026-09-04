ALTER TABLE purchase_request_invites DROP FOREIGN KEY fk_purchase_request_invites_dealer;
ALTER TABLE purchase_request_invites DROP COLUMN dealer_id;
DROP TABLE IF EXISTS crm_aftercare_tasks;
DROP TABLE IF EXISTS crm_case_events;
DROP TABLE IF EXISTS crm_case_dealers;
DROP TABLE IF EXISTS crm_dealer_contacts;
DROP TABLE IF EXISTS crm_dealers;
DROP TABLE IF EXISTS crm_cases;
