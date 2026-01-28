"use server";

import { CycleStatus } from "@/generated/prisma/enums";
import { prisma } from "../lib/prisma";
import { revalidatePath } from "next/cache";

export interface ActionState {
  success: boolean;
  message?: string;
  error?: string;
  [key: string]: unknown;
}

export interface CycleUpdateData {
  name?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  registrationDeadline?: string | Date;
  numberPickingStartDate?: string | Date | null;
  status?: CycleStatus;
  totalSlots?: number;
  paymentDeadlineDay?: number;
}

// Verify admin access
async function verifyAdmin(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });
  return user?.isAdmin || false;
}

// Get all cycles with details
export async function getAllCyclesWithDetails() {
  try {
    const cycles = await prisma.contributionCycle.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        participations: {
          select: {
            id: true,
            pickedNumber: true,
            hasOptedOut: true,
          },
        },
        payments: {
          select: {
            id: true,
            status: true,
          },
        },
        payouts: {
          select: {
            id: true,
            status: true,
          },
        },
      },
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
        paymentDeadlineDay: any;
        createdAt: any;
        participations: {
          length: number;
          filter: (arg0: { (p: any): boolean; (p: any): boolean }) => {
            (): any;
            new (): any;
            length: any;
          };
        };
        payments: {
          length: any;
          filter: (arg0: { (p: any): boolean; (p: any): boolean }) => {
            (): any;
            new (): any;
            length: any;
          };
        };
        payouts: {
          length: any;
          filter: (arg0: (p: any) => boolean) => {
            (): any;
            new (): any;
            length: any;
          };
        };
      }) => ({
        id: cycle.id,
        name: cycle.name,
        startDate: cycle.startDate,
        endDate: cycle.endDate,
        registrationDeadline: cycle.registrationDeadline,
        numberPickingStartDate: cycle.numberPickingStartDate,
        status: cycle.status,
        totalSlots: cycle.totalSlots,
        paymentDeadlineDay: cycle.paymentDeadlineDay,
        createdAt: cycle.createdAt,
        // Stats
        totalParticipants: cycle.participations.length,
        activeParticipants: cycle.participations.filter(
          (p: { hasOptedOut: any }) => !p.hasOptedOut,
        ).length,
        pickedNumbers: cycle.participations.filter(
          (p: { pickedNumber: null }) => p.pickedNumber !== null,
        ).length,
        availableSlots: cycle.totalSlots - cycle.participations.length,
        // Payment stats
        totalPayments: cycle.payments.length,
        paidPayments: cycle.payments.filter(
          (p: { status: string }) => p.status === "PAID",
        ).length,
        pendingPayments: cycle.payments.filter(
          (p: { status: string }) => p.status === "PENDING",
        ).length,
        // Payout stats
        totalPayouts: cycle.payouts.length,
        completedPayouts: cycle.payouts.filter(
          (p: { status: string }) => p.status === "PAID",
        ).length,
      }),
    );
  } catch (error) {
    console.error("Error getting cycles:", error);
    return [];
  }
}

// Get single cycle details
export async function getCycleDetails(cycleId: string) {
  try {
    const cycle = await prisma.contributionCycle.findUnique({
      where: { id: cycleId },
      include: {
        participations: {
          include: {
            user: {
              select: {
                fullName: true,
                phone: true,
                email: true,
              },
            },
            bankDetails: true,
          },
        },
      },
    });

    if (!cycle) return null;

    return {
      id: cycle.id,
      name: cycle.name,
      startDate: cycle.startDate,
      endDate: cycle.endDate,
      registrationDeadline: cycle.registrationDeadline,
      numberPickingStartDate: cycle.numberPickingStartDate,
      status: cycle.status,
      totalSlots: cycle.totalSlots,
      paymentDeadlineDay: cycle.paymentDeadlineDay,
      createdAt: cycle.createdAt,
      participants: cycle.participations.map(
        (p: {
          id: any;
          user: { fullName: any; phone: any; email: any };
          contributionMode: any;
          pickedNumber: any;
          hasOptedOut: any;
          registeredAt: any;
          bankDetails: any;
        }) => ({
          id: p.id,
          userName: p.user.fullName,
          userPhone: p.user.phone,
          userEmail: p.user.email,
          contributionMode: p.contributionMode,
          pickedNumber: p.pickedNumber,
          hasOptedOut: p.hasOptedOut,
          registeredAt: p.registeredAt,
          hasBankDetails: !!p.bankDetails,
        }),
      ),
    };
  } catch (error) {
    console.error("Error getting cycle details:", error);
    return null;
  }
}

// Create new cycle
export async function createCycle(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const adminId = formData.get("adminId") as string;

  // Verify admin
  const isAdmin = await verifyAdmin(adminId);
  if (!isAdmin) {
    return {
      success: false,
      error: "Unauthorized: Admin access required",
    };
  }

  const name = formData.get("name") as string;
  const startDate = new Date(formData.get("startDate") as string);
  const endDate = new Date(formData.get("endDate") as string);
  const registrationDeadline = new Date(
    formData.get("registrationDeadline") as string,
  );
  const numberPickingStartDate = formData.get("numberPickingStartDate")
    ? new Date(formData.get("numberPickingStartDate") as string)
    : null;
  const status = formData.get("status") as CycleStatus;
  const totalSlots = parseInt(formData.get("totalSlots") as string);
  const paymentDeadlineDay = parseInt(
    formData.get("paymentDeadlineDay") as string,
  );

  // Validation
  if (!name?.trim()) {
    return { success: false, error: "Cycle name is required" };
  }

  if (endDate <= startDate) {
    return { success: false, error: "End date must be after start date" };
  }

  if (registrationDeadline >= startDate) {
    return {
      success: false,
      error: "Registration deadline must be before start date",
    };
  }

  if (totalSlots < 10 || totalSlots > 100) {
    return { success: false, error: "Total slots must be between 10 and 100" };
  }

  if (paymentDeadlineDay < 1 || paymentDeadlineDay > 31) {
    return {
      success: false,
      error: "Payment deadline day must be between 1 and 31",
    };
  }

  try {
    const cycle = await prisma.contributionCycle.create({
      data: {
        name,
        startDate,
        endDate,
        registrationDeadline,
        numberPickingStartDate,
        status,
        totalSlots,
        paymentDeadlineDay,
      },
    });

    revalidatePath("/dashboard/admin/cycles");

    return {
      success: true,
      message: "Cycle created successfully",
      cycleId: cycle.id,
    };
  } catch (error) {
    console.error("Error creating cycle:", error);
    return {
      success: false,
      error: "Failed to create cycle",
    };
  }
}

// Update cycle
export async function updateCycle(
  cycleId: string,
  adminId: string,
  data: CycleUpdateData,
): Promise<ActionState> {
  try {
    // Verify admin
    const isAdmin = await verifyAdmin(adminId);
    if (!isAdmin) {
      return {
        success: false,
        error: "Unauthorized: Admin access required",
      };
    }

    // Check if cycle exists
    const existingCycle = await prisma.contributionCycle.findUnique({
      where: { id: cycleId },
      include: {
        participations: {
          select: { pickedNumber: true },
        },
      },
    });

    if (!existingCycle) {
      return {
        success: false,
        error: "Cycle not found",
      };
    }

    // Validate total slots if changed
    if (data.totalSlots && data.totalSlots < existingCycle.totalSlots) {
      const maxPickedNumber = Math.max(
        ...existingCycle.participations
          .filter((p: { pickedNumber: null }) => p.pickedNumber !== null)
          .map((p: { pickedNumber: number }) => p.pickedNumber as number),
        0,
      );

      if (data.totalSlots < maxPickedNumber) {
        return {
          success: false,
          error: `Cannot reduce total slots below ${maxPickedNumber} as some users have already picked higher numbers`,
        };
      }
    }

    // Update cycle
    await prisma.contributionCycle.update({
      where: { id: cycleId },
      data: {
        name: data.name,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        registrationDeadline: data.registrationDeadline
          ? new Date(data.registrationDeadline)
          : undefined,
        numberPickingStartDate: data.numberPickingStartDate
          ? new Date(data.numberPickingStartDate)
          : undefined,
        status: data.status,
        totalSlots: data.totalSlots,
        paymentDeadlineDay: data.paymentDeadlineDay,
      },
    });

    revalidatePath("/dashboard/admin/cycles");

    return {
      success: true,
      message: "Cycle updated successfully",
    };
  } catch (error) {
    console.error("Error updating cycle:", error);
    return {
      success: false,
      error: "Failed to update cycle",
    };
  }
}

// Generate monthly payments for a cycle
export async function generateCyclePayments(
  cycleId: string,
  adminId: string,
): Promise<ActionState> {
  try {
    // Verify admin
    const isAdmin = await verifyAdmin(adminId);
    if (!isAdmin) {
      return {
        success: false,
        error: "Unauthorized: Admin access required",
      };
    }

    const cycle = await prisma.contributionCycle.findUnique({
      where: { id: cycleId },
      include: {
        participations: {
          where: { hasOptedOut: false },
        },
      },
    });

    if (!cycle) {
      return {
        success: false,
        error: "Cycle not found",
      };
    }

    // Check if payments already exist
    const existingPayments = await prisma.payment.count({
      where: { cycleId },
    });

    if (existingPayments > 0) {
      return {
        success: false,
        error: "Payments have already been generated for this cycle",
      };
    }

    // Calculate cycle duration in months
    const monthsDiff =
      (cycle.endDate.getFullYear() - cycle.startDate.getFullYear()) * 12 +
      (cycle.endDate.getMonth() - cycle.startDate.getMonth()) +
      1;

    const cycleDuration = Math.min(monthsDiff, cycle.totalSlots);

    // Generate payments for each participant
    for (const participation of cycle.participations) {
      for (let month = 1; month <= cycleDuration; month++) {
        const dueDate = new Date(cycle.startDate);
        dueDate.setMonth(dueDate.getMonth() + month - 1);
        dueDate.setDate(cycle.paymentDeadlineDay);

        await prisma.payment.create({
          data: {
            participationId: participation.id,
            userId: participation.userId,
            cycleId: cycle.id,
            monthNumber: month,
            dueDate,
            amount: participation.monthlyAmount,
          },
        });
      }
    }

    revalidatePath("/dashboard/admin/cycles");

    return {
      success: true,
      message: `Generated ${cycleDuration} months of payments for ${cycle.participations.length} participants`,
    };
  } catch (error) {
    console.error("Error generating payments:", error);
    return {
      success: false,
      error: "Failed to generate payments",
    };
  }
}

// Close cycle
export async function closeCycle(
  cycleId: string,
  adminId: string,
): Promise<ActionState> {
  try {
    // Verify admin
    const isAdmin = await verifyAdmin(adminId);
    if (!isAdmin) {
      return {
        success: false,
        error: "Unauthorized: Admin access required",
      };
    }

    // Check for pending payments or payouts
    const [pendingPayments, pendingPayouts] = await Promise.all([
      prisma.payment.count({
        where: { cycleId, status: "PENDING" },
      }),
      prisma.payout.count({
        where: { cycleId, status: "PENDING" },
      }),
    ]);

    if (pendingPayments > 0 || pendingPayouts > 0) {
      return {
        success: false,
        error: `Cannot close cycle: ${pendingPayments} pending payment(s) and ${pendingPayouts} pending payout(s) remaining`,
        pendingPayments,
        pendingPayouts,
      };
    }

    await prisma.contributionCycle.update({
      where: { id: cycleId },
      data: { status: "COMPLETED" },
    });

    revalidatePath("/dashboard/admin/cycles");

    return {
      success: true,
      message: "Cycle closed successfully",
    };
  } catch (error) {
    console.error("Error closing cycle:", error);
    return {
      success: false,
      error: "Failed to close cycle",
    };
  }
}

// Delete cycle (only if no participants)
export async function deleteCycle(
  cycleId: string,
  adminId: string,
): Promise<ActionState> {
  try {
    // Verify admin
    const isAdmin = await verifyAdmin(adminId);
    if (!isAdmin) {
      return {
        success: false,
        error: "Unauthorized: Admin access required",
      };
    }

    // Check if cycle has participants
    const participantCount = await prisma.participation.count({
      where: { cycleId },
    });

    if (participantCount > 0) {
      return {
        success: false,
        error: "Cannot delete cycle with participants. Close it instead.",
      };
    }

    await prisma.contributionCycle.delete({
      where: { id: cycleId },
    });

    revalidatePath("/dashboard/admin/cycles");

    return {
      success: true,
      message: "Cycle deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting cycle:", error);
    return {
      success: false,
      error: "Failed to delete cycle",
    };
  }
}
