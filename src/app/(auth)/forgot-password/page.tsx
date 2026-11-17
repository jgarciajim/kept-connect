"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button, Field } from "@/components/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await createSupabaseBrowserClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm`,
    });
    setBusy(false);
    if (error) return setError(error.message);
    setSent(true);
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 18 }}>
        <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 28, color: "var(--ink)" }}>
          Reset your password<span style={{ color: "var(--terracotta)" }}>.</span>
        </h1>
        {sent ? (
          <p style={{ margin: 0, color: "var(--ink-2)" }}>
            If there&apos;s an account for {email}, we&apos;ve emailed it a link to set a new password.
          </p>
        ) : (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field id="reset-email" label="Email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button type="submit" size="lg" fullWidth disabled={busy}>{busy ? "Sending…" : "Email me a reset link"}</Button>
            {error && <p role="alert" style={{ margin: 0, fontSize: 14, color: "var(--terracotta-deep)" }}>{error}</p>}
          </form>
        )}
        <Link href="/sign-in" style={{ color: "var(--terracotta)", fontSize: 14, fontWeight: 500 }}>Back to sign in</Link>
      </div>
    </main>
  );
}
