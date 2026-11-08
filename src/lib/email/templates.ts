/**
 * Transactional email templates (plain, inline-styled HTML + a text fallback).
 * Pure functions — no I/O — so they're trivially testable. Keep copy in the
 * Guildry voice; the brand terracotta is #C06B4F.
 */

export interface BuiltEmail {
  subject: string;
  html: string;
  text: string;
}

const BRAND = "#C06B4F";

function wrap(heading: string, bodyHtml: string): string {
  return `<!doctype html>
<html><body style="margin:0;background:#F6F3EE;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#2B2622">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F3EE;padding:28px 16px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFDF9;border:1px solid #E7E0D6;border-radius:16px;overflow:hidden">
        <tr><td style="padding:22px 28px 0">
          <span style="font-size:19px;font-weight:600;letter-spacing:-0.01em;color:#2B2622">Guildry<span style="color:${BRAND}">.</span></span>
        </td></tr>
        <tr><td style="padding:18px 28px 26px">
          <h1 style="margin:0 0 12px;font-size:20px;font-weight:600;color:#2B2622">${heading}</h1>
          ${bodyHtml}
        </td></tr>
      </table>
      <p style="max-width:520px;margin:16px auto 0;font-size:12px;color:#9A9186;text-align:center">
        Guildry · trusted local Pros, matched in minutes
      </p>
    </td></tr>
  </table>
</body></html>`;
}

function p(text: string): string {
  return `<p style="margin:0 0 12px;font-size:15px;line-height:1.5;color:#4A443D">${text}</p>`;
}

const hi = (name: string | null) => (name ? `Hi ${name},` : "Hi,");

/** A Pro's verification was approved → they can now take work. */
export function verificationApproved(name: string | null): BuiltEmail {
  const subject = "You're verified on Guildry";
  return {
    subject,
    html: wrap(
      "You're verified 🎉",
      p(hi(name)) +
        p("Your Guildry verification is approved — your profile now shows the verified badge, and you'll start receiving job offers in your trades.") +
        p("Open the app and make sure you're online to get matched."),
    ),
    text: `${hi(name)}\n\nYour Guildry verification is approved — your profile now shows the verified badge, and you'll start receiving job offers in your trades.\n\nOpen the app and make sure you're online to get matched.\n\n— Guildry`,
  };
}

/** A Pro's verification was rejected, with a reason. */
export function verificationRejected(name: string | null, reason: string): BuiltEmail {
  const subject = "An update on your Guildry verification";
  return {
    subject,
    html: wrap(
      "Verification update",
      p(hi(name)) +
        p("We weren't able to approve your Guildry verification yet. Here's why:") +
        `<p style="margin:0 0 12px;padding:12px 14px;background:#F6F3EE;border-radius:10px;font-size:14px;color:#4A443D">${reason}</p>` +
        p("You can update your details and resubmit from your profile — reply to this email if you have questions."),
    ),
    text: `${hi(name)}\n\nWe weren't able to approve your Guildry verification yet.\n\nReason: ${reason}\n\nYou can update your details and resubmit from your profile — reply to this email if you have questions.\n\n— Guildry`,
  };
}

/** A Pro won a job (quote awarded / booked). */
export function jobAwarded(name: string | null, jobTitle: string, priceDollars: string): BuiltEmail {
  const subject = `You got the job: ${jobTitle}`;
  return {
    subject,
    html: wrap(
      "You got the job",
      p(hi(name)) +
        p(`You've been awarded <strong>${jobTitle}</strong>${priceDollars ? ` at <strong>$${priceDollars}</strong>` : ""}.`) +
        p("Open Guildry to see the details, message the customer, and mark yourself on the way."),
    ),
    text: `${hi(name)}\n\nYou've been awarded "${jobTitle}"${priceDollars ? ` at $${priceDollars}` : ""}.\n\nOpen Guildry to see the details, message the customer, and mark yourself on the way.\n\n— Guildry`,
  };
}

/** A Pro accepted a customer's instant job (notify the customer). */
export function proMatched(name: string | null, jobTitle: string): BuiltEmail {
  const subject = `A Pro is on your job: ${jobTitle}`;
  return {
    subject,
    html: wrap(
      "You're matched",
      p(hi(name)) +
        p(`A verified Pro accepted <strong>${jobTitle}</strong> and is getting ready to head over.`) +
        p("Open Guildry to track their arrival and message them."),
    ),
    text: `${hi(name)}\n\nA verified Pro accepted "${jobTitle}" and is getting ready to head over.\n\nOpen Guildry to track their arrival and message them.\n\n— Guildry`,
  };
}

/** A job was completed and paid (receipt to the customer). */
export function paymentReleased(name: string | null, jobTitle: string, amountDollars: string): BuiltEmail {
  const subject = `Receipt: ${jobTitle}`;
  return {
    subject,
    html: wrap(
      "Job complete",
      p(hi(name)) +
        p(`<strong>${jobTitle}</strong> is marked complete${amountDollars ? ` and <strong>$${amountDollars}</strong> has been released to your Pro` : ""}. Thanks for using Guildry.`) +
        p("You can leave a rating from the job in the app — it helps other customers find great Pros."),
    ),
    text: `${hi(name)}\n\n"${jobTitle}" is marked complete${amountDollars ? ` and $${amountDollars} has been released to your Pro` : ""}. Thanks for using Guildry.\n\nYou can leave a rating from the job in the app — it helps other customers find great Pros.\n\n— Guildry`,
  };
}
