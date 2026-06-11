/* Provider app — icon set (the brand's own glyphs, from the provider-app
   exploration). Monochrome line, 2px, round caps. Inherit currentColor. */
const PIc = ({ d, size = 22, sw = 2, fill = 'none', children, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...p}>
    {d ? <path d={d} /> : children}
  </svg>
);
const PIconJobs   = (p) => <PIc {...p}><path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/></PIc>;
const PIconActive = (p) => <PIc {...p}><rect x="6" y="4" width="12" height="17" rx="2.5"/><path d="M9 4.5h6v2.5H9z"/><path d="M9 11h6M9 15h4"/></PIc>;
const PIconWallet = (p) => <PIc {...p}><rect x="3.5" y="6" width="17" height="12" rx="2.5"/><path d="M3.5 9.5h17M16 13h1.5"/></PIc>;
const PIconUser   = (p) => <PIc {...p}><circle cx="12" cy="8.5" r="3.5"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/></PIc>;
const PIconBack   = (p) => <PIc {...p}><path d="M14 6l-6 6 6 6"/></PIc>;
const PIconPhone  = (p) => <PIc {...p}><path d="M6 4h3l1.6 4-2 1.2c.9 2.3 2.5 3.9 4.8 4.8l1.2-2 4 1.6V17c0 .6-.4 1-1 1C11.3 18 6 12.7 6 6c0-.6.4-1 1-1z"/></PIc>;
const PIconChat   = (p) => <PIc {...p}><path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4V6a1 1 0 0 1 1-1z"/></PIc>;
const PIconCam    = (p) => <PIc {...p}><rect x="3.5" y="7" width="17" height="12" rx="2.5"/><circle cx="12" cy="13" r="3.2"/><path d="M9 7l1.2-2h3.6L15 7"/></PIc>;
const PIconCheck  = (p) => <PIc {...p}><path d="M5 12.5 10 17 19 6.5"/></PIc>;
Object.assign(window, { PIc, PIconJobs, PIconActive, PIconWallet, PIconUser, PIconBack, PIconPhone, PIconChat, PIconCam, PIconCheck });
