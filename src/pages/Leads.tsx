import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import LeadDetailPanel from '../components/LeadDetailPanel';

const STATUS_OPTIONS = ['all', 'new', 'called', 'interested', 'demo_booked', 'closed', 'dead'];
const STATUS_LABELS: Record<string, string> = { all: 'All Statuses', new: 'New', called: 'Called', interested: 'Interested', demo_booked: 'Demo Booked', closed: 'Closed', dead: 'Dead' };

function fmt(str?: string) {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
}

export default function Leads() {
  const [searchParams] = useSearchParams();

  const [leads, setLeads] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [activeLead, setActiveLead] = useState<any>(null);
  const [activeIdx, setActiveIdx] = useState(-1);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [city, setCity] = useState('all');
  const [industry, setIndustry] = useState('all');

  const searchTimer = useRef<any>(null);

  const load = useCallback(async (override: Record<string, string> = {}) => {
    setLoading(true);
    try {
      const p: Record<string, string> = {
        ...(search && { search }),
        ...(status !== 'all' && { status }),
        ...(city !== 'all' && { city }),
        ...(industry !== 'all' && { industry }),
        ...override,
      };
      const { leads: l, total: t } = await api.leads.list(p);
      setLeads(l || []);
      setTotal(t || 0);

      const highlight = searchParams.get('highlight');
      if (highlight) {
        const idx = (l || []).findIndex((x: any) => x.id === parseInt(highlight));
        if (idx >= 0) { setActiveLead(l[idx]); setActiveIdx(idx); }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, status, city, industry, searchParams]);

  useEffect(() => { load(); }, [status, city, industry]);
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(), 300);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === ' ' && activeIdx >= 0) {
        e.preventDefault();
        handleQuickCall(leads[activeIdx]);
      }
      if (e.key === 'Enter' && activeIdx >= 0) {
        e.preventDefault();
        const next = leads[activeIdx + 1];
        if (next) { setActiveLead(next); setActiveIdx(activeIdx + 1); }
      }
      if (e.key === 'Escape') { setActiveLead(null); setActiveIdx(-1); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeIdx, leads]);

  const handleQuickCall = async (lead: any) => {
    if (!lead) return;
    try {
      const updated = await api.leads.update(lead.id, { status: 'called' });
      setLeads(ls => ls.map(l => l.id === updated.id ? updated : l));
      if (activeLead?.id === lead.id) setActiveLead(updated);
    } catch (e) {}
  };

  const handleCallNext = () => {
    const next = leads.find(l => l.status === 'new');
    if (next) {
      const idx = leads.indexOf(next);
      setActiveLead(next);
      setActiveIdx(idx);
    }
  };

  const handleLeadUpdate = (updated: any) => {
    setLeads(ls => ls.map(l => l.id === updated.id ? updated : l));
    setActiveLead(updated);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this lead?')) return;
    await api.leads.delete(id);
    setLeads(ls => ls.filter(l => l.id !== id));
    if (activeLead?.id === id) { setActiveLead(null); setActiveIdx(-1); }
  };

  const toggleSelect = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === leads.length) setSelected(new Set());
    else setSelected(new Set(leads.map(l => l.id)));
  };

  const handleBulkStatus = async (newStatus: string) => {
    if (!newStatus || selected.size === 0) return;
    try {
      await api.leads.bulkUpdate([...selected], newStatus);
      setSelected(new Set());
      await load();
    } catch (e) {}
  };

  const cities = [...new Set(leads.map(l => l.city).filter(Boolean))].sort();
  const industries = [...new Set(leads.map(l => l.industry).filter(Boolean))].sort();
  const newCount = leads.filter(l => l.status === 'new').length;

  return (
    <div className="page animate-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Leads</div>
          <div className="page-sub">
            {total} total{selected.size > 0 && ` · ${selected.size} selected`}
          </div>
        </div>
        {newCount > 0 && (
          <button className="btn btn-cyan" onClick={handleCallNext}>
            📞 Call Next <span className="badge badge-apify" style={{ marginLeft: 6 }}>{newCount}</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input
          className="input search-input"
          placeholder="Search leads…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select className="input" value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="all">All Cities</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input" value={industry} onChange={(e) => setIndustry(e.target.value)}>
          <option value="all">All Industries</option>
          {industries.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>

      {selected.size > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{selected.size} selected:</span>
          {STATUS_OPTIONS.filter(s => s !== 'all').map(s => (
            <button key={s} className="btn btn-ghost btn-sm" onClick={() => handleBulkStatus(s)}>
              → {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}

      {/* Keyboard hint */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: 11, color: 'var(--muted)' }}>
        <span><span className="kbd">Space</span> Mark called</span>
        <span><span className="kbd">Enter</span> Next lead</span>
        <span><span className="kbd">Esc</span> Close panel</span>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <div className="table-scroll">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div className="spinner" />
            </div>
          ) : leads.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <div style={{ fontWeight: 600 }}>No leads found</div>
              <div style={{ fontSize: 12 }}>Try adjusting your filters or import leads from Apify.</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th style={{ width: 36, textAlign: 'center' }}>
                    <input type="checkbox" className="checkbox" checked={selected.size === leads.length && leads.length > 0} onChange={toggleSelectAll} />
                  </th>
                  <th>Company</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Industry</th>
                  <th>Status</th>
                  <th>Calls</th>
                  <th>Last Called</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, idx) => (
                  <tr
                    key={lead.id}
                    onClick={() => { setActiveLead(lead); setActiveIdx(idx); }}
                    className={`${selected.has(lead.id) ? 'row-selected' : ''} ${activeLead?.id === lead.id ? 'row-active' : ''}`}
                  >
                    <td onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                      <input type="checkbox" className="checkbox" checked={selected.has(lead.id)} onChange={(e: any) => toggleSelect(lead.id, e)} />
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{lead.company_name}</div>
                      {lead.website && (
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{lead.website.replace(/^https?:\/\//, '')}</div>
                      )}
                    </td>
                    <td>
                      {lead.phone ? (
                        <a href={`tel:${lead.phone}`} style={{ color: 'var(--cyan)', fontFamily: 'var(--mono)', fontSize: 12 }} onClick={(e) => e.stopPropagation()}>
                          {lead.phone}
                        </a>
                      ) : <span style={{ color: 'var(--muted)' }}>—</span>}
                    </td>
                    <td>{lead.city || '—'}</td>
                    <td>{lead.industry || '—'}</td>
                    <td><span className={`badge badge-${lead.status}`}>{STATUS_LABELS[lead.status] || lead.status}</span></td>
                    <td style={{ fontFamily: 'var(--mono)', color: lead.call_count > 0 ? 'var(--cyan)' : 'var(--muted)' }}>
                      {lead.call_count || 0}
                    </td>
                    <td style={{ fontSize: 12 }}>{fmt(lead.last_called_at)}</td>
                    <td>
                      {lead.rating ? (
                        <span style={{ color: 'var(--yellow)', fontSize: 12 }}>★ {lead.rating}</span>
                      ) : <span style={{ color: 'var(--muted)' }}>—</span>}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleQuickCall(lead)} style={{ padding: '4px 6px' }}>📞</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(lead.id)} style={{ padding: '4px 6px', color: 'var(--red)' }}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Lead detail panel */}
      {activeLead && (
        <LeadDetailPanel
          lead={activeLead}
          onClose={() => { setActiveLead(null); setActiveIdx(-1); }}
          onUpdate={handleLeadUpdate}
        />
      )}
    </div>
  );
}
