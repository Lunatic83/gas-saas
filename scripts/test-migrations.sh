#!/usr/bin/env bash
set -e

TEMP_DB="test_migrations_$$"
DATABASE_URL_TEMP="postgresql://postgres:postgres@localhost:5432/$TEMP_DB"

echo "[test-migrations] Creating temp DB: $TEMP_DB"

# Create temp database using docker compose exec postgres
docker compose -f docker-compose.dev.yml exec -T postgres psql -U postgres -c "DROP DATABASE IF EXISTS $TEMP_DB" -c "CREATE DATABASE $TEMP_DB" postgres > /dev/null 2>&1

# Run migrations against temp DB
export DATABASE_URL="$DATABASE_URL_TEMP"
pnpm db:migrate

# Drop temp DB
docker compose -f docker-compose.dev.yml exec -T postgres psql -U postgres -c "DROP DATABASE $TEMP_DB" postgres > /dev/null 2>&1

echo "[test-migrations] OK"
