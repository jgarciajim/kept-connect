import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Admin data layer — pure queries for the verification review queue. RLS only
 * returns these rows to an admin (provider_verifications_select OR-admin); the
 * accessors create the RLS-scoped client.
 */
export interface PendingVerification {
  memberId: string;
  name: string;
  trades: string[];
  licenseType: string | null;
  licenseNumber: string | null;
  insuranceCarrier: string | null;
  coiExpiry: string | null;
  yearsInTrade: number | null;
  w9Path: string | null;
  coiPath: string | null;
  licensePhotoPath: string | null;
  submittedAt: string;
}

export async function qGetPendingVerifications(c: SupabaseClient): Promise<PendingVerification[]> {
  const { data } = await c
    .from("provider_verifications")
    .select("*")
    .eq("status", "pending")
    .order("submitted_at", { ascending: true });
  const rows = data ?? [];
  return Promise.all(
    rows.map(async (r) => {
      const { data: p } = await c
        .from("provider_profiles")
        .select("display_name, trade_labels")
        .eq("member_id", r.member_id)
        .maybeSingle();
      return {
        memberId: r.member_id,
        name: p?.display_name ?? "Provider",
        trades: p?.trade_labels ?? [],
        licenseType: r.license_type ?? null,
        licenseNumber: r.license_number ?? null,
        insuranceCarrier: r.insurance_carrier ?? null,
        coiExpiry: r.coi_expiry ?? null,
        yearsInTrade: r.years_in_trade ?? null,
        w9Path: r.w9_path ?? null,
        coiPath: r.coi_path ?? null,
        licensePhotoPath: r.license_photo_path ?? null,
        submittedAt: r.submitted_at,
      };
    }),
  );
}
