---
description: Create a Pull Request from the current branch's changes
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git branch:*), Bash(git fetch:*), Bash(git rev-parse:*), Bash(git remote:*), Bash(git symbolic-ref:*), Bash(git merge-base:*), Bash(git push:*), Bash(gh pr create:*), Bash(gh pr view:*), Read, Grep, Glob
---

## Current context

- Branch: !`git branch --show-current`
- Status: !`git status --short`
- Remotes: !`git remote -v`
- Fetch: !`git fetch origin 2>&1 | tail -3 || echo "fetch failed - check remote access"`
- Available remote branches: !`git branch -r | sed 's|^ *origin/||' | grep -v '^HEAD' | sort`
- Repo default branch: !`git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null | sed 's|^origin/||' || echo "not set locally"`

## Task

Create a Pull Request from the current branch. Follow these steps **in order**.

### Step 1 — ASK ME WHICH BRANCH TO MERGE INTO (ALWAYS)

Before doing anything else, stop and ask me:

> Which branch should this PR target? (default: `master`)

Rules for this step:
- Ask **every single time**, no exceptions — even if the repo default is obvious, even if a previous PR in this session already used a base branch.
- Show me the list of available remote branches from the context above so I can pick from it.
- **Wait for my answer.** Do not run any diff, push, or PR command before I reply.
- If I reply with an empty answer or just "default", use `master`. This repo's base branch is `master`, not `main` — never assume `main`.
- Validate my answer: if the branch I name doesn't exist in the remote branch list, tell me and ask again. Do not silently fall back to another branch.

Once I answer, refer to my choice as `<BASE>` for the rest of these steps.

### Step 2 — Gather the diff

Run these yourself with the Bash tool, using the base branch I chose:

```bash
git log --oneline origin/<BASE>..HEAD
git diff origin/<BASE>...HEAD --stat
git diff origin/<BASE>...HEAD
```

If `origin/<BASE>` doesn't resolve, run `git fetch origin <BASE>` once and retry. If it still fails, stop and report the error — do not guess a different base.

### Step 3 — Validate

- If there are uncommitted changes, tell me and stop (do not commit on your own).
- If the current branch is the same as `<BASE>`, stop and tell me.
- If there are no new commits vs `<BASE>`, stop and tell me.

### Step 4 — Analyze

Read the full diff (not just the last commit) and work out:
- What problem the change solves and why
- Which files/modules it touches and whether there are breaking changes
- Whether there are migrations, config changes, or new dependencies

### Step 5 — Push

Push the branch with `git push -u origin <current-branch>` if it isn't on the remote yet.

### Step 6 — ASK ME ABOUT `[skip-review]` (ALWAYS)

Stop and ask me this exact question:

> Should I add `[skip-review]` to the PR title? (yes / no)

Rules for this step:
- Ask **every single time**, no exceptions.
- **Wait for my answer.** Do not create the PR before I reply.
- Do not assume, infer, or default the answer based on the size or nature of the diff.
- If I say yes, prefix the title with `[skip-review] ` (e.g. `[skip-review] fix: correct null check in tire lookup`).
- If I say no, use the plain title with no prefix.

### Step 7 — Create the PR

Run `gh pr create --base <BASE>` with this body format:

```markdown
## What it does
<1-3 bullets, imperative mood, focused on the "what" and the "why">

## Why
<problem context, or a ticket link if the branch name suggests one>

## Key changes
<bullets per relevant file/module — do not list every file>

## How to test
<concrete, reproducible steps to validate the change>

## Notes
<breaking changes, migrations, tech debt, or "N/A">
```

**PR title**: Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`) plus a short imperative description. Max ~70 characters, not counting the `[skip-review]` prefix if I asked for it.

### Step 8 — Report

Show me the URL of the created PR.

## Rules

- Do not commit or modify code; only open a PR from what already exists.
- If the repo has a `.github/pull_request_template.md`, use it instead of the body format above.
- If the branch name contains a ticket ID (e.g. `JIRA-123`, `#456`), include it in the title or body.
- Do not invent testing steps — base them on what you actually see in the diff and in existing tests.
- Mark the PR as draft (`--draft`) if the diff contains `TODO`, `FIXME`, or leftover `console.log`.
- Never batch Step 1 and Step 6 into a single question. They are separate stops, asked at different points in the flow.