import type { CSSProperties } from "react";

/**
 * Avatar — the circular-assignment language. Soft-tinted circle with a 2px
 * inner border in the surface color (--paper, which the Surface remap swaps to
 * chrome on dark, so the signature reads on both). Initials fallback when no
 * image. Wrap in <StatusRing> to add an activity ring.
 */
const TINT_COUNT = 7;

// Stable name -> tint-token lookup (the tint hexes live in tokens.css as --tint-N).
function tintVar(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return `var(--tint-${(h % TINT_COUNT) + 1})`;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export interface AvatarProps {
  name?: string;
  src?: string | null;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

export function Avatar({ name = "", src = null, size = 44, className = "", style }: AvatarProps) {
  return (
    <div
      className={`kc-avatar ${className}`.trim()}
      aria-label={name || undefined}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: src ? `center/cover no-repeat url(${src})` : tintVar(name),
        boxShadow: "0 0 0 2px var(--paper)", // 2px inner border — the signature
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--ink-2)",
        fontFamily: "var(--font-ui)",
        fontWeight: 500,
        fontSize: Math.round(size * 0.36),
        letterSpacing: "0.01em",
        flex: "0 0 auto",
        overflow: "hidden",
        ...style,
      }}
    >
      {!src && initials(name)}
    </div>
  );
}
