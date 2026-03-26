import { useState } from 'react';

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const [token, setToken] = useState(localStorage.getItem('apify_token') || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (token.trim()) {
      localStorage.setItem('apify_token', token.trim());
    } else {
      localStorage.removeItem('apify_token');
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  return (
    <div className="modal-overlay" onClick={(e: any) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">⚙️ Settings</div>
        <div className="modal-sub">Configure your Apify integration to import leads from actors.</div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>
            Apify API Token
          </label>
          <input
            className="input"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="apify_api_xxxxxxxxxxxx"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
            Find your token at console.apify.com → Settings → Integrations
          </div>
        </div>

        {token && (
          <div style={{ fontSize: 11, color: 'var(--green)', marginTop: 10 }}>
            ✓ Token stored locally in browser — never sent to any server except Apify.
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>
            {saved ? '✓ Saved!' : 'Save Token'}
          </button>
        </div>
      </div>
    </div>
  );
}
