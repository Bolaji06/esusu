
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/actions/auth";
import { getOptOutInfo, getUserOptOutRequests } from "@/src/actions/optOut";
import OptOutView from "@/src/components/dashboard/OptOutView";

export default async function OptOutPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [optOutInfo, requests] = await Promise.all([
    getOptOutInfo(user.id),
    getUserOptOutRequests(user.id),
  ]);

  return (
    <OptOutView
      userId={user.id}
      optOutInfo={optOutInfo}
      requests={requests}
    />
  );
}