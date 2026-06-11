/* Requester app — icon set.
   These are the brand's OWN glyphs, lifted from the Kept Connect design
   explorations (terracotta × Uber + category systems). Monochrome line,
   2px stroke, round caps/joins — they inherit currentColor. Trade/category
   glyphs live in the CategoryIcon component; these are the UI affordances. */
const Ic = ({ d, size = 22, sw = 2, fill = 'none', children, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...p}>
    {d ? <path d={d} /> : children}
  </svg>
);

const IconHome    = (p) => <Ic {...p}><path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/></Ic>;
const IconJobs    = (p) => <Ic {...p}><rect x="6" y="4" width="12" height="17" rx="2.5"/><path d="M9 4.5h6v2.5H9z"/><path d="M9 11h6M9 15h4"/></Ic>;
const IconChat    = (p) => <Ic {...p}><path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4V6a1 1 0 0 1 1-1z"/></Ic>;
const IconUser    = (p) => <Ic {...p}><circle cx="12" cy="8.5" r="3.5"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/></Ic>;
const IconArrow   = (p) => <Ic {...p}><path d="M5 12h13M13 6l6 6-6 6"/></Ic>;
const IconBack    = (p) => <Ic {...p}><path d="M14 6l-6 6 6 6"/></Ic>;
const IconChevron = (p) => <Ic {...p}><path d="M9 6l6 6-6 6"/></Ic>;
const IconPhone   = (p) => <Ic {...p}><path d="M6 4h3l1.6 4-2 1.2c.9 2.3 2.5 3.9 4.8 4.8l1.2-2 4 1.6V17c0 .6-.4 1-1 1C11.3 18 6 12.7 6 6c0-.6.4-1 1-1z"/></Ic>;
const IconStar    = (p) => <Ic {...p} fill="currentColor" stroke="none"><path d="M12 4l2.3 5.2 5.7.6-4.2 3.8 1.2 5.6-5-3-5 3 1.2-5.6L3.8 9.8l5.7-.6z"/></Ic>;
const IconCheck   = (p) => <Ic {...p}><path d="M5 12.5 10 17 19 6.5"/></Ic>;
const IconCam     = (p) => <Ic {...p}><rect x="3.5" y="7" width="17" height="12" rx="2.5"/><circle cx="12" cy="13" r="3.2"/><path d="M9 7l1.2-2h3.6L15 7"/></Ic>;
const IconPin     = (p) => <Ic {...p}><path d="M12 21s-6.5-5.6-6.5-10.2A6.5 6.5 0 0 1 12 4.3a6.5 6.5 0 0 1 6.5 6.5C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="10.6" r="2.3"/></Ic>;
const IconClock   = (p) => <Ic {...p}><circle cx="12" cy="12" r="8.2"/><path d="M12 7.6v4.6l3 1.8"/></Ic>;

Object.assign(window, {
  IconHome, IconJobs, IconChat, IconUser, IconArrow, IconBack, IconChevron,
  IconPhone, IconStar, IconCheck, IconCam, IconPin, IconClock,
});
