"use server";

import prisma from "../lib/prisma";
import { revalidatePath } from "next/cache";

export interface ActionState {
  success: boolean;
  message?: string;
  error?: string;
  [key: string]: unknown;
}

// Get opt-out eligibility and calculations
export async function getOptOutInfo(userId: string) {
  try {
    // Get active participation
    const activeCycle = await prisma.contributionCycle.findFirst({
      where: { status: "ACTIVE" },
    });

    if (!activeCycle) {
      return {
        eligible: false,
        reason: "No active cycle found",
        participation: null,
      };
    }

    const participation = await prisma.participation.findUnique({
      where: {
        userId_cycleId: {
          userId,
          cycleId: activeCycle.id,
        },
      },
      include: {
        cycle: true,
        payments: {
          where: { status: "PAID" },
        },
        payout: true,
        bankDetails: true,
      },
    });

    if (!participation) {
      return {
        eligible: false,
        reason: "You are not participating in any active cycle",
        participation: null,
      };
    }

    if (participation.hasOptedOut) {
      return {
        eligible: false,
        reason: "You have already opted out of this cycle",
        participation: null,
      };
    }

    // Check if user has already received their payout
    if (participation.payout?.status === "PAID") {
      return {
        eligible: false,
        reason: "You have already received your payout and cannot opt out",
        participation: null,
      };
    }

    // Check for existing pending opt-out request
    const existingRequest = await prisma.optOutRequest.findFirst({
      where: {
        userId,
        cycleId: activeCycle.id,
        status: "PENDING_APPROVAL",
      },
    });

    if (existingRequest) {
      return {
        eligible: false,
        reason: "You already have a pending opt-out request",
        existingRequest: {
          id: existingRequest.id,
          requestedAt: existingRequest.requestedAt,
          status: existingRequest.status,
        },
        participation: null,
      };
    }

    // Get system settings for penalty calculation
    const settings = await prisma.systemSettings.findFirst();
    const penaltyPercent = settings?.optOutPenaltyPercent || 10;

    // Calculate totals
    const totalPaid = participation.payments.reduce(
      (sum, p) => sum + (p.paidAmount || 0),
      0
    );
    const penaltyAmount = Math.floor((totalPaid * penaltyPercent) / 100);
    const refundAmount = totalPaid - penaltyAmount;

    return {
      eligible: true,
      participation: {
        id: participation.id,
        cycleId: participation.cycleId,
        cycleName: participation.cycle.name,
        contributionMode: participation.contributionMode,
        monthlyAmount: participation.monthlyAmount,
        totalPayout: participation.totalPayout,
        pickedNumber: participation.pickedNumber,
        registeredAt: participation.registeredAt,
      },
      calculations: {
        totalPaid,
        penaltyPercent,
        penaltyAmount,
        refundAmount,
        paymentsMade: participation.payments.length,
      },
      bankDetails: participation.bankDetails,
    };
  } catch (error) {
    console.error("Error getting opt-out info:", error);
    return {
      eligible: false,
      reason: "An error occurred while checking opt-out eligibility",
      participation: null,
    };
  }
}

// Submit opt-out request
export async function submitOptOutRequest(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const userId = formData.get("userId") as string;
  const cycleId = formData.get("cycleId") as string;
  const reason = formData.get("reason") as string;

  // Validation
  if (!userId || !cycleId) {
    return {
      success: false,
      error: "Missing required information",
    };
  }

  if (!reason?.trim() || reason.trim().length < 10) {
    return {
      success: false,
      error: "Please provide a detailed reason (at least 10 characters)",
    };
  }

  try {
    // Verify eligibility
    const optOutInfo = await getOptOutInfo(userId);

    if (!optOutInfo.eligible) {
      return {
        success: false,
        error: optOutInfo.reason || "You are not eligible to opt out",
      };
    }

    // Check for existing request
    const existingRequest = await prisma.optOutRequest.findFirst({
      where: {
        userId,
        cycleId,
        status: "PENDING_APPROVAL",
      },
    });

    if (existingRequest) {
      return {
        success: false,
        error: "You already have a pending opt-out request",
      };
    }

    // Create opt-out request
    const request = await prisma.optOutRequest.create({
      data: {
        userId,
        cycleId,
        reason: reason.trim(),
        totalPaid: optOutInfo.calculations?.totalPaid || 0,
        penaltyAmount: optOutInfo.calculations?.penaltyAmount || 0,
        refundAmount: optOutInfo.calculations?.refundAmount || 0,
      },
    });

    revalidatePath("/dashboard/opt-out");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Opt-out request submitted successfully. Please wait for admin approval.",
      requestId: request.id,
    };
  } catch (error) {
    console.error("Error submitting opt-out request:", error);
    return {
      success: false,
      error: "Failed to submit opt-out request. Please try again.",
    };
  }
}

// Get user's opt-out requests
export async function getUserOptOutRequests(userId: string) {
  try {
    const requests = await prisma.optOutRequest.findMany({
      where: { userId },
      orderBy: { requestedAt: "desc" },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });

    // Get cycle names
    const cycleIds = [...new Set(requests.map((r) => r.cycleId))];
    const cycles = await prisma.contributionCycle.findMany({
      where: { id: { in: cycleIds } },
      select: { id: true, name: true },
    });
    const cycleMap = new Map(cycles.map((c) => [c.id, c.name]));

    return requests.map((r) => ({
      id: r.id,
      cycleName: cycleMap.get(r.cycleId) || "Unknown Cycle",
      reason: r.reason,
      status: r.status,
      totalPaid: r.totalPaid,
      penaltyAmount: r.penaltyAmount,
      refundAmount: r.refundAmount,
      requestedAt: r.requestedAt,
      reviewedAt: r.reviewedAt,
      reviewNotes: r.reviewNotes,
    }));
  } catch (error) {
    console.error("Error getting user opt-out requests:", error);
    return [];
  }
}

// Cancel opt-out request (by user)
export async function cancelOptOutRequest(requestId: string, userId: string) {
  try {
    const request = await prisma.optOutRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return {
        success: false,
        error: "Request not found",
      };
    }

    if (request.userId !== userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    if (request.status !== "PENDING_APPROVAL") {
      return {
        success: false,
        error: "Only pending requests can be cancelled",
      };
    }

    await prisma.optOutRequest.delete({
      where: { id: requestId },
    });

    revalidatePath("/dashboard/opt-out");

    return {
      success: true,
      message: "Opt-out request cancelled successfully",
    };
  } catch (error) {
    console.error("Error cancelling opt-out request:", error);
    return {
      success: false,
      error: "Failed to cancel request",
    };
  }
}

// Admin: Get all pending opt-out requests
export async function getPendingOptOutRequests() {
  try {
    const requests = await prisma.optOutRequest.findMany({
      where: { status: "PENDING_APPROVAL" },
      orderBy: { requestedAt: "asc" },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    // Get cycle names
    const cycleIds = [...new Set(requests.map((r) => r.cycleId))];
    const cycles = await prisma.contributionCycle.findMany({
      where: { id: { in: cycleIds } },
      select: { id: true, name: true },
    });
    const cycleMap = new Map(cycles.map((c) => [c.id, c.name]));

    return requests.map((r) => ({
      id: r.id,
      userId: r.user.id,
      userName: r.user.fullName,
      userPhone: r.user.phone,
      userEmail: r.user.email,
      cycleId: r.cycleId,
      cycleName: cycleMap.get(r.cycleId) || "Unknown Cycle",
      reason: r.reason,
      totalPaid: r.totalPaid,
      penaltyAmount: r.penaltyAmount,
      refundAmount: r.refundAmount,
      requestedAt: r.requestedAt,
    }));
  } catch (error) {
    console.error("Error getting pending opt-out requests:", error);
    return [];
  }
}

// Admin: Review opt-out request
export async function reviewOptOutRequest(
  requestId: string,
  adminId: string,
  approved: boolean,
  notes?: string
) {
  try {
    // Verify admin
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { isAdmin: true },
    });

    if (!admin?.isAdmin) {
      return {
        success: false,
        error: "Unauthorized: Admin access required",
      };
    }

    const request = await prisma.optOutRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return {
        success: false,
        error: "Request not found",
      };
    }

    if (request.status !== "PENDING_APPROVAL") {
      return {
        success: false,
        error: "Request has already been reviewed",
      };
    }

    // Update request status
    await prisma.optOutRequest.update({
      where: { id: requestId },
      data: {
        status: approved ? "APPROVED" : "REJECTED",
        reviewedAt: new Date(),
        reviewedBy: adminId,
        reviewNotes: notes || null,
      },
    });

    if (approved) {
      // Update participation
      await prisma.participation.updateMany({
        where: {
          userId: request.userId,
          cycleId: request.cycleId,
        },
        data: {
          hasOptedOut: true,
        },
      });

      // Update user status
      await prisma.user.update({
        where: { id: request.userId },
        data: {
          status: "OPTED_OUT",
        },
      });

      // Cancel any pending payout
      await prisma.payout.updateMany({
        where: {
          userId: request.userId,
          cycleId: request.cycleId,
          status: "PENDING",
        },
        data: {
          status: "WAIVED",
          notes: "Cancelled due to opt-out",
        },
      });
    }

    revalidatePath("/dashboard/admin/opt-outs");
    revalidatePath("/dashboard/opt-out");

    return {
      success: true,
      message: approved
        ? "Opt-out request approved. User has been removed from the cycle."
        : "Opt-out request rejected.",
    };
  } catch (error) {
    console.error("Error reviewing opt-out request:", error);
    return {
      success: false,
      error: "Failed to review request",
    };
  }
}

// Get opt-out statistics (admin)
export async function getOptOutStats() {
  try {
    const [pending, approved, rejected] = await Promise.all([
      prisma.optOutRequest.count({ where: { status: "PENDING_APPROVAL" } }),
      prisma.optOutRequest.count({ where: { status: "APPROVED" } }),
      prisma.optOutRequest.count({ where: { status: "REJECTED" } }),
    ]);

    const totalRefunded = await prisma.optOutRequest.aggregate({
      where: { status: "APPROVED" },
      _sum: { refundAmount: true },
    });

    const totalPenalties = await prisma.optOutRequest.aggregate({
      where: { status: "APPROVED" },
      _sum: { penaltyAmount: true },
    });

    return {
      pending,
      approved,
      rejected,
      totalRefunded: totalRefunded._sum.refundAmount || 0,
      totalPenalties: totalPenalties._sum.penaltyAmount || 0,
    };
  } catch (error) {
    console.error("Error getting opt-out stats:", error);
    return {
      pending: 0,
      approved: 0,
      rejected: 0,
      totalRefunded: 0,
      totalPenalties: 0,
    };
  }
}