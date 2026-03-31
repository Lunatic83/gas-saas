# Worker

BullMQ worker process — handles background jobs asynchronously.

## Running

The worker runs as a separate Node.js process, managed by Docker Compose/ Swarm.

```bash
# Development (from project root)
pnpm worker:dev
```

## Queue Names

- `email` — transactional emails via React Email + Resend
- `notifications` — in-app notification dispatch
- `webhooks` — Stripe webhook processing

## Guidelines

- Workers are stateless — jobs are idempotent.
- Failed jobs are retried automatically by BullMQ with exponential backoff.
- Dead letter queue captures jobs that fail after all retries.
- Never import from `server/` — workers use their own database client connected to the same Postgres instance.
