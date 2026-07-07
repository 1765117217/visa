import type { PostgrestError } from "@supabase/supabase-js";

const MISSING_PROFILE_STORE_CODES = new Set(["42P01", "PGRST205"]);

export function isMissingProfileStoreError(
  error: PostgrestError | Error | null | undefined
): boolean {
  if (!error) {
    return false;
  }

  if ("code" in error && MISSING_PROFILE_STORE_CODES.has(error.code)) {
    return true;
  }

  const details = "details" in error ? error.details : "";
  const message = `${error.message || ""} ${details || ""}`.toLowerCase();
  return message.includes("profiles") && message.includes("does not exist");
}
