import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeInternalPath } from "@/lib/safe-redirect";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeInternalPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
    console.error("auth/callback exchangeCodeForSession failed:", error.message);
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  console.error("auth/callback called without a code param");
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
