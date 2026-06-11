import type { SVGProps } from "react";

/**
 * Requester app icon set — the brand's own glyphs (from the design references),
 * monochrome line, 2px round-cap/join, inheriting currentColor. Trade/category
 * glyphs live in the shared CategoryIcon; these are the UI affordances.
 */
type IconProps = { size?: number; sw?: number } & Omit<SVGProps<SVGSVGElement>, "width" | "height">;

function Ic({ size = 22, sw = 2, fill = "none", children, ...p }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...p}
    >
      {children}
    </svg>
  );
}

export const IconHome = (p: IconProps) => (
  <Ic {...p}><path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z" /></Ic>
);
export const IconJobs = (p: IconProps) => (
  <Ic {...p}><rect x="6" y="4" width="12" height="17" rx="2.5" /><path d="M9 4.5h6v2.5H9z" /><path d="M9 11h6M9 15h4" /></Ic>
);
export const IconChat = (p: IconProps) => (
  <Ic {...p}><path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4V6a1 1 0 0 1 1-1z" /></Ic>
);
export const IconUser = (p: IconProps) => (
  <Ic {...p}><circle cx="12" cy="8.5" r="3.5" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></Ic>
);
export const IconArrow = (p: IconProps) => (
  <Ic {...p}><path d="M5 12h13M13 6l6 6-6 6" /></Ic>
);
export const IconBack = (p: IconProps) => (
  <Ic {...p}><path d="M14 6l-6 6 6 6" /></Ic>
);
export const IconChevron = (p: IconProps) => (
  <Ic {...p}><path d="M9 6l6 6-6 6" /></Ic>
);
export const IconPhone = (p: IconProps) => (
  <Ic {...p}><path d="M6 4h3l1.6 4-2 1.2c.9 2.3 2.5 3.9 4.8 4.8l1.2-2 4 1.6V17c0 .6-.4 1-1 1C11.3 18 6 12.7 6 6c0-.6.4-1 1-1z" /></Ic>
);
export const IconStar = (p: IconProps) => (
  <Ic {...p} fill="currentColor" stroke="none"><path d="M12 4l2.3 5.2 5.7.6-4.2 3.8 1.2 5.6-5-3-5 3 1.2-5.6L3.8 9.8l5.7-.6z" /></Ic>
);
export const IconCheck = (p: IconProps) => (
  <Ic {...p}><path d="M5 12.5 10 17 19 6.5" /></Ic>
);
export const IconCam = (p: IconProps) => (
  <Ic {...p}><rect x="3.5" y="7" width="17" height="12" rx="2.5" /><circle cx="12" cy="13" r="3.2" /><path d="M9 7l1.2-2h3.6L15 7" /></Ic>
);
export const IconPin = (p: IconProps) => (
  <Ic {...p}><path d="M12 21s-6.5-5.6-6.5-10.2A6.5 6.5 0 0 1 12 4.3a6.5 6.5 0 0 1 6.5 6.5C18.5 15.4 12 21 12 21z" /><circle cx="12" cy="10.6" r="2.3" /></Ic>
);
export const IconClock = (p: IconProps) => (
  <Ic {...p}><circle cx="12" cy="12" r="8.2" /><path d="M12 7.6v4.6l3 1.8" /></Ic>
);
export const IconGrid = (p: IconProps) => (
  <Ic {...p} fill="currentColor" stroke="none"><circle cx="8" cy="8" r="1.7" /><circle cx="16" cy="8" r="1.7" /><circle cx="8" cy="16" r="1.7" /><circle cx="16" cy="16" r="1.7" /></Ic>
);
