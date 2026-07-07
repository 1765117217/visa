import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

// OAuth (e.g. Google) redirects the browser back here with a `code`. We exchange
// it for a session (sets the auth cookies) then send the user home — same
// destination as loginAction.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  // Behind a proxy the request origin can be an internal localhost; honor the
  // public host so we don't redirect users off-site. Dev / no-proxy: use origin.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const base =
    process.env.NODE_ENV !== "development" && forwardedHost
      ? `https://${forwardedHost}`
      : origin;

  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL("/", base));
    }

    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, base)
    );
  }

  // Provider returned an error instead of a code (user denied, misconfig, ...).
  const providerError =
    searchParams.get("error_description") ||
    searchParams.get("error") ||
    "OAuth sign-in failed";

  return NextResponse.redirect(
    new URL(`/login?error=${encodeURIComponent(providerError)}`, base)
  );
}
