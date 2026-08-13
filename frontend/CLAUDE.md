# Nido Frontend

React + TypeScript frontend for the Nido project. Connects to `nido_backend` (Spring Boot).

## Commands

Always use `pnpm`, never `npm` or `yarn`.

## Project structure (group-by-type)

### Where things go

- Reusable component used in multiple places → `components/`
- Pure UI primitive (shadcn) → `components/ui/` — do not edit by hand unless necessary; these come from shadcn
- Page tied to a route → `pages/`, registered as a child route in `router.tsx`
- Zod schema or validation → `lib/` (e.g. `auth-schema.ts`)
- Shared helper / utility → `lib/utils.ts` or a new file in `lib/`

## Conventions

### Routing

- `router.tsx` defines routes with `createBrowserRouter`.
- `App.tsx` is the **root layout**: it renders shared chrome plus `<Outlet />`. It is the `element` of the parent route, NOT rendered standalone in `main.tsx`.
- `main.tsx` only mounts `<RouterProvider router={router} />` inside `<StrictMode>`. Do not render `<App />` directly there.
- Pages are children of the root layout route. Use `index: true` for the home route.

### Forms & validation

- Use **react-hook-form** with `zodResolver`.
- Use **Zod 4 syntax**: prefer `z.email()` over the deprecated `z.string().email()`.
- Schemas live in `lib/` and export both the schema and its inferred type (e.g. `loginSchema` + `type LoginSchema = z.infer<typeof loginSchema>`).
- Always add `noValidate` to the `<form>` element so native browser validation does not conflict with Zod errors.
- Field error messages should be specific and correct (don't copy-paste an "Email is required" message onto the password field).

### UI

- Use shadcn/ui components from `components/ui/`.
- The `<Toaster />` (sonner) must stay mounted once in `App.tsx`, outside the `<Outlet />`. Call `toast()` from anywhere; never add a second `<Toaster />`.
- Import alias `@/` maps to `src/` (e.g. `@/lib/auth-schema`).

### Code style

- Prettier and ESLint are configured — match the existing config (`.prettierrc`, `eslint.config.js`). Run `pnpm lint` after changes.
- TypeScript: keep components typed; avoid `any`.

## Backend

- Talks to `nido_backend`, a Spring Boot service.
- Keep API call logic separated from components (e.g. in `lib/` or a dedicated `api` module) rather than inline in JSX.

## Working agreements for Claude Code

- Prefer small, scoped changes (one component or feature at a time).
- Before large refactors, outline a plan first.
- Follow the existing structure and conventions above instead of introducing new patterns (e.g. don't switch to a feature-based folder layout unless asked).
- Use `pnpm` for any install or script command.
