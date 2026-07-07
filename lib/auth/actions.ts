"use server";

import { redirect } from "next/navigation";

import { getAccountName } from "@/lib/auth/account";
import { parseEmailPasswordForm, type EmailPasswordCredentials } from "@/lib/auth/forms";
import { isMissingProfileStoreError } from "@/lib/profile/errors";
import { createClient } from "@/lib/supabase/server";

function redirectWithError(path: string, error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function loginAction(formData: FormData) {
  let credentials: EmailPasswordCredentials;

  try {
    credentials = parseEmailPasswordForm(formData);
  } catch (error) {
    redirectWithError("/login", error);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    redirectWithError("/login", error);
  }

  redirect("/");
}

export async function registerAction(formData: FormData) {
  let credentials: EmailPasswordCredentials;

  try {
    credentials = parseEmailPasswordForm(formData);
  } catch (error) {
    redirectWithError("/register", error);
  }

  const supabase = await createClient();
  const defaultDisplayName = getAccountName(credentials.email);
  const { data, error } = await supabase.auth.signUp({
    ...credentials,
    options: {
      data: {
        display_name: defaultDisplayName
      }
    }
  });

  if (error) {
    redirectWithError("/register", error);
  }

  if (data.session && data.user) {
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: data.user.id,
        display_name: defaultDisplayName,
        updated_at: new Date().toISOString()
      },
      { onConflict: "id" }
    );

    if (profileError && !isMissingProfileStoreError(profileError)) {
      console.warn("Unable to create profile", profileError);
    }
  }

  if (data.session) {
    redirect("/");
  }

  redirect("/login?message=Check%20your%20email%20to%20confirm%20your%20account");
}
