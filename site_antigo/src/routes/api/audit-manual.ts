import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/audit-manual')({
  server: {
    handlers: {
      GET: async () => {
        return new Response(JSON.stringify({ error: 'Not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
  }
});
