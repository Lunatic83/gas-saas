# Gas SaaS

A production-grade SaaS boilerplate. Built with Next.js, PostgreSQL, Redis, and Docker.

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Redis](https://img.shields.io/badge/Redis-7-red)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-cyan)
![Docker](https://img.shields.io/badge/Docker-ready-blue)

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp .env.example .env.local

# 3. Start backing services (Postgres, Redis, Mailhog)
pnpm dev:services

# 4. Start the app
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Developer Prerequisites

| Tool | Purpose | Install |
|------|---------|---------|
| **Node.js 20** | Runtime | `nvm install 20 && nvm use 20` |
| **pnpm** | Package manager | `npm install -g pnpm` |
| **Docker** | Local services | [docker.com](https://docker.com) |
| **`gh` CLI** | GitHub interaction | `brew install gh` |
| **Stripe CLI** | Local webhook replay | `brew install stripe/stripe-cli/stripe` |

After installing, run `gh auth login` and `stripe login` to authenticate.

## Local Development

### Environment variables

Copy `.env.example` to `.env.local` and fill in the values. All variables are documented in the file.

### Docker services

| Service | Port | Purpose |
|---------|------|---------|
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Sessions, caching, queues |
| Mailhog | 1025 / 8025 | SMTP trap / web UI |

```bash
pnpm dev:services      # Start services in background
pnpm dev:services:watch # Start services in foreground
pnpm dev:stop          # Stop services
pnpm dev:clean         # Stop services and remove volumes
```

**Data volumes** are stored at `./data/postgres` and `./data/redis` — gitignored, created automatically on first start.

### Running the app

```bash
pnpm dev          # Next.js dev server (waits for services)
pnpm build        # Production build check
pnpm test:e2e     # End-to-end tests (requires e2e profile)
```

### Code quality

```bash
pnpm lint         # ESLint
pnpm lint:fix     # ESLint with auto-fix
pnpm format       # Prettier format
pnpm format:check # Check formatting
```

## Project Structure

```
app/              # Next.js App Router pages and layouts
components/       # UI components (shadcn/ui)
lib/              # Shared utilities (db, redis, auth, validations)
server/           # Business logic (services, actions, queries)
worker/           # Background job processor (BullMQ)
tests/            # Test suites (unit, integration, e2e)
migrations/       # Database migrations (Drizzle)
scripts/          # Infrastructure automation
docs/             # Architecture decisions (ADR)
```

For architecture decisions, see [ai-hld/](ai-hld/). For domain terminology, see [UBIQUITOUS_LANGUAGE.md](UBIQUITOUS_LANGUAGE.md).

## Contributing

1. Clone the repo and run `pnpm install`
2. Create a branch: `git checkout -b task/N-description`
3. Make changes and commit using [Conventional Commits](https://www.conventionalcommits.org/)
4. Open a Draft PR for review

See [ai-hld/](ai-hld/) for the full architecture and development methodology.
