import { useNavigate } from 'react-router-dom';

const COLUMNS = [
  { key: 'new', label: 'New', color: 'var(--s-new)' },
  { key: 'called', label: 'Called', color: 'var(--s-called)' },
  { key: 'interested', label: 'Interested', color: 'var(--s-interested)' },
  { key: 'demo_booked', label: 'Demo Booked', color: 'var(--s-demo)' },
  { key: 'closed', label: 'Closed', color: 'var(--s-closed)' },
  { key: 'dead', label: 'Dead', color: 'var(--s-dead)' },
];

interface Lead {
  id: number;
  company_name: string;
  city?: string;
  status: string;
  call_count?: number;
}

export default function KanbanBoard({ leads = [] }: { leads?: Lead[] }) {
  const navigate = useNavigate();

  const byStatus: Record<string, Lead[]> = {};
  for (const col of COLUMNS) byStatus[col.key] = [];
  for (const lead of leads) {
    if (byStatus[lead.status]) byStatus[lead.status].push(lead);
  }

  return (
    <div className="kanban">
      {COLUMNS.map((col) => {
        const items = byStatus[col.key] || [];
        return (
          <div key={col.key} className="kanban-col">
            <div className="kanban-col-header">
              <span className="kanban-col-title" style={{ color: col.color }}>{col.label}</span>
              <span className="kanban-col-count" style={{ color: col.color }}>{items.length}</span>
            </div>
            <div className="kanban-cards">
              {items.slice(0, 5).map((lead) => (
                <div
                  key={lead.id}
                  className="kanban-card"
                  onClick={() => navigate(`/leads?highlight=${lead.id}`)}
                  title={lead.company_name}
                >
                  <div className="kanban-card-name">{lead.company_name}</div>
                  <div className="kanban-card-meta">
                    {lead.city || '—'}
                    {(lead.call_count || 0) > 0 && <> · {lead.call_count} call{lead.call_count !== 1 ? 's' : ''}</>}
                  </div>
                </div>
              ))}
              {items.length > 5 && (
                <div
                  className="kanban-card"
                  style={{ textAlign: 'center', color: 'var(--muted)', cursor: 'pointer' }}
                  onClick={() => navigate(`/leads?status=${col.key}`)}
                >
                  +{items.length - 5} more
                </div>
              )}
              {items.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '16px 0', fontSize: 12 }}>
                  Empty
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
