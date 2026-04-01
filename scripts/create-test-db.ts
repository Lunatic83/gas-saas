import 'dotenv/config';
import postgres from 'postgres';
import { spawnSync } from 'node:child_process';

const adminUrl = process.env.DATABASE_URL_ADMIN;
const testDbUrl = process.env.DATABASE_URL_TEST;

if (!adminUrl) {
  console.error('[create-test-db] ERROR: DATABASE_URL_ADMIN is not set');
  process.exit(1);
}
if (!testDbUrl) {
  console.error('[create-test-db] ERROR: DATABASE_URL_TEST is not set');
  process.exit(1);
}

const adminDb = postgres(adminUrl, { max: 1 });

async function createTestDb() {
  console.log('[create-test-db] Dropping saas_test if exists...');
  await adminDb`DROP DATABASE IF EXISTS saas_test`;

  console.log('[create-test-db] Creating saas_test...');
  await adminDb`CREATE DATABASE saas_test`;
  await adminDb.end();

  // Run db:push against saas_test
  console.log('[create-test-db] Running db:push against saas_test...');

  const result = spawnSync('pnpm', ['db:push', '--force'], {
    env: { ...process.env, DATABASE_URL: testDbUrl },
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    console.error('[create-test-db] db:push failed');
    process.exit(1);
  }

  console.log('[create-test-db] Done.');
}

createTestDb().catch((err) => {
  console.error('[create-test-db] Error:', err);
  process.exit(1);
});
