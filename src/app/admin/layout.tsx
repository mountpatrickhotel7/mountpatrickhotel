import { DashboardShell } from "@/components/dashboard/shell";
import { requireRole } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole(["admin", "owner"]);
  return (
    <DashboardShell area="admin" profile={profile}>
      {children}
    </DashboardShell>
  );
}
