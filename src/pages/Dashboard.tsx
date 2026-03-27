import { useState, useEffect } from 'react';
import { api } from '../api';
import StatCard from '../components/StatCard';
import KanbanBoard from '../components/KanbanBoard';
import ActivityFeed from '../components/ActivityFeed';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const [s, l] = await Promise.all([
        api.stats(),
        api.leads.list({ limit: '500' }),
      ]);
      setStats(s);
      setLeads(l.leads || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
        <span style={{ marginLeft: 12, color: 'var(--muted)' }}>Loading dashboard…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Connection Error</div>
          <div style={{ color: 'var(--muted)', marginBottom: 16 }}>{error}</div>
          <button className="btn btn-primary" onClick={() => { setError(null); setLoading(true); load(); }}>Retry</button>
        </div>
      </div>
    );
  }

  const s = stats || {};

  return (
    <div className="page animate-in">
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">Your pipeline at a glance</div>
        </div>
        <button className="btn btn-secondary" onClick={() => { setLoading(true); load(); }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <StatCard
          label="Total Leads"
          value={s.total || 0}
          color=""
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          }
        />
        <StatCard
          label="Called Today"
          value={s.calledToday || 0}
          color="cyan"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/></svg>
          }
        />
        <StatCard
          label="Demos Booked"
          value={s.demosBooked || 0}
          color="purple"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          }
        />
        <StatCard
          label="Conversion Rate"
          value={s.conversionRate || 0}
          suffix="%"
          decimals={1}
          color="green"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
          }
        />
      </div>

      {/* Main grid */}
      <div className="dash-grid">
        {/* Left: Kanban */}
        <div>
          <div className="dash-section-title">Pipeline</div>
          <KanbanBoard leads={leads} />
        </div>

        {/* Right: Activity */}
        <div>
          <div className="row-between" style={{ marginBottom: 12 }}>
            <div className="dash-section-title" style={{ margin: 0 }}>Recent Activity</div>
            <span className="badge badge-apify">Live Feed</span>
          </div>
          <div className="card" style={{ maxHeight: 500, overflowY: 'auto' }}>
            <ActivityFeed items={s.recentActivity} />
          </div>
        </div>
      </div>

      {/* Bottom: Status breakdown */}
      <div style={{ marginTop: 24 }}>
        <div className="dash-section-title">Status Breakdown</div>
        <div className="stat-grid status-breakdown-grid">
          {[
            { key: 'new', label: 'New', color: 'var(--s-new)' },
            { key: 'called', label: 'Called', color: 'var(--s-called)' },
            { key: 'interested', label: 'Interested', color: 'var(--s-interested)' },
            { key: 'demo_booked', label: 'Demo Booked', color: 'var(--s-demo)' },
            { key: 'closed', label: 'Closed', color: 'var(--s-closed)' },
            { key: 'dead', label: 'Dead', color: 'var(--s-dead)' },
          ].map(({ key, label, color }) => {
            const count = s.byStatus?.[key] || 0;
            const pct = s.total > 0 ? Math.round((count / s.total) * 100) : 0;
            return (
              <div key={key} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--mono)', color }}>{count}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
