import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/actions/auth";
import {
  getAdminDashboardStats,
  getRecentActivities,
  getPaymentsNeedingVerification,
} from "@/src/actions/admin";
import AdminDashboardView from "@/src/components/admin/AdminDashboardView";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.isAdmin) {
    redirect("/dashboard");
  }

  const [stats, activities, paymentsToVerify] = await Promise.all([
    getAdminDashboardStats(),
    getRecentActivities(),
    getPaymentsNeedingVerification(),
  ]);

  return (
    <AdminDashboardView
      stats={stats}
      activities={activities}
      paymentsToVerify={paymentsToVerify}
      adminId={user.id}
    />
  );
}