# Lib

Shared libraries and utilities with no server-side business logic.

## Structure

- `auth/` — Better-Auth configuration
- `db/` — Drizzle schema and database client
- `queue/` — BullMQ queue definitions
- `redis/` — Redis client
- `validations/` — Zod schemas shared between client and server

## Guidelines

- Everything in `lib/` is a pure utility or client — no side effects, no direct database calls (only via `db/`).
- Business logic does NOT live here — it lives in `server/services/`.
- Zod schemas here are the single source of truth for validation on both client and server.
