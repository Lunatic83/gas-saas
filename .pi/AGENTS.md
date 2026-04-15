# AGENTS.md

> **Project:** gas-saas — B2B multi-tenant SaaS platform
> **Core constraints:** TDD-first, schema-first DB migrations, quality gates never disabled

## Mission

gas-saas is a B2B SaaS platform with multi-tenancy, Stripe billing, Drizzle ORM, and Postgres. The primary quality principle is: never ship code that bypasses verification. LLMs accelerate execution but cannot replace judgment — verify everything through gates.

## Toolchain

| Action           | Command                                    | Authority                |
| ---------------- | ------------------------------------------ | ------------------------ |
| Build            | `pnpm build`                               | Outputs to `.next/`      |
| Unit Test        | `pnpm test:unit`                           | Vitest                   |
| Integration Test | `pnpm test:integration`                    | Vitest + test DB         |
| E2E Test         | `pnpm test:e2e`                            | Playwright               |
| Lint + Fix       | `pnpm lint:fix`                            | Biome — see `biome.json` |
| Type check       | `pnpm exec tsc --noEmit`                   | tsconfig.json            |
| Format           | `pnpm format`                              | Prettier                 |
| Docs             | `npx ctx7@latest docs /shadcn-ui/ui "..."` | shadcn/ui + Tailwind v4  |

## Judgment Boundaries

**NEVER**

- Disable ESLint, TypeScript, Prettier, or lint-staged to pass checks — fix the underlying issue
- Commit secrets, credentials, API keys, or `.env` files
- Force push to `main` (`git push --force`)
- Skip the full test gate (unit + integration + e2e) before opening a PR
- Merge when CI is red

**ASK**

- Before running database migrations
- Before deleting files with `git rm`
- Before adding external dependencies not in existing stack

**ALWAYS**

- Use TDD: write failing test before implementation (Workflow A)
- Run `pnpm test:unit && pnpm test:integration && pnpm test:e2e` as the Quality Gate
- Classify every task by `nature:` (code/config/manual) before starting
- Use Context7 for shadcn/ui and Tailwind v4 documentation
- Micro-commit after each discrete working state (Red/Green/Refactor)

## Architectural Constraints

### Data Access

- Schema migrations must precede application code changes (schema-first)
- Use Drizzle ORM client from `lib/db/` — never create raw DB connections

### Rate Limiting

- E5: IP-only rate limiting via `keys.rateLimit.auth(ip)`
- E6+: composite key `rate-limit:auth:{ip}:{userId}` once `withAuth` is real

### Security

- Never log raw user IDs — use hashed identifiers
- All inputs validated against Zod schemas before processing
- Never expose stack traces to user-facing errors

## Personas

Invoke via skill: `@tdd`, `@grill-me`, `@write-a-prd`, `@prd-to-issues`, `@pr-validate`, `@create-pr`
Definitions: `.claude/skills/`

## Context Map

```
src/
  app/               # Next.js App Router
  features/          # Feature-based modules (auth, billing, tenancy)
    auth/            # Authentication + session management
    billing/         # Stripe integration
    tenancy/         # Multi-tenancy: rows, schemas
  lib/
    db/              # Drizzle ORM schema + client
    redis/           # Rate limiting keys + client
    stripe/          # Stripe SDK wrapper
migrations/          # Drizzle migration files (schema-first)
tests/
  unit/              # Vitest unit tests
  integration/       # Vitest + test DB (saas_test)
  e2e/               # Playwright E2E tests
```

Note: Only structural deviations from Next.js/Drizzle defaults are listed. Standard conventions are inferable from the codebase.
