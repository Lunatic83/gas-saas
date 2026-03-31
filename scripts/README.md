# Scripts

Infrastructure automation scripts. These are executed by Dokploy cron jobs, not by developers directly.

## What's Here

- `backup-db.sh` — `pg_dump` to R2, runs daily at 02:00 UTC
- `cleanup-backups.sh` — delete R2 backups older than 30 days, runs weekly
- `archive-audit-logs.sh` — move audit logs > 90 days to R2, runs monthly
- `cleanup-queue.sh` — purge completed/failed BullMQ jobs older than 7 days
- `setup-github-labels.sh` — sync GitHub labels from `.github/labels.yml`

## Guidelines

- All scripts must be idempotent — safe to run multiple times.
- Scripts log to stdout — Dokploy captures stdout as the job log.
- Credentials are injected as environment variables by Dokploy, not hardcoded.
