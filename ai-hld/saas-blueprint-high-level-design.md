# SaaS Boilerplate — Master Architecture Prompt

**Version:** 1.0
**Status:** Pre-implementation — architecture and planning phase only
**Goal of this document:** Define the full architecture, stack, and development methodology for a reusable SaaS boilerplate. No code is written until this document reaches v1.0 and all open questions (marked `[DECISION REQUIRED]`) are resolved. Content is decision + rationale — no implementation details or config snippets, except where a data model or schema is necessary to communicate an architectural design (e.g. Section 8.3).

---

## 1. Product Context & Goals

### 1.1 Purpose

This is a **production-grade SaaS boilerplate** designed to be the foundation for rapid but reliable MVP delivery. It is not a throwaway prototype — every decision should optimise for: correctness first, extensibility second, speed of future feature development third.

The boilerplate must deliver:

- A working, deployable SaaS shell with auth, billing, user management, and RBAC out of the box.
- A self-sovereign PaaS infrastructure philosophy: no vendor lock-in to managed platforms (Vercel, Railway, Render). Everything runs on VPS infrastructure you control.
- A development methodology that produces reliable, testable, AI-assisted code by default.

### 1.2 Primary Consumer of This Boilerplate

This boilerplate is built **by and for a small team or solo developer** launching multiple future SaaS products. Documentation, onboarding clarity, and time-to-first-feature are key quality metrics alongside correctness.

**Target time-to-first-feature** (after cloning the boilerplate): < 2 days for a developer familiar with the stack.

### 1.3 Developer Prerequisites

Every developer working on this boilerplate must have the following installed before cloning. These are hard requirements — the workflow cannot function without them.

| Tool | Purpose | Install |
|---|---|---|
| **Claude Code** | Primary development interface + skills runner | `npm install -g @anthropic-ai/claude-code` |
| **`gh` CLI** | GitHub interaction from terminal (Issues, PRs, Milestones) | `brew install gh` / [cli.github.com](https://cli.github.com) |
| **Docker + Docker Compose** | All local service stacks | [docker.com](https://docker.com) |
| **pnpm** | Package manager (npm/yarn not supported) | `npm install -g pnpm` |
| **Stripe CLI** | Local webhook replay for e2e tests | `brew install stripe/stripe-cli/stripe` |
| **Node.js (LTS)** | Runtime | Via `nvm` or `fnm` — version pinned in `.nvmrc` |

After installing, run `gh auth login` and `stripe login` to authenticate before first use. Claude Code requires an Anthropic API key set as `ANTHROPIC_API_KEY` in the shell environment.


### 1.4 Out of Scope for v1.0

- Native mobile app (iOS/Android) — mobile API auth deferred to v2
- Third-party / M2M API key authentication — not designed at this stage
- Real-time / WebSocket features
- AI-powered product features (infrastructure only in v1)
- Staging environment (added when a second project uses this boilerplate)
- Internationalisation / i18n (architecture must not prevent it; implementation deferred)

---

## 2. Infrastructure & Deployment

### 2.1 PaaS Philosophy

**Self-sovereign PaaS**: all infrastructure runs on VPS nodes managed via **Dokploy**. No dependence on Vercel, Railway, or similar platforms. The deployment model must be reproducible on any VPS provider.

### 2.2 Hosting

- **Provider:** Hetzner Cloud
- **Initial node:** CX21 (4GB RAM, 2 vCPU) — minimum viable for running PostgreSQL + Redis + App + Dokploy overhead simultaneously. The CX11 (2GB) is insufficient for production.
- **Scaling model:** Horizontal container scaling via **Docker Swarm**. The architecture must support adding nodes without application changes.

### 2.3 Container & Orchestration

- **Runtime:** Docker + Docker Compose (single node) → Docker Swarm (multi-node)
- **Reverse proxy / Load balancer:** Traefik (bundled with Dokploy). Used for: SSL termination (Let's Encrypt automatic), routing, and load balancing across app replicas.
- **Rule:** A Traefik load balancer sits in front of the app even on a single-node deployment. This ensures the scaling path requires zero architectural change.
- **SSL:** Traefik manages Let's Encrypt certificates automatically. HTTPS enforced at the proxy layer; HTTP redirects to HTTPS.

### 2.4 Docker Registry

- **Choice:** GitHub Container Registry (GHCR) — free, integrates natively with GitHub Actions, private by default.
- **Image tagging strategy:** Semantic versioning (`v1.2.3`) via git tags + git SHA suffix for traceability (e.g., `v1.2.3-abc1234`).

### 2.5 DNS & Domain

- **DNS provider:** Cloudflare — natural pairing with R2 for static assets, free DDoS protection, and DNS management.

### 2.6 Environments

| Environment | Purpose | Infrastructure |
|---|---|---|
| `local-dev` | Feature development | `pnpm dev` + Docker Compose dev profile |
| `local-e2e` | Full E2E suite, local | Production build + Docker Compose e2e profile (isolated DB, Redis, Mailhog) |
| `local-container` | Pre-push integration validation | Full Docker Compose stack including app container |
| `ci` | Automated checks on every PR | GitHub Actions + ephemeral Docker service containers |
| `production` | Live deployment | Dokploy on Hetzner, Docker Swarm |

**Environment isolation rule:** `local-dev` and `local-e2e` never share a database or Redis instance. E2E tests running against dev data produce false results and corrupt working state. The two Docker Compose profiles are fully independent and can run simultaneously without port conflicts.

**Environment file strategy:**

| File | Purpose | Committed? |
|---|---|---|
| `.env.local` | local-dev secrets and config | No — gitignored |
| `.env.e2e` | local-e2e isolated config | No — gitignored |
| `.env.e2e.example` | Template with all required e2e vars documented | Yes |
| `.env.example` | Template for local-dev vars | Yes |
| CI secrets | Injected via GitHub Actions secrets | Never a file |

Staging is deferred. When added, it must be an isolated Dokploy environment, not a flag in production.

### 2.7 Scheduled Jobs & Automation (Dokploy Cron)

Dokploy has a **built-in cron job runner** that can execute commands against any service in the stack on a schedule. This is the preferred mechanism for all infrastructure-level automation — no additional tooling, no sidecar containers, no external schedulers.

**Rule:** Use Dokploy cron for infrastructure automation (backups, cleanup, archival). Use BullMQ (Section 3.5) for application-level async jobs (emails, webhooks, exports). Keep these two layers separate.

Cron jobs managed by Dokploy at launch:

| Job | Schedule | Command | Purpose |
|---|---|---|---|
| DB backup | `0 2 * * *` | `bash /scripts/backup-db.sh` | Daily `pg_dump` → R2 |
| Backup retention cleanup | `0 3 * * 0` | `bash /scripts/cleanup-backups.sh` | Delete R2 backups older than 30 days |
| Audit log archival | `0 4 1 * *` | `bash /scripts/archive-audit-logs.sh` | Move audit logs > 90 days to R2 |
| Dead BullMQ job cleanup | `0 5 * * *` | `bash /scripts/cleanup-queue.sh` | Purge completed/failed BullMQ jobs older than 7 days |

All cron scripts live in `/scripts/` in the repository — version controlled, not configured ad-hoc in Dokploy's UI. The Dokploy cron config references the script paths so changes go through the normal PR process and are auditable in git history.

### 2.8 Backup Strategy

- **PostgreSQL:** Automated daily backups using `pg_dump` shipped to Cloudflare R2 (separate backup bucket). Retention: 30 days. **Tooling: Dokploy built-in cron job** — Dokploy has native cron scheduling that can execute a `pg_dump` command against the database service and pipe the output to R2 via `rclone` or `aws-cli` (R2 is S3-compatible). No sidecar container required. Cron schedule: `0 2 * * *` (daily at 02:00 UTC). Backup script lives in `/scripts/backup-db.sh` in the repo, executed by Dokploy's cron runner.
- **Redis:** Redis persistence (`AOF + RDB`) enabled. Redis data is considered recoverable from application state for most use cases, but session loss on restart must be acceptable.
- **Hetzner snapshots:** Weekly, used as a last-resort disaster recovery only — not a substitute for application-level backups.

---

## 3. Data Layer

### 3.1 Primary Database

- **Engine:** PostgreSQL (latest stable LTS)
- **Deployment:** Dokploy-managed database service (single node to start)
- **Scalability path:** When the application scales horizontally, PostgreSQL becomes the bottleneck. Migration path is: Dokploy Postgres → **PgBouncer connection pooler** (add immediately at scale) → dedicated Hetzner DB node or managed Postgres (Neon / Supabase) when read replicas are needed.
- **Connection pooling:** PgBouncer to be introduced before horizontal app scaling. Next.js does not maintain persistent DB connections well at scale.
- **v1 connection limits:** Application-layer connection pool capped at 20 connections. BullMQ worker pool capped at 5 connections. PostgreSQL `max_connections` set to 50 — sufficient for a single app instance plus worker on the CX21, with headroom for administrative connections. These limits prevent silent connection exhaustion under SSR concurrency.

### 3.2 Data Isolation Model

**Decision: B2C with Account stub — row-level isolation via `tenant_id`, one Account per User at registration.**

#### Product model vs data model

There is a deliberate split between what the product exposes and what the database does:

| Layer | Term | Definition |
|---|---|---|
| Product / UI | `Account` | What a user thinks of as "their space" — their data, their subscription, their settings |
| Database | `tenant_id` | The isolation key on all product data tables. In v1, maps 1:1 with an Account |
| Future | `AccountMember` | When teams are added, multiple Users share one Account — the data model already supports this |

Users never see the word "tenant". PRDs, UI copy, and error messages use "Account" exclusively. `tenant_id` is an internal implementation detail.

#### Registration flow

Signup is a single atomic transaction:

1. Create `User` record
2. Create `Account` (tenant) record — name defaults to the user's name or email prefix
3. Create `AccountMembership` record linking User → Account with role `admin`
4. Subscription tier defaults to `free` on the Account

The user lands in their Account immediately after email verification. No invitation, no onboarding choice.

#### Data isolation rules

- Every product data table carries a `tenant_id` foreign key — not `user_id`
- All queries scope by `tenant_id` explicitly at the application layer
- PostgreSQL RLS enforces `tenant_id` isolation as a safety net — not the primary control
- Subscription lives on the `Account` (tenant), not the User. When teams are added, billing stays per-Account naturally — one subscription regardless of member count

#### RLS Implementation

RLS (Row-Level Security) policies are defined as raw SQL within Drizzle migration files — Drizzle has no native RLS API, so policies are authored and versioned alongside schema migrations. The `tenant_id` used for RLS evaluation is resolved from the authenticated user session at the middleware layer, not passed as a parameter through service functions. On each authenticated request, Better-Auth resolves the session, the middleware reads the user's `AccountMembership` to determine the active `tenant_id`, and sets it as a PostgreSQL session variable. All subsequent queries within that request are automatically filtered by the RLS policy — service functions never receive or propagate `tenant_id` explicitly. It is ambient context derived from the authenticated session.

This design guarantees that even if application-layer query scoping is accidentally omitted, the database itself prevents cross-tenant data access. It also means the tenant resolution path is identical in v1 (single Account per User) and v2+ (multiple Accounts per User with a tenant switcher) — only the middleware's active-tenant resolution logic changes; downstream service code and RLS policies remain untouched.

#### Expansion path to teams (v2+)

No schema migration required. The `AccountMembership` table already exists. Adding teams means:

- Allowing Account admins to invite additional Users
- Adding a tenant switcher to the UI (if a User belongs to multiple Accounts)
- Updating billing to reflect seat-based or team pricing if needed

The data isolation model is identical in v1 (B2C) and v2+ (teams/B2B). This is the key design guarantee.

#### Schema-per-tenant / database-per-tenant

Explicitly deferred and not recommended for this product trajectory. Row-level isolation with RLS is sufficient for the foreseeable scale and avoids operational complexity.

### 3.3 ORM & Migrations

- **ORM:** Drizzle ORM
- **Migration naming convention:** `{timestamp}_{feature-name}_{action}.sql` — e.g., `20240315_user-profiles_add-avatar-url.sql`. No random or auto-generated names. Migrations are feature-named and human-readable.
- **Migration direction:** All migrations must have an `up` and `down`. Irreversible migrations (e.g., data transformations) must be explicitly flagged and require an ADR.
- **Soft deletes:** All primary entities (users, tenants, subscriptions) use soft deletes (`deleted_at` timestamp). Hard deletes are reserved for GDPR deletion flows only.
- **Seed data:** A `seed` script provides: a super-admin user, a demo account, one user per subscription tier, and sample data for all UI components. Seed is idempotent.

### 3.4 Caching (Redis)

- **Deployment:** Redis installed as a Dokploy service.
- **Key namespace convention:** `{scope}:{entity}:{id}` — e.g., `session:user:abc123`, `ratelimit:login:ip:1.2.3.4`
- **Use cases and TTL strategy:**

| Use Case | Redis Key Prefix | TTL | Owner |
|---|---|---|---|
| User sessions | `session:` | 7 days (sliding) | Better-Auth |
| Rate limiting (auth) | `ratelimit:auth:` | 1 min window | Better-Auth built-in |
| Rate limiting (API) | `ratelimit:api:` | 1 min window | Custom middleware |
| SSR page cache | `cache:page:` | 5 min | Next.js custom |
| Feature flag cache | `cache:flags:` | 60 sec | GrowthBook SDK |

### 3.5 Background Jobs

**Gap resolved:** A background job system is required from day one. Use cases include: sending welcome emails, processing Stripe webhook events, generating exports, and scheduled cleanup tasks.

- **Choice:** **BullMQ** (Redis-backed queue) — natural fit given Redis is already in the stack.
- **Worker:** A separate Node.js worker process deployed as its own Docker container, managed by Docker Compose / Swarm.
- **Queue naming:** `{domain}.{action}` — e.g., `email.send-welcome`, `billing.process-webhook`, `export.generate-csv`.

---

## 4. Auth & Security

### 4.1 Authentication Framework

- **Library:** Better-Auth
- **Auth methods (v1):** Email + password (with verification), OAuth (Google, GitHub), Magic link
- **Session model:** Database-backed sessions — PostgreSQL as source of truth, Redis as read cache

#### Decision — Database Sessions over JWT

JWT was evaluated and rejected. This boilerplate requires immediate session revocation in three places: user suspension by super admin, impersonation termination, and password change across devices. Handling these with JWT demands a Redis blocklist — at which point statelessness is gone and sessions are rebuilt with worse ergonomics. Database-backed sessions with Redis caching are the correct choice. The performance difference vs JWT is negligible at any scale this boilerplate targets.

#### Authentication Surface

| Consumer | Method | Status |
|---|---|---|
| Web app | Database-backed session cookie (HttpOnly, Secure) | ✅ v1 |
| Mobile app | Better-Auth JWT plugin — short-lived access token + rotating refresh token | ⏳ v2 |

**v2 mobile note:** the JWT plugin operates on the same Better-Auth user accounts — no separate user store. The auth surface expands without changing the identity model. The Route Handler middleware is designed from v1 to accept `Authorization: Bearer` alongside session cookies, so the mobile layer slots in without architectural change.

Third-party and M2M API key authentication is explicitly out of scope and not designed at this stage.

### 4.2 Rate Limiting

- **Auth endpoints:** Better-Auth built-in rate limiting, backed by Redis. Limits: 5 failed login attempts per IP per minute, 3 magic link requests per email per 10 minutes.
- **API endpoints:** Custom middleware using Redis sliding window counters. Per-user and per-IP limits defined per endpoint.
- **Server Actions:** Server Actions are directly callable from the client and must be rate-limited independently of API Route Handlers. A `withRateLimit` guard is applied in the same chain as `requireRole()` — before any business logic executes. Uses the same Redis sliding window mechanism as API rate limiting, with per-action configurable limits (e.g., form submissions: 10/min, sensitive operations: 3/min).

### 4.3 Authorisation & RBAC

Three role levels across two scopes:

| Role | Scope | Permissions |
|---|---|---|
| `super_admin` | Platform | Full tenant management, user role control, manual subscription override, impersonation, audit log access |
| `admin` | Tenant | Manage users within their own tenant only, view their own tenant billing status |
| `user` | Tenant | Access features permitted by their subscription tier, no management capabilities |

**Role assignments** are stored in the database (`user_roles` table). Permission checks happen exclusively at the server layer (middleware + Server Actions) — client-side role data is never trusted for access control.

**Super admin is never self-registered.** The super admin account is seeded at deploy time only. There is no UI path to assign the `super_admin` role — it is set directly in the seed script and can only be changed via a migration or a one-off CLI script executed on the server. This is a deliberate security constraint. The super admin account must use an operational/system email (e.g., `admin@yourdomain.com`), not a personal email — a GDPR data deletion request against the super admin email would conflict with the platform's operational requirements.

**Permission check pattern:** Every protected Server Action and API route calls a `requireRole(role)` or `requirePermission(permission)` guard as its first statement. Guards throw an unauthorised error before any business logic executes. This pattern is enforced via ESLint custom rule (`no-unguarded-server-action`).

### 4.4 Feature Flags

- **Tool:** GrowthBook (self-hosted on Dokploy)
- **Dual purpose:**
  1. **Rollout control** (engineering): gradually release features to a percentage of users
  2. **Subscription gating** (business): restrict features to specific subscription tiers
- **Rule:** Feature flag checks happen server-side only. Client receives a resolved set of enabled features — never the raw flag evaluation logic.
- **Cache:** GrowthBook SDK feature flag responses cached in Redis for 60 seconds to avoid latency on every request.

### 4.5 Application Security

- **OWASP Top 10 checklist** applied at boilerplate level:
  - SQL injection: mitigated by Drizzle parameterised queries (document explicitly in codebase)
  - XSS: Next.js escapes by default; Content Security Policy headers configured
  - CSRF: Better-Auth handles CSRF for auth routes; Server Actions have CSRF protection built into Next.js
  - Secure headers: `next-safe` or manual headers in `next.config.js` (X-Frame-Options, HSTS, etc.)
  - Dependency vulnerabilities: Dependabot (GitHub) + Snyk free tier + GitHub secret scanning (enabled on repo)
- **Secrets management:** All secrets injected via environment variables. Production secrets managed in Dokploy's environment manager — never in source control. `.env.example` committed with placeholder values and documentation for every variable.
- **HTTPS:** Enforced at Traefik layer. No exceptions.

### 4.6 Compliance (GDPR)

Hetzner is EU-hosted. GDPR compliance is non-optional from day one.

- **Data deletion flow:** Hard delete all personal data on user request (overrides soft delete). Automated cascade defined per entity.
- **Data export flow:** User can export all their data (JSON) — stub implementation in boilerplate.
- **Consent:** Cookie consent banner stub (no tracking cookies at boilerplate level, but infrastructure for it).
- **Privacy policy / Terms of Service:** Static pages with placeholder content included in boilerplate.

---

## 5. Observability

### 5.1 Stack

| Tool | Role | Deploy Phase |
|---|---|---|
| **Uptime Kuma** | Uptime monitoring + alerting | Day 1 |
| **GlitchTip** | Error tracking (Sentry-compatible) | Day 1 |
| **Pino** | Structured JSON logging (in-app) | Day 1 |
| **OpenObserve** | Log aggregation + metrics | Scale-up phase only |

OpenObserve is explicitly deferred. At single-node scale, stdout logs collected by Docker's logging driver (JSON file) are sufficient. OpenObserve is added when multi-node log aggregation becomes necessary.

**Docker log rotation:** The default `json-file` logging driver has no size limit — on a long-running production node, unrotated logs will fill the disk. All containers must configure Docker log rotation at the Compose level: maximum 50MB per log file, maximum 3 rotated files per container. This keeps total log storage bounded at ~150MB per container without external tooling.

### 5.2 Structured Logging

- **Library:** Pino (fastest Node.js logger, JSON output by default)
- **Log levels:** `error`, `warn`, `info`, `debug`. Production runs at `info`. Local dev runs at `debug`.
- **Mandatory log fields:** `timestamp`, `level`, `requestId`, `userId` (if authenticated), `tenantId` (if scoped), `duration` (for API routes)
- **Rule:** No `console.log` in application code. ESLint rule enforced.

### 5.3 Health Check Endpoints

- `GET /api/health` — liveness check. Returns 200 if the process is running.
- `GET /api/ready` — readiness check. Verifies PostgreSQL and Redis connectivity. Returns 200 only if all dependencies are reachable. Used by Traefik for load balancer health checks.

### 5.4 Alerting

- **Uptime Kuma** alerts via email (and optionally Telegram/Slack) for: downtime > 1 min, SSL expiry < 14 days.
- **GlitchTip** alerts on new error types and error spike thresholds.

### 5.5 Performance Baseline

- Server response time target for authenticated API routes: < 200ms p95.
- Core Web Vitals tracked via Vercel-style instrumentation in Next.js `instrumentation.ts` even when not deployed on Vercel.

---

## 6. Application Architecture

### 6.1 Framework & Rendering Strategy

- **Framework:** Next.js (App Router)
- **Rendering strategy by page type:**

| Page Type | Strategy | Rationale |
|---|---|---|
| Marketing / landing | SSG (static generation) | Maximum performance, CDN-cacheable |
| Auth pages (login, signup) | SSR | Dynamic, not cacheable |
| Dashboard / app pages | SSR + streaming | Server-authorised, real-time data |
| Public API routes | API Route Handlers | REST endpoints for webhooks, external |
| Data mutations | Server Actions | Preferred over API routes for form actions |

- **Rule:** Server Actions are the default for form submissions and mutations. API Route Handlers are reserved for: webhook receivers, third-party integrations, and public API endpoints.

### 6.2 API Design

**Decision: REST Route Handlers exclusively — no tRPC.**

tRPC was evaluated. Its end-to-end type safety is valuable, but it requires an adapter layer to expose REST endpoints for external consumers. Since full API parity is a goal and the same endpoints must serve both the web app and future mobile/external consumers, building everything as REST Route Handlers from day one means one implementation with no adaptation overhead.

Type safety — tRPC's primary advantage — is covered by Zod schemas shared between client and server, which are already in the stack. Client-side data fetching via TanStack Query consumes the REST endpoints directly.

**Rule:** every feature is implemented once as a REST Route Handler. Server Actions remain the pattern for form mutations within the web app only, as they are not consumable by external clients.

### 6.3 Service Layer Pattern

Business logic lives exclusively in `/server/services/`. Route Handlers and Server Actions are thin entry points — they handle auth, validation, and response shaping, then delegate to a service function. The service function owns the logic.

```
Request (Route Handler or Server Action)
  → auth guard          (requireRole / requirePermission)
  → input validation    (Zod schema parse)
  → service function    (business logic, DB calls, queue dispatch)
  → response shape      (Route Handler returns JSON / Server Action returns result)
```

**Rules:**

- Service functions have no knowledge of HTTP — they receive plain typed arguments and return plain typed results. They are equally callable from a Route Handler, a Server Action, a BullMQ worker job, or a test.
- Database queries that are purely read-only with no business logic live in `server/queries/` and are called directly by service functions.
- No business logic in Route Handlers or Server Actions — if you find yourself writing an `if` statement in a handler, it belongs in a service function.
- Service functions are the primary unit of integration testing — test them directly against a real database, not through the HTTP layer.

### 6.4 Error Handling Strategy

Errors are categorised at the service layer and propagated consistently to the client.

| Error Type | When | HTTP Status | Client receives |
|---|---|---|---|
| `ValidationError` | Zod parse fails | 400 | Field-level error map |
| `AuthError` | Unauthenticated request | 401 | Generic message |
| `ForbiddenError` | Insufficient role/permission | 403 | Generic message |
| `NotFoundError` | Entity doesn't exist or tenant-scoped miss | 404 | Generic message |
| `ConflictError` | Duplicate, constraint violation | 409 | Specific message |
| `AppError` | Known application error | 422 | Specific message |
| Unhandled exception | Unexpected failure | 500 | Generic message + GlitchTip capture |

Service functions throw typed errors. Route Handlers catch them in a shared `withErrorHandler` wrapper that maps error types to HTTP responses. Server Actions return a typed `{ success, error }` discriminated union — never throw to the client.

Unhandled exceptions are caught at the top-level handler, logged via Pino, and reported to GlitchTip automatically. The client receives a generic 500 message — internal details never leak.

### 6.5 File Storage

- **Provider:** Cloudflare R2 (S3-compatible)
- **Upload strategy:** Presigned URLs — client uploads directly to R2, server never proxies file data. Server generates the presigned URL after authorisation check.
- **Bucket structure:** `/{tenantId}/{userId}/{timestamp}-{filename}` for tenant isolation.

### 6.6 Email

- **Provider:** Resend — production email delivery via API. Sends real emails to real inboxes.
- **Scope:** Transactional emails only at boilerplate level (verification, magic link, password reset, welcome, billing receipts).
- **Templates:** React Email for template authoring — type-safe, version-controlled email templates.
- **Sending:** Async via BullMQ queue. Email sends are never blocking in the request lifecycle.

**Local and e2e environments — Mailhog:** Mailhog is a local SMTP trap running as a Docker container. The application code is identical across environments — only the SMTP destination changes. In `local-dev` and `local-e2e`, the SMTP host env var points to Mailhog instead of Resend's servers, so all outgoing emails are caught before leaving the machine and never reach a real inbox. Playwright asserts email delivery by querying Mailhog's API directly — reading magic link URLs out of captured email bodies without touching a real inbox. Resend is never called in local or e2e environments.

### 6.7 Background Jobs Architecture

- **Queue:** BullMQ on Redis
- **Worker:** Separate Docker container, scaled independently from the web app.
- **Job types at launch:** `email.*`, `billing.*`, `export.*`, `cleanup.*`
- **Dead letter queue:** Failed jobs after 3 retries moved to a dead letter queue. GlitchTip notified on dead letter events.
- **Graceful shutdown:** The BullMQ worker must handle `SIGTERM` by finishing in-progress jobs before the container exits. This is critical during Docker Swarm rolling updates — without it, jobs are killed mid-execution and retried, causing duplicate side effects (double emails, double webhook processing). Implementation details are deferred to the background jobs epic.

---

## 7. UI / Frontend

### 7.1 Design System

- **Component library:** shadcn/ui (Radix UI primitives + Tailwind CSS)
- **Theming:** CSS custom properties for design tokens. Light and dark mode supported from day one via `next-themes`.
- **Extension pattern:** shadcn components are copied into the codebase, not imported as a package. Customisations live in `components/ui/`. Never modify the base; extend with composition.

### 7.2 Charts

- **Library:** shadcn/ui Chart components (built on Recharts). This maintains visual consistency with the design system without adding a separate charting library.
- All charts must be mobile-responsive. Test on 375px viewport width.

### 7.3 State Management

| Concern | Tool | Rationale |
|---|---|---|
| Server state (data fetching, caching) | TanStack Query | Pairs naturally with REST API layer |
| Client UI state (modals, sidebar) | Zustand | Lightweight, no boilerplate |
| Form state | React Hook Form + Zod | Industry standard, shadcn integration |
| URL state (filters, pagination) | `nuqs` | Type-safe URL search params |

### 7.4 Form & Validation

- **Forms:** React Hook Form
- **Validation schemas:** Zod — shared between client validation and server-side validation. Schema definitions live in `lib/validations/` and are imported by both form components and Server Actions.

### 7.5 Mobile Strategy

- **Approach:** Mobile-first responsive web app. All layouts designed at 375px and scaled up.
- **PWA:** Not in scope for v1. Architecture must not prevent adding a service worker later.
- **Native app:** Out of scope. If required in future, a React Native app sharing Zod schemas and API types is the natural path.

---

## 8. Business Layer

### 8.1 Account Model & Roles

- Data isolation model: see Section 3.2 (B2C with Account stub, `tenant_id` row-level isolation)
- Role model: see Section 4.3 (`super_admin` / `admin` / `user`)

#### Registration & Account Creation

Registration is a single atomic transaction — no multi-step onboarding choice. The user signs up, and immediately owns an Account scoped to them. In B2C mode, every Account has exactly one member. This is invisible to the user — they experience it as a personal account, not a "tenant".

```
User registers
  → User record created
  → Account record created (name = user's name or email prefix)
  → AccountMembership created (User → Account, role: admin)
  → Subscription tier: free
  → Welcome email dispatched via BullMQ
```

Super admin is seeded at deploy time only — never self-registered.

#### Super Admin — Account Management Feature

In B2C mode the super admin panel manages individual user Accounts. Each row represents one user and their Account. The UI uses the word "Account" — users never see "tenant".

The primary tool is a **unified account management page** at `/admin/accounts/{accountId}` with three tabs:

**Tab 1 — Overview**

- Account owner name and email, created date, status (active / suspended)
- Current subscription tier + whether it is a manual override or Stripe-managed
- Quick actions: suspend account, delete account (soft delete with confirmation modal)

**Tab 2 — Members**
In B2C v1, each Account has one member. The tab is designed for the teams expansion — it renders a member list with per-member actions. In v1 it shows one row.

| Action | UI Pattern | Constraints |
|---|---|---|
| Promote to `admin` | Toggle / dropdown | Cannot demote the last `admin` of an Account |
| Demote to `user` | Toggle / dropdown | Cannot demote the last `admin` of an Account |
| Suspend / deactivate | Toggle with confirmation | Suspended users cannot log in; sessions invalidated immediately via Redis |
| Impersonate | Button → new session | See impersonation rules below |

**Tab 3 — Subscription**
Super admin can manually override the Account's subscription tier independently of Stripe. See Section 8.3 for full details.

#### Impersonation Rules

Impersonation allows super admin to log in as any user for support purposes without knowing their password.

- Impersonation creates a **shadow session** flagged as `impersonated: true` in the session record.
- The impersonating super admin's identity is preserved in the session (`impersonated_by: superAdminUserId`).
- A **persistent visible banner** is shown in the UI during impersonation: *"You are viewing this account as [user name]. [End impersonation]"* — this cannot be dismissed.
- Impersonated sessions are **limited to 1 hour**, after which they expire automatically.
- Impersonated sessions **cannot perform billing or destructive actions** (delete account, change password, change email). These are blocked at the Server Action guard level by checking `session.impersonated`.
- Every impersonation start and end is written to the audit log. This is non-negotiable.

### 8.2 Subscription Tiers

Three placeholder tiers (names and limits are configurable per product):

| Tier | Placeholder Name | Feature Gate Key |
|---|---|---|
| 0 | Free | `tier:free` |
| 1 | Pro | `tier:pro` |
| 2 | Advanced | `tier:advanced` |

Feature gates per tier are defined in GrowthBook, not hardcoded. The application checks `hasFeature('feature-key')` — the mapping of feature to tier lives in GrowthBook.

### 8.3 Billing

- **Provider:** Stripe
- **Model:** Recurring subscriptions (monthly and annual billing cycles).
- **Billing entity:** Subscription lives on the **Account** (`tenant_id`), not on the individual User. In B2C v1 this is a 1:1 mapping. When teams are added in v2+, billing remains per-Account — one subscription covers all members. This is the correct model and requires no schema change at expansion time.
- **Stripe Customer Portal:** Used for subscription management (upgrade, downgrade, cancel, payment method update). Do not build a custom billing UI — use Stripe's hosted portal.
- **Webhook handling:** Stripe webhooks received at `POST /api/webhooks/stripe`. Processing is async via BullMQ. Webhook handlers must be idempotent (check for duplicate event IDs).
- **Key webhook events to handle at launch:** `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.
- **Trial periods:** Configurable per tier. Implementation deferred to product configuration, not hard-coded.

#### Subscription Tier — Source of Truth Model

The `accounts` table (mapped to `tenant_id`) holds a `subscription_tier` column which is the **sole source of truth for feature gating**. Stripe is the source of truth for payment state only. These two can intentionally diverge.

```
accounts (tenant)
├── subscription_tier       ← feature gating source of truth
├── stripe_customer_id      ← Stripe payment identity
├── stripe_subscription_id  ← current Stripe subscription (nullable)
└── subscription_override   ← boolean: true when manually set by super admin
```

#### Manual Override Flow (Super Admin)

When a super admin changes an Account's subscription tier via the admin UI (Tab 3):

1. `subscription_tier` is updated directly in the database.
2. `subscription_override` is set to `true`.
3. `stripe_subscription_id` and Stripe's state are **not touched** — Stripe remains on whatever plan it was on.
4. An audit log entry is written: `{ action: 'subscription.manual_override', actor: superAdminId, entity: accountId, metadata: { from_tier, to_tier, reason } }`. A `reason` field (free text) is required in the UI before saving.
5. The UI in Tab 3 displays a visible **"Manual Override Active"** badge where `subscription_override = true`, with the date and actor of the last override.

#### Stripe / DB Divergence Handling

When a Stripe webhook updates subscription status, the webhook handler **checks `subscription_override` before writing**:

- If `subscription_override = false` → apply Stripe's update normally.
- If `subscription_override = true` → **do not overwrite `subscription_tier`**. Log a warning: `stripe.webhook.skipped_override`. Alert the super admin via email that Stripe and the DB are out of sync.

This prevents a Stripe webhook from silently undoing a manual override.

### 8.4 Audit Logging

All significant actions must be logged for compliance and debugging.

- **Audit log table** in PostgreSQL: `(id, tenant_id, actor_id, action, entity_type, entity_id, metadata jsonb, created_at)`
- **Logged events at launch:**

| Category | Events |
|---|---|
| Auth | login, logout, password change, magic link sent, OAuth connected |
| User management | user suspended/reactivated, role promoted, role demoted |
| Impersonation | impersonation started (actor + target), impersonation ended |
| Subscription | stripe webhook applied, **manual override applied** (with from/to tier + reason + actor) |
| Account | account created, account suspended, account deleted |
| Data | GDPR deletion requested, data export generated |

- **Retention:** Audit logs are never soft-deleted. Archived to R2 after 90 days.
- **Super admin audit view:** `/admin/audit` — searchable and filterable by account, actor, action type, and date range.

---

## 9. CI/CD Pipeline

### 9.1 Version Control

- **Platform:** GitHub
- **Branching model:** Feature branching from `main`. Branch naming: `feature/{ticket-id}-short-description`, `fix/{ticket-id}-short-description`.
- **Branch protection:** `main` requires: all CI checks passing, minimum 1 approved review, no force pushes, linear history (rebase merges only).

### 9.2 GitHub Actions Pipeline

Pipeline stages (in order, all must pass before proceeding):

```
1. Code quality gates
   ├── ESLint (no warnings permitted in CI)
   ├── Prettier format check
   ├── TypeScript type check (tsc --noEmit)
   └── Secret scanning (gitleaks)

2. Tests
   ├── Unit tests (Vitest)
   ├── Integration tests (Vitest + real Postgres/Redis via Docker services)
   └── E2E smoke suite (Playwright — critical paths only, runs on every PR)

3. Build
   └── Next.js production build (validates no build errors)

4. Containerise
   ├── Build Docker image
   ├── Tag: {semver} + {git-sha}
   └── Push to GHCR

5. Deploy (triggered on semver tag push only)
   ├── Run database migrations (drizzle-kit migrate)
   ├── Trigger Dokploy deploy via webhook
   └── Post-deploy health check (poll /api/ready until 200 or timeout)
```

**E2E suite split — smoke vs full:**

| Suite | Scope | Trigger | Target |
|---|---|---|---|
| Smoke | Critical paths only: signup, login, subscription upgrade | Every PR open/update | PR branch |
| Full | All E2E tests including edge cases and full feature flows | Merge to `main` (post-merge) | `main` |
| Nightly | Full suite as a scheduled safety net | `cron: 0 3 * * *` | `main` |

The smoke suite keeps PR feedback fast (target: under 5 minutes). The full suite runs post-merge to `main` — `main` is always fully verified before a release tag can be cut. If the full suite fails on `main`, the offending commit is identified immediately and a fix PR is prioritised before any new release tag is pushed.

**Rule:** a release tag (`v*`) must never be pushed if the full suite is red on `main`. The GitHub Actions release workflow checks the last full suite result before allowing the tag to proceed.

**CI E2E environment:** both smoke and full suites run against a production build (`next build && next start`) with ephemeral Postgres and Redis Docker services and Mailhog for email trapping. `.env.e2e.example` values are injected via GitHub Actions secrets.

### 9.3 Database Migration Deployment

**Migration sequence (critical):**

1. Run `drizzle-kit migrate` as a one-off container using the new image, against production DB.
2. On migration success → deploy new app containers (rolling update).
3. On migration failure → abort deploy, alert, do not update app containers.

This sequence ensures the database is always ahead of the application, compatible with backward-compatible migration policy: **all migrations must be backward-compatible with the previous app version** (no breaking column renames or drops in a single migration — use a two-phase approach).

### 9.4 Rollback Strategy

- Docker Swarm rolling updates allow automatic rollback on health check failure.
- Database rollbacks use the `down` migration. Triggered manually — automated DB rollback is too risky.
- Policy: if a hotfix cannot be applied forward, roll the app back and apply a corrective migration.

### 9.5 Local Development Modes

Three modes, each served by a dedicated Docker Compose profile:

**Mode 1 — `dev`** (daily feature development, hot reload)
Starts backing services only. App runs via `pnpm dev` outside Docker for fast iteration.

```
pnpm dev:services    # docker compose --profile dev up
pnpm dev             # next dev, loads .env.local
```

**Mode 2 — `container`** (pre-push production parity check)
Builds and runs the full stack including the Next.js production container.

```
pnpm dev:container   # docker compose --profile full up --build
```

**Mode 3 — `e2e`** (full E2E suite, fully isolated)
Spins up a completely separate stack: dedicated Postgres (`saas_e2e` DB), dedicated Redis, and Mailhog for email trapping. App runs as a production build for environment parity with CI.

```
pnpm test:e2e:services   # docker compose --profile e2e up
pnpm test:e2e            # next build && next start (loads .env.e2e) + playwright test
```

The e2e stack runs on different ports from the dev stack — both can be active simultaneously. A `pretest` script wipes and reseeds the `saas_e2e` database before every full suite run. Mailhog exposes an API at `localhost:8025` that Playwright uses to assert email delivery without sending real messages.

All three modes share the same Postgres and Redis versions — environment parity is enforced across dev, e2e, and production.

### 9.6 Tooling

- **Package manager:** pnpm (mandatory — no npm or yarn)
- **Primary IDE:** Claude Code — all feature lifecycle phases run through Claude Code with installed skills
- **GitHub CLI:** `gh` — all GitHub interactions (Issues, PRs, Milestones) from the terminal. No browser workflow during feature development.
- **Pre-commit hooks:** Husky + lint-staged. Runs: ESLint, Prettier, TypeScript check on staged files. Blocks commit on failure.
- **Commit message format:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`) — enforced by `commitlint`.

### 9.7 CI Secrets Inventory

All secrets required by the GitHub Actions pipeline must be configured in the repository's GitHub Actions secrets before the first CI run. A pipeline run with missing secrets fails silently or with a cryptic error — this list prevents that.

**Required GitHub Actions secrets for v1:**

| Secret | Used by | Description |
|---|---|---|
| `GHCR_TOKEN` | Containerise stage | GitHub PAT with `write:packages` scope for pushing to GHCR |
| `DOKPLOY_WEBHOOK_URL` | Deploy stage | Dokploy deploy webhook URL for the production app service |
| `DOKPLOY_WEBHOOK_TOKEN` | Deploy stage | Auth token for the Dokploy webhook |
| `DATABASE_URL` | Migration stage | Production PostgreSQL connection string |
| `REDIS_URL` | E2E / integration tests | Redis connection string for CI test stack |
| `BETTER_AUTH_SECRET` | Build + tests | Session signing secret — must match production value |
| `STRIPE_SECRET_KEY` | E2E tests | Stripe test mode secret key |
| `STRIPE_WEBHOOK_SECRET` | E2E tests | Stripe CLI webhook signing secret for test events |
| `RESEND_API_KEY` | Production deployment only | Resend API key — not used in CI tests (Mailhog handles all email in test environments) |
| `R2_ACCESS_KEY_ID` | Deploy + backup scripts | Cloudflare R2 access key |
| `R2_SECRET_ACCESS_KEY` | Deploy + backup scripts | Cloudflare R2 secret key |
| `R2_BUCKET_NAME` | Deploy + backup scripts | R2 bucket name for backups and file storage |
| `GROWTHBOOK_API_KEY` | Build + tests | GrowthBook SDK key for feature flag evaluation |
| `GLITCHTIP_DSN` | Build | GlitchTip error tracking DSN |

These same values (with production credentials) are set in Dokploy's environment manager for the running containers — never in a committed file.

### 9.8 Environment Variables Reference (`.env.example`)

The committed `.env.example` is the authoritative reference for all environment variables required to run the application locally. Every variable must have a comment explaining its purpose and where to obtain it.

```bash
# ─── App ──────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000     # Public base URL of the app
NODE_ENV=development

# ─── Database ─────────────────────────────────────────────────────────────────
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/saas_dev
# Format: postgresql://{user}:{password}@{host}:{port}/{database}

# ─── Redis ────────────────────────────────────────────────────────────────────
REDIS_URL=redis://localhost:6379
# Used for: sessions, rate limiting, BullMQ, feature flag cache

# ─── Auth (Better-Auth) ───────────────────────────────────────────────────────
BETTER_AUTH_SECRET=your-secret-here-min-32-chars
# Generate with: openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000

# ─── OAuth providers ──────────────────────────────────────────────────────────
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
# Obtain from: console.cloud.google.com → Credentials

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
# Obtain from: github.com → Settings → Developer Settings → OAuth Apps

# ─── Billing (Stripe) ─────────────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_...
# Use test mode keys for local dev. Obtain from: dashboard.stripe.com/apikeys
STRIPE_WEBHOOK_SECRET=whsec_...
# Obtain from: stripe listen --print-secret (Stripe CLI for local dev)
STRIPE_PRICE_ID_PRO_MONTHLY=price_...
STRIPE_PRICE_ID_PRO_ANNUAL=price_...
STRIPE_PRICE_ID_ADVANCED_MONTHLY=price_...
STRIPE_PRICE_ID_ADVANCED_ANNUAL=price_...

# ─── Email (Resend) ───────────────────────────────────────────────────────────
RESEND_API_KEY=re_...
# Obtain from: resend.com/api-keys
RESEND_FROM_EMAIL=noreply@yourdomain.com

# ─── File Storage (Cloudflare R2) ─────────────────────────────────────────────
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=saas-uploads
R2_ENDPOINT=https://{account_id}.r2.cloudflarestorage.com
# Obtain from: dash.cloudflare.com → R2 → Manage R2 API tokens

# ─── Feature Flags (GrowthBook) ───────────────────────────────────────────────
GROWTHBOOK_API_KEY=
GROWTHBOOK_API_HOST=http://localhost:3100
# Point to local Dokploy GrowthBook instance in dev

# ─── Error Tracking (GlitchTip) ───────────────────────────────────────────────
GLITCHTIP_DSN=
# Obtain from: your GlitchTip instance → Project → Settings → DSN
# Leave empty in local dev to suppress error reporting
```

---

## 10. SDLC & Development Methodology

### 10.1 Feature Development Lifecycle

**GitHub is the single source of truth.** Every feature — its requirements, its structure, its tasks, and its status — lives exclusively in GitHub Issues. The toolchain that drives this is **Claude Code** with Matt Pocock's skills installed, and **`gh` CLI** for all GitHub interactions from the terminal.

#### Installed Skills

Skills are `SKILL.md` files that Claude Code reads automatically when context is relevant. They contain **procedural instructions** — "when you see X, do Y" — and are project-aware (they can read your actual codebase). They are distinct from **subagents**, which are generic AI persona descriptions ("you are an expert in X") and add no value over Claude's existing training knowledge.

**Quality bar for any skill before committing to the repo:** does it contain project-specific procedural instructions that Claude Code can follow? If it reads like a persona prompt or a topic description, it is a subagent, not a skill — do not install it.

All skills are committed to `.claude/skills/` and versioned in git. Every developer and CI environment has identical behaviour.

---

##### Matt Pocock Workflow Skills

The SDLC methodology backbone. All procedural, all project-aware.

```bash
npx skills@latest add mattpocock/skills/ubiquitous-language
npx skills@latest add mattpocock/skills/grill-me
npx skills@latest add mattpocock/skills/write-a-prd
npx skills@latest add mattpocock/skills/prd-to-issues
npx skills@latest add mattpocock/skills/tdd
npx skills@latest add mattpocock/skills/triage-issue
npx skills@latest add mattpocock/skills/request-refactor-plan
npx skills@latest add mattpocock/skills/git-guardrails-claude-code
```

---

##### Library & Framework Skills

**Install for v1:**

| Skill | Tool | Source | Why it qualifies |
|---|---|---|---|
| `shadcn-ui` | shadcn/ui | `ui.shadcn.com` (official) | Official skill maintained by the shadcn team. Runs `shadcn info --json` to read your actual `components.json` on every interaction — knows your installed components, enforces composition rules, uses correct base-specific APIs. Project-aware, not generic. |
| `tailwind-v4-shadcn` | Tailwind v4 + shadcn | `secondsky/claude-skills` | Corrects specific Tailwind v4 breaking changes (`tw-animate-css`, duplicate `@layer base`, CSS variable conflicts). Documented evidence of zero setup errors vs 2–3 without it. Procedural, not descriptive. |

**Install only after reviewing the SKILL.md:**

| Skill | Tool | Source | Condition |
|---|---|---|---|
| `drizzle` | Drizzle ORM | community | Read the full SKILL.md before committing. Only install if it contains procedural schema and migration patterns specific to your project — not if it reads like a generic Drizzle documentation summary. |

**Not recommended:**

| Source | Reason |
|---|---|
| `0xfurai/claude-code-subagents` (all) | These are subagent persona prompts, not skills. They describe what an expert knows, not what Claude Code should do in your project. Claude already has this knowledge from training — installing them adds noise, not value. |
| `masonjames/Shadcnblocks-Skill` | Requires a paid API key. The official shadcn/ui skill covers the same ground without cost or external dependency. |
| `drizzle-orm-d1` | D1/SQLite variant for Cloudflare Workers. This boilerplate uses PostgreSQL — inapplicable. |

**Security rule:** every community skill must be read in full before committing to the repo. Skills run with Claude Code's full permissions. A low-quality or malicious skill affects every developer on the project.

---

#### Ubiquitous Language (`UBIQUITOUS_LANGUAGE.md`)

Before any feature work begins, the project maintains a **canonical domain glossary** in `UBIQUITOUS_LANGUAGE.md` at the repo root. This is a DDD-style ubiquitous language document — a living contract that defines every domain term precisely, flags aliases to avoid, and captures relationships between concepts.

**Why this matters:** `write-a-prd`, `prd-to-issues`, and `tdd` all operate on the language in the codebase and PRDs. Without a canonical glossary, PRDs will use "tenant" in one place and "organisation" in another, which flows into inconsistent variable names, column names, and API contracts. The `tdd` skill implements what the PRD says — sloppy language produces sloppy code.

**Initial domains with known ambiguity in this boilerplate:**

| Canonical Term | Definition | Aliases to avoid |
|---|---|---|
| `Account` | The product-facing concept for a user's space — their data, subscription, and settings. In B2C v1 maps 1:1 with a User. | Tenant, organisation, workspace, company (in UI/PRDs) |
| `tenant_id` | The internal database isolation key. Implementation detail — never exposed in UI or PRDs. The DB-level term for Account. | account_id (in DB schema) |
| `AccountMembership` | The link between a User and an Account, carrying their Role. In B2C v1 each Account has one membership. | user_tenant, member |
| `User` | An authenticated identity. Belongs to one or more Accounts via AccountMemberships. | Member, account, login |
| `SuperAdmin` | A platform-level operator with cross-account access. Not a member of any Account. | Admin, owner, operator |
| `Admin` | A User with management rights within their own Account. | Owner, manager |
| `Role` | A named permission level assigned to a User within an Account (`admin` or `user`). | Permission, access level |
| `SubscriptionTier` | The billing plan level assigned to an Account (Free / Pro / Advanced). | Plan, tier, package, level |
| `SubscriptionOverride` | A manual tier assignment by SuperAdmin independent of Stripe. | Manual plan, billing override |
| `Session` | A database-backed authenticated context for a User. | Token, auth state |
| `AuditLog` | An immutable record of a significant system action. | Activity log, event log, history |
| `FeatureFlag` | A named toggle controlling feature access or rollout. | Feature switch, toggle, gate |
| `Notification` | An in-app alert delivered to a User. | Alert, message, event |
| `Job` | An async unit of work processed by the BullMQ worker. | Task, queue item, background task |

**Two moments when the skill is invoked:**

1. **Phase 0 (once):** Run `ubiquitous-language` against the architecture document to generate the initial `UBIQUITOUS_LANGUAGE.md`. This seeds the base glossary before any PRD is written.

2. **Start of each Epic:** After `grill-me` resolves scope, run `ubiquitous-language` before `write-a-prd`. New domain concepts surfaced during the interview are added to the glossary. The PRD is then written using only canonical terms.

**Rule:** `UBIQUITOUS_LANGUAGE.md` is a committed file. Changes to it go through a PR like any other code change — terminology decisions are reviewed, not made ad-hoc in a conversation.

---

#### The Feature Lifecycle — Skill by Skill

**Phase 1 — Scope & Interview (`grill-me`)**
The developer describes the feature idea to Claude Code. Claude Code invokes `grill-me` — a relentless interview that walks down every branch of the decision tree until all dependencies between decisions are resolved. No Issue is created until the interview reaches a shared understanding. This is the scope gate: Epic or Story is determined here, not by a checklist.

**Phase 2 — PRD (`write-a-prd`)**
Once scope is resolved, Claude Code invokes `write-a-prd`. It explores the codebase to verify the developer's assertions, sketches the major modules to build or modify, and actively looks for deep modules — functionality that can be encapsulated behind a simple, testable interface. The output is a PRD submitted directly as a GitHub Issue via `gh issue create`. The PRD contains: problem statement, solution, exhaustive numbered user stories, implementation decisions, and testing decisions. No file paths or code snippets — they go stale.

**Phase 3 — Issue Breakdown (`prd-to-issues`)**
Claude Code invokes `prd-to-issues` against the PRD issue. It reads the PRD and generates child GitHub Issues via `gh` — one per implementation task. Tasks are atomic (max 4 hours), ordered by dependency, and written as unambiguous specifications. Each task Issue is linked back to the parent PRD Issue via GitHub Tasklists. A GitHub Milestone is created per Story and all task issues are assigned to it.

**Phase 4 — Implementation (`tdd`)**
Claude Code invokes `tdd` per task. The `tdd` skill implements one vertical slice at a time using a strict red-green-refactor loop. It does not improvise — it implements exactly what the task Issue specifies. When a task is complete, Claude Code opens a PR via `gh pr create` that references the task Issue (`closes #N`). The developer reviews and merges. The agent picks up the next task.

**Phase 5 — Bug path (`triage-issue`)**
When a bug is found, Claude Code invokes `triage-issue` — it explores the codebase, identifies the root cause, and files a GitHub Issue with a TDD-based fix plan. The fix Issue then enters the standard `tdd` loop.

**Phase 6 — Refactor path (`request-refactor-plan`)**
For technical debt, Claude Code invokes `request-refactor-plan` — an interview-driven refactor plan filed as a GitHub Issue with a sequence of tiny, safe commits. Enters the standard `tdd` loop.

---

#### GitHub Issue Hierarchy

```
Epic  (label: type:epic)
  └─ Story / PRD  (label: type:story)   ← write-a-prd output
       └─ Task    (label: type:task)    ← prd-to-issues output, tdd input
```

**Auto-close chain:** PR `closes #task` → Task closes → Story Tasklist 100% → Story closes → Epic Tasklist 100% → Epic closes. No manual status updates.

#### Label Taxonomy

```
type:epic  /  type:story  /  type:task

domain:auth  /  domain:billing  /  domain:tenancy
domain:ui  /  domain:infra  /  domain:observability  /  domain:dx

status:ready        ← tdd agent pickup signal
status:in-progress  ← agent currently working
status:blocked      ← waiting on decision or dependency

priority:critical  /  priority:high  /  priority:normal
```

**Setup:** two complementary mechanisms, both committed to the repo.

- `scripts/setup-github-labels.sh` — a `gh`-based shell script that creates all labels on a fresh repo. Run once after cloning: `bash scripts/setup-github-labels.sh`. Deletes GitHub's default labels first for a clean slate.
- `.github/labels.yml` + `EndBug/label-sync` GitHub Action — declarative label definition synced automatically on push. Corrects any manual drift in the GitHub UI. Triggers when `.github/labels.yml` changes.

The script handles first-time setup; the Action maintains correctness over time.

#### Milestones

One GitHub Milestone per Story. Created by `prd-to-issues` at breakdown time. All task Issues under that Story are assigned to the Milestone. Milestone progress % is the Story's live completion indicator.

#### Git Safety (`git-guardrails-claude-code`)

Claude Code hooks installed by `git-guardrails-claude-code` block dangerous git commands — force pushes to `main`, direct commits bypassing pre-commit hooks, and other destructive operations. These run as Claude Code pre-tool hooks and cannot be bypassed from within a Claude Code session.

#### `gh` CLI Integration

All GitHub interactions from Claude Code use `gh`. No browser required during feature development:

- `gh issue create` — PRD and task issue creation
- `gh issue edit` — adding Tasklist links, updating labels
- `gh milestone create` — Story milestone creation
- `gh pr create` — opening PRs from completed task branches
- `gh issue close` — closing issues on task completion

---

#### Full Lifecycle Summary

```
Phase 0 (once):
  → ubiquitous-language: generate UBIQUITOUS_LANGUAGE.md from architecture doc

Per Epic:
  Developer describes feature idea
  → grill-me: relentless interview, scope resolved (Epic or Story)
  → ubiquitous-language: extend glossary with new domain concepts from interview
  → write-a-prd: codebase exploration + PRD (using canonical terms) → gh issue create
  → prd-to-issues: PRD → task issues via gh + Milestone created

Claude Code tdd loop (per task, in order):
  → reads task Issue spec verbatim
  → writes failing tests (red)
  → implements minimum to pass (green)
  → cleans up (refactor)
  → gh pr create (closes #task)
  → developer reviews + merges
  → next task

Bug found → triage-issue → gh issue create (fix plan) → tdd loop
Tech debt → request-refactor-plan → gh issue create → tdd loop
```

### 10.2 Testing Strategy

**Unit tests — Vitest**
Pure functions, utilities, Zod validation schemas, and business logic. No database, no network. Fast feedback loop — runs in milliseconds.

**Integration tests — Vitest + real services**
Tests that touch Postgres or Redis use real instances — no mocking. Spun up as Docker service containers in CI, running locally via the `dev` Docker Compose profile. Every integration test has a `teardown` block that removes all data it created. Tests are stateless and order-independent.

**E2E tests — Playwright**
Run exclusively against a production build (`next build && next start`) in the `local-e2e` environment. Never against `next dev` — hot-reload mode is a different build than what ships to production.

Side effect containment in the e2e environment:

| Service | Strategy |
|---|---|
| Email | Mailhog SMTP trap — no real emails sent. Playwright asserts delivery via Mailhog API |
| Stripe | Test mode keys + Stripe CLI for local webhook replay |
| BullMQ | Real worker runs against isolated e2e Redis — jobs execute but against e2e data only |
| GrowthBook | Fixed flag seed — no live SDK calls |

**Suite split:**

- Smoke suite (CI, every PR): signup, login, subscription upgrade, core feature flows — fast, focused on catching regressions before review
- Full suite (CI, post-merge to `main`): all scenarios including edge cases — `main` is always fully verified before a release tag is cut
- Nightly (GitHub Actions scheduled): full suite as a safety net, alerts on failure
- Local full suite (`local-e2e`): developer-run on demand during feature development

**Coverage target:** 80% on business logic and data layer. UI components are not coverage targets — test behaviour, not rendering.

### 10.3 AI-Assisted Development

- **IDE:** Claude Code — the primary development interface. All feature lifecycle phases (interview, PRD, breakdown, implementation) are driven through Claude Code using installed skills.
- **TDD constraint:** The `tdd` skill enforces red-green-refactor strictly — Claude Code cannot shortcut to implementation without failing tests first. This is the primary mechanism for preventing sloppy AI-generated code.
- **Skills are version-controlled:** The `.claude/` directory containing all installed skills is committed to the repo. Every developer and CI environment has identical skill behaviour.

### 10.4 Architecture Decision Records (ADRs)

- Location: `/docs/adr/`
- Format: `{sequence}-{short-title}.md` — e.g., `0001-row-level-multitenancy.md`
- Template: Context → Decision → Rationale → Consequences → Alternatives considered
- **Trigger:** Any decision that is expensive to reverse (data model, auth mechanism, API design pattern, infrastructure vendor).

### 10.5 PR Standards

PR template enforces:

- [ ] Links to the spec/task it implements
- [ ] All new code has tests
- [ ] Migration included if schema changed (with down migration)
- [ ] `.env.example` updated if new env vars added
- [ ] ADR created if applicable
- [ ] Tested in `container` mode locally (`pnpm dev:container`)

### 10.6 Parallelising Feature Branches

- Feature branches are isolated by design (feature branching from `main`).
- Database migrations are the primary conflict surface. Policy: only one migration-bearing branch is merged at a time. Migration timestamps must not conflict — always pull `main` and regenerate timestamp before creating a migration.
- Feature flags (GrowthBook) enable parallel work on incomplete features in `main` — flag-gated code can be merged without being active.

---

## 11. Open Decisions

| # | Decision | Status |
|---|---|---|
| 1 | API internal layer | ✅ Resolved: REST Route Handlers exclusively |
| 2 | Backup tooling for Postgres | ✅ Resolved: Dokploy built-in cron job |
| 3 | i18n readiness | ✅ Resolved: stub with `next-intl`, ship English only |
| 4 | PWA | ✅ Resolved: deferred — see note below |
| 5 | OpenObserve | ✅ Resolved: deferred to scale-up phase |
| 6 | Search | ✅ Resolved: deferred — see note below |
| 7 | Notification system | ✅ Resolved: in-app v1, email channel deferred to v2 — see note below |

All open decisions resolved. Document is unblocked for v1.0 implementation.

---

#### Decision 3 — i18n

**Decision:** Install `next-intl` and ship English only. All user-facing strings go through the `next-intl` `t()` function from day one — no raw string literals in components. This means adding a second language later requires only a translation file, not a codebase refactor. Zero runtime cost when running a single locale.

#### Decision 4 — PWA (Deferred)

**Decision:** Deferred to a later stage. No service worker in v1.

**When implemented, the recommended approach is:**

- **Install trigger:** add a "Install App" prompt only after a user has demonstrated engagement (e.g. 3+ sessions). Never prompt on first visit.
- **Caching strategy:** use a `stale-while-revalidate` strategy for the app shell and static assets (CSS, fonts, icons), and a network-first strategy for API calls and authenticated pages. Never cache authenticated pages offline — stale auth state is a security problem.
- **Offline mode:** dashboard pages should degrade gracefully (show cached data with a "you are offline" banner) rather than showing an error. Forms should queue mutations when offline and sync on reconnect.
- **Push notifications:** only relevant if a notification system is in place (Decision 7). Add after the in-app notification system is built.
- **Implementation:** Next.js with `next-pwa` or Serwist (the maintained fork of Workbox). Service worker file is committed and version-controlled — not generated ad-hoc.

#### Decision 6 — Search (Deferred)

**Decision:** Deferred to a later stage. No search in v1.

Search in this boilerplate context means **content search within the SaaS application** — searching across the tenant's own data (records, documents, users). This is not site search or marketing search.

**When implemented, the recommended approach is:**

- **v1 of search (when needed):** PostgreSQL `tsvector` full-text search. Covers the majority of use cases (search across text fields in one or two tables), requires no additional infrastructure, and is tenant-scoped by default via `tenant_id`. Sufficient for most SaaS products up to hundreds of thousands of records.
- **Scale-up path:** when full-text search is insufficient (multi-table, faceted, fuzzy, or cross-entity search), **Typesense** is the recommended upgrade. Typesense is self-hostable on Dokploy, has a simple API, and supports multi-tenancy natively via collection-level scoping. Meilisearch is an alternative with a simpler setup but weaker multi-tenancy model.
- **Rule when implemented:** search is always tenant-scoped. A search query must never return results from another tenant regardless of the search engine used.

#### Decision 7 — Notification System

**Decision:** In-app notification system in v1. Email notification channel deferred to v2.

**In-app notification system (v1):**

- Notifications are stored in a `notifications` table: `(id, tenant_id, user_id, type, title, body, read_at, created_at)`.
- Notification types are defined as an enum — e.g. `billing.payment_failed`, `user.invited`, `subscription.upgraded`. New types are added as new features are built.
- Delivery: BullMQ job dispatches notifications at event time. The job writes to the `notifications` table. The UI polls or uses SSE (Server-Sent Events) for live updates — WebSocket is out of scope for v1.
- UI: a bell icon in the top navigation with an unread count badge. Clicking opens a dropdown of recent notifications with mark-as-read and mark-all-read actions.
- Notification preferences: deferred — all notification types are on by default in v1.

**Email notification channel (v2):**

- When added, each notification type gets an optional email template via React Email + Resend.
- User preference per notification type (in-app only / email + in-app / off) added at v2.
- The `notifications` table gains a `channels` column to track delivery state per channel.

---

## 12. Repository Structure (Proposed)

**Convention:** every directory whose purpose is not self-evident from its name must contain a `README.md` explaining what belongs there, what doesn't, and why it exists. Mandatory at minimum for: `.claude/`, `docs/adr/`, `migrations/`, `worker/`, and `scripts/`.

```
/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth pages (login, signup, etc.)
│   ├── (dashboard)/        # Authenticated app pages
│   ├── (marketing)/        # Public/static pages
│   └── api/                # REST Route Handlers (webhooks, data API)
├── components/
│   ├── ui/                 # shadcn base components
│   └── {feature}/          # Feature-specific components
├── lib/
│   ├── auth/               # Better-Auth config
│   ├── db/                 # Drizzle schema + client
│   ├── queue/              # BullMQ queue definitions
│   ├── redis/              # Redis client
│   └── validations/        # Zod schemas (shared client/server)
├── server/
│   ├── services/           # Business logic — called by Route Handlers and Server Actions
│   ├── actions/            # Next.js Server Actions (web app mutations only)
│   └── queries/            # Read-only database query functions
├── worker/                 # BullMQ worker process (separate Docker container)
│   └── README.md
├── scripts/                # Infrastructure automation scripts (Dokploy cron)
│   ├── README.md
│   ├── setup-github-labels.sh
│   ├── backup-db.sh
│   ├── cleanup-backups.sh
│   ├── archive-audit-logs.sh
│   └── cleanup-queue.sh
├── .claude/                # Claude Code installed skills (committed to repo)
│   ├── README.md
│   └── skills/             # mattpocock/skills + any custom skills
├── docs/
│   └── adr/                # Architecture Decision Records — permanent log of hard-to-reverse decisions
│       └── README.md
├── migrations/             # Drizzle migration files — named {timestamp}_{feature}_{action}
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/                # Playwright — smoke and full suites
├── .github/
│   ├── workflows/          # GitHub Actions
│   ├── labels.yml          # Declarative label definitions — synced by EndBug/label-sync action
│   └── PULL_REQUEST_TEMPLATE.md
├── docker-compose.yml      # Base service definitions (Postgres, Redis, Mailhog)
│                           # Profiles: --profile dev | --profile full | --profile e2e
├── Dockerfile              # Next.js production image
├── .env.example            # All env vars documented with comments — source of truth for local setup
├── .env.e2e.example        # E2E-specific env vars (isolated DB, test credentials)
├── .nvmrc                  # Node.js version pin
└── UBIQUITOUS_LANGUAGE.md  # Canonical domain glossary — generated by ubiquitous-language skill
```

---

*Document status: v1.0 — all decisions resolved. Ready for implementation.*
