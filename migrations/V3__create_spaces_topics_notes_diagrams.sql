BEGIN;

SET search_path TO nido;

CREATE TABLE IF NOT EXISTS spaces (
    space_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_space_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT uq_space_name_per_user UNIQUE (user_id, name)
);

CREATE TABLE IF NOT EXISTS topics (
    topic_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    color VARCHAR(20),
    space_id UUID NOT NULL,
    parent_topic_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_topic_space
        FOREIGN KEY (space_id)
        REFERENCES spaces(space_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_topic_parent
        FOREIGN KEY (parent_topic_id)
        REFERENCES topics(topic_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notes (
    note_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    content JSONB NOT NULL DEFAULT '[]'::jsonb,
    topic_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_note_topic
        FOREIGN KEY (topic_id)
        REFERENCES topics(topic_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS diagrams (
    diagram_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL,
    elements JSONB NOT NULL DEFAULT '[]'::jsonb,
    app_state JSONB NOT NULL DEFAULT '{}'::jsonb,
    files JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT fk_diagram_note
        FOREIGN KEY (note_id)
        REFERENCES notes(note_id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_topics_space_id ON topics(space_id);
CREATE INDEX IF NOT EXISTS idx_topics_parent_id ON topics(parent_topic_id);
CREATE INDEX IF NOT EXISTS idx_notes_topic_id ON notes(topic_id);
CREATE INDEX IF NOT EXISTS idx_diagrams_note_id ON diagrams(note_id);

COMMIT;