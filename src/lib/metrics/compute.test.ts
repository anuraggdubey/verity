import { beforeEach, describe, expect, it } from 'vitest';

import { computeMetrics } from '@/lib/metrics/compute';
import { resetDemo, setCaseState } from '@/lib/store';

describe('safety metrics', () => {
  beforeEach(() => resetDemo());

  it('does not count a case that escalated as an unsafe escape', () => {
    // CASE-007 reached `escalated` while its stored route decision still said
    // review. Reading the route alone reported a phantom unsafe escape — the
    // one number the whole product is judged on.
    expect(computeMetrics().safety.criticalUnsafeMergeReady).toBe(0);
  });

  it('does count an escalation-worthy case that never escalated', () => {
    setCaseState('CASE-004', 'merge_ready');
    expect(computeMetrics().safety.criticalUnsafeMergeReady).toBeGreaterThan(0);
  });
});
