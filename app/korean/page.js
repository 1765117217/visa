import SiteLayout from "@/components/layout/SiteLayout";
import VisaChecklistPage from "@/components/visa/VisaChecklistPage";
import { visaPages } from "@/data/pages/site";

export default function KoreanPage() {
  return (
    <SiteLayout>
      <VisaChecklistPage page={visaPages.korea} />
    </SiteLayout>
  );
}
