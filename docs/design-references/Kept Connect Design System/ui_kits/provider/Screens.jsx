/* Provider app — Job feed (live offer), Active job, Earnings. */
const VDS2 = window.KeptConnectDesignSystem_4a1eb7;
const { Avatar: TAvatar, CategoryIcon: TCat, KeptConnectLogo: TLogo } = VDS2;

const dim = (o) => `rgba(233,230,221,${o})`;

function SectionHead({ children }) {
  return <div style={{ fontSize: 11.5, color: 'var(--chrome-dim)', margin: '18px 4px 9px' }}>{children}</div>;
}

/* ---- Feed -------------------------------------------------------------- */
const OFFER = { cat: 'water', title: 'Faucet replacement', place: 'Breckenridge', dist: '1.2 mi away', pay: '120', note: 'est. 45 min · paid on completion', timer: '0:43' };

function FeedScreen({ onOpenJob }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, background: 'var(--chrome)' }}>
      <VStatusBar />
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 16px' }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 2px 2px' }}>
          <TLogo treatment="app-icon" size={30} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 16, color: 'var(--chrome-cream)' }}>Morning, Marco</span>
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--verified-bright)' }}>
            <span style={{ width: 7, height: 7, borderRadius: 9, background: 'var(--verified-bright)' }} /> Online
          </span>
        </div>
        {/* earn strip */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--chrome-card)', border: '1px solid var(--chrome-line)', borderRadius: 16, padding: '13px 15px', marginTop: 14 }}>
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--chrome-dim)' }}>Available to cash out</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 21, color: 'var(--chrome-cream)', fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>$340.00</div>
          </div>
          <button style={{ marginLeft: 'auto', background: 'var(--terracotta-bright)', color: 'var(--cream)', fontSize: 12.5, fontWeight: 500, borderRadius: 999, padding: '9px 15px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>Cash out</button>
        </div>
        {/* live offer */}
        <SectionHead>New offer</SectionHead>
        <OfferCard job={OFFER} onAction={() => onOpenJob()} />
        {/* scheduled */}
        <SectionHead>Scheduled today</SectionHead>
        <div onClick={onOpenJob} style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'var(--chrome-card)', border: '1px solid var(--chrome-line)', borderRadius: 14, padding: '11px 12px', cursor: 'pointer' }}>
          <TCat category="power" size={36} dark />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--chrome-cream)' }}>Outlet install ×3</div>
            <div style={{ fontSize: 11.5, color: 'var(--chrome-dim)' }}>Frisco · Power</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right', fontSize: 11.5, color: 'var(--chrome-dim)' }}>2:30 PM<br/><span style={{ color: 'var(--chrome-cream)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>$180</span></div>
        </div>
      </div>
    </div>
  );
}

/* ---- Active job -------------------------------------------------------- */
function ActiveScreen({ onBack }) {
  const [stage, setStage] = React.useState(0); // 0 start, 1 complete, 2 paid
  const label = ['Start job', 'Mark complete', 'Mark paid'][stage];
  const done = stage > 2;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--chrome)' }}>
      <VStatusBar />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 16px 12px' }}>
        <button onClick={onBack} style={{ width: 30, height: 30, borderRadius: 999, border: 'none', background: 'var(--chrome-card)', cursor: 'pointer', color: 'var(--chrome-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PIconBack size={20} /></button>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 17, color: 'var(--chrome-cream)' }}>Faucet replacement</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 120, borderRadius: 16, overflow: 'hidden', border: '1px solid var(--chrome-line)' }}>
          <svg viewBox="0 0 280 120" preserveAspectRatio="xMidYMid slice" style={{ display: 'block', width: '100%', height: '100%' }}>
            <rect width="280" height="120" fill="#211F1B"/>
            <g stroke="#2E2B27" strokeWidth="6" strokeLinecap="round"><path d="M-10 36 H290"/><path d="M-10 92 H290"/><path d="M80 -10 V130"/><path d="M205 -10 V130"/></g>
            <path d="M80 92 L80 60 L205 60 L205 36" fill="none" stroke="var(--terracotta-bright)" strokeWidth="4" strokeLinecap="round"/>
            <circle cx="80" cy="92" r="7" fill="var(--terracotta-bright)" stroke="#1A1916" strokeWidth="3"/>
            <g transform="translate(205 36)"><path d="M0 6 C0 6 8 0 8 -6 A8 8 0 1 0 -8 -6 C-8 0 0 6 0 6 z" fill="#E9E6DD"/><circle cx="0" cy="-6" r="3" fill="#1A1916"/></g>
          </svg>
        </div>
        {/* customer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'var(--chrome-card)', border: '1px solid var(--chrome-line)', borderRadius: 16, padding: 12, marginTop: 12 }}>
          <TAvatar name="Sarah K" size={38} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--chrome-cream)' }}>Sarah K.</div>
            <div style={{ fontSize: 11.5, color: 'var(--chrome-dim)' }}>142 Ski Hill Rd · gate code in notes</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[PIconPhone, PIconChat].map((I, i) => (
              <span key={i} style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--chrome-card-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--chrome-cream)' }}><I size={17} /></span>
            ))}
          </div>
        </div>
        {/* before / after capture */}
        <div style={{ display: 'flex', gap: 9, marginTop: 12 }}>
          {['Before', 'After'].map((l) => (
            <div key={l} style={{ flex: 1, height: 62, border: '1.5px dashed var(--chrome-line)', borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, color: 'var(--chrome-dim)', fontSize: 10.5 }}>
              <PIconCam size={18} /><span>{l}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 13, fontSize: 12.5, color: 'var(--chrome-dim)' }}>
          <span>Payout on completion</span>
          <b style={{ color: 'var(--chrome-cream)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>$120.00</b>
        </div>
        {/* big action */}
        <div style={{ marginTop: 'auto', paddingTop: 16 }}>
          {!done
            ? <button onClick={() => setStage((s) => s + 1)} style={{ width: '100%', background: 'var(--terracotta-bright)', color: 'var(--cream)', textAlign: 'center', borderRadius: 16, padding: 15, fontSize: 15, fontWeight: 500, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>{label}</button>
            : <div style={{ textAlign: 'center', color: 'var(--verified-bright)', fontWeight: 500, fontSize: 15, padding: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><PIconCheck size={20} /> Paid — nice work.</div>}
        </div>
      </div>
    </div>
  );
}

/* ---- Earnings ---------------------------------------------------------- */
function EarningsScreen() {
  const rows = [
    { job: 'Clear shower drain', who: 'Joan Ek', when: 'Today', amt: '120.00', status: 'Pending' },
    { job: 'Faucet replacement', who: 'Priya Nair', when: 'Yesterday', amt: '180.00', status: 'Paid' },
    { job: 'Leak repair', who: 'Theo Vance', when: 'Mon', amt: '240.00', status: 'Paid' },
    { job: 'Water heater flush', who: 'Sam Cole', when: 'Sun', amt: '160.00', status: 'Paid' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, background: 'var(--chrome)' }}>
      <VStatusBar />
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 16px' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 26, margin: '6px 2px 16px', color: 'var(--chrome-cream)', letterSpacing: '-0.015em' }}>Earnings<span style={{ color: 'var(--terracotta-bright)' }}>.</span></p>
        <div style={{ background: 'var(--chrome-card)', border: '1px solid var(--chrome-line)', borderRadius: 16, padding: 18 }}>
          <div style={{ fontSize: 11.5, color: 'var(--chrome-dim)' }}>Available to cash out</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 32, color: 'var(--chrome-cream)', fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>$340.00</div>
          <button style={{ marginTop: 13, width: '100%', height: 44, borderRadius: 999, border: 'none', background: 'var(--terracotta-bright)', color: 'var(--cream)', fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}>Cash out instantly</button>
        </div>
        <div style={{ display: 'flex', gap: 11, margin: '12px 0 20px' }}>
          {[['This week', '$3,180'], ['Jobs', '14'], ['Rating', '4.9']].map(([l, v]) => (
            <div key={l} style={{ flex: 1, background: 'var(--chrome-card)', border: '1px solid var(--chrome-line)', borderRadius: 12, padding: '12px 10px' }}>
              <div style={{ fontSize: 17, fontWeight: 500, color: 'var(--chrome-cream)', fontVariantNumeric: 'tabular-nums' }}>{v}</div>
              <div style={{ fontSize: 11, color: 'var(--chrome-dim)', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
        <SectionHead>Recent payouts</SectionHead>
        <div style={{ background: 'var(--chrome-card)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--chrome-line)' }}>
          {rows.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderTop: i ? '1px solid var(--chrome-line)' : 'none' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--chrome-cream)' }}>{r.job}</div>
                <div style={{ fontSize: 11.5, color: 'var(--chrome-dim)', marginTop: 1 }}>{r.who} · {r.when}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--chrome-cream)', fontVariantNumeric: 'tabular-nums' }}>${r.amt}</div>
                <div style={{ fontSize: 10.5, color: r.status === 'Paid' ? 'var(--verified-bright)' : 'var(--terracotta-bright)', marginTop: 1 }}>{r.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FeedScreen, ActiveScreen, EarningsScreen });
