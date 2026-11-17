"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Field } from "@/components/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/** Reached from the password-reset email (via /auth/confirm, which signs the user in). */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await createSupabaseBrowserClient().auth.updateUser({ password });
    setBusy(false);
    if (error) {
      return setError(
        error.message.toLowerCase().includes("session")
          ? "This reset link has expired. Request a new one from the sign-in page."
          : error.message,
      );
    }
    router.replace("/app");
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <form onSubmit={submit} style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 14 }}>
        <h1 style={{ margin: "0 0 4px", fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 28, color: "var(--ink)" }}>
          Choose a new password<span style={{ color: "var(--terracotta)" }}>.</span>
        </h1>
        <Field id="new-password" label="New password" type="password" required minLength={8} autoComplete="new-password" hint="At least 8 characters." value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" size="lg" fullWidth disabled={busy}>{busy ? "Saving…" : "Save password"}</Button>
        {error && <p role="alert" style={{ margin: 0, fontSize: 14, color: "var(--terracotta-deep)" }}>{error}</p>}
      </form>
    </main>
  );
}
