import * as React from 'react';

/**
 * The Kept Connect button. The emerald `primary` is the one obvious action
 * per surface — never two primaries on one screen.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. `primary` = terracotta action. `outline` = terracotta border. `chrome-*` for dark provider surfaces. */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'chrome-primary' | 'chrome-ghost';
  /** Control height. Default 'md' (44px touch target). */
  size?: 'sm' | 'md' | 'lg';
  /** Stretch to fill the container width. */
  fullWidth?: boolean;
  disabled?: boolean;
  /** Leading icon node (SVG). */
  icon?: React.ReactNode;
  /** Trailing icon node (SVG). */
  iconRight?: React.ReactNode;
  children?: React.ReactNode;
}

export function Button(props: ButtonProps): JSX.Element;
