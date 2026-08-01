import { DashboardTitle } from "@/components/dashboard/stat-card";
import { CheckinLookup } from "@/components/reception/checkin-lookup";

export const metadata = { title: "Check-in" };

export default function CheckinPage() {
  return (
    <>
      <DashboardTitle
        title="Check-in & QR Verification"
        description="Scan a guest's booking QR or look up their reference to verify and check in."
      />
      <CheckinLookup />
    </>
  );
}
