import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth/safe-next";

/**
 * Email links (sign-up confirmation, magic link, password reset). The Supabase
 * email templates point here with `token_hash` + `type`, which works even when
 * the link is opened in a different browser than the one that asked for it.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(searchParams.get("next"));

  if (tokenHash && type) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(`${origin}${type === "recovery" ? "/auth/reset-password" : next}`);
    }
    console.error("auth/confirm: verifyOtp failed", error.message);
  }
  return NextResponse.redirect(`${origin}/sign-in?error=link`);
}
