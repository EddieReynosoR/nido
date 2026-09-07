-- V5__add_deleted_at_to_soft_delete_tables.sql
-- Adds a nullable deleted_at marker so user-owned records can be soft deleted
-- instead of physically removed. NULL means the row is live.

BEGIN;

SET search_path TO nido;

ALTER TABLE users
    ADD COLUMN deleted_at TIMESTAMPTZ;

ALTER TABLE spaces
    ADD COLUMN deleted_at TIMESTAMPTZ;

ALTER TABLE topics
    ADD COLUMN deleted_at TIMESTAMPTZ;

ALTER TABLE notes
    ADD COLUMN deleted_at TIMESTAMPTZ;

ALTER TABLE diagrams
    ADD COLUMN deleted_at TIMESTAMPTZ;

-- Partial indexes: every read path filters on deleted_at IS NULL, so index only
-- the live rows and keep the index small as deleted rows accumulate.
CREATE INDEX idx_users_live ON users(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_spaces_user_id_live ON spaces(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_topics_space_id_live ON topics(space_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_topics_parent_id_live ON topics(parent_topic_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_notes_topic_id_live ON notes(topic_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_diagrams_note_id_live ON diagrams(note_id) WHERE deleted_at IS NULL;

COMMIT;
