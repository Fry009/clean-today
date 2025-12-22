import demoData from '@shared/demoData';

import { db } from '../../storage/dexieClient';

let enabled = false;

const euro = (amount: number) => ({ amount, currency: 'EUR' as const });
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });

export function setupMockServer() {
  if (enabled || typeof window === 'undefined') return;
  enabled = true;
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    const method = (init?.method || 'GET').toUpperCase();

    if (url.startsWith('/api/jobs')) {
      if (method === 'GET') {
        const match = url.match(/^\/api\/jobs\/([^/?#]+)/);
        if (match) {
          const job = await db.jobs.get(match[1]);
          return json(job ?? null, job ? 200 : 404);
        }
        const jobs = await db.jobs.toArray();
        return json(jobs);
      }
    }

    if (url.startsWith('/api/clients')) {
      if (method === 'GET') {
        const match = url.match(/^\/api\/clients\/([^/?#]+)/);
        if (match) {
          const client = await db.clients.get(match[1]);
          return json(client ?? null, client ? 200 : 404);
        }
        const clients = await db.clients.toArray();
        return json(clients);
      }
    }

    if (url.startsWith('/api/leads')) {
      if (method === 'GET') {
        const leads = await db.leads.toArray();
        return json(leads);
      }
      if (method === 'POST' && url.endsWith('/refresh')) {
        await db.leads.bulkPut([
          ...demoData.leads,
          {
            id: crypto.randomUUID(),
            source: 'milanuncios',
            title: 'Limpieza express Malasaña',
            description: '2h hoy',
            url: 'https://example.com/lead',
            location: 'Madrid',
            price: euro(55),
            distanceKm: 1.2,
            postedHoursAgo: 1,
            type: 'hogar',
            status: 'unhandled',
            createdAt: new Date().toISOString()
          }
        ]);
        const leads = await db.leads.toArray();
        return json(leads);
      }
      const matchAction = url.match(/\/api\/leads\/(.+)\/(save|discard|convert-to-job)/);
      if (method === 'POST' && matchAction) {
        const [, id, action] = matchAction;
        if (action === 'save') await db.leads.update(id, { status: 'saved' });
        if (action === 'discard') await db.leads.update(id, { status: 'discarded' });
        if (action === 'convert-to-job') await db.leads.update(id, { status: 'saved' });
        const lead = await db.leads.get(id);
        return json(lead);
      }
    }
    return originalFetch(input, init);
  };
}
