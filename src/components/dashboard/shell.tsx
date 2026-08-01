import { DesktopSidebar, MobileSidebar } from "@/components/dashboard/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { navForArea, areaSwitcher } from "@/lib/dashboard-nav";
import type { Profile } from "@/lib/supabase/types";

const AREA_LABELS = {
  reception: "Reception",
  admin: "Administration",
  owner: "Owner Portal",
} as const;

export function DashboardShell({
  area,
  profile,
  children,
}: {
  area: "reception" | "admin" | "owner";
  profile: Profile;
  children: React.ReactNode;
}) {
  const nav = navForArea(area);
  const switcher = areaSwitcher(profile.role);
  const areaLabel = AREA_LABELS[area];

  return (
    <div className="flex min-h-dvh bg-background">
      <DesktopSidebar nav={nav} switcher={switcher} areaLabel={areaLabel} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/85 px-4 glass md:px-6">
          <div className="flex items-center gap-2">
            <MobileSidebar nav={nav} switcher={switcher} areaLabel={areaLabel} />
            <span className="font-heading text-lg font-semibold md:hidden">
              {areaLabel}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <UserMenu name={profile.full_name} email={profile.email} role={profile.role} />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
