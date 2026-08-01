import { DashboardTitle } from "@/components/dashboard/stat-card";
import { SettingsForm } from "@/components/admin/settings-form";
import { createClient } from "@/lib/supabase/server";
import type { HotelSettings } from "@/lib/supabase/types";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("hotel_settings").select("*").eq("id", 1).maybeSingle();
  const settings = data as unknown as HotelSettings | null;

  return (
    <>
      <DashboardTitle
        title="Hotel Settings"
        description="Configure check-in times, reservation holds, fees, and policies."
      />
      {settings ? (
        <SettingsForm settings={settings} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Settings not initialised. Run the seed migration to create the settings row.
        </p>
      )}
    </>
  );
}
