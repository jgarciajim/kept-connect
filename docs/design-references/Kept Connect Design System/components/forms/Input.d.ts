import * as React from 'react';

/**
 * The composer field. Big touch target, emerald focus ring, sentence-case
 * label. Single-line or multiline; right-align + tabular for money fields.
 */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  /** Field label (sentence case — say what it does). */
  label?: React.ReactNode;
  /** Helper text below the field. */
  hint?: React.ReactNode;
  /** Render a textarea instead of an input. */
  multiline?: boolean;
  /** Textarea rows when multiline. Default 3. */
  rows?: number;
  /** Leading node inside the field (icon or "$"). */
  prefix?: React.ReactNode;
  /** Text alignment — use 'right' for money/figures. */
  align?: 'left' | 'right';
  /** Tabular lining numerals (for numeric fields). */
  tabular?: boolean;
  disabled?: boolean;
}

export function Input(props: InputProps): JSX.Element;
