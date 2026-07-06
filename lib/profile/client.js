"use client";

import { buildProfilePayload } from "@/lib/profile/forms.js";
import { isMissingProfileStoreError } from "@/lib/profile/errors.js";
import { getAccountName } from "@/lib/auth/account";
import { getBrowserSupabaseClient } from "@/lib/supabase/client.js";

const PROFILE_COLUMNS =
  "id, display_name, full_name, phone, nationality, pass_type, visa_type, updated_at";

async function getAuthenticatedUser(supabase) {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function fetchCurrentProfile() {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    return null;
  }

  const user = await getAuthenticatedUser(supabase);
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .maybeSingle();

  if (isMissingProfileStoreError(error)) {
    return null;
  }

  if (error) {
    console.warn("Unable to load profile", error);
    return null;
  }

  return data;
}

export async function syncBasicDataToProfile(values) {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    return { ok: false, skipped: true, reason: "missing-supabase-env" };
  }

  const user = await getAuthenticatedUser(supabase);
  if (!user) {
    return { ok: false, skipped: true, reason: "not-authenticated" };
  }

  const payload = buildProfilePayload(values);
  if (Object.keys(payload).length === 0) {
    return { ok: true, skipped: true, reason: "empty-profile-payload" };
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
    return { ok: false, skipped: true, reason: "missing-profile-store" };
  }

  if (error) {
    console.warn("Unable to sync profile", error);
    return { ok: false, skipped: false, reason: "sync-failed" };
  }

  return { ok: true, skipped: false };
}

export async function saveCurrentProfile(values) {
  const supabase = getBrowserSupabaseClient();
  if (!supabase) {
    return { ok: false, reason: "missing-supabase-env" };
  }

  const user = await getAuthenticatedUser(supabase);
  if (!user) {
    return { ok: false, reason: "not-authenticated" };
  }

  const payload = buildProfilePayload(values, { emptyAsNull: true });
  payload.display_name = getAccountName(user.email, payload.display_name);

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        ...payload,
        updated_at: new Date().toISOString()
      },
      { onConflict: "id" }
    )
    .select(PROFILE_COLUMNS)
    .maybeSingle();

  if (isMissingProfileStoreError(error)) {
    return { ok: false, reason: "missing-profile-store" };
  }

  if (error) {
    console.warn("Unable to save profile", error);
    return { ok: false, reason: "save-failed" };
  }

  return { ok: true, profile: data || { ...payload, id: user.id } };
}
