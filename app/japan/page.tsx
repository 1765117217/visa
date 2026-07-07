import SiteLayout from "@/components/layout/SiteLayout";
import VisaChecklistPage from "@/components/visa/VisaChecklistPage";
import { visaPages } from "@/data/pages/site";

export default function JapanPage() {
  return (
    <SiteLayout>
      <VisaChecklistPage page={visaPages.japan} />
    </SiteLayout>
  );
}
