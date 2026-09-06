import { runMigrations } from '../src/lib/db/migrate';

async function main() {
  const forceReseed = process.argv.includes('--force-reseed');
  console.log('Running Neon PostgreSQL migration...');
  const result = await runMigrations(forceReseed);
  if (!result.ok) {
    console.error('Migration notice:', result.message);
    process.exit(1);
  }
  console.log('Success:', result.message);
}

main().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
