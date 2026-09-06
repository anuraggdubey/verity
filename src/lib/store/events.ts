import type { VerityEvent } from '@/lib/contracts/types';

export function appendAuditEvent(events: VerityEvent[], event: VerityEvent): void {
  events.push(structuredClone(event));
}

export function orderedEvents(events: VerityEvent[]): VerityEvent[] {
  return [...events].sort((a, b) => a.at.localeCompare(b.at));
}
