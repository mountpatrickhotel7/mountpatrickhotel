import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileForm } from "@/components/profile-form";
import { getProfile } from "@/lib/auth";

export const metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const profile = await getProfile();
  if (!profile) return null;

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="font-heading">Profile details</CardTitle>
        <CardDescription>Keep your contact information up to date.</CardDescription>
      </CardHeader>
      <CardContent>
        <ProfileForm profile={profile} />
      </CardContent>
    </Card>
  );
}
