import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/actions/auth";
import { getUserProfile } from "@/src/actions/profile";
import ProfileView from "@/src/components/dashboard/ProfileView";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profileData = await getUserProfile(user.id);

  if (!profileData) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Error loading profile data</p>
      </div>
    );
  }

  return <ProfileView profileData={profileData} />;
}
