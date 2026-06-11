import * as React from 'react';

/**
 * The verified check — a small emerald check beside a provider name.
 * Connect's trust signature: reassurance, not a loud badge.
 */
export interface VerifiedBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Check diameter in px. Default 16. */
  size?: number;
  /** Show "Verified" label text beside the check. */
  label?: boolean;
}

export function VerifiedBadge(props: VerifiedBadgeProps): JSX.Element;
