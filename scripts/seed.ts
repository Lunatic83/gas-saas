import 'dotenv/config';
import { db } from '../lib/db/index';

async function main() {
  console.log('[seed] Placeholder seed — replace in Epic 6');
  await db.execute(`SELECT 1`);
  console.log('[seed] DB connection OK');
}

main().catch((err) => {
  console.error('[seed] Error:', err);
  process.exit(1);
});
