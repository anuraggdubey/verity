import { beforeEach, describe, expect, it } from 'vitest';

import { executeTool } from '@/lib/agent/tools';
import { resetDemo } from '@/lib/store';

describe('tool result semantics', () => {
  // The kernel binds its data access lazily on first store use, so touch the
  // store before reading through the tools — the same order the app follows.
  beforeEach(() => resetDemo());

  it('treats a search that finds nothing as success, not a failure', () => {
    // 17 auto-matched bank lines have no supporting document. Counting those
    // searches as errors reported 18 "tool failures" in a clean live run.
    const result = executeTool('get_supporting_document', JSON.stringify({ reference: 'NOPE-000' }));
    expect(result.ok).toBe(true);
    expect(result.content).toMatchObject({ count: 0 });
  });

  it('still fails a lookup for a specific record that does not exist', () => {
    const result = executeTool('get_supporting_document', JSON.stringify({ id: 'DOC-NOT-REAL' }));
    expect(result.ok).toBe(false);
  });

  it('fails an unknown bank line id', () => {
    expect(executeTool('get_bank_line', JSON.stringify({ id: 'BL-NOPE' })).ok).toBe(false);
  });

  it('rejects an unknown tool by name', () => {
    expect(executeTool('delete_ledger', '{}').ok).toBe(false);
  });
});
