import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AccountNav } from "@/components/account-nav";
import { getProfile } from "@/lib/auth";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login?next=/account");

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="border-b border-border bg-sidebar">
          <div className="container-page py-10">
            <h1 className="font-heading text-3xl font-semibold">
              Hello, {profile.full_name?.split(" ")[0] ?? "Guest"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your profile and reservations.
            </p>
          </div>
        </div>
        <div className="container-page grid gap-8 py-10 md:grid-cols-[220px_1fr]">
          <AccountNav />
          <div>{children}</div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
