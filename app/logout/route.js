import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server.js";

async function signOut(request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL("/login", request.url));
}

export async function GET(request) {
  return signOut(request);
}

export async function POST(request) {
  return signOut(request);
}
