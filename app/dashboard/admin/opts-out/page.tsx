
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/actions/auth";
import {
  getPendingOptOutRequests,
  getOptOutStats,
} from "@/src/actions/optOut";
import AdminOptOutView from "@/src/components/admin/AdminOptOutView";

export default async function AdminOptOutsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.isAdmin) {
    redirect("/dashboard");
  }

  const [pendingRequests, stats] = await Promise.all([
    getPendingOptOutRequests(),
    getOptOutStats(),
  ]);

  return (
    <AdminOptOutView
      pendingRequests={pendingRequests}
      stats={stats}
      adminId={user.id}
    />
  );
}