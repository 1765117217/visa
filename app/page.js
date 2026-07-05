import LegacyPageClient from "@/components/LegacyPageClient";
import { getLegacyPage } from "@/lib/legacyHtml";

export default function HomePage() {
  return <LegacyPageClient page={getLegacyPage("index.html")} />;
}
