---
description: Create a new versioned Flyway migration in backend/src/main/resources/db/migration/
argument-hint: [what the migration should do, in plain language]
allowed-tools: Bash(ls:*), Read, Glob, Grep, Write, AskUserQuestion
---

# New database migration

## Current state of the migrations folder

!`ls -1 backend/src/main/resources/db/migration/`

## Requested change

$ARGUMENTS

If the section above is empty, use the `AskUserQuestion` tool to ask the user what the
migration should do, and wait for their answer before doing anything else. Do not guess
and do not create any file until you have a concrete description of the change.

## Hard rule: never execute anything

This command only writes a file. Flyway applies it automatically the next time the user
starts the backend.

- Never connect to a database, and never run `psql`, `docker exec`, `docker compose exec`,
  `flyway`, `mvn`, or any other command that could reach Postgres.
- Never start the application to "check" that the migration works.
- The only shell command allowed is the `ls` of the migrations folder shown above.
- If you are unsure whether the SQL is correct, say so in your report — do not test it.

## Steps

1. **Pick the version number.** Take the highest `V<n>` in the listing above and add 1.
   Never reuse a number, never renumber an existing file, and never edit a migration that
   already exists — Flyway stores each applied migration's checksum and the app will
   refuse to start if one changes.

2. **Read the current schema before writing SQL.** Read the existing migrations in version
   order so you know the real state of every table involved: exact column names, types,
   nullability, and foreign keys. If the change touches a JPA entity, also read the
   matching `*Entity.java` under `backend/src/main/java/` so the SQL and the entity agree
   (`ddl-auto: validate` runs right after Flyway). Never assume a column exists — verify
   it in the migration history.

3. **Write the SQL** following the rules below.

4. **Name the file** `V<n>__<snake_case_description>.sql` — capital `V`, the number, a
   double underscore, then a lowercase snake_case description:
   - Start with a verb: `create_`, `add_`, `remove_`, `rename_`, `update_`, `backfill_`.
   - Keep it to about five words, describing the change and the table it applies to.
   - Examples: `V6__create_note_tags_table.sql`, `V7__add_favorite_to_notes.sql`,
     `V8__rename_notes_title_to_name.sql`.

5. **Write the file** to `backend/src/main/resources/db/migration/` — never anywhere else,
   and never overwrite an existing file. If the requested change needs a name that already
   exists, pick a more specific description.

6. **Report back**: print the file name, then the complete SQL in a single fenced block.
   After that, state in one or two lines what is left: restarting the backend to apply it,
   the matching change to the JPA entity, or a warning that the change is destructive.

## Naming rules

- Format: `V<integer>__<description>.sql`. Two underscores, not one — Flyway parses on that.
- Lowercase snake_case only, no spaces, no dates in the name.
- One version number per file, no gaps needed but never a duplicate.

## SQL rules

- Target PostgreSQL. Write plain SQL — no ORM-specific syntax, no `psql` meta-commands.
- **No `BEGIN;` / `COMMIT;`.** Flyway already runs each migration in its own transaction,
  so a failed statement rolls back the whole file.
- Don't use statements that cannot run inside a transaction, such as
  `CREATE INDEX CONCURRENTLY`. If one is truly needed, stop and tell the user instead of
  writing it.
- Don't prefix tables with `nido.`; Flyway sets `nido` as the default schema.
- One logical change per migration. If the request contains two unrelated changes, ask
  whether to split it into two files rather than bundling them.
- Do not use `IF NOT EXISTS` / `IF EXISTS` to make a migration re-runnable. A migration
  runs exactly once; those clauses only hide the fact that the schema is not what you think.
- Types: `TIMESTAMPTZ` for timestamps (never `TIMESTAMP`), `JSONB` (never `JSON`),
  `BIGSERIAL` for surrogate keys, `TEXT` or `VARCHAR(n)` with a deliberate limit.
- New domain tables follow the soft-delete convention: a nullable `deleted_at TIMESTAMPTZ`,
  and uniqueness enforced with partial unique indexes `WHERE deleted_at IS NULL`.
- Foreign keys always declare the delete behaviour explicitly (`ON DELETE CASCADE`,
  `ON DELETE SET NULL`, or `ON DELETE RESTRICT`) — pick the one that matches the ownership
  of the data and say why in a comment if it is not obvious.
- Add an index for every foreign key column you create.
- When adding a `NOT NULL` column to a table that may already hold rows, either give it a
  `DEFAULT`, or split it: add the column nullable, `UPDATE` the existing rows, then
  `ALTER COLUMN ... SET NOT NULL`. Never add a bare `NOT NULL` column without a default.
- Renaming a column is `ALTER TABLE ... RENAME COLUMN` — never a drop plus an add, which
  silently destroys the data.
- If the change alters the shape of data inside a `JSONB` column, include the `UPDATE` that
  migrates the existing rows in the same file, placed before any constraint that depends on
  the new shape.
- Start the file with a one-line comment stating what the migration does and why.
- Flag destructive statements (`DROP TABLE`, `DROP COLUMN`, `TRUNCATE`, a type change that
  can truncate values) in your final report so the user can confirm before restarting the app.

## Example output shape

```sql
-- V7__add_favorite_to_notes.sql
-- Lets a user mark a note as favorite so it can be pinned in the sidebar.

ALTER TABLE notes
    ADD COLUMN is_favorite BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX idx_notes_favorite ON notes(topic_id) WHERE is_favorite;
```