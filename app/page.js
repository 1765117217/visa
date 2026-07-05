import { redirect } from "next/navigation";

import AccountMenu from "@/components/AccountMenu";
import LegacyPageClient from "@/components/LegacyPageClient";
import { getLegacyPage } from "@/lib/legacyHtml";
import { createClient } from "@/lib/supabase/server.js";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login");
  }

  return (
    <>
      <LegacyPageClient page={getLegacyPage("index.html")} />
      <AccountMenu email={data.claims.email || ""} />
    </>
  );
}
