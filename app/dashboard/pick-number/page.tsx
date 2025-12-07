import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/actions/auth";
import {
  getActiveCycle,
  getUserPick,
  getAllPicks,
} from "@/src/actions/numberPicks";
import PickNumberView from "@/src/components/dashboard/PickNumberView";

export default async function PickNumberPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const cycleData = await getActiveCycle();
  const userPick = await getUserPick(user.id);
  const takenNumbers = await getAllPicks(user.id);

  return (
    <PickNumberView
      userId={user.id}
      cycleData={cycleData}
      userPick={userPick}
      takenNumbers={takenNumbers}
    />
  );
}
