import { isMissingProfileStoreError } from "@/lib/profile/errors.js";
import { getAccountName } from "@/lib/auth/account";
import { createClient } from "@/lib/supabase/server.js";

export const PROFILE_COLUMNS =
  "id, display_name, full_name, phone, nationality, pass_type, visa_type, updated_at";

export async function getCurrentUserProfile() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .maybeSingle();

  if (isMissingProfileStoreError(error)) {
    return { user, profile: null, missingProfileStore: true };
  }

  if (error) {
    throw error;
  }

  if (data?.display_name) {
    return { user, profile: data };
  }

  const defaultDisplayName = getAccountName(
    user.email,
    user.user_metadata?.display_name
  );
  const { data: defaultProfile, error: defaultError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        ...(data || {}),
        display_name: defaultDisplayName,
        updated_at: new Date().toISOString()
      },
      { onConflict: "id" }
    )
    .select(PROFILE_COLUMNS)
    .maybeSingle();

  if (isMissingProfileStoreError(defaultError)) {
    return { user, profile: null, missingProfileStore: true };
  }

  if (defaultError) {
    throw defaultError;
  }

  return { user, profile: defaultProfile || data };
}

export async function upsertCurrentUserProfile(payload) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, reason: "not-authenticated" };
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      ...payload,
      updated_at: new Date().toISOString()
    },
    { onConflict: "id" }
  );

  if (isMissingProfileStoreError(error)) {
    return { ok: false, reason: "missing-profile-store" };
  }

  if (error) {
    throw error;
  }

  return { ok: true };
}
