BEGIN;

ALTER TABLE nido.refresh_tokens
DROP COLUMN revoked_at;

COMMIT;