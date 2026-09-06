import { isDatabaseConfigured } from '../src/lib/db/env';
import { runMigrations } from '../src/lib/db/migrate';

async function main() {
  if (!isDatabaseConfigured()) {
    console.log('[verity] Skipping db:migrate — DATABASE_URL not set');
    return;
  }

  const result = await runMigrations();
  if (!result.ok) {
    console.error('[verity] db:migrate failed:', result.message);
    process.exit(1);
  }
  console.log('[verity]', result.message);
}

main().catch((err) => {
  console.error('[verity] prebuild database error:', err);
  process.exit(1);
});
