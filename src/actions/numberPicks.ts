"use server";

import prisma from "../lib/prisma";
import { revalidatePath } from "next/cache";

// Constants for restricted numbers
const HOUSE_RESERVED_NUMBERS = [1, 2];

export async function getActiveCycle(userId?: string) {
  try {
    let cycle;

    if (userId) {
      // Get the cycle the user is participating in
      const participation = await prisma.participation.findFirst({
        where: {
          userId,
          cycle: { status: "ACTIVE" },
        },
        include: {
          cycle: true,
        },
      });

      cycle = participation?.cycle;
    } else {
      // Fallback to any active cycle
      cycle = await prisma.contributionCycle.findFirst({
        where: {
          status: "ACTIVE",
        },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!cycle) {
      return {
        id: "",
        name: "",
        totalSlots: 20,
        status: "UPCOMING",
        canPickNumbers: false,
        hasActiveParticipation: false,
        displaySlots: 20,
      };
    }

    const canPickNumbers = cycle.numberPickingStartDate
      ? new Date() >= cycle.numberPickingStartDate
      : cycle.status === "ACTIVE";

    // Add reserved numbers to the total for display
    const displaySlots = cycle.totalSlots;

    return {
      id: cycle.id,
      name: cycle.name,
      totalSlots: cycle.totalSlots,
      displaySlots, // Total numbers to display (including reserved)
      status: cycle.status,
      canPickNumbers,
      numberPickingStartDate: cycle.numberPickingStartDate,
      hasActiveParticipation: userId ? true : false,
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
      displaySlots: 20,
    };
  }
}

export async function pickNumber(userId: string, number: number) {
  try {
    // Validate that number is not reserved for house
    if (HOUSE_RESERVED_NUMBERS.includes(number)) {
      return {
        success: false,
        error: `Number ${number} is reserved for house payouts and cannot be selected`,
      };
    }

    // Get the cycle the user is participating in
    const participation = await prisma.participation.findFirst({
      where: {
        userId,
        cycle: { status: "ACTIVE" },
      },
      include: {
        cycle: true,
        payout: true,
      },
    });

    if (!participation) {
      return {
        success: false,
        error: "You are not registered for any active cycle",
      };
    }

    const cycle = participation.cycle;
    console.log("User's active cycle:", cycle);

    // Check if number picking has started
    if (
      cycle.numberPickingStartDate &&
      new Date() < cycle.numberPickingStartDate
    ) {
      return {
        success: false,
        error: `Number picking starts on ${cycle.numberPickingStartDate.toLocaleDateString()}`,
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

    // Check if number is already taken in this cycle
    const numberTaken = await prisma.participation.findFirst({
      where: {
        cycleId: cycle.id,
        pickedNumber: number,
        NOT: {
          userId: userId,
        },
      },
    });

    if (numberTaken) {
      return {
        success: false,
        error: "This number has already been picked by another user",
      };
    }

    // Validate number is within range (including reserved numbers)
    const maxNumber = cycle.totalSlots;
    if (number < 1 || number > maxNumber) {
      return {
        success: false,
        error: `Number must be between 1 and ${maxNumber}`,
      };
    }

    // Calculate payout date (cycle start + picked number months - 1)
    const payoutDate = new Date(cycle.startDate);
    payoutDate.setMonth(payoutDate.getMonth() + number - 1);
    payoutDate.setDate(cycle.paymentDeadlineDay);

    // Use a transaction to update both participation and payout
    const result = await prisma.$transaction(async (tx) => {
      // Update participation with picked number
      const updated = await tx.participation.update({
        where: { id: participation.id },
        data: { pickedNumber: number },
      });

      // Check if payout already exists
      let payout = participation.payout;

      if (payout) {
        // Update existing payout
        payout = await tx.payout.update({
          where: { id: payout.id },
          data: {
            scheduledMonth: number,
            scheduledDate: payoutDate,
            amount: participation.totalPayout,
          },
        });
      } else {
        // Create new payout
        payout = await tx.payout.create({
          data: {
            participationId: participation.id,
            userId,
            cycleId: cycle.id,
            amount: participation.totalPayout,
            scheduledMonth: number,
            scheduledDate: payoutDate,
          },
        });
      }

      return { updated, payout };
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/pick-number");

    return {
      success: true,
      pick: {
        id: result.updated.id,
        number: result.updated.pickedNumber,
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
    // Get the user's participation in an active cycle
    const participation = await prisma.participation.findFirst({
      where: {
        userId,
        cycle: { status: "ACTIVE" },
      },
      include: {
        payout: true,
        cycle: true,
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

export async function getAllPicks(userId: string) {
  try {
    // Get the cycle the user is participating in
    const participation = await prisma.participation.findFirst({
      where: {
        userId,
        cycle: { status: "ACTIVE" },
      },
      include: {
        cycle: true,
      },
    });

    if (!participation) return [];

    // Get all picks from this specific cycle
    const picks = await prisma.participation.findMany({
      where: {
        cycleId: participation.cycleId,
        pickedNumber: { not: null },
      },
      select: {
        pickedNumber: true,
      },
    });

    // Add house reserved numbers to the taken list
    const userPicks = picks
      .map((p) => p.pickedNumber)
      .filter((n): n is number => n !== null);

    return [...HOUSE_RESERVED_NUMBERS, ...userPicks];
  } catch (error) {
    console.error("Error getting all picks:", error);
    return [];
  }
}

export async function checkUserParticipation(userId: string) {
  try {
    // Check if user has an active participation
    const participation = await prisma.participation.findFirst({
      where: {
        userId,
        cycle: { status: "ACTIVE" },
      },
    });

    return !!participation;
  } catch (error) {
    console.error("Error checking participation:", error);
    return false;
  }
}