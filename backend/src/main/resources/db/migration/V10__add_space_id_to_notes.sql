-- V10__add_space_id_to_notes.sql
-- Lets a note live directly in a space without a topic. Every note now stores its space_id,
-- so note -> space is the single ownership path; topic_id becomes optional and, when set,
-- must point to a topic in that same space.

SET search_path TO nido;

-- Existing notes all have a topic, so their space comes from it.
ALTER TABLE notes
    ADD COLUMN space_id UUID;

UPDATE notes n
    SET space_id = t.space_id
    FROM topics t
    WHERE t.topic_id = n.topic_id;

ALTER TABLE notes
    ALTER COLUMN space_id SET NOT NULL,
    ALTER COLUMN topic_id DROP NOT NULL;

-- Target for the composite FK below, so a note's topic is always in the note's space.
ALTER TABLE topics
    ADD CONSTRAINT uq_topics_topic_space UNIQUE (topic_id, space_id);

-- The composite FK covers fk_note_topic; MATCH SIMPLE skips it when topic_id is NULL.
ALTER TABLE notes
    DROP CONSTRAINT fk_note_topic;

ALTER TABLE notes
    ADD CONSTRAINT fk_note_space
        FOREIGN KEY (space_id)
        REFERENCES spaces(space_id)
        ON DELETE CASCADE,
    ADD CONSTRAINT fk_note_topic_space
        FOREIGN KEY (topic_id, space_id)
        REFERENCES topics(topic_id, space_id)
        ON DELETE CASCADE;

-- The V8 intro index ignores NULL topic_id, so a topic-less intro note would slip through.
ALTER TABLE notes
    ADD CONSTRAINT chk_notes_intro_requires_topic
        CHECK (NOT is_intro OR topic_id IS NOT NULL);

-- Case-insensitive like the topic name indexes in V7; soft-deleted notes don't count.
CREATE UNIQUE INDEX uq_note_title_per_topic_live
    ON notes (topic_id, LOWER(title))
    WHERE topic_id IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX uq_note_title_per_space_root_live
    ON notes (space_id, LOWER(title))
    WHERE topic_id IS NULL AND deleted_at IS NULL;

CREATE INDEX idx_notes_space_id ON notes (space_id);
