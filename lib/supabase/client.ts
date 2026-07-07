import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

function getSupabasePublicEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  };
}

export function hasSupabasePublicEnv() {
  const { url, key } = getSupabasePublicEnv();
  return Boolean(url && key);
}

export function getBrowserSupabaseClient() {
  const { url, key } = getSupabasePublicEnv();

  if (!url || !key) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient(url, key);
  }

  return browserClient;
}

export function createClient() {
  const supabase = getBrowserSupabaseClient();

  if (!supabase) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
    );
  }

  return supabase;
}
