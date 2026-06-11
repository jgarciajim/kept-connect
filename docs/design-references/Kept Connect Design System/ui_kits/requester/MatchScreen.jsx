/* Requester app — Live match status (the signature moment) + Quote cards. */
const _DS2 = window.KeptConnectDesignSystem_4a1eb7;
const { Button: RBtn, Card: RCard, Avatar: RAvatar, Tag: RTag, VerifiedBadge: RVer } = _DS2;

const PROVIDERS = [
  { name: 'Summit Drywall', rating: 4.9, jobs: 128, price: '295.00', eta: 'Can start tomorrow', creds: ['Licensed', 'Insured'] },
  { name: 'A. Vega Finishes', rating: 4.8, jobs: 74, price: '340.00', eta: 'This week', creds: ['Licensed', 'Background checked'] },
  { name: 'Peak Interiors', rating: 5.0, jobs: 41, price: '410.00', eta: 'Next week', creds: ['Insured'] },
];

function MatchScreen({ onResolved, onOpen, phase }) {
  const ringStates = phase === 'quotes' ? ['quoted', 'quoted', 'quoted'] : ['responding', 'responding', 'none'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ReqStatusBar />
      <ReqAppHeader title="Live match" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 18px 20px' }}>
        <div style={{ background: 'var(--moment)', borderRadius: 'var(--r-lg)', padding: '28px 24px 30px', textAlign: 'center', marginBottom: 18 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 28, lineHeight: 1.12, letterSpacing: '-0.015em', margin: 0, color: 'var(--ink)' }}>
            {phase === 'quotes' ? <>3 quotes in</> : <>Finding your<br/>provider…</>}
          </p>
          <p style={{ fontSize: 13.5, color: 'var(--ink-2)', margin: '10px 0 22px' }}>
            {phase === 'quotes' ? "Sealed quotes — compare and award." : 'Dispatched to vetted pros near 14 Birch Lane.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 18 }}>
            {PROVIDERS.map((p, i) => (
              <div key={p.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: ringStates[i] === 'none' ? 0.4 : 1 }}>
                <RAvatar name={p.name} size={46} status={ringStates[i]} />
                <span style={{ fontSize: 11, color: 'var(--ink-2)', fontWeight: 500 }}>{p.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
        {phase === 'finding' && (
          <div style={{ textAlign: 'center', color: 'var(--ink-3)', fontSize: 13, padding: '10px 0' }}>
            Usually under 5 minutes. You can close the app — we'll notify you.
          </div>
        )}
        {phase === 'quotes' && (
          <>
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)', margin: '2px 4px 10px' }}>Sealed quotes · pick one</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PROVIDERS.map((p, i) => <QuoteCard key={p.name} p={p} best={i === 0} onAward={onResolved} onOpen={onOpen} />)}
            </div>
          </>
        )}
      </div>
      {phase === 'finding' && (
        <div style={{ padding: '14px 18px', borderTop: '1px solid var(--hairline)', flex: '0 0 auto' }}>
          <RBtn fullWidth variant="secondary" onClick={onResolved}>Skip ahead (demo)</RBtn>
        </div>
      )}
    </div>
  );
}

function QuoteCard({ p, best, onAward, onOpen }) {
  return (
    <RCard tone="paper" padding={14} lift={best}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <RAvatar name={p.name} size={42} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontWeight: 500, fontSize: 14.5, color: 'var(--ink)' }}>{p.name}</span>
            <RVer size={14} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2, color: 'var(--ink-2)', fontSize: 12.5 }}>
            <IconStar size={12} style={{ color: 'var(--terracotta)' }} />
            <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500, color: 'var(--ink)' }}>{p.rating}</span>
            <span style={{ color: 'var(--ink-3)' }}>· {p.jobs} jobs</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 12 }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 500, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>${p.price}</div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 1 }}>{p.eta}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <RBtn variant="ghost" size="sm" onClick={onOpen}>Profile</RBtn>
          <RBtn variant={best ? 'primary' : 'outline'} size="sm" onClick={onAward}>Award</RBtn>
        </div>
      </div>
    </RCard>
  );
}

Object.assign(window, { MatchScreen, QuoteCard, REQ_PROVIDERS: PROVIDERS });
