import { neon, Pool } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

import { getDatabaseUrl, isDatabaseConfigured } from './env';

function loadEnvFallback() {
  if (isDatabaseConfigured()) return;
  for (const file of ['.env.local', '.env']) {
    const fullPath = path.join(process.cwd(), file);
    if (!fs.existsSync(fullPath)) continue;
    try {
      if (typeof process.loadEnvFile === 'function') {
        process.loadEnvFile(fullPath);
      } else {
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const line of content.split('\n')) {
          const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
          if (match && !process.env[match[1]]) {
            process.env[match[1]] = match[2]?.replace(/^["'](.*)["']$/, '$1').trim() || '';
          }
        }
      }
      if (isDatabaseConfigured()) break;
    } catch {
      // ignore
    }
  }
}

loadEnvFallback();

export { getDatabaseUrl, isDatabaseConfigured } from './env';
export { useDatabase } from './env';

let cachedSql: ReturnType<typeof neon> | null = null;
let cachedPool: Pool | null = null;

export function getSql() {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error('Database connection URL is not configured. Please set DATABASE_URL or POSTGRES_URL.');
  }
  if (!cachedSql) {
    cachedSql = neon(url);
  }
  return cachedSql;
}

export function getPool(): Pool {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error('Database connection URL is not configured. Please set DATABASE_URL or POSTGRES_URL.');
  }
  if (!cachedPool) {
    cachedPool = new Pool({ connectionString: url });
  }
  return cachedPool;
}
