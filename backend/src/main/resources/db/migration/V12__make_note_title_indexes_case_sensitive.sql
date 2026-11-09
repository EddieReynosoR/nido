-- V12__make_note_title_indexes_case_sensitive.sql
-- Note titles are unique per place respecting case, so "algebra" and "Algebra" can coexist.

SET search_path TO nido;

DROP INDEX uq_note_title_per_topic_live;
DROP INDEX uq_note_title_per_space_root_live;

CREATE UNIQUE INDEX uq_note_title_per_topic_live
    ON notes (topic_id, title)
    WHERE topic_id IS NOT NULL AND NOT is_intro AND deleted_at IS NULL;

CREATE UNIQUE INDEX uq_note_title_per_space_root_live
    ON notes (space_id, title)
    WHERE topic_id IS NULL AND deleted_at IS NULL;
