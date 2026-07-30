BEGIN;

SET search_path TO nido;

ALTER TABLE users
    ALTER COLUMN created_at TYPE TIMESTAMPTZ
        USING created_at AT TIME ZONE 'UTC',
    ALTER COLUMN updated_at TYPE TIMESTAMPTZ
        USING updated_at AT TIME ZONE 'UTC';

ALTER TABLE refresh_tokens
    ALTER COLUMN expires_at TYPE TIMESTAMPTZ
        USING expires_at AT TIME ZONE 'UTC',
    ALTER COLUMN created_at TYPE TIMESTAMPTZ
        USING created_at AT TIME ZONE 'UTC';

COMMIT;