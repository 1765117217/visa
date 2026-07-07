const MISSING_PROFILE_STORE_CODES = new Set(["42P01", "PGRST205"]);

export function isMissingProfileStoreError(error) {
  if (!error) {
    return false;
  }

  if (MISSING_PROFILE_STORE_CODES.has(error.code)) {
    return true;
  }

  const message = `${error.message || ""} ${error.details || ""}`.toLowerCase();
  return message.includes("profiles") && message.includes("does not exist");
}
