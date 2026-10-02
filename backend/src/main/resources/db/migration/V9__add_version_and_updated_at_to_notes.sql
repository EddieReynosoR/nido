-- V9__add_version_and_updated_at_to_notes.sql
-- Supports the update-note endpoint: version enables optimistic locking so concurrent saves
-- don't silently overwrite each other, and updated_at records when a note was last edited.

ALTER TABLE notes
    ADD COLUMN version BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Existing notes have never been edited through the new endpoint, so their last-modified
-- time is their creation time rather than the moment this migration ran.
UPDATE notes
    SET updated_at = created_at;
