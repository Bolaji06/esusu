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
  searchParams: Promise<{ page?: string; search?: string; status?: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.isAdmin) {
    redirect("/dashboard");
  }

  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || "1");
  const search = resolvedSearchParams.search || "";
  const status = resolvedSearchParams.status || "all";

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