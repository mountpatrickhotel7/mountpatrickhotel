import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/supabase/types";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  return (data as unknown as Profile | null) ?? null;
}

/** Guard a server page/action by role. Redirects if unauthorized. */
export async function requireRole(
  allowed: UserRole[],
  redirectTo = "/login"
): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) redirect(redirectTo);
  if (!allowed.includes(profile.role)) redirect("/");
  return profile;
}

export const isAdminRole = (role?: UserRole | null) =>
  role === "admin" || role === "owner";
