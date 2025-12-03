import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/actions/auth";
import { getCycleDetails } from "@/src/actions/cycles";
import EditCycleView from "@/src/components/admin/EditCycleView";

export default async function EditCyclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const paramId = (await params).id;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.isAdmin) {
    redirect("/dashboard");
  }

  const cycle = await getCycleDetails(paramId);

  if (!cycle) {
    redirect("/dashboard/admin/cycles");
  }

  return <EditCycleView cycle={cycle} adminId={user.id} />;
}
