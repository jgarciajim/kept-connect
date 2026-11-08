import "server-only";

/**
 * Transactional email adapter (Resend REST API via fetch — no SDK dependency,
 * same swap-in posture as the payments mock adapter).
 *
 * Safe by construction:
 *   - No RESEND_API_KEY  → logs and no-ops (local/dev/CI never send real mail).
 *   - Any send failure   → logged, never thrown, so a user action (approve a Pro,
 *     award a job) is never broken by an email problem.
 *
 * `from` comes from RESEND_FROM (e.g. "Guildry <notify@breckhousekeeping.com>");
 * Resend only delivers to arbitrary recipients from a VERIFIED domain.
 */
const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "Guildry <onboarding@resend.dev>"; // test sender (owner-only)

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail({ to, subject, html, text }: EmailPayload): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? DEFAULT_FROM;

  if (!key) {
    console.info(`[email] no RESEND_API_KEY — skipped → ${to}: "${subject}"`);
    return;
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html, text }),
    });
    if (!res.ok) {
      console.error(`[email] send failed ${res.status} → ${to}: ${await res.text()}`);
    }
  } catch (err) {
    console.error(`[email] send threw → ${to}`, err);
  }
}
