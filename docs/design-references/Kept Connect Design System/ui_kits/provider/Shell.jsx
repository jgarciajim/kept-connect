/* Provider app — the cool sibling. Dark chrome, dense, fast pay.
   Terracotta (brightened) is the only accent; verified stays emerald. */
const VDS = window.KeptConnectDesignSystem_4a1eb7;
const { Avatar: VAvatar, CategoryIcon: VCat } = VDS;

function VStatusBar() {
  return (
    <div style={{ height: 42, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 22px', color: 'var(--chrome-dim)', fontSize: 13, fontWeight: 500, flex: '0 0 auto' }}>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>9:41</span>
      <span style={{ display: 'flex', gap: 5, opacity: 0.9 }}>
        <svg width="17" height="11" viewBox="0 0 17 11" fill="var(--chrome-dim)"><rect x="0" y="6" width="3" height="5" rx="1"/><rect x="4.5" y="4" width="3" height="7" rx="1"/><rect x="9" y="2" width="3" height="9" rx="1"/><rect x="13.5" y="0" width="3" height="11" rx="1"/></svg>
        <svg width="24" height="11" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="var(--chrome-dim)" opacity="0.5"/><rect x="2" y="2" width="16" height="8" rx="1.5" fill="var(--chrome-dim)"/></svg>
      </span>
    </div>
  );
}

function VBottomNav({ tab, setTab }) {
  const items = [['jobs', 'Jobs', PIconJobs], ['active', 'Active', PIconActive], ['earnings', 'Earnings', PIconWallet], ['you', 'You', PIconUser]];
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px 18px 16px', borderTop: '1px solid var(--chrome-line)', flex: '0 0 auto' }}>
      {items.map(([id, label, I]) => {
        const on = tab === id;
        return (
          <button key={id} onClick={() => setTab(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: on ? 'var(--terracotta-bright)' : 'var(--chrome-dim)' }}>
            <I size={22} sw={on ? 2.2 : 2} />
            <span style={{ fontSize: 9.5, fontWeight: 500 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* the round-robin offer card — respond timer, set rate, accept/decline */
function OfferCard({ job, onAction }) {
  return (
    <div style={{ position: 'relative', background: 'var(--chrome-card-2)', border: '1px solid var(--terracotta-deep)', borderRadius: 18, padding: 14 }}>
      <span style={{ position: 'absolute', top: 12, right: 14, fontSize: 11, color: 'var(--terracotta-bright)', fontVariantNumeric: 'tabular-nums' }}>{job.timer}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <VCat category={job.cat} size={42} dark />
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--chrome-cream)' }}>{job.title}</div>
          <div style={{ fontSize: 12, color: 'var(--chrome-dim)', marginTop: 1 }}>{job.place} · {job.dist}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '12px 0' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 24, color: 'var(--chrome-cream)', fontVariantNumeric: 'tabular-nums' }}>${job.pay}</span>
        <span style={{ fontSize: 11.5, color: 'var(--chrome-dim)' }}>{job.note}</span>
      </div>
      <div style={{ display: 'flex', gap: 9 }}>
        <button onClick={() => onAction('decline', job)} style={{ flex: 1, borderRadius: 999, padding: 11, fontSize: 13.5, fontWeight: 500, background: 'transparent', color: 'var(--chrome-dim)', border: '1px solid var(--chrome-line)', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>Decline</button>
        <button onClick={() => onAction('accept', job)} style={{ flex: 1, borderRadius: 999, padding: 11, fontSize: 13.5, fontWeight: 500, background: 'var(--terracotta-bright)', color: 'var(--cream)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>Accept</button>
      </div>
    </div>
  );
}

Object.assign(window, { VStatusBar, VBottomNav, OfferCard });
