import LegacyPageClient from "@/components/LegacyPageClient";
import { getLegacyPage } from "@/lib/legacyHtml";

export default function KoreanPage() {
  return <LegacyPageClient page={getLegacyPage("korean.html")} exposePdfLib />;
}
