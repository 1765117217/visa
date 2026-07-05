export function getAccountName(email) {
  if (!email) {
    return "User";
  }

  return email.split("@")[0] || "User";
}

export function getAccountInitial(email) {
  const name = getAccountName(email);
  return (name[0] || "U").toUpperCase();
}
