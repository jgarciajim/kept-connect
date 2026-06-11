/* Requester app — Masked thread (§3.4, job-scoped comms, no raw contact)
   and Ratings (§3.5, one-tap stars, a warm confirmation moment). */
const _DS4 = window.KeptConnectDesignSystem_4a1eb7;
const { Button: MBtn, Avatar: MAvatar, VerifiedBadge: MVer, Input: MInput } = _DS4;

/* ---- Masked thread ----------------------------------------------------- */
function ThreadScreen({ onBack }) {
  const msgs = [
    { from: 'them', text: "Hi! On my way — about 12 minutes out. I'll text when I'm parked.", time: '1:48 PM' },
    { from: 'me', text: 'Great, thanks. The leak is under the kitchen sink, cabinet on the left.', time: '1:49 PM' },
    { from: 'them', photo: true, text: 'Found it — the supply line fitting is cracked. Easy fix, I have the part.', time: '2:06 PM' },
    { from: 'me', text: 'Amazing. Go ahead.', time: '2:07 PM' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ReqStatusBar />
      <ReqAppHeader
        title="Marco R."
        onBack={onBack}
        right={<span style={{ color: 'var(--ink)', display: 'flex' }}><IconPhone /></span>}
      />
      {/* job-context chip — comms are scoped to this job; no raw phone/email */}
      <div style={{ margin: '0 18px 10px', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--neutral)', borderRadius: 'var(--r-chip)', padding: '9px 12px', flex: '0 0 auto' }}>
        <span style={{ width: 6, height: 6, borderRadius: 9, background: 'var(--terracotta)', flex: '0 0 auto' }} />
        <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>Leak under kitchen sink · 14 Birch Lane</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink-3)' }}>Contact stays private</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 18px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {msgs.map((m, i) => {
          const me = m.from === 'me';
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: me ? 'flex-end' : 'flex-start', gap: 4 }}>
              {m.photo && (
                <div style={{ width: 150, height: 104, borderRadius: 14, background: 'var(--neutral)', border: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-3)' }}>
                  <IconCam size={26} />
                </div>
              )}
              <div style={{
                maxWidth: '78%', padding: '10px 13px', borderRadius: 16, fontSize: 14, lineHeight: 1.45,
                background: me ? 'var(--terracotta)' : 'var(--paper)',
                color: me ? 'var(--cream)' : 'var(--ink)',
                border: me ? 'none' : '1px solid var(--hairline)',
                borderBottomRightRadius: me ? 5 : 16, borderBottomLeftRadius: me ? 16 : 5,
              }}>{m.text}</div>
              <span style={{ fontSize: 10.5, color: 'var(--ink-3)', padding: '0 4px' }}>{m.time}</span>
            </div>
          );
        })}
      </div>
      {/* composer */}
      <div style={{ padding: '10px 18px 16px', borderTop: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', gap: 10, flex: '0 0 auto', background: 'var(--canvas)' }}>
        <span style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--neutral)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)', flex: '0 0 auto' }}><IconCam size={20} /></span>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--paper)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-pill)', padding: '0 6px 0 14px', height: 44 }}>
          <span style={{ flex: 1, fontSize: 14, color: 'var(--ink-3)' }}>Message…</span>
          <span style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--terracotta)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cream)' }}><IconArrow size={16} sw={2.2} /></span>
        </div>
      </div>
    </div>
  );
}

/* ---- Ratings ----------------------------------------------------------- */
function RatingScreen({ onDone }) {
  const [stars, setStars] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false);

  if (submitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--moment)' }}>
        <ReqStatusBar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
          <div style={{ marginBottom: 20 }}>
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill="var(--terracotta)"/><path d="M7 12.4 L10.6 16 L17 8.6" stroke="var(--cream)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 34, margin: 0, letterSpacing: '-0.015em', color: 'var(--ink)' }}>Thanks<span style={{ color: 'var(--terracotta)' }}>.</span></p>
          <p style={{ fontSize: 15, color: 'var(--ink-2)', margin: '12px 0 0', lineHeight: 1.5, maxWidth: 260 }}>Your rating helps keep the network trustworthy for everyone.</p>
        </div>
        <div style={{ padding: '14px 18px 24px', flex: '0 0 auto' }}>
          <MBtn fullWidth size="lg" onClick={onDone}>Back to home</MBtn>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--moment)' }}>
      <ReqStatusBar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px', textAlign: 'center' }}>
        <MAvatar name="Marco Reyes" size={72} status="awarded" />
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 28, margin: '18px 0 0', letterSpacing: '-0.015em', color: 'var(--ink)' }}>How was Marco?</p>
        <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: '8px 0 0' }}>Leak under kitchen sink · done in 38 min</p>
        {/* one-tap stars */}
        <div style={{ display: 'flex', gap: 8, margin: '24px 0 20px' }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setStars(n)} aria-label={`${n} stars`} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: n <= stars ? 'var(--terracotta)' : 'var(--ink-3)', opacity: n <= stars ? 1 : 0.4 }}>
              <IconStar size={36} />
            </button>
          ))}
        </div>
        <div style={{ width: '100%', maxWidth: 320 }}>
          <MInput multiline rows={2} placeholder="Add a note (optional)" />
        </div>
      </div>
      <div style={{ padding: '14px 18px 24px', flex: '0 0 auto' }}>
        <MBtn fullWidth size="lg" disabled={stars === 0} onClick={() => setSubmitted(true)}>Submit rating</MBtn>
      </div>
    </div>
  );
}

Object.assign(window, { ThreadScreen, RatingScreen });
