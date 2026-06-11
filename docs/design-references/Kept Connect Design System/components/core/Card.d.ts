import * as React from 'react';

/**
 * The surface card. `paper` for data (clean, near-mono), `moment` for warm
 * human beats (never behind numbers), `chrome` for the dark provider app.
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Surface temperature. `moment` = warm cream, human moments only. */
  tone?: 'paper' | 'moment' | 'canvas' | 'chrome';
  /** Left-edge ribbon flag for exceptions / urgency. */
  ribbon?: null | 'sameday' | 'urgent' | 'emerald';
  /** Inner padding in px. Default 20. */
  padding?: number;
  /** Corner radius (CSS value). Default var(--r-card). */
  radius?: string;
  /** Raise with a soft card shadow. */
  lift?: boolean;
  children?: React.ReactNode;
}

export function Card(props: CardProps): JSX.Element;
