"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { logAudit } from "@/lib/services/audit";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  check_in_time: z.string(),
  check_out_time: z.string(),
  reservation_hold_hours: z.coerce.number().int().min(1).max(168),
  no_show_fee: z.coerce.number().min(0),
  tax_rate: z.coerce.number().min(0).max(100),
  cancellation_policy: z.enum(["flexible", "moderate", "strict"]),
});

export async function updateSettings(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const profile = await requireRole(["admin", "owner"]);
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    address: formData.get("address") ?? "",
    check_in_time: formData.get("check_in_time"),
    check_out_time: formData.get("check_out_time"),
    reservation_hold_hours: formData.get("reservation_hold_hours"),
    no_show_fee: formData.get("no_show_fee"),
    tax_rate: formData.get("tax_rate"),
    cancellation_policy: formData.get("cancellation_policy"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const { error } = await supabase
    .from("hotel_settings")
    .update(parsed.data as never)
    .eq("id", 1);
  if (error) return { ok: false, error: error.message };

  await logAudit({ actorId: profile.id, action: "settings.updated", entity: "hotel_settings", entityId: "1" });
  revalidatePath("/admin/settings");
  return { ok: true };
}
