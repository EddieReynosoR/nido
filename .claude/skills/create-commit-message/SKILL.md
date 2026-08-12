---
name: commit-staged
description: Write a commit message based ONLY on what the user deliberately staged, ignoring everything left unstaged. Use this whenever the user asks for a commit message, says "commit this", "I staged what I want", "write the commit message", or asks you to describe/summarize Git changes — even if they never say the word "staged". Also use it when the user is building partial commits with `git add -p` and needs a message covering just those hunks.
---

# Commit message from the staged changes

The user already decided what goes into this commit. That selection work is the
important part and it must be respected: the message describes **exactly what is in
the index**, nothing more and nothing less.

## Hard rules

1. **Never run `git add`, `git add -A`, `git add .`, or `git stage`.** If something
   is missing from the index, it's because the user left it out on purpose. Asking
   is fine; staging on their behalf is not.
2. **Never use `git commit -a`.** That flag sweeps every modified tracked file into
   the commit, which is the exact opposite of what's being asked.
3. **Every inspection uses `--cached`** (or its synonym `--staged`). A bare
   `git diff` shows what is *not* staged and will lead you to describe changes that
   aren't in the commit.
4. **A file can be half-staged.** With `git add -p` it's normal for a file to have
   some hunks staged and others not. Describe only the staged hunks.

## Workflow

### 1. Confirm something is actually staged

```bash
git diff --cached --quiet && echo "EMPTY STAGE"
```

If the index is empty, don't invent a message: tell the user nothing is staged and
show them `git status --short` so they can decide what to add.

### 2. Get the shape of the commit

```bash
git diff --cached --stat
git diff --cached --name-status
```

`--name-status` is worth running because it distinguishes `A` (added), `M`
(modified), `D` (deleted), `R` (renamed). A commit that only deletes files is
rarely a `feat`, for instance.

### 3. Read the actual content

```bash
git diff --cached
```

If the diff is large, narrow it per file (`git diff --cached -- path/to/file`)
instead of guessing from filenames. The message should come from what the code
does, not from what the files are called.

### 4. Spot partially staged files

```bash
git status --short
```

In that output the first column is the index and the second is the working tree. A
file marked `MM` has both staged and pending changes. Mention it to the user in one
line when you hand over the message — not so they change anything, but so they know
that file is being split across two commits.

### 5. Match the repository's history

```bash
git log --oneline -20
```

This tells you three things you shouldn't decide on your own:

- **Language.** If previous commits are in English, write in English even if the
  conversation is in another language. Log consistency wins.
- **Convention.** Do they use Conventional Commits (`feat:`, `fix:`)? Ticket
  prefixes (`ABC-123:`)? Plain imperative text? Copy whatever pattern is already
  there.
- **Scopes.** Reuse the scopes that already appear in the history instead of
  inventing new names for the same module.

Only when the history shows no clear pattern (new repo, commits like "wip",
"changes") should you fall back to Conventional Commits as the default.

### 6. Write it

**Default format (Conventional Commits):**

```
<type>(<scope>): <imperative summary, ~50 chars, no trailing period>

<optional body: the why, not the what>

<optional footer: refs, BREAKING CHANGE>
```

Types: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `build`, `ci`, `chore`,
`style`.

Summary criteria:

- Imperative mood (`add`, `fix`, `remove`), not past tense or gerund.
- The *what* is already in the diff; use the body for the *why* when it isn't
  obvious.
- No filler like "updated some files".

**When to add a body:** when the change has a non-obvious reason (a subtle bug, a
design decision, a workaround), when it touches several files with a common thread
that needs explaining, or when there's a breaking change. An obvious one-line
change needs no body.

**When the stage mixes unrelated work:** don't force it into a single type. Give
the message that best covers the set and tell the user, in one line, that they
could split it into two commits — with the concrete `git restore --staged <file>`
they'd need. Let them decide.

### 7. Hand it over

Show the message in a copy-ready block, and separately the command:

```bash
git commit -m "feat(auth): add refresh token rotation"
```

For messages with a body, use repeated `-m` (each one is a paragraph) or a heredoc:

```bash
git commit -F - <<'EOF'
fix(orders): prevent double inventory decrement

The OrderPlaced listener was registered twice on context reload, which
subtracted stock two times per order.

Refs: ABC-412
EOF
```

Don't run the commit yourself unless the user explicitly asks ("commit it", "go
ahead and commit"). If they only asked for the message, hand over the message.

## Examples

**Example 1 — clean stage, single purpose**

`git diff --cached --name-status`:
```
M  src/main/java/com/nido/auth/JwtService.java
M  src/main/java/com/nido/auth/AuthController.java
```
The diff adds a `/refresh` endpoint and refresh-token signing.

```
feat(auth): add refresh token endpoint
```

**Example 2 — partially staged file**

`git status --short`:
```
MM src/services/PaymentService.cs
```
Only the staged hunk fixes a division by zero in the tax calculation.

```
fix(payments): guard against zero-rate tax division
```

And you note: *"`PaymentService.cs` has additional unstaged changes; they're not
part of this commit."*

**Example 3 — stage with two unrelated topics**

```
M  README.md
A  src/utils/retry.ts
```

```
feat(utils): add retry helper with exponential backoff
```

And you note: *"The README change is unrelated. To split it out:
`git restore --staged README.md`."*

## Mistakes to avoid

| Mistake | Why it hurts |
|---|---|
| Running `git diff` without `--cached` | You describe changes that aren't in the commit |
| Running `git add` "to make it complete" | You commit what the user deliberately excluded |
| Using `git commit -am` | Ignores the carefully built stage |
| Listing filenames in the summary (`update A, B and C`) | The diff already says which files; the message should say what changed |
| Writing in the wrong language for the repo | Breaks log consistency |
| Inventing a new scope for a module that already had one | Pollutes scope-based filtering |