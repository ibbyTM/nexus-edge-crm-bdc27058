import { useState } from 'react';

const SCRIPTS = [
  {
    id: 'a',
    label: 'Variant A',
    sublabel: 'Pain-First',
    color: 'var(--accent)',
    badge: 'RECOMMENDED',
    sections: [
      {
        title: 'Open',
        content: (
          <>
            "Hey [Name], this is [Your Name] — quick call, I promise I'll be brief.{' '}
            We work with HVAC and plumbing companies who are struggling to keep their schedule full during slow months.{' '}
            Does that sound familiar?"
          </>
        ),
      },
      {
        title: 'Bridge',
        content: (
          <>
            "Most of our clients were spending hours doing their own outreach — cold calls, flyers, the lot — with zero consistency.{' '}
            We built a system that delivers 5 to 15 qualified jobs booked per week, completely on autopilot.{' '}
            We handle the lead gen, qualification, and appointment setting. You just show up."
          </>
        ),
      },
      {
        title: 'Close',
        content: (
          <>
            "Would it make sense to jump on a 15-minute call this week? I can show you exactly how it works for businesses like yours.{' '}
            Does Thursday or Friday work better for you?"
          </>
        ),
      },
    ],
    objections: [
      { q: '"I\'m too busy right now."', a: 'Totally get it — that\'s exactly why we built this. To take the busy work off your plate. The call is only 15 minutes. Would Thursday at 9am or Friday at 2pm work?' },
      { q: '"We\'re not interested."', a: 'Fair enough. Can I ask — is it the timing, or is keeping the schedule full just not a pain point right now?' },
      { q: '"We already have enough leads."', a: 'That\'s great to hear. How are you getting them? We typically work alongside what\'s already working to fill any seasonal gaps.' },
      { q: '"How much does it cost?"', a: 'Pricing depends on your market and what you\'re looking to hit — that\'s exactly what the 15-minute call covers. What I can say is that clients typically see ROI within the first two weeks.' },
      { q: '"Send me some information."', a: 'Absolutely — what\'s the best email? And while I\'ve got you, is there a specific challenge you\'re looking to solve? That way I can send you the most relevant stuff.' },
    ],
  },
  {
    id: 'b',
    label: 'Variant B',
    sublabel: 'Curiosity Hook',
    color: 'var(--cyan)',
    badge: null,
    sections: [
      {
        title: 'Open',
        content: (
          <>
            "Hey [Name], quick question — if I could show you exactly how your competitors are{' '}
            booking 20+ jobs per month without doing any cold calling themselves,{' '}
            would that be worth 15 minutes of your time?"
          </>
        ),
      },
      {
        title: 'Bridge',
        content: (
          <>
            "We've helped HVAC and plumbing businesses implement a done-for-you lead gen system that targets{' '}
            homeowners actively searching for your services right now.{' '}
            The key difference is we pre-qualify every lead before it hits your inbox — no tire kickers."
          </>
        ),
      },
      {
        title: 'Close',
        content: (
          <>
            "I have time Tuesday or Wednesday — which works better?{' '}
            Even if it's not a fit, you'll leave with a clear picture of what's working for top operators in your space right now."
          </>
        ),
      },
    ],
    objections: [
      { q: '"How did you get my number?"', a: 'I found you through Google Maps — you\'ve got a solid operation, that\'s why I reached out. I focus on businesses with strong reviews because the system works best when there\'s already a reputation to back it up.' },
      { q: '"We tried lead gen before and it didn\'t work."', a: 'What happened — was it quality, volume, or something else? Most people we talk to tried broad pay-per-click or bought a list. What we do is fundamentally different. I can show you exactly how in 15 minutes.' },
      { q: '"I handle my own marketing."', a: 'That\'s impressive — most owners I talk to are too swamped for that. Are you happy with where the volume is, or is there a target you\'re trying to hit?' },
      { q: '"We\'re fully booked."', a: 'That\'s the best problem to have. Are you thinking about expanding, or hiring another crew anytime soon? A lot of our clients used this to justify the investment in growth.' },
    ],
  },
  {
    id: 'c',
    label: 'Variant C',
    sublabel: 'Direct ROI',
    color: 'var(--green)',
    badge: null,
    sections: [
      {
        title: 'Open',
        content: (
          <>
            "Hi [Name], I'll get straight to the point.{' '}
            We help HVAC businesses add $15,000 to $30,000 in revenue per month{' '}
            by booking more qualified jobs without extra ad spend. Is that relevant to where you're at right now?"
          </>
        ),
      },
      {
        title: 'Bridge',
        content: (
          <>
            "Here's how it works: we run hyper-targeted outreach to homeowners in your service area{' '}
            who are actively looking for HVAC services. We handle qualification and appointment setting.{' '}
            Our clients average 8 to 12 new jobs in the first 30 days."
          </>
        ),
      },
      {
        title: 'Close',
        content: (
          <>
            "Are you currently looking to grow revenue, or are you at capacity for the next few months?{' '}
            Either answer is fine — I just want to make sure it makes sense for me to walk you through the numbers."
          </>
        ),
      },
    ],
    objections: [
      { q: '"Those numbers sound too good."', a: 'Completely fair. I\'d rather show you than tell you — that\'s the whole point of the 15-minute call. We\'ll look at your market, your average job value, and I\'ll give you a realistic projection. No pitch if the numbers don\'t stack up.' },
      { q: '"What\'s the catch?"', a: 'No long-term contracts, no setup fees we hide in the small print. We work on a monthly retainer, and if you\'re not getting results in 30 days, we give you the next month free. That\'s the deal.' },
      { q: '"I need to talk to my wife/partner first."', a: 'That makes total sense for a business decision. Would it help if I sent over a one-page breakdown you could both look at? And is there a better time to loop them into a call together?' },
      { q: '"We just signed with someone else."', a: 'No worries at all. Out of curiosity, what made you go with them? I\'m always trying to understand what matters most to business owners. No agenda — happy to just leave you my number if things don\'t work out.' },
    ],
  },
];

function CopyButton({ getText }: { getText: () => string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(getText()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button className={`btn ${copied ? 'btn-green' : 'btn-secondary'} btn-sm`} onClick={handleCopy}>
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copy
        </>
      )}
    </button>
  );
}

function ScriptSection({ title, content, accentColor }: { title: string; content: React.ReactNode; accentColor?: string }) {
  return (
    <div className="script-section">
      <div className="script-section-header">
        <div className="script-section-title" style={{ color: accentColor }}>{title}</div>
        <CopyButton getText={() => title} />
      </div>
      <div className="script-section-body">{content}</div>
    </div>
  );
}

function ObjectionSection({ objections }: { objections: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setOpen(prev => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  };

  return (
    <div className="script-section">
      <div className="script-section-header">
        <div className="script-section-title">Objection Handles</div>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{objections.length} objections</span>
      </div>
      {objections.map((obj, i) => (
        <div key={i} className="objection-item">
          <div className="objection-q" onClick={() => toggle(i)}>
            {obj.q}
            <span style={{ fontSize: 10 }}>{open.has(i) ? '▲' : '▼'}</span>
          </div>
          {open.has(i) && (
            <div className="objection-a">{obj.a}</div>
          )}
        </div>
      ))}
    </div>
  );
}

function getScriptPlainText(script: typeof SCRIPTS[0]) {
  const parts: string[] = [];
  for (const s of script.sections) {
    parts.push(`=== ${s.title.toUpperCase()} ===`);
    parts.push(typeof s.content === 'string' ? s.content : '[See script]');
    parts.push('');
  }
  parts.push('=== OBJECTION HANDLES ===');
  for (const o of script.objections) {
    parts.push(`Q: ${o.q}`);
    parts.push(`A: ${o.a}`);
    parts.push('');
  }
  return parts.join('\n');
}

export default function Scripts() {
  const [active, setActive] = useState('a');
  const script = SCRIPTS.find(s => s.id === active)!;

  return (
    <div className="page animate-in">
      <div className="page-header">
        <div>
          <div className="page-title">Call Scripts</div>
          <div className="page-sub">Three proven variants — pick your style and go</div>
        </div>
        <CopyButton getText={() => getScriptPlainText(script)} />
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 24 }}>
        {SCRIPTS.map((s) => (
          <div
            key={s.id}
            className={`tab ${active === s.id ? 'active' : ''}`}
            onClick={() => setActive(s.id)}
            style={active === s.id ? { borderColor: s.color, color: s.color } : {}}
          >
            <div style={{ fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.sublabel}</div>
          </div>
        ))}
      </div>

      {/* Active script header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{script.label}</div>
        <span style={{ color: 'var(--muted)', fontSize: 12 }}>{script.sublabel} approach</span>
        {script.badge && (
          <span className="badge badge-demo_booked">{script.badge}</span>
        )}
      </div>

      {/* Script sections */}
      {script.sections.map((section) => (
        <ScriptSection key={section.title} title={section.title} content={section.content} accentColor={script.color} />
      ))}

      {/* Objections */}
      <ObjectionSection objections={script.objections} />

      {/* Tips */}
      <div className="card" style={{ marginTop: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>⚡ Quick Tips</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            'Smile when you speak — it comes through in your voice.',
            "Don't read the script verbatim. Know it well enough to have a natural conversation.",
            'Silence is your friend. After asking a question, wait — resist the urge to fill the gap.',
            'Aim for 3 calls per hour. Quality over speed.',
            'Log every call immediately — even voicemails. The data adds up.',
          ].map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--text-2)' }}>
              <span style={{ color: 'var(--accent)', flexShrink: 0 }}>→</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
