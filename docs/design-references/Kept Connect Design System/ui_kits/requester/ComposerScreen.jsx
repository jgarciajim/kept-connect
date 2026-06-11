/* Requester app — shell (status bar, header, bottom nav), Home, and the
   post-a-job Composer. Warm, terracotta action, category wayfinding. */
const DS = window.KeptConnectDesignSystem_4a1eb7;
const { Button, Card, Avatar, Tag, VerifiedBadge, Input, KeptConnectLogo, CategoryIcon } = DS;

/* ---- shell ------------------------------------------------------------- */
function StatusBar() {
  return (
    <div style={{ height: 42, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 22px', color: 'var(--ink)', fontSize: 13, fontWeight: 500, flex: '0 0 auto' }}>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>9:41</span>
      <span style={{ display: 'flex', gap: 5, alignItems: 'center', opacity: 0.85 }}>
        <svg width="17" height="11" viewBox="0 0 17 11" fill="var(--ink)"><rect x="0" y="6" width="3" height="5" rx="1"/><rect x="4.5" y="4" width="3" height="7" rx="1"/><rect x="9" y="2" width="3" height="9" rx="1"/><rect x="13.5" y="0" width="3" height="11" rx="1"/></svg>
        <svg width="24" height="11" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="var(--ink)" opacity="0.4"/><rect x="2" y="2" width="16" height="8" rx="1.5" fill="var(--ink)"/></svg>
      </span>
    </div>
  );
}

function AppHeader({ title, onBack, right, brand }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 18px 12px', flex: '0 0 auto' }}>
      {onBack
        ? <button onClick={onBack} style={{ width: 32, height: 32, borderRadius: 999, border: 'none', background: 'var(--neutral)', cursor: 'pointer', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconBack size={20} /></button>
        : brand ? <KeptConnectLogo treatment="app-icon" size={30} /> : null}
      <span style={{ fontFamily: brand ? 'var(--font-display)' : 'var(--font-ui)', fontWeight: 500, fontSize: brand ? 17 : 16, color: 'var(--ink)' }}>{title}</span>
      <span style={{ marginLeft: 'auto' }}>{right}</span>
    </div>
  );
}

function BottomNav({ tab = 'home', onTab }) {
  const items = [['home', 'Home', IconHome], ['jobs', 'Jobs', IconJobs], ['messages', 'Messages', IconChat], ['you', 'You', IconUser]];
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px 18px 16px', borderTop: '1px solid var(--hairline)', flex: '0 0 auto', background: 'var(--canvas)' }}>
      {items.map(([id, label, I]) => {
        const on = tab === id;
        return (
          <button key={id} onClick={() => onTab && onTab(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: on ? 'var(--terracotta)' : 'var(--ink-3)' }}>
            <I size={22} sw={on ? 2.2 : 2} />
            <span style={{ fontSize: 9.5, fontWeight: 500 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---- Home -------------------------------------------------------------- */
const TRADES = [
  { cat: 'water', label: 'Plumbing' },
  { cat: 'power', label: 'Electrical' },
  { cat: 'surfaces', label: 'Painting' },
  { cat: 'grounds', label: 'Yard' },
];

function HomeScreen({ onCompose, onOpenJob, onTab }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <StatusBar />
      <AppHeader brand title="Connect" right={<Avatar name="Grace Olin" size={30} />} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 18px 18px' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 26, lineHeight: 1.15, letterSpacing: '-0.01em', margin: '12px 2px 14px', color: 'var(--ink)' }}>
          What needs doing<span style={{ color: 'var(--terracotta)' }}>?</span>
        </p>
        {/* compose bar */}
        <button onClick={onCompose} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--neutral)', border: '1px solid var(--hairline)', borderRadius: 16, padding: '12px 14px', cursor: 'pointer', textAlign: 'left' }}>
          <span style={{ color: 'var(--ink-3)', fontSize: 14, flex: 1 }}>Describe the job…</span>
          <span style={{ width: 30, height: 30, borderRadius: 999, background: 'var(--terracotta)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cream)' }}><IconArrow size={16} sw={2.2} /></span>
        </button>
        {/* category trades */}
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '18px 2px 4px' }}>
          {TRADES.map((t) => (
            <button key={t.label} onClick={onCompose} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 60 }}>
              <CategoryIcon category={t.cat} size={48} />
              <span style={{ fontSize: 10.5, color: 'var(--ink-2)' }}>{t.label}</span>
            </button>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 60 }}>
            <span style={{ width: 48, height: 48, borderRadius: 15, background: 'var(--neutral)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--ink-2)"><circle cx="8" cy="8" r="1.7"/><circle cx="16" cy="8" r="1.7"/><circle cx="8" cy="16" r="1.7"/><circle cx="16" cy="16" r="1.7"/></svg>
            </span>
            <span style={{ fontSize: 10.5, color: 'var(--ink-2)' }}>More</span>
          </div>
        </div>
        {/* in progress */}
        <div style={{ fontSize: 11.5, color: 'var(--ink-3)', margin: '20px 4px 9px' }}>In progress</div>
        <button onClick={onOpenJob} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, background: 'var(--paper)', border: '1px solid var(--hairline)', borderRadius: 16, padding: 12, cursor: 'pointer', textAlign: 'left' }}>
          <Avatar name="Marco Reyes" size={40} status="enroute" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>Marco R. <VerifiedBadge size={14} /></div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
              <span style={{ width: 6, height: 6, borderRadius: 9, background: 'var(--terracotta)' }} /> Plumbing · On the way
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 14, fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: 'var(--ink)' }}>$120</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>12 min</div>
          </div>
        </button>
      </div>
      <BottomNav tab="home" onTab={onTab} />
    </div>
  );
}

/* ---- Composer ---------------------------------------------------------- */
function ComposerScreen({ onPost, onBack }) {
  const [trade, setTrade] = React.useState('water');
  const [urgency, setUrgency] = React.useState('Same day');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <StatusBar />
      <AppHeader title="Post a job" onBack={onBack} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 20px' }}>
        <div style={{ background: 'var(--moment)', borderRadius: 'var(--r-lg)', padding: '22px 20px', marginBottom: 18 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 28, lineHeight: 1.12, letterSpacing: '-0.015em', margin: 0, color: 'var(--ink)' }}>
            What needs doing<span style={{ color: 'var(--terracotta)' }}>?</span>
          </p>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: '8px 0 0' }}>Describe it once. We'll match you with vetted providers nearby.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="What's the job?" multiline rows={3} defaultValue="Kitchen faucet is leaking at the base — water pooling under the sink." />
          {/* trade picker via category icons */}
          <div>
            <span style={{ display: 'block', fontWeight: 500, fontSize: 13, color: 'var(--ink-2)', marginBottom: 8 }}>Trade</span>
            <div style={{ display: 'flex', gap: 10 }}>
              {TRADES.map((t) => {
                const on = trade === t.cat;
                return (
                  <button key={t.cat} onClick={() => setTrade(t.cat)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, padding: '12px 4px', borderRadius: 'var(--r-chip)', cursor: 'pointer', background: on ? 'var(--terracotta-tint)' : 'var(--paper)', border: `1.5px solid ${on ? 'var(--terracotta)' : 'var(--hairline)'}` }}>
                    <CategoryIcon category={t.cat} size={36} />
                    <span style={{ fontSize: 11, fontWeight: 500, color: on ? 'var(--terracotta-deep)' : 'var(--ink-2)' }}>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 14px', background: 'var(--paper)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-chip)' }}>
            <span style={{ color: 'var(--terracotta)', display: 'flex' }}><IconPin /></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>14 Birch Lane</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Saved property · Home</div>
            </div>
            <span style={{ color: 'var(--ink-3)', display: 'flex' }}><IconChevron size={18} /></span>
          </div>
          {/* urgency */}
          <div>
            <span style={{ display: 'block', fontWeight: 500, fontSize: 13, color: 'var(--ink-2)', marginBottom: 8 }}>When?</span>
            <div style={{ display: 'flex', gap: 9 }}>
              {['Whenever', 'Same day', 'Emergency'].map((u) => {
                const on = urgency === u;
                return (
                  <button key={u} onClick={() => setUrgency(u)} style={{ flex: 1, padding: '10px 6px', borderRadius: 'var(--r-pill)', cursor: 'pointer', background: on ? 'var(--ink)' : 'var(--paper)', border: `1.5px solid ${on ? 'var(--ink)' : 'var(--hairline)'}`, color: on ? 'var(--cream)' : 'var(--ink-2)', fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 12.5 }}>{u}</button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: '14px 18px', borderTop: '1px solid var(--hairline)', background: 'var(--canvas)', flex: '0 0 auto' }}>
        <Button fullWidth size="lg" onClick={onPost}>Post</Button>
      </div>
    </div>
  );
}

Object.assign(window, { ReqStatusBar: StatusBar, ReqAppHeader: AppHeader, ReqBottomNav: BottomNav, HomeScreen, ComposerScreen, REQ_TRADES: TRADES });
