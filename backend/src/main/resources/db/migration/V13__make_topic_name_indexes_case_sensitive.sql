-- V13__make_topic_name_indexes_case_sensitive.sql
-- Topic names are unique per place respecting case, so "algebra" and "Algebra" can coexist.

SET search_path TO nido;

DROP INDEX uq_topic_root_name_per_space_live;
DROP INDEX uq_topic_name_per_parent_live;

CREATE UNIQUE INDEX uq_topic_root_name_per_space_live
    ON topics (space_id, name)
    WHERE parent_topic_id IS NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX uq_topic_name_per_parent_live
    ON topics (parent_topic_id, name)
    WHERE parent_topic_id IS NOT NULL AND deleted_at IS NULL;
