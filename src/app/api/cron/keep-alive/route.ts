import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Keeps the Supabase project from auto-pausing.
 *
 * Free-tier projects pause after ~7 days without database activity, which takes
 * the whole site down (the project hostname stops resolving) until someone
 * restores it by hand. Vercel Cron hits this daily; the read below is real
 * database traffic, which is what resets that idle timer — pinging the REST
 * endpoint without touching a table would not.
 *
 * Vercel sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set,
 * so the job can't be triggered by anyone else. Schedule lives in vercel.json.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();
  const supabase = createAdminClient();
  const { error, count } = await supabase
    .from("rooms")
    .select("id", { count: "exact", head: true });

  if (error) {
    console.error("cron:keep-alive failed", error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const ms = Date.now() - startedAt;
  console.log(`cron:keep-alive ok — ${count} rooms in ${ms}ms`);
  return NextResponse.json({ ok: true, rooms: count, ms });
}
