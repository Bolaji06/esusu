import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/actions/auth";
import { getDashboardData, getActiveCycles } from "@/src/actions/dashboard";
import DashboardOverview from "@/src/components/dashboard/DashboardOverview";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const dashboardData = await getDashboardData(user.id);
  const activeCycles = await getActiveCycles();

  if (!dashboardData) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Error loading dashboard data</p>
      </div>
    );
  }

  return (
    <DashboardOverview
      data={dashboardData}
      activeCycles={activeCycles}
      isAdmin={user.isAdmin}
    />
  );
}