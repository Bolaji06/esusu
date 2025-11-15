
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/actions/auth";
import { getUserPayments } from "@/src/actions/payments";
import ContributionsView from "@/src/components/dashboard/ContributionsView";

export default async function ContributionsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const paymentsData = await getUserPayments(user.id);

  return <ContributionsView userId={user.id} data={paymentsData} />;
}