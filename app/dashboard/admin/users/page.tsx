import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/actions/auth";
import {
  getAllUsersWithDetails,
  getUserManagementStats,
} from "@/src/actions/userManagement";
import UserManagementView from "@/src/components/admin/UserManagementView";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; status?: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.isAdmin) {
    redirect("/dashboard");
  }

  const page = parseInt(searchParams.page || "1");
  const search = searchParams.search || "";
  const status = searchParams.status || "all";

  const [usersData, stats] = await Promise.all([
    getAllUsersWithDetails(page, 20, search, status),
    getUserManagementStats(),
  ]);

  return (
    <UserManagementView
      usersData={usersData}
      stats={stats}
      adminId={user.id}
      currentPage={page}
      searchTerm={search}
      statusFilter={status}
    />
  );
}