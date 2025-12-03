
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/actions/auth";
import { getUserPayoutInfo, getPayoutTimeline } from "@/src/actions/userPayout";
import UserPayoutsView from "@/src/components/dashboard/UserPayoutView";

export default async function UserPayoutsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [payoutInfo, timelineData] = await Promise.all([
    getUserPayoutInfo(user.id),
    getPayoutTimeline(user.id),
  ]);

  const timeline = {
    ...timelineData,
    cycleName: timelineData.cycleName ?? "",
    totalSlots: timelineData.totalSlots ?? 0,
  };

  return (
    <UserPayoutsView
      userId={user.id}
      payoutInfo={payoutInfo}
      timeline={timeline}
    />
  );
}