-- V6__update_topics_color_width_and_nullability.sql
-- Narrows topics.color to the 6-digit hex value the app actually stores (no leading '#')
-- and makes it required, so every topic renders with a colour instead of a muted fallback.

SET search_path TO nido;

UPDATE topics
    SET color = '6B7280'
    WHERE color IS NULL
       OR color !~ '^[0-9A-Fa-f]{6}$';

ALTER TABLE topics
    ALTER COLUMN color TYPE VARCHAR(6),
    ALTER COLUMN color SET DEFAULT '6B7280',
    ALTER COLUMN color SET NOT NULL;
