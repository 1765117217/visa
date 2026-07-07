"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  buildProfilePayload,
  type BasicVisaData,
  type ProfileFormValues,
  type ProfileRow
} from "@/lib/profile/forms";
import { isMissingProfileStoreError } from "@/lib/profile/errors";
import { getAccountName } from "@/lib/auth/account";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

const PROFILE_COLUMNS =
  "id, display_name, full_name, phone, nationality, pass_type, visa_type, updated_at";

interface SyncResult {
  ok: boolean;
  skipped: boolean;
  reason?: string;
}

async function getAuthenticatedUser(supabase: SupabaseClient) {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function fetchCurrentProfile(): Promise<ProfileRow | null> {
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
    return { email: user.email || "" };
  }

  if (error) {
    console.warn("Unable to load profile", error);
    return { email: user.email || "" };
  }

  return {
    ...((data as ProfileRow | null) || {}),
    email: user.email || ""
  };
}

export async function syncBasicDataToProfile(values: BasicVisaData): Promise<SyncResult> {
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

export async function saveCurrentProfile(
  values: ProfileFormValues
): Promise<{ ok: false; reason: string } | { ok: true; profile: ProfileRow }> {
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

  return { ok: true, profile: (data as ProfileRow | null) || { ...payload, id: user.id } };
}
