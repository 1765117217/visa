import LegacyPageClient from "@/components/LegacyPageClient";
import { getLegacyPage } from "@/lib/legacyHtml";

export default function DocumentsPage() {
  return <LegacyPageClient page={getLegacyPage("documents.html")} />;
}
