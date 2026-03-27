import { useState, useEffect } from 'react';
import { api } from '../api';

function relTime(str?: string) {
  if (!str) return '—';
  const diff = Date.now() - new Date(str).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(str).toLocaleDateString();
}

const DEFAULT_ACTOR = {
  id: "compass/crawler-google-places",
  name: "Google Maps Scraper",
  stats: { totalRuns: null, lastRunStartedAt: null },
};

function ActorCard({ actor, onRun, onImport, importing }: any) {
  const isRunning = actor.stats?.lastRunStatus === 'RUNNING' ||
    (actor.lastRun && actor.lastRun.status === 'RUNNING');

  return (
    <div className={`actor-card${isRunning ? ' actor-card-running' : ''}`}>
      <div style={{ marginBottom: 10 }}>
        <div className="actor-name">{actor.name || actor.id}</div>
        <div className="actor-meta" style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{actor.id}</div>
        {isRunning && (
          <span className="badge badge-closed" style={{ marginTop: 6, display: 'inline-flex' }}>
            <span className="pulse-dot" style={{ width: 6, height: 6 }} /> LIVE
          </span>
        )}
      </div>

      <div className="actor-status-row">
        {isRunning ? <span className="pulse-dot" /> : <span className="pulse-dot-idle" />}
        <span style={{ fontSize: 12, color: isRunning ? 'var(--green)' : 'var(--muted)' }}>
          {isRunning ? 'Running…' : 'Idle'}
        </span>
        {actor.stats?.lastRunStartedAt && !isRunning && (
          <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 'auto' }}>
            Last run {relTime(actor.stats.lastRunStartedAt)}
          </span>
        )}
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 12 }}>
        Runs: <strong>{actor.stats?.totalRuns ?? '—'}</strong>
        <span style={{ margin: '0 8px' }}>·</span>
        Builds: <strong>{actor.stats?.totalBuilds ?? '—'}</strong>
      </div>

      <div className="actor-actions">
        <button className="btn btn-secondary btn-sm" onClick={() => onRun(actor.id)} disabled={isRunning} title="Trigger a new run with default input">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Run Actor
        </button>
        <button className="btn btn-green btn-sm" onClick={() => onImport(actor.id)} disabled={importing === actor.id} title="Import results from last successful run">
          {importing === actor.id ? (
            <span className="spinner" style={{ width: 12, height: 12 }} />
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          )}
          Import Leads
        </button>
      </div>
    </div>
  );
}

export default function Import() {
  const [actors, setActors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [runMsg, setRunMsg] = useState<any>(null);

  const token = localStorage.getItem('apify_token');

  const loadActors = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.apify.actors();
      setActors(list || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) loadActors(); else setLoading(false); }, [token]);

  const handleRun = async (actorId: string) => {
    setRunMsg(null);
    try {
      const run = await api.apify.run(actorId, {});
      setRunMsg({ type: 'success', text: `Run started (ID: ${run.id}). Status: ${run.status}` });
      setTimeout(loadActors, 3000);
    } catch (e: any) {
      setRunMsg({ type: 'error', text: e.message });
    }
  };

  const handleImport = async (actorId: string) => {
    setImporting(actorId);
    setResults(null);
    try {
      const { run, items } = await api.apify.lastRun(actorId);
      if (!run) {
        setResults({ type: 'error', msg: 'No successful run found for this actor.' });
        return;
      }
      if (run.status !== 'SUCCEEDED') {
        setResults({ type: 'error', msg: `Last run status is "${run.status}". Wait for it to succeed.` });
        return;
      }
      if (!items || items.length === 0) {
        setResults({ type: 'warn', msg: 'Last run returned 0 items.' });
        return;
      }
      const r = await api.leads.import(items);
      setResults({ type: 'success', ...r });
    } catch (e: any) {
      setResults({ type: 'error', msg: e.message });
    } finally {
      setImporting(null);
    }
  };

  return (
    <div className="page animate-in">
      <div className="page-header">
        <div>
          <div className="page-title">Import from Apify</div>
          <div className="page-sub">Run actors and import leads directly into your CRM</div>
        </div>
        {token && (
          <button className="btn btn-secondary" onClick={loadActors}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Refresh
          </button>
        )}
      </div>

      {/* No token */}
      {!token && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>🔑</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Apify token required</div>
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>
            Add your Apify API token in Settings to connect your actors.
          </div>
          <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 12 }}>
            Click the <strong>Apify Settings</strong> gear icon in the sidebar.
          </div>
        </div>
      )}

      {/* Run message */}
      {runMsg && (
        <div className={`card ${runMsg.type === 'success' ? 'card-glow' : ''}`} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ flex: 1, fontSize: 13 }}>{runMsg.text}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setRunMsg(null)}>✕</button>
        </div>
      )}

      {/* Import results */}
      {results && (
        <div style={{ marginBottom: 16 }}>
          <div className="import-result">
            {results.type === 'success' ? (
              <>
                <div className="import-stat">
                  <div className="import-stat-num" style={{ color: 'var(--green)' }}>{results.imported}</div>
                  <div className="import-stat-label">Imported</div>
                </div>
                <div className="import-stat">
                  <div className="import-stat-num" style={{ color: 'var(--yellow)' }}>{results.skipped}</div>
                  <div className="import-stat-label">Skipped (dupes)</div>
                </div>
                <div className="import-stat">
                  <div className="import-stat-num">{results.total}</div>
                  <div className="import-stat-label">Total in Run</div>
                </div>
                <span style={{ color: 'var(--green)', fontSize: 12, flex: 1 }}>✓ Import complete</span>
              </>
            ) : (
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13 }}>
                  {results.type === 'warn' ? '⚠️' : '❌'} {results.msg}
                </span>
              </div>
            )}
            <button className="btn btn-ghost btn-sm" onClick={() => setResults(null)} style={{ marginLeft: 'auto' }}>✕</button>
          </div>
        </div>
      )}

      {/* Supported actor info */}
      {token && (
        <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 16, display: 'flex', gap: 6, alignItems: 'center' }}>
          <span>ℹ</span>
          <span>
            Optimised for <strong>apify/google-maps-scraper</strong>.
            Fields imported: title, phone, address, city, website, rating, reviewsCount.
          </span>
        </div>
      )}

      {/* Loading */}
      {token && loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, gap: 10 }}>
          <div className="spinner" />
          <span style={{ color: 'var(--muted)' }}>Loading actors…</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Failed to load actors</div>
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>{error}</div>
        </div>
      )}

      {/* Actor grid */}
      {!loading && actors.length > 0 && (
        <div className="actor-grid">
          {actors.map((actor) => (
            <ActorCard key={actor.id} actor={actor} onRun={handleRun} onImport={handleImport} importing={importing} />
          ))}
        </div>
      )}

      {/* No actors */}
      {token && !loading && !error && actors.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🤖</div>
          <div style={{ fontWeight: 600 }}>No actors found</div>
          <div style={{ fontSize: 12 }}>Create actors at console.apify.com</div>
        </div>
      )}
    </div>
  );
}
