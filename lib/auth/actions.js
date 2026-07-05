"use server";

import { redirect } from "next/navigation";

import { parseEmailPasswordForm } from "@/lib/auth/forms";
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
  const { data, error } = await supabase.auth.signUp(credentials);

  if (error) {
    redirectWithError("/register", error);
  }

  if (data.session) {
    redirect("/");
  }

  redirect("/login?message=Check%20your%20email%20to%20confirm%20your%20account");
}
