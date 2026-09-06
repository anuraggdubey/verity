import { createHash } from 'node:crypto';

import type { ReplayFingerprint } from '@/lib/contracts/types';

export function fingerprintDigest(fingerprint: ReplayFingerprint): string {
  const canonical = JSON.stringify({ ...fingerprint, tools: [...fingerprint.tools].sort() });
  return `sha256:${createHash('sha256').update(canonical).digest('hex')}`;
}
