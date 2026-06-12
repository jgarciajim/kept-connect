import type { SVGProps } from "react";

/**
 * Provider app icon set — the brand's own glyphs (from the provider-app
 * exploration), monochrome line, 2px round-cap/join, inheriting currentColor.
 */
type IconProps = { size?: number; sw?: number } & Omit<SVGProps<SVGSVGElement>, "width" | "height">;

function PIc({ size = 22, sw = 2, fill = "none", children, ...p }: IconProps & { children: React.ReactNode }) {
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

export const PIconJobs = (p: IconProps) => (
  <PIc {...p}><path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z" /></PIc>
);
export const PIconActive = (p: IconProps) => (
  <PIc {...p}><rect x="6" y="4" width="12" height="17" rx="2.5" /><path d="M9 4.5h6v2.5H9z" /><path d="M9 11h6M9 15h4" /></PIc>
);
export const PIconWallet = (p: IconProps) => (
  <PIc {...p}><rect x="3.5" y="6" width="17" height="12" rx="2.5" /><path d="M3.5 9.5h17M16 13h1.5" /></PIc>
);
export const PIconUser = (p: IconProps) => (
  <PIc {...p}><circle cx="12" cy="8.5" r="3.5" /><path d="M5.5 20a6.5 6.5 0 0 1 13 0" /></PIc>
);
export const PIconBack = (p: IconProps) => (
  <PIc {...p}><path d="M14 6l-6 6 6 6" /></PIc>
);
export const PIconPhone = (p: IconProps) => (
  <PIc {...p}><path d="M6 4h3l1.6 4-2 1.2c.9 2.3 2.5 3.9 4.8 4.8l1.2-2 4 1.6V17c0 .6-.4 1-1 1C11.3 18 6 12.7 6 6c0-.6.4-1 1-1z" /></PIc>
);
export const PIconChat = (p: IconProps) => (
  <PIc {...p}><path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4V6a1 1 0 0 1 1-1z" /></PIc>
);
export const PIconCam = (p: IconProps) => (
  <PIc {...p}><rect x="3.5" y="7" width="17" height="12" rx="2.5" /><circle cx="12" cy="13" r="3.2" /><path d="M9 7l1.2-2h3.6L15 7" /></PIc>
);
export const PIconCheck = (p: IconProps) => (
  <PIc {...p}><path d="M5 12.5 10 17 19 6.5" /></PIc>
);
export const PIconStar = (p: IconProps) => (
  <PIc {...p} fill="currentColor" stroke="none"><path d="M12 4l2.3 5.2 5.7.6-4.2 3.8 1.2 5.6-5-3-5 3 1.2-5.6L3.8 9.8l5.7-.6z" /></PIc>
);
