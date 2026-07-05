import LegacyPageClient from "@/components/LegacyPageClient";
import { getLegacyPage } from "@/lib/legacyHtml";

export default function PricingPage() {
  return <LegacyPageClient page={getLegacyPage("pricing.html")} />;
}
