-- V7__add_unique_topic_name_indexes.sql
-- Guarantees topic name uniqueness in the database instead of relying only on the
-- service-level pre-check, which races under concurrent requests. Case-insensitive to
-- match the LOWER(...) comparisons in TopicRepository.

SET search_path TO nido;

-- Root topics were never covered: parent_topic_id IS NULL makes every row distinct in
-- the V5 index, so duplicates at the top level were possible.
CREATE UNIQUE INDEX uq_topic_root_name_per_space_live
    ON topics (space_id, LOWER(name))
    WHERE parent_topic_id IS NULL AND deleted_at IS NULL;

-- V5's index is case-sensitive, so it does not enforce what the service checks.
DROP INDEX uq_topic_name_per_parent_live;

CREATE UNIQUE INDEX uq_topic_name_per_parent_live
    ON topics (parent_topic_id, LOWER(name))
    WHERE parent_topic_id IS NOT NULL AND deleted_at IS NULL;
