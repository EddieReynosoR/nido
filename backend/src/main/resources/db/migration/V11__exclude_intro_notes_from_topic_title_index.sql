-- V11__exclude_intro_notes_from_topic_title_index.sql
-- An intro note takes its topic's name as title, so it must not block a regular note with the
-- same title in that topic. Intro notes are already unique per topic (uq_notes_intro_per_topic_live).

SET search_path TO nido;

DROP INDEX uq_note_title_per_topic_live;

CREATE UNIQUE INDEX uq_note_title_per_topic_live
    ON notes (topic_id, LOWER(title))
    WHERE topic_id IS NOT NULL AND NOT is_intro AND deleted_at IS NULL;
