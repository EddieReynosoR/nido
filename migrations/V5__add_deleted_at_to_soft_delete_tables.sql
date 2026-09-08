-- V5__add_deleted_at_to_soft_delete_tables.sql
-- Adds a nullable deleted_at marker so user-owned records can be soft deleted
-- instead of physically removed. NULL means the row is live.

BEGIN;

SET search_path TO nido;

ALTER TABLE users
    ADD COLUMN deleted_at TIMESTAMPTZ;

CREATE UNIQUE INDEX uq_users_email_live ON users(email) WHERE deleted_at IS NULL;

ALTER TABLE spaces
    ADD COLUMN deleted_at TIMESTAMPTZ;

ALTER TABLE spaces DROP CONSTRAINT uq_space_name_per_user;
CREATE UNIQUE INDEX uq_space_name_per_user_live ON spaces(user_id, name) WHERE deleted_at IS NULL;

ALTER TABLE topics
    ADD COLUMN deleted_at TIMESTAMPTZ;

CREATE UNIQUE INDEX uq_topic_name_per_space_live ON topics(space_id, name) WHERE deleted_at IS NULL;

ALTER TABLE notes
    ADD COLUMN deleted_at TIMESTAMPTZ;

ALTER TABLE diagrams
    ADD COLUMN deleted_at TIMESTAMPTZ;

COMMIT;
