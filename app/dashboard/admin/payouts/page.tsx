
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/actions/auth";
import { getAllPayouts, getPayoutStats, getUpcomingPayouts } from "@/src/actions/payout";
import PayoutsView from "@/src/components/admin/PayoutsView";

export default async function AdminPayoutsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.isAdmin) {
    redirect("/dashboard");
  }

  const [payouts, stats, upcoming] = await Promise.all([
    getAllPayouts("all"),
    getPayoutStats(),
    getUpcomingPayouts(),
  ]);

  return (
    <PayoutsView
      payouts={payouts}
      stats={stats}
      upcoming={upcoming}
      adminId={user.id}
    />
  );
}