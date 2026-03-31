# Server Actions

Next.js Server Actions — the only way to mutate data from client components.

## Naming

Files are named by feature: `auth-actions.ts`, `billing-actions.ts`, etc.

## Guidelines

- Server Actions call `services/` — they are the HTTP boundary, not the business logic.
- Actions are async functions decorated with `'use server'`.
- Validate all inputs with Zod schemas from `lib/validations/`.
- Rate limiting is applied at the `services/` layer, not here.
