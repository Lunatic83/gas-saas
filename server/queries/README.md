# Server Queries

Read-only database query functions. No mutations.

## Naming

Files are named by domain: `auth-queries.ts`, `billing-queries.ts`, `accounts-queries.ts`, etc.

## Guidelines

- All functions are read-only — if you need to mutate, call a service.
- Queries return plain serializable objects, not ORM model instances.
- Use Drizzle's query builder — avoid raw SQL unless absolutely necessary.
