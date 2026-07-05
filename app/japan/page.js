import LegacyPageClient from "@/components/LegacyPageClient";
import { getLegacyPage } from "@/lib/legacyHtml";

export default function JapanPage() {
  return <LegacyPageClient page={getLegacyPage("japan.html")} exposePdfLib />;
}
