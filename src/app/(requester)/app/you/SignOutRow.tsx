"use client";

import { SignOutButton } from "@clerk/nextjs";

/** Sign out via Clerk → back to the marketing home. */
export function SignOutRow() {
  return (
    <SignOutButton redirectUrl="/">
      <button
        type="button"
        style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", color: "var(--terracotta)", fontSize: 14, fontWeight: 500, fontFamily: "var(--font-ui)", padding: "12px 14px" }}
      >
        Sign out
      </button>
    </SignOutButton>
  );
}
