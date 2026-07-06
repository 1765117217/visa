export function getAccountName(email, displayName = "") {
  const cleanDisplayName = String(displayName || "").trim();
  if (cleanDisplayName) {
    return cleanDisplayName;
  }

  if (!email) {
    return "User";
  }

  return email.split("@")[0] || "User";
}

export function getAccountInitial(email, displayName = "") {
  const name = getAccountName(email, displayName);
  return (name[0] || "U").toUpperCase();
}
