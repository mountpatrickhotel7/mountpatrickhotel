import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function logAudit(params: {
  actorId?: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const admin = createAdminClient();
    await admin.from("audit_logs").insert({
      actor_id: params.actorId ?? null,
      action: params.action,
      entity: params.entity ?? null,
      entity_id: params.entityId ?? null,
      metadata: params.metadata ?? null,
    } as never);
  } catch (err) {
    console.error("audit:log failed", err);
  }
}
