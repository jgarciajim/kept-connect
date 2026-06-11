/* Requester app — Provider profile (trust surface) + Track (the live job). */
const _DS3 = window.KeptConnectDesignSystem_4a1eb7;
const { Button: PBtn, Card: PCard, Avatar: PAvatar, Tag: PTag, VerifiedBadge: PVer } = _DS3;

function Stat({ value, label }) {
  return (
    <div style={{ flex: 1, textAlign: 'center', padding: '4px 0' }}>
      <div style={{ fontSize: 19, fontWeight: 500, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{label}</div>
    </div>
  );
}
function SectionLabel({ children }) {
  return <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500, marginBottom: 9 }}>{children}</div>;
}

function ProfileScreen({ onBack, onAward }) {
  const reviews = [
    { name: 'Priya N.', when: '2 weeks ago', text: 'Fixed a stubborn leak fast and left the cabinet cleaner than he found it. Walked me through what went wrong.' },
    { name: 'Theo V.', when: 'last month', text: 'On time, clear quote, no upsell. Exactly what you want when a stranger is in your home.' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ReqStatusBar />
      <ReqAppHeader title="Provider" onBack={onBack} right={<span style={{ color: 'var(--ink-3)', display: 'flex' }}><IconChat /></span>} />
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 20 }}>
        <div style={{ background: 'var(--moment)', padding: '8px 22px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <PAvatar name="Summit Drywall" size={66} status="quoted" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 22, color: 'var(--ink)', letterSpacing: '-0.01em' }}>Summit Drywall</span>
              <PVer size={18} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4, fontSize: 14, color: 'var(--ink-2)' }}>
              <IconStar size={14} style={{ color: 'var(--terracotta)' }} />
              <span style={{ fontWeight: 500, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>4.9</span>
              <span style={{ color: 'var(--ink-3)' }}>· 128 jobs</span>
            </div>
          </div>
        </div>
        <div style={{ padding: '18px' }}>
          <PCard tone="paper" padding={4} style={{ display: 'flex', marginBottom: 16 }}>
            <Stat value="128" label="Jobs done" />
            <div style={{ width: 1, background: 'var(--hairline)', margin: '10px 0' }} />
            <Stat value="4.9" label="Rating" />
            <div style={{ width: 1, background: 'var(--hairline)', margin: '10px 0' }} />
            <Stat value="5 yr" label="On Kept" />
          </PCard>
          <div style={{ marginBottom: 18 }}>
            <SectionLabel>Verified credentials</SectionLabel>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              <PTag icon={<IconCheck size={12} />}>Licensed</PTag>
              <PTag icon={<IconCheck size={12} />}>Insured</PTag>
              <PTag icon={<IconCheck size={12} />}>Background checked</PTag>
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <SectionLabel>Trades</SectionLabel>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              <PTag variant="trade">Drywall</PTag>
              <PTag variant="trade">Plaster</PTag>
              <PTag variant="trade">Texture & finish</PTag>
            </div>
          </div>
          <div>
            <SectionLabel>Reviews</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {reviews.map((r) => (
                <PCard key={r.name} tone="paper" padding={14}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                    <PAvatar name={r.name} size={28} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{r.name}</span>
                    <span style={{ marginLeft: 'auto', display: 'flex', gap: 1 }}>
                      {[0,1,2,3,4].map(i => <IconStar key={i} size={12} style={{ color: 'var(--terracotta)' }} />)}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>{r.text}</p>
                  <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--ink-3)' }}>{r.when}</p>
                </PCard>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: '14px 18px', borderTop: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', gap: 14, flex: '0 0 auto' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Sealed quote</div>
          <div style={{ fontSize: 20, fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: 'var(--ink)' }}>$295.00</div>
        </div>
        <PBtn size="lg" style={{ flex: 1 }} onClick={onAward}>Award</PBtn>
      </div>
    </div>
  );
}

/* ---- Track (replaces a static confirmation — the live job) ------------- */
function TrackScreen({ onBack, onTab, onMessage, onRate }) {
  const steps = [['Requested', true], ['Matched with Marco', true], ['On the way', true], ['Job complete', false]];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ReqStatusBar />
      <ReqAppHeader title="Your plumber" onBack={onBack} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 18px' }}>
        <div style={{ height: 160, borderRadius: 18, overflow: 'hidden', border: '1px solid var(--hairline)', margin: '0 0 6px' }}>
          <svg viewBox="0 0 280 160" preserveAspectRatio="xMidYMid slice" style={{ display: 'block', width: '100%', height: '100%' }}>
            <rect width="280" height="160" fill="#F1EFEA"/>
            <g stroke="#E4E1D9" strokeWidth="6" strokeLinecap="round"><path d="M-10 44 H290"/><path d="M-10 112 H290"/><path d="M70 -10 V170"/><path d="M200 -10 V170"/></g>
            <path d="M70 112 L70 64 L200 64 L200 44" fill="none" stroke="var(--terracotta)" strokeWidth="4" strokeLinecap="round"/>
            <circle cx="70" cy="112" r="7" fill="var(--terracotta)" stroke="#fff" strokeWidth="3"/>
            <g transform="translate(200 44)"><path d="M0 6 C0 6 8 0 8 -6 A8 8 0 1 0 -8 -6 C-8 0 0 6 0 6 z" fill="var(--ink)"/><circle cx="0" cy="-6" r="3" fill="#fff"/></g>
          </svg>
        </div>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 24, margin: '10px 2px 2px', letterSpacing: '-0.01em', color: 'var(--ink)' }}>On the way<span style={{ color: 'var(--terracotta)' }}>.</span></p>
        <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: '0 2px 14px' }}>Arriving in about 12 minutes</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, border: '1px solid var(--hairline)', borderRadius: 16, padding: 12 }}>
          <PAvatar name="Marco Reyes" size={42} status="enroute" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>Marco R. <PVer size={14} /></div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 1 }}>Plumbing · Licensed · Insured</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onMessage} aria-label="Call" style={{ width: 38, height: 38, borderRadius: 999, background: 'var(--neutral)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)', border: 'none', cursor: 'pointer' }}><IconPhone size={18} /></button>
            <button onClick={onMessage} aria-label="Message" style={{ width: 38, height: 38, borderRadius: 999, background: 'var(--neutral)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)', border: 'none', cursor: 'pointer' }}><IconChat size={18} /></button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', margin: '16px 4px 0' }}>
          {steps.map(([label, done]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, padding: '5px 0', color: done ? 'var(--ink)' : 'var(--ink-3)' }}>
              <span style={{ width: 11, height: 11, borderRadius: 999, flex: '0 0 auto', background: done ? 'var(--terracotta)' : 'transparent', border: `2px solid ${done ? 'var(--terracotta)' : 'var(--ink-3)'}` }} />
              {label}
            </div>
          ))}
        </div>
        <PBtn variant="outline" fullWidth size="md" style={{ marginTop: 18 }} onClick={onRate}>Job done? Rate Marco</PBtn>
      </div>
      <ReqBottomNav tab="jobs" onTab={onTab} />
    </div>
  );
}

Object.assign(window, { ProfileScreen, TrackScreen });
