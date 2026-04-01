#!/bin/bash
set -euo pipefail

SCHEMA_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep 'lib/db/schema/' || true)
if [ -n "$SCHEMA_FILES" ]; then
  if [ ! -d "migrations" ] || [ -z "$(ls -A migrations/*.sql 2>/dev/null)" ]; then
    echo "ERROR: Schema files modified but no migrations directory found."
    exit 1
  fi

  LATEST_MIGRATION=$(ls -t migrations/*.sql | head -1)
  SCHEMA_NEWER=$(find lib/db/schema -name '*.ts' -newer "$LATEST_MIGRATION" | head -1)

  if [ -n "$SCHEMA_NEWER" ]; then
    echo "ERROR: Schema files modified but no migration generated."
    echo "Run: pnpm db:generate"
    exit 1
  fi
fi
