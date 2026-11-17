"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Provider } from "@supabase/supabase-js";
import { Button, Field, KeptConnectLogo } from "@/components/ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Sign in / sign up with Supabase Auth.
 *  - Social buttons: only the providers listed in NEXT_PUBLIC_AUTH_PROVIDERS
 *    (comma-separated: google,apple,facebook) — so a provider stays hidden until
 *    it is configured in the Supabase dashboard.
 *  - Email + password, or a one-time 6-digit code by email (no password).
 */
type Mode = "sign-in" | "sign-up";

const PROVIDER_LABELS: Record<string, string> = {
  google: "Google",
  apple: "Apple",
  facebook: "Facebook",
};

const ENABLED_PROVIDERS = (process.env.NEXT_PUBLIC_AUTH_PROVIDERS ?? "")
  .split(",")
  .map((p) => p.trim().toLowerCase())
  .filter((p) => p in PROVIDER_LABELS);

function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "That email and password don't match. Try again, or use a code instead.";
  if (m.includes("email not confirmed")) return "Confirm your email first. Check your inbox for the link we sent.";
  if (m.includes("already registered")) return "There's already an account with that email. Sign in instead.";
  if (m.includes("password should be")) return "Use a password of at least 8 characters.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts. Wait a minute and try again.";
  if (m.includes("token has expired") || m.includes("invalid")) return "That code didn't work. It may have expired, so send a new one.";
  return message;
}

export function AuthForm({ mode, next, initialError }: { mode: Mode; next: string; initialError?: string | null }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const isSignUp = mode === "sign-up";

  const [method, setMethod] = useState<"password" | "code">("password");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [notice, setNotice] = useState<string | null>(null);

  const done = () => {
    router.replace(next);
    router.refresh();
  };

  async function oauth(provider: string) {
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) {
      setError(friendly(error.message));
      setBusy(false);
    }
  }

  async function submitPassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: name.trim() ? { full_name: name.trim() } : undefined,
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}`,
        },
      });
      setBusy(false);
      if (error) return setError(friendly(error.message));
      if (data.session) return done();
      setNotice(`We sent a confirmation link to ${email}. Open it to finish creating your account.`);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setError(friendly(error.message));
      done();
    }
  }

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: isSignUp && name.trim() ? { full_name: name.trim() } : undefined,
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}`,
      },
    });
    setBusy(false);
    if (error) return setError(friendly(error.message));
    setCodeSent(true);
    setNotice(`We emailed a 6-digit code to ${email}. It works for 1 hour.`);
  }

  async function verifyCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: "email" });
    setBusy(false);
    if (error) return setError(friendly(error.message));
    done();
  }

  const otherHref = `${isSignUp ? "/sign-in" : "/sign-up"}${next !== (isSignUp ? "/welcome" : "/app") ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
        <Link href="/" aria-label="Guildry home">
          <KeptConnectLogo variant="mark" treatment="app-icon" size={52} />
        </Link>
        <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 30, lineHeight: 1.15, color: "var(--ink)" }}>
          {isSignUp ? "Create your account" : "Welcome back"}
          <span style={{ color: "var(--terracotta)" }}>.</span>
        </h1>
        <p style={{ margin: 0, fontSize: 15, color: "var(--ink-2)" }}>
          {isSignUp ? "Post a job or start earning as a Pro." : "Sign in to Guildry."}
        </p>
      </div>

      {ENABLED_PROVIDERS.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ENABLED_PROVIDERS.map((p) => (
            <Button key={p} type="button" variant="secondary" size="lg" fullWidth disabled={busy} onClick={() => oauth(p)}>
              Continue with {PROVIDER_LABELS[p]}
            </Button>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--ink-3)", fontSize: 13 }}>
            <span style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
            or use email
            <span style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
          </div>
        </div>
      )}

      {method === "password" ? (
        <form onSubmit={submitPassword} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {isSignUp && (
            <Field id="auth-name" label="Your name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          )}
          <Field id="auth-email" label="Email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field
            id="auth-password"
            label="Password"
            type="password"
            required
            minLength={8}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            hint={isSignUp ? "At least 8 characters." : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" size="lg" fullWidth disabled={busy}>
            {busy ? "One moment…" : isSignUp ? "Create account" : "Sign in"}
          </Button>
        </form>
      ) : (
        <form onSubmit={codeSent ? verifyCode : sendCode} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {isSignUp && !codeSent && (
            <Field id="auth-name" label="Your name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          )}
          <Field
            id="auth-email"
            label="Email"
            type="email"
            required
            autoComplete="email"
            disabled={codeSent}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {codeSent && (
            <Field
              id="auth-code"
              label="6-digit code"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              pattern="[0-9]{6,8}"
              tabular
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            />
          )}
          <Button type="submit" size="lg" fullWidth disabled={busy}>
            {busy ? "One moment…" : codeSent ? "Continue" : "Email me a code"}
          </Button>
          {codeSent && (
            <Button type="button" variant="ghost" fullWidth disabled={busy} onClick={() => { setCodeSent(false); setCode(""); setNotice(null); }}>
              Use a different email
            </Button>
          )}
        </form>
      )}

      {notice && <p role="status" style={{ margin: 0, fontSize: 14, color: "var(--ink-2)", textAlign: "center" }}>{notice}</p>}
      {error && <p role="alert" style={{ margin: 0, fontSize: 14, color: "var(--terracotta-deep)", textAlign: "center" }}>{error}</p>}

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, fontSize: 14, color: "var(--ink-2)" }}>
        <button
          type="button"
          onClick={() => { setMethod(method === "password" ? "code" : "password"); setError(null); setNotice(null); setCodeSent(false); }}
          style={{ background: "none", border: "none", padding: 4, cursor: "pointer", color: "var(--terracotta)", fontSize: 14, fontWeight: 500, fontFamily: "var(--font-ui)" }}
        >
          {method === "password" ? "Email me a code instead" : "Use a password instead"}
        </button>
        {!isSignUp && method === "password" && (
          <Link href="/forgot-password" style={{ color: "var(--ink-2)" }}>Forgot password?</Link>
        )}
        <span>
          {isSignUp ? "Already have an account? " : "New to Guildry? "}
          <Link href={otherHref} style={{ color: "var(--terracotta)", fontWeight: 500 }}>
            {isSignUp ? "Sign in" : "Create an account"}
          </Link>
        </span>
      </div>
    </div>
  );
}
