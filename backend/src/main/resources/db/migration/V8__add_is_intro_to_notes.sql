-- V8__add_is_intro_to_notes.sql
-- Lets a note be marked as its topic's intro (overview) note (one live intro per topic), and drops the unused notes.updated_at.

SET search_path TO nido;

ALTER TABLE notes
    ADD COLUMN is_intro BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX uq_notes_intro_per_topic_live
    ON notes (topic_id)
    WHERE is_intro AND deleted_at IS NULL;

ALTER TABLE notes
    DROP COLUMN updated_at;
