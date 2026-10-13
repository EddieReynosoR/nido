# Frontend

React 19 + TypeScript SPA built with Vite. See the root `CLAUDE.md` for the package
manager and the checks to run before finishing.

## Stack
- Routing: `react-router` v7 data router (`src/router.tsx`, `Component:` routes).
- Server state: TanStack Query. Client state: React context.
- UI: shadcn/ui (Radix, `radix-nova` style) + Tailwind v4, icons from `lucide-react`,
  toasts from `sonner`.
- Forms: `react-hook-form` + `zod` via `zodResolver`.
- Editor: BlockNote (`@blocknote/shadcn`). Drag and drop: `@dnd-kit` (0.5, pinned).
- API base URL comes from `VITE_API_URL` in `.env`.

## Layout of `src/`
- `api/`: one file per resource. Plain functions that call `executeFetch<T>` from
  `api/auth.ts` with the access token and a user-facing error message. No React here.
- `hooks/`: TanStack Query wrappers around `api/` (`useX` queries, `useCreateX` etc.
  mutations). Group by feature in a subfolder (`hooks/topics/`, `hooks/notes/`).
  File names are kebab-case `use-*.ts`.
- `context/`: providers that are also route layout components (render `<Outlet />`) plus
  a `useX()` hook that throws outside its provider.
- `components/<feature>/`: feature components (PascalCase, `export default function`).
  `components/ui/` is shadcn-generated; add to it with the shadcn CLI and avoid
  hand-editing it.
- `pages/`: route-level components.
- `lib/`: pure helpers, zod schemas (`*-schema.ts`), tree utilities, toasts, error classes.
- `types/`: shared types, one `*.types.ts` per resource.
- `constants/const.ts`: shared constants and reusable Tailwind class strings.

## Conventions
- Import with the `@/` alias, and use `import type` for types (`verbatimModuleSyntax`).
- Prettier: single quotes, semicolons, 2 spaces, trailing commas `es5`, width 80.
- Merge class names with `cn()` from `@/lib/utils`.
- All user-facing text is in English.

## Data fetching
- Query keys: `['spaces', accessToken]`, `['topics', spaceId]`, `['note', noteId]`.
  Reuse them exactly; invalidation depends on them.
- Hooks take `accessToken` (from `useAuth()`) as an argument. Queries use
  `enabled: !!accessToken` (and any id); mutations throw `HttpError('NO_SESSION', 400)`
  when there is no token and show `invalidSessionToast()` for it.
- Mutations on the topic tree are optimistic: `cancelQueries`, snapshot `previous`,
  update with the helpers in `lib/topic-tree.ts`, roll back in `onError`, and
  `invalidateQueries` in `onSettled`.
- Note saves go through `enqueueNoteSave` (`lib/note-save-queue.ts`) so requests for the
  same note never overlap. Deleting a note must call `discardNoteSaves` first.

## Errors and feedback
- `executeFetch` throws `HttpError` (has `status`), `TokenError` (auth codes), or
  `TypeError` (server unreachable). Branch on these classes rather than on message text (the one
  exception is the `NO_SESSION` sentinel above).
- Show failures with `errorToast({ id, title, error, customMessage })` from
  `lib/toast.ts`. Give each toast a stable `id` (`<resource>-<action>-error-<id>`) so
  repeats replace each other. Map a `409` to a specific `customMessage`.

## Forms
- Define the schema in `lib/<resource>-schema.ts` and export its inferred type.
- Use `useForm` + `Controller` with the `Field`, `FieldLabel`, `FieldError` components from
  `components/ui/field.tsx`, and set `aria-invalid` from `fieldState`.
