import { DashboardShell } from "@/components/dashboard/shell";
import { requireRole } from "@/lib/auth";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole(["admin", "owner"]);
  return (
    <DashboardShell area="owner" profile={profile}>
      {children}
    </DashboardShell>
  );
}
