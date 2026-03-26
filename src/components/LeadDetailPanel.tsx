import { useState, useEffect } from 'react';
import { api } from '../api';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'called', label: 'Called' },
  { value: 'interested', label: 'Interested' },
  { value: 'demo_booked', label: 'Demo Booked' },
  { value: 'closed', label: 'Closed' },
  { value: 'dead', label: 'Dead' },
];

const OUTCOME_OPTIONS = [
  { value: 'answered', label: '✅ Answered' },
  { value: 'no_answer', label: '📵 No Answer' },
  { value: 'callback', label: '🔁 Callback Requested' },
  { value: 'not_interested', label: '❌ Not Interested' },
];

const OUTCOME_BADGE: Record<string, string> = {
  answered: 'closed',
  no_answer: 'new',
  callback: 'interested',
  not_interested: 'dead',
  status_change: 'called',
};

function relTime(str: string) {
  const diff = Date.now() - new Date(str).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(str).toLocaleDateString();
}

interface Lead {
  id: number;
  company_name: string;
  phone?: string;
  website?: string;
  city?: string;
  postcode?: string;
  industry?: string;
  status: string;
  source?: string;
  rating?: number;
  review_count?: number;
  notes?: string;
  last_called_at?: string;
  call_count?: number;
}

interface CallEntry {
  id: number;
  outcome: string;
  notes: string;
  created_at: string;
}

export default function LeadDetailPanel({ lead, onClose, onUpdate }: { lead: Lead | null; onClose: () => void; onUpdate: (lead: Lead) => void }) {
  const [calls, setCalls] = useState<CallEntry[]>([]);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('new');
  const [outcome, setOutcome] = useState('answered');
  const [callNote, setCallNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!lead) return;
    setNotes(lead.notes || '');
    setStatus(lead.status || 'new');
    setCalls([]);
    api.leads.calls(lead.id).then(setCalls).catch(() => {});
  }, [lead?.id]);

  if (!lead) return null;

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      const updated = await api.leads.update(lead.id, { notes });
      onUpdate(updated);
    } finally { setSaving(false); }
  };

  const handleStatusChange = async (val: string) => {
    setStatus(val);
    try {
      const updated = await api.leads.update(lead.id, { status: val });
      onUpdate(updated);
    } catch (e) {}
  };

  const handleLogCall = async () => {
    setSaving(true);
    try {
      const updated = await api.leads.update(lead.id, { outcome, call_notes: callNote });
      onUpdate(updated);
      setCallNote('');
      const fresh = await api.leads.calls(lead.id);
      setCalls(fresh);
    } finally { setSaving(false); }
  };

  return (
    <div className="panel-overlay" onClick={(e: any) => e.target === e.currentTarget && onClose()}>
      <div className="panel animate-slide-r">
        {/* Header */}
        <div className="panel-header">
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{lead.company_name}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              <span className={`badge badge-${lead.status}`}>
                {STATUS_OPTIONS.find(s => s.value === lead.status)?.label || lead.status}
              </span>
              {lead.city && <span className="chip">{lead.city}</span>}
              {lead.industry && lead.industry !== 'Unknown' && (
                <span className="chip">{lead.industry}</span>
              )}
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="panel-body">
          {/* Quick actions */}
          <div>
            <div style={{ display: 'flex', gap: 8 }}>
              {lead.phone ? (
                <a href={`tel:${lead.phone}`} className="btn btn-cyan btn-sm">📞 {lead.phone}</a>
              ) : (
                <span className="btn btn-ghost btn-sm" style={{ opacity: 0.5 }}>No phone</span>
              )}
              {lead.website && (
                <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">🌐 Website</a>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <div className="panel-section-label">Status</div>
            <select className="input" value={status} onChange={(e) => handleStatusChange(e.target.value)}>
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Info */}
          <div>
            <div className="panel-section-label">Lead Info</div>
            {[
              { k: 'Phone', v: lead.phone || '—', mono: true },
              { k: 'City', v: lead.city || '—' },
              { k: 'Postcode', v: lead.postcode || '—' },
              { k: 'Industry', v: lead.industry || '—' },
              { k: 'Rating', v: lead.rating ? `⭐ ${lead.rating} (${lead.review_count ?? 0} reviews)` : '—' },
              { k: 'Calls Made', v: lead.call_count || 0, mono: true, color: 'var(--cyan)' },
              { k: 'Last Called', v: lead.last_called_at ? new Date(lead.last_called_at).toLocaleString() : '—' },
              { k: 'Source', v: lead.source || 'manual' },
            ].map(({ k, v, mono, color }: any) => (
              <div key={k} className="panel-info-row">
                <span className="panel-info-key">{k}</span>
                <span className="panel-info-value" style={{ fontFamily: mono ? 'var(--mono)' : undefined, color: color || undefined }}>
                  {k === 'Source' ? <span className={`badge badge-${v}`}>{v}</span> : String(v)}
                </span>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div>
            <div className="panel-section-label">Notes</div>
            <textarea
              className="input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add notes about this lead..."
            />
            <button className="btn btn-secondary btn-sm" onClick={handleSaveNotes} disabled={saving} style={{ marginTop: 8 }}>
              {saving ? <span className="spinner" /> : 'Save Notes'}
            </button>
          </div>

          {/* Log Call */}
          <div>
            <div className="panel-section-label">Log a Call</div>
            <select className="input" value={outcome} onChange={(e) => setOutcome(e.target.value)} style={{ marginBottom: 8 }}>
              {OUTCOME_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <input
              className="input"
              value={callNote}
              onChange={(e) => setCallNote(e.target.value)}
              placeholder="Call notes (optional)"
              style={{ marginBottom: 8 }}
            />
            <button className="btn btn-primary btn-sm" onClick={handleLogCall} disabled={saving}>
              {saving ? <span className="spinner" /> : '📞 Log Call'}
            </button>
          </div>

          {/* Call History */}
          {calls.length > 0 && (
            <div>
              <div className="panel-section-label">Call History</div>
              <div className="call-history">
                {calls.map((c) => (
                  <div key={c.id} className="call-entry">
                    <div className="call-entry-row">
                      <span className={`badge badge-${OUTCOME_BADGE[c.outcome] || 'new'}`}>
                        {c.outcome.replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                        {relTime(c.created_at)}
                      </span>
                    </div>
                    {c.notes && <div className="call-entry-notes">{c.notes}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
