import { redirect } from "next/navigation";

import SiteLayout from "@/components/layout/SiteLayout";
import HomePageClient from "@/components/marketing/HomePageClient";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login");
  }

  return (
    <SiteLayout>
      <HomePageClient />
    </SiteLayout>
  );
}
