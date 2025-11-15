
"use server";

import prisma from "../lib/prisma";
import { revalidatePath } from "next/cache";

export async function getActiveCycle() {
  try {
    const cycle = await prisma.contributionCycle.findFirst({
      where: {
        status: "ACTIVE",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!cycle) {
      return {
        id: "",
        name: "",
        totalSlots: 20,
        status: "UPCOMING",
        canPickNumbers: false,
        hasActiveParticipation: false,
      };
    }

    const canPickNumbers = cycle.numberPickingStartDate
      ? new Date() >= cycle.numberPickingStartDate
      : cycle.status === "ACTIVE";

    return {
      id: cycle.id,
      name: cycle.name,
      totalSlots: cycle.totalSlots,
      status: cycle.status,
      canPickNumbers,
      numberPickingStartDate: cycle.numberPickingStartDate,
      hasActiveParticipation: false, // Will be set in the component
    };
  } catch (error) {
    console.error("Error getting active cycle:", error);
    return {
      id: "",
      name: "",
      totalSlots: 20,
      status: "UPCOMING",
      canPickNumbers: false,
      hasActiveParticipation: false,
    };
  }
}

export async function pickNumber(userId: string, number: number) {
  try {
    // Get active cycle
    const cycle = await prisma.contributionCycle.findFirst({
      where: { status: "ACTIVE" },
    });

    if (!cycle) {
      return {
        success: false,
        error: "No active cycle found",
      };
    }

    // Check if number picking has started
    if (cycle.numberPickingStartDate && new Date() < cycle.numberPickingStartDate) {
      return {
        success: false,
        error: `Number picking starts on ${cycle.numberPickingStartDate.toLocaleDateString()}`,
      };
    }

    // Check if user is registered for this cycle
    const participation = await prisma.participation.findUnique({
      where: {
        userId_cycleId: {
          userId,
          cycleId: cycle.id,
        },
      },
    });

    if (!participation) {
      return {
        success: false,
        error: "You must join this cycle before picking a number",
      };
    }

    // Check if user already picked a number
    if (participation.pickedNumber) {
      return {
        success: false,
        error: "You have already picked a number",
        pickedNumber: participation.pickedNumber,
      };
    }

    // Check if number is already taken
    const numberTaken = await prisma.participation.findFirst({
      where: {
        cycleId: cycle.id,
        pickedNumber: number,
      },
    });

    if (numberTaken) {
      return {
        success: false,
        error: "This number has already been picked by another user",
      };
    }

    // Validate number is within range
    if (number < 1 || number > cycle.totalSlots) {
      return {
        success: false,
        error: `Number must be between 1 and ${cycle.totalSlots}`,
      };
    }

    // Pick the number
    const updated = await prisma.participation.update({
      where: { id: participation.id },
      data: { pickedNumber: number },
    });

    // Calculate payout date (cycle start + picked number months - 1)
    const payoutDate = new Date(cycle.startDate);
    payoutDate.setMonth(payoutDate.getMonth() + number - 1);
    payoutDate.setDate(cycle.paymentDeadlineDay);

    // Create payout schedule
    await prisma.payout.create({
      data: {
        participationId: participation.id,
        userId,
        cycleId: cycle.id,
        amount: participation.totalPayout,
        scheduledMonth: number,
        scheduledDate: payoutDate,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/pick-number");

    return {
      success: true,
      pick: {
        id: updated.id,
        number: updated.pickedNumber,
      },
    };
  } catch (error) {
    console.error("Error picking number:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function getUserPick(userId: string) {
  try {
    const cycle = await prisma.contributionCycle.findFirst({
      where: { status: "ACTIVE" },
    });

    if (!cycle) return null;

    const participation = await prisma.participation.findUnique({
      where: {
        userId_cycleId: {
          userId,
          cycleId: cycle.id,
        },
      },
      include: {
        payout: true,
      },
    });

    if (!participation?.pickedNumber) return null;

    return {
      number: participation.pickedNumber,
      payoutDate: participation.payout?.scheduledDate,
    };
  } catch (error) {
    console.error("Error getting user pick:", error);
    return null;
  }
}

export async function getAllPicks() {
  try {
    const cycle = await prisma.contributionCycle.findFirst({
      where: { status: "ACTIVE" },
    });

    if (!cycle) return [];

    const picks = await prisma.participation.findMany({
      where: {
        cycleId: cycle.id,
        pickedNumber: { not: null },
      },
      select: {
        pickedNumber: true,
      },
    });

    return picks
      .map((p) => p.pickedNumber)
      .filter((n): n is number => n !== null);
  } catch (error) {
    console.error("Error getting all picks:", error);
    return [];
  }
}

export async function checkUserParticipation(userId: string) {
  try {
    const cycle = await prisma.contributionCycle.findFirst({
      where: { status: "ACTIVE" },
    });

    if (!cycle) return false;

    const participation = await prisma.participation.findUnique({
      where: {
        userId_cycleId: {
          userId,
          cycleId: cycle.id,
        },
      },
    });

    return !!participation;
  } catch (error) {
    console.error("Error checking participation:", error);
    return false;
  }
}