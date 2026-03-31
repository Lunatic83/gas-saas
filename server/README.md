# Server

Server-side business logic. All database access and mutations go through this layer.

## Structure

- `services/` — Business logic — called by Route Handlers and Server Actions
- `actions/` — Next.js Server Actions (web app mutations only)
- `queries/` — Read-only database query functions

## Guidelines

- **Never** import from `server/` in client components — use Server Actions or Route Handlers as the boundary.
- `queries/` are always read-only — no mutations.
- `services/` can call `queries/` and other `services/`, but not vice versa (no upward imports).
- All database access goes through `queries/` or `services/` — never raw SQL in Route Handlers.
