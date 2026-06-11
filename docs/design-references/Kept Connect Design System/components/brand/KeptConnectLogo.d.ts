import * as React from 'react';

export type LogoTreatment =
  | 'app-icon'
  | 'on-light'
  | 'on-chrome'
  | 'mono'
  | 'reversed'
  | 'blue';

/**
 * The Kept Connect brand mark and lockup — the "K-link" dispatch fan-out.
 */
export interface KeptConnectLogoProps {
  /** Color treatment. Default 'on-light'. 'app-icon' is the emerald squircle. */
  treatment?: LogoTreatment;
  /** 'mark' = squircle only; 'lockup' = mark + "Kept Connect." wordmark. */
  variant?: 'mark' | 'lockup';
  /** Mark size in px (square). Default 48. Legible to 24px. */
  size?: number;
  /** Lockup orientation. */
  orientation?: 'horizontal' | 'stacked';
  className?: string;
  style?: React.CSSProperties;
}

export function KeptConnectLogo(props: KeptConnectLogoProps): JSX.Element;
