const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function headers() {
  const token = localStorage.getItem('apify_token');
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    ...(token ? { 'x-apify-token': token } : {}),
  };
}

async function req(fn: string, path: string, opts: RequestInit = {}) {
  const url = `${SUPABASE_URL}/functions/v1/${fn}${path}`;
  const res = await fetch(url, { ...opts, headers: { ...headers(), ...opts.headers } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  stats: () => req('stats', ''),

  leads: {
    list: (p: Record<string, string> = {}) => req('leads', `?${new URLSearchParams(p)}`),
    create: (d: any) => req('leads', '', { method: 'POST', body: JSON.stringify(d) }),
    update: (id: number, d: any) => req('leads', `/${id}`, { method: 'PATCH', body: JSON.stringify(d) }),
    delete: (id: number) => req('leads', `/${id}`, { method: 'DELETE' }),
    calls: (id: number) => req('leads', `/${id}/calls`),
    import: (leads: any[]) => req('leads', '/import', { method: 'POST', body: JSON.stringify({ leads }) }),
    bulkUpdate: (ids: number[], status: string) => req('leads', '/bulk', { method: 'PATCH', body: JSON.stringify({ ids, status }) }),
  },

  apify: {
    actors: () => req('apify', '/actors'),
    run: (id: string, input?: any) => req('apify', `/actors/${id}/run`, { method: 'POST', body: JSON.stringify(input || {}) }),
    lastRun: (id: string) => req('apify', `/actors/${id}/last-run`),
    runs: (id: string) => req('apify', `/actors/${id}/runs`),
  },
};
