import test from "node:test";
import assert from "node:assert/strict";

import { hasSupabasePublicEnv } from "../lib/supabase/client.ts";

test("hasSupabasePublicEnv accepts the publishable key env name", () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalPublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const originalAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable-key";
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  try {
    assert.equal(hasSupabasePublicEnv(), true);
  } finally {
    if (originalUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    } else {
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    }

    if (originalPublishableKey === undefined) {
      delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    } else {
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalPublishableKey;
    }

    if (originalAnonKey === undefined) {
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    } else {
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalAnonKey;
    }
  }
});
