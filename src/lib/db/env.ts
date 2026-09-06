/** Database env detection — no Node built-ins, safe to import anywhere. */

export function getDatabaseUrl(): string | null {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    null
  );
}

export function isDatabaseConfigured(): boolean {
  const url = getDatabaseUrl();
  return Boolean(url && (url.startsWith('postgres://') || url.startsWith('postgresql://')));
}

export function isDatabaseEnabled(): boolean {
  return process.env.VITEST !== 'true' && isDatabaseConfigured();
}

export const shouldUseDatabase = isDatabaseEnabled;
