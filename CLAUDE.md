# Nido

Nido is a personal study-notes app, currently an MVP. It exists to replace notes
scattered across Google Docs and Excalidraw with one place that is simpler than Notion.

Users organize their material as spaces → topics (a nested tree) → notes. Notes are
Confluence-style block documents (BlockNote) that can embed Excalidraw diagrams;
there is no free-form canvas positioning.

- `backend/`: Spring Boot REST API with PostgreSQL
- `frontend/`: React + TypeScript SPA (pnpm only, never npm or yarn)
- `backend/src/main/resources/db/migration/`: Flyway SQL migrations, applied on startup

## Before finishing a change

- Backend: `cd backend && ./mvnw -q compile`
- Frontend: `cd frontend && pnpm lint && pnpm build`

## Easy to get wrong

- Rows are soft-deleted (`deleted_at`); every query must filter live rows.
- Every endpoint checks the resource belongs to the JWT user.
- Changing a JPA entity requires a new migration file, or the app won't boot.
- Only free libraries and services; ask before adding a dependency.