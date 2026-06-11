import * as React from 'react';

/**
 * Quiet descriptive pill — credentials, trades, status. Trust facts
 * rendered calm, never as loud badges. Inherits the ops tag treatment.
 */
export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** `default` quiet pill, `trade` outlined, `status` tinted by state. */
  variant?: 'default' | 'trade' | 'status';
  /** Tint for variant="status". */
  status?: null | 'live' | 'verified' | 'neutral';
  /** Leading icon node (e.g. a small check). */
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function Tag(props: TagProps): JSX.Element;
