import LegacyPageClient from "@/components/LegacyPageClient";
import { getLegacyPage } from "@/lib/legacyHtml";

export default function FaqPage() {
  return <LegacyPageClient page={getLegacyPage("faq.html")} />;
}
