"use server";

import { ContributionMode } from "@/generated/prisma/enums";
import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";
//import { ContributionMode } from "@/app/generated/prisma/enums";

export async function getCycleDetails(cycleId: string) {
  try {
    const cycle = await prisma.contributionCycle.findUnique({
      where: { id: cycleId },
      include: {
        participations: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!cycle) return null;

    const participantCount = cycle.participations.length;
    const availableSlots = cycle.totalSlots - participantCount;

    return {
      id: cycle.id,
      name: cycle.name,
      startDate: cycle.startDate,
      endDate: cycle.endDate,
      registrationDeadline: cycle.registrationDeadline,
      numberPickingStartDate: cycle.numberPickingStartDate,
      status: cycle.status,
      totalSlots: cycle.totalSlots,
      availableSlots,
      participantCount,
      paymentDeadlineDay: cycle.paymentDeadlineDay,
    };
  } catch (error) {
    console.error("Error getting cycle details:", error);
    return null;
  }
}

export async function checkUserParticipation(userId: string, cycleId: string) {
  try {
    const participation = await prisma.participation.findUnique({
      where: {
        userId_cycleId: {
          userId,
          cycleId,
        },
      },
    });

    return !!participation;
  } catch (error) {
    console.error("Error checking participation:", error);
    return false;
  }
}

export async function joinCycle(prevState: unknown, formData: FormData) {
  const userId = formData.get("userId") as string;
  const cycleId = formData.get("cycleId") as string;
  const contributionMode = formData.get("contributionMode") as ContributionMode;
  const bankName = formData.get("bankName") as string;
  const accountNumber = formData.get("accountNumber") as string;
  const accountName = formData.get("accountName") as string;

  // Validation
  if (!userId || !cycleId || !contributionMode) {
    return {
      success: false,
      error: "Missing required fields",
    };
  }

  if (!bankName || !accountNumber || !accountName) {
    return {
      success: false,
      error: "Bank details are required",
    };
  }

  // Validate account number (10 digits for Nigerian banks)
  if (!/^\d{10}$/.test(accountNumber)) {
    return {
      success: false,
      error: "Account number must be 10 digits",
    };
  }

  try {
    // Check if cycle exists and is open for registration
    const cycle = await prisma.contributionCycle.findUnique({
      where: { id: cycleId },
    });

    if (!cycle) {
      return {
        success: false,
        error: "Cycle not found",
      };
    }

    if (cycle.registrationDeadline < new Date()) {
      return {
        success: false,
        error: "Registration deadline has passed",
      };
    }

    if (cycle.status === "COMPLETED" || cycle.status === "CANCELLED") {
      return {
        success: false,
        error: "This cycle is no longer accepting registrations",
      };
    }

    // Check if user already registered
    const existingParticipation = await prisma.participation.findUnique({
      where: {
        userId_cycleId: {
          userId,
          cycleId,
        },
      },
    });

    if (existingParticipation) {
      return {
        success: false,
        error: "You are already registered for this cycle",
      };
    }

    // Check if slots are available
    const participantCount = await prisma.participation.count({
      where: { cycleId },
    });

    if (participantCount >= cycle.totalSlots) {
      return {
        success: false,
        error: "No available slots in this cycle",
      };
    }

    // Get system settings for financial details
    const settings = await prisma.systemSettings.findFirst();

    let monthlyAmount: number;
    let totalPayout: number;
    let fineAmount: number;

    switch (contributionMode) {
      case "PACK_20K":
        monthlyAmount = settings?.pack20kMonthly || 20000;
        totalPayout = settings?.pack20kPayout || 200000;
        fineAmount = settings?.pack20kFine || 2000;
        break;
      case "PACK_50K":
        monthlyAmount = settings?.pack50kMonthly || 50000;
        totalPayout = settings?.pack50kPayout || 500000;
        fineAmount = settings?.pack50kFine || 2500;
        break;
      case "PACK_100K":
        monthlyAmount = settings?.pack100kMonthly || 100000;
        totalPayout = settings?.pack100kPayout || 1000000;
        fineAmount = settings?.pack100kFine || 5000;
        break;
      default:
        return {
          success: false,
          error: "Invalid contribution mode",
        };
    }

    // Create participation with bank details in a transaction
    const participation = await prisma.$transaction(
      async (tx: {
        participation: {
          create: (arg0: {
            data: {
              userId: string;
              cycleId: string;
              contributionMode: ContributionMode;
              monthlyAmount: number;
              totalPayout: number;
              fineAmount: number;
            };
          }) => any;
        };
        bankDetails: {
          create: (arg0: {
            data: {
              participationId: any;
              bankName: string;
              accountNumber: string;
              accountName: string;
            };
          }) => any;
        };
      }) => {
        const newParticipation = await tx.participation.create({
          data: {
            userId,
            cycleId,
            contributionMode,
            monthlyAmount,
            totalPayout,
            fineAmount,
          },
        });

        await tx.bankDetails.create({
          data: {
            participationId: newParticipation.id,
            bankName,
            accountNumber,
            accountName,
          },
        });

        return newParticipation;
      },
    );

    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Successfully joined the cycle!",
      participationId: participation.id,
    };
  } catch (error) {
    console.error("Error joining cycle:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function getAvailableCycles() {
  try {
    const cycles = await prisma.contributionCycle.findMany({
      where: {
        OR: [{ status: "ACTIVE" }, { status: "UPCOMING" }],
        registrationDeadline: {
          gte: new Date(),
        },
      },
      include: {
        participations: {
          select: { id: true },
        },
      },
      orderBy: { startDate: "asc" },
    });

    return cycles.map(
      (cycle: {
        id: any;
        name: any;
        startDate: any;
        endDate: any;
        registrationDeadline: any;
        numberPickingStartDate: any;
        status: any;
        totalSlots: number;
        participations: string | any[];
      }) => ({
        id: cycle.id,
        name: cycle.name,
        startDate: cycle.startDate,
        endDate: cycle.endDate,
        registrationDeadline: cycle.registrationDeadline,
        numberPickingStartDate: cycle.numberPickingStartDate,
        status: cycle.status,
        totalSlots: cycle.totalSlots,
        availableSlots: cycle.totalSlots - cycle.participations.length,
        participantCount: cycle.participations.length,
      }),
    );
  } catch (error) {
    console.error("Error getting available cycles:", error);
    return [];
  }
}

export async function getSystemSettings() {
  try {
    let settings = await prisma.systemSettings.findFirst();

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {},
      });
    }

    return {
      pack20k: {
        monthly: settings.pack20kMonthly,
        payout: settings.pack20kPayout,
        fine: settings.pack20kFine,
      },
      pack50k: {
        monthly: settings.pack50kMonthly,
        payout: settings.pack50kPayout,
        fine: settings.pack50kFine,
      },
      pack100k: {
        monthly: settings.pack100kMonthly,
        payout: settings.pack100kPayout,
        fine: settings.pack100kFine,
      },
    };
  } catch (error) {
    console.error("Error getting system settings:", error);
    return {
      pack20k: { monthly: 20000, payout: 200000, fine: 2000 },
      pack50k: { monthly: 50000, payout: 500000, fine: 2500 },
      pack100k: { monthly: 100000, payout: 1000000, fine: 5000 },
    };
  }
}
