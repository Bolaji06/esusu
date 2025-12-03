
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/actions/auth";
import { getAllCyclesWithDetails } from "@/src/actions/cycles";
import CyclesManagementView from "@/src/components/admin/CycleManagementView";

export default async function CyclesManagementPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.isAdmin) {
    redirect("/dashboard");
  }

  const cycles = await getAllCyclesWithDetails();

  return <CyclesManagementView cycles={cycles} adminId={user.id} />;
}