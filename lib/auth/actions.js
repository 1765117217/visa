"use server";

import { redirect } from "next/navigation";

import { getAccountName } from "@/lib/auth/account";
import { parseEmailPasswordForm } from "@/lib/auth/forms";
import { isMissingProfileStoreError } from "@/lib/profile/errors.js";
import { createClient } from "@/lib/supabase/server.js";

function redirectWithError(path, error) {
  redirect(`${path}?error=${encodeURIComponent(error.message)}`);
}

export async function loginAction(formData) {
  let credentials;

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

export async function registerAction(formData) {
  let credentials;

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
