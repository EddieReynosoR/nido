---
name: commit
description: Stage, commit, and push the current changes
disable-model-invocation: true
---

Review the working tree from the repository root and create one or more commits.

## How to ask me things

Whenever you need me to choose or confirm something, always use the `AskUserQuestion`
tool with explicit options so I can select from a list. Never ask as plain text, and
never list the options in a message and wait for me to type an answer.

## 1. Inspect

Run `git status` and `git diff` (plus `git diff --staged` if anything is already staged).
This is a monorepo with `backend/` (Spring Boot), `frontend/`, and `migrations/`, so changes
may span multiple areas.

## 2. Group

If the changes cover unrelated concerns, split them into separate commits rather than
lumping everything together. Related changes across areas (e.g. a new endpoint plus the
UI that consumes it) belong in the same commit.

If you are unsure how to split, propose the grouping with `AskUserQuestion` and wait for
my selection before committing. Offer options such as "Use the proposed grouping" (put the
grouping in the option description or preview) and "Single commit".

## 3. Stage

Stage explicitly by path — never run `git add .`.
Before staging, check for files that must not be committed: `.env` files, credentials,
local config, build output (`target/`, `dist/`, `node_modules/`), IDE folders (`.idea/`),
and database dumps. If any appear untracked, flag them with `AskUserQuestion`, offering
"Add to `.gitignore`" and "Leave untracked, don't commit". Never commit them.

## 4. Ask about `[skip-review]`

Before creating any commit, always ask with `AskUserQuestion`:

> Add `[skip-review]` to the commit message? (skips the automated PR review workflow)

Options: "No" and "Yes, add `[skip-review]`". Wait for my selection. Never assume — ask on every run, even if the same answer was given
earlier in the session.

If the answer is yes, append `[skip-review]` at the end of the subject line, separated by
a space:

```
feat(backend): add paginated spaces listing endpoint [skip-review]
```

If multiple commits are being created in one run, ask once and apply the same answer to
all of them.

## 5. Commit

Write the message in English, following Conventional Commits, with a scope matching the
area touched:

```
feat(backend): add paginated spaces listing endpoint
fix(frontend): correct space name validation
chore(migrations): add unique constraint on spaces(user_id, name)
```

Rules:
- Subject line in imperative mood, no trailing period
- Keep the subject under 72 characters — including `[skip-review]` when it is appended
- Add a body only when the "why" is not obvious from the diff
- If the current branch name starts with an issue number (e.g. `61-add-new-space-controller`),
  reference it in the body as `Refs #61`
- Do not add co-author trailers or tool attribution

## 6. Push

Push to `origin`. If the current branch has no upstream set, use:

```bash
git push -u origin "$(git branch --show-current)"
```

Report the commit hash(es) and the branch that was pushed.

## Do not

- Do not amend, rebase, force-push, or modify existing commits
- Do not commit directly to `master` — if the current branch is `master`, stop and say so
- Do not create or switch branches unless asked