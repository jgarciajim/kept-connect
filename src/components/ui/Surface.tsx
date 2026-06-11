import type { CSSProperties, ReactNode } from "react";

/**
 * Surface — the light/dark mechanism for the whole library.
 *
 * tone="dark" applies the `.kc-surface-dark` class, which remaps the semantic
 * tokens (--paper→--chrome-card, --terracotta→-bright, --ink→--chrome-cream, …)
 * in CSS. Every primitive nested inside renders correctly on the provider app's
 * chrome with NO per-component dark code — that's how the library is "built once"
 * and consumed by the warm (requester/marketing) and cool (provider) surfaces alike.
 */
export interface SurfaceProps {
  tone?: "light" | "dark";
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function Surface({ tone = "light", className = "", style, children }: SurfaceProps) {
  const cls = tone === "dark" ? "kc-surface-dark" : "kc-surface";
  return (
    <div className={`${cls} ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}
