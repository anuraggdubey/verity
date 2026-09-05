import type { TraceEntry } from '@/lib/trace/trace';
import { subscribeToTraces } from '@/lib/trace/trace';

/**
 * Owner: Builder B. Live worker activity as server-sent events.
 *
 * Each event is one trace entry: a model call, a tool call, a control result, a
 * block or a repair. Optional ?caseId= narrows the stream to one case.
 */
export async function GET(request: Request) {
  const caseId = new URL(request.url).searchParams.get('caseId');
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      send('open', { caseId: caseId ?? 'all', at: new Date().toISOString() });

      const unsubscribe = subscribeToTraces((entry: TraceEntry) => {
        if (caseId && entry.caseId !== caseId) return;
        try {
          send('trace', entry);
        } catch {
          // Client went away mid-write; cleanup happens on abort.
        }
      });

      // Keeps proxies from closing an idle stream.
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'));
        } catch {
          clearInterval(heartbeat);
        }
      }, 15000);

      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
    },
  });
}
