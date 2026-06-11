import * as React from 'react';

export type RingStatus =
  | 'none'
  | 'responding'
  | 'quoted'
  | 'awarded'
  | 'enroute'
  | 'onsite'
  | 'done';

/**
 * Circular assignment avatar — soft tint, 2px white inner border, activity-ring
 * status. The marketplace ring states power the live-match moment.
 */
export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Person name — drives initials + stable soft tint when no image. */
  name?: string;
  /** Image URL. Falls back to tinted initials. */
  src?: string | null;
  /** Diameter in px (excludes the ring). Default 44. */
  size?: number;
  /** Activity-ring state. `responding` pulses (respects reduced-motion). */
  status?: RingStatus;
}

export function Avatar(props: AvatarProps): JSX.Element;
