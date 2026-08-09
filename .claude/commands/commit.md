---
description: Stage, commit, and push the current changes
---

Review the working tree from the repository root and create one or more commits.

## 1. Inspect

Run `git status` and `git diff` (plus `git diff --staged` if anything is already staged).
This is a monorepo with `backend/` (Spring Boot), `frontend/`, and `migrations/`, so changes
may span multiple areas.

## 2. Group

If the changes cover unrelated concerns, split them into separate commits rather than
lumping everything together. Related changes across areas (e.g. a new endpoint plus the
UI that consumes it) belong in the same commit.

If you are unsure how to split, propose the grouping and wait for confirmation before
committing.

## 3. Stage

Stage explicitly by path — never run `git add .`.
Before staging, check for files that must not be committed: `.env` files, credentials,
local config, build output (`target/`, `dist/`, `node_modules/`), IDE folders (`.idea/`),
and database dumps. If any appear untracked, flag them and suggest adding them to
`.gitignore` instead of committing them.

## 4. Commit

Write the message in English, following Conventional Commits, with a scope matching the
area touched:

```
feat(backend): add paginated spaces listing endpoint
fix(frontend): correct space name validation
chore(migrations): add unique constraint on spaces(user_id, name)
```

Rules:
- Subject line in imperative mood, under 72 characters, no trailing period
- Add a body only when the "why" is not obvious from the diff
- If the current branch name starts with an issue number (e.g. `61-add-new-space-controller`),
  reference it in the body as `Refs #61`
- Do not add co-author trailers or tool attribution

## 5. Push

Push to `origin`. If the current branch has no upstream set, use:

```bash
git push -u origin "$(git branch --show-current)"
```

Report the commit hash(es) and the branch that was pushed.

## Do not

- Do not amend, rebase, force-push, or modify existing commits
- Do not commit directly to `master` — if the current branch is `master`, stop and say so
- Do not create or switch branches unless asked