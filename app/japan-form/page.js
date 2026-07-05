import LegacyPageClient from "@/components/LegacyPageClient";
import { getLegacyPage } from "@/lib/legacyHtml";

export default function JapanFormPage() {
  return <LegacyPageClient page={getLegacyPage("japan-form.html")} exposeCanvasPdf />;
}
