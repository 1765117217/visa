export interface EmailPasswordCredentials {
  email: string;
  password: string;
}

export type AuthSearchParams = Record<string, string | string[] | undefined>;

export function parseEmailPasswordForm(formData: FormData): EmailPasswordCredentials {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email) {
    throw new Error("Email is required");
  }

  if (!email.includes("@")) {
    throw new Error("Enter a valid email address");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  return { email, password };
}

export function getAuthMessage(searchParams: AuthSearchParams | undefined | null, key: string): string {
  const value = searchParams?.[key];

  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return typeof value === "string" ? value : "";
}
