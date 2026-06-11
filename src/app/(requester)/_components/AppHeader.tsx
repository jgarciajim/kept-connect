import Link from "next/link";
import type { ReactNode } from "react";
import { KeptConnectLogo } from "@/components/ui";
import { IconBack } from "./icons";

/**
 * AppHeader — the per-screen top bar. Either the brand mark (Home) or a back
 * link, the title (Fraunces when brand), and an optional right slot.
 */
export interface AppHeaderProps {
  title: string;
  backHref?: string;
  brand?: boolean;
  right?: ReactNode;
}

export function AppHeader({ title, backHref, brand = false, right }: AppHeaderProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px 12px" }}>
      {backHref ? (
        <Link
          href={backHref}
          aria-label="Back"
          style={{
            width: 32,
            height: 32,
            borderRadius: "var(--r-pill)",
            background: "var(--neutral)",
            color: "var(--ink)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "0 0 auto",
          }}
        >
          <IconBack size={20} />
        </Link>
      ) : brand ? (
        <KeptConnectLogo variant="mark" treatment="app-icon" size={30} />
      ) : null}

      <span
        style={{
          fontFamily: brand ? "var(--font-display)" : "var(--font-ui)",
          fontWeight: 500,
          fontSize: brand ? 18 : 16,
          color: "var(--ink)",
        }}
      >
        {title}
      </span>

      <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center" }}>{right}</span>
    </div>
  );
}
