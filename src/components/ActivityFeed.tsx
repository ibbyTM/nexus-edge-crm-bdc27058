const OUTCOME_COLORS: Record<string, string> = {
  answered: 'var(--green)',
  no_answer: 'var(--muted)',
  callback: 'var(--yellow)',
  not_interested: 'var(--red)',
  status_change: 'var(--accent)',
};

const OUTCOME_LABELS: Record<string, string> = {
  answered: 'Answered',
  no_answer: 'No Answer',
  callback: 'Callback',
  not_interested: 'Not Interested',
  status_change: 'Status Change',
};

function relTime(str: string) {
  const diff = Date.now() - new Date(str).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(str).toLocaleDateString();
}

interface ActivityItem {
  id: number;
  lead_id: number;
  outcome: string;
  notes: string;
  created_at: string;
  company_name: string;
}

export default function ActivityFeed({ items = [] }: { items?: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '32px 16px' }}>
        <div className="empty-state-icon">📋</div>
        <div>No activity yet</div>
      </div>
    );
  }

  return (
    <div className="activity-feed">
      {items.map((item, i) => (
        <div key={item.id || i} className="activity-item" style={{ animationDelay: `${i * 0.04}s` }}>
          <div className="activity-dot" style={{ background: OUTCOME_COLORS[item.outcome] || 'var(--muted)' }} />
          <div className="activity-content">
            <div className="activity-company">{item.company_name}</div>
            <div className="activity-outcome">
              {OUTCOME_LABELS[item.outcome] || item.outcome}
              {item.notes && item.outcome !== 'status_change' && ` · ${item.notes}`}
              {item.outcome === 'status_change' && item.notes && (
                <span style={{ display: 'block', marginTop: 2, fontSize: 11, color: 'var(--text-2)' }}>{item.notes}</span>
              )}
            </div>
          </div>
          <div className="activity-time">{relTime(item.created_at)}</div>
        </div>
      ))}
    </div>
  );
}
