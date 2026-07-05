import LegacyPageClient from "@/components/LegacyPageClient";
import { getLegacyPage } from "@/lib/legacyHtml";

export default function ContactPage() {
  return <LegacyPageClient page={getLegacyPage("Contact.html")} />;
}
