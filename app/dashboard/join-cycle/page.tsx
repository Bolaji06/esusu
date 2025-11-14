import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/actions/auth";
import {
  getAvailableCycles,
  getCycleDetails,
  checkUserParticipation,
  getSystemSettings,
} from "@/src/actions/participation";
import JoinCycleView from "@/src/components/dashboard/JoinCycleView";

export default async function JoinCyclePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const user = await getCurrentUser();
  const paramsId = (await searchParams).id;

  if (!user) {
    redirect("/login");
  }

  const cycles = await getAvailableCycles();
  const settings = await getSystemSettings();

  // If specific cycle ID is provided
  if (paramsId) {
    const cycleDetails = await getCycleDetails(paramsId);
    const alreadyJoined = await checkUserParticipation(user.id, paramsId);

    return (
      <JoinCycleView
        cycles={cycles}
        selectedCycle={cycleDetails}
        alreadyJoined={alreadyJoined}
        userId={user.id}
        settings={settings}
      />
    );
  }

  return (
    <JoinCycleView
      cycles={cycles}
      selectedCycle={null}
      alreadyJoined={false}
      userId={user.id}
      settings={settings}
    />
  );
}
