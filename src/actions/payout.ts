"use server";

import { Prisma } from "@/app/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "../lib/prisma";

// Get all payouts with filters
export async function getAllPayouts(
  filter: "all" | "pending" | "completed" = "all",
) {
  try {
    const where: Prisma.PayoutWhereInput = {};

    if (filter === "pending") {
      where.status = "PENDING";
    } else if (filter === "completed") {
      where.status = "PAID";
    }

    const payouts = await prisma.payout.findMany({
      where,
      orderBy: { scheduledDate: "asc" },
      include: {
        user: {
          select: {
            fullName: true,
            phone: true,
            email: true,
          },
        },
        participation: {
          select: {
            contributionMode: true,
            cycle: {
              select: {
                name: true,
              },
            },
            bankDetails: true,
          },
        },
      },
    });

    return payouts.map(
      (p: {
        id: any;
        userId: any;
        user: { fullName: any; phone: any; email: any };
        participation: {
          cycle: { name: any };
          contributionMode: any;
          bankDetails: { bankName: any; accountNumber: any; accountName: any };
        };
        amount: any;
        scheduledMonth: any;
        scheduledDate: any;
        paidAt: any;
        status: any;
        transferReference: any;
        processedBy: any;
        notes: any;
      }) => ({
        id: p.id,
        userId: p.userId,
        userName: p.user.fullName,
        userPhone: p.user.phone,
        userEmail: p.user.email,
        cycleName: p.participation.cycle.name,
        contributionMode: p.participation.contributionMode,
        amount: p.amount,
        scheduledMonth: p.scheduledMonth,
        scheduledDate: p.scheduledDate,
        paidAt: p.paidAt,
        status: p.status,
        transferReference: p.transferReference,
        processedBy: p.processedBy,
        notes: p.notes,
        bankDetails: p.participation.bankDetails
          ? {
              bankName: p.participation.bankDetails.bankName,
              accountNumber: p.participation.bankDetails.accountNumber,
              accountName: p.participation.bankDetails.accountName,
            }
          : null,
      }),
    );
  } catch (error) {
    console.error("Error getting all payouts:", error);
    return [];
  }
}

// Get payout statistics
export async function getPayoutStats() {
  try {
    const [totalPayouts, pendingPayouts, completedPayouts, overduePayouts] =
      await Promise.all([
        prisma.payout.count(),
        prisma.payout.count({ where: { status: "PENDING" } }),
        prisma.payout.count({ where: { status: "PAID" } }),
        prisma.payout.count({
          where: {
            status: "PENDING",
            scheduledDate: { lt: new Date() },
          },
        }),
      ]);

    const pendingAmount = await prisma.payout.aggregate({
      where: { status: "PENDING" },
      _sum: { amount: true },
    });

    const completedAmount = await prisma.payout.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    });

    return {
      total: totalPayouts,
      pending: pendingPayouts,
      completed: completedPayouts,
      overdue: overduePayouts,
      pendingAmount: pendingAmount._sum.amount || 0,
      completedAmount: completedAmount._sum.amount || 0,
    };
  } catch (error) {
    console.error("Error getting payout stats:", error);
    return {
      total: 0,
      pending: 0,
      completed: 0,
      overdue: 0,
      pendingAmount: 0,
      completedAmount: 0,
    };
  }
}

// Get upcoming payouts (next 30 days)
export async function getUpcomingPayouts() {
  try {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const payouts = await prisma.payout.findMany({
      where: {
        status: "PENDING",
        scheduledDate: {
          gte: today,
          lte: thirtyDaysFromNow,
        },
      },
      orderBy: { scheduledDate: "asc" },
      take: 10,
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
        participation: {
          select: {
            cycle: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return payouts.map(
      (p: {
        id: any;
        user: { fullName: any };
        participation: { cycle: { name: any } };
        amount: any;
        scheduledDate: any;
        scheduledMonth: any;
      }) => ({
        id: p.id,
        userName: p.user.fullName,
        cycleName: p.participation.cycle.name,
        amount: p.amount,
        scheduledDate: p.scheduledDate,
        scheduledMonth: p.scheduledMonth,
      }),
    );
  } catch (error) {
    console.error("Error getting upcoming payouts:", error);
    return [];
  }
}

// Process payout
export async function processPayout(
  payoutId: string,
  adminId: string,
  transferReference: string,
  notes?: string,
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

    // Check if payout exists and is pending
    const payout = await prisma.payout.findUnique({
      where: { id: payoutId },
    });

    if (!payout) {
      return {
        success: false,
        error: "Payout not found",
      };
    }

    if (payout.status !== "PENDING") {
      return {
        success: false,
        error: "Payout has already been processed",
      };
    }

    // Validate transfer reference
    if (!transferReference.trim()) {
      return {
        success: false,
        error: "Transfer reference is required",
      };
    }

    // Update payout
    await prisma.payout.update({
      where: { id: payoutId },
      data: {
        status: "PAID",
        paidAt: new Date(),
        transferReference,
        processedBy: adminId,
        notes: notes || null,
      },
    });

    revalidatePath("/dashboard/admin/payouts");

    return {
      success: true,
      message: "Payout processed successfully",
    };
  } catch (error) {
    console.error("Error processing payout:", error);
    return {
      success: false,
      error: "Failed to process payout",
    };
  }
}

// Batch process payouts
export async function batchProcessPayouts(
  payoutIds: string[],
  adminId: string,
  baseReference: string,
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

    if (payoutIds.length === 0) {
      return {
        success: false,
        error: "No payouts selected",
      };
    }

    // Process each payout
    const results = await Promise.allSettled(
      payoutIds.map((id, index) =>
        prisma.payout.update({
          where: { id },
          data: {
            status: "PAID",
            paidAt: new Date(),
            transferReference: `${baseReference}-${index + 1}`,
            processedBy: adminId,
          },
        }),
      ),
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    revalidatePath("/dashboard/admin/payouts");

    return {
      success: true,
      message: `Processed ${successful} payout(s)${
        failed > 0 ? `, ${failed} failed` : ""
      }`,
      successful,
      failed,
    };
  } catch (error) {
    console.error("Error batch processing payouts:", error);
    return {
      success: false,
      error: "Failed to process payouts",
    };
  }
}

// Get user payout history (for user dashboard)
export async function getUserPayouts(userId: string) {
  try {
    const payouts = await prisma.payout.findMany({
      where: { userId },
      orderBy: { scheduledDate: "desc" },
      include: {
        participation: {
          select: {
            cycle: {
              select: {
                name: true,
              },
            },
            contributionMode: true,
          },
        },
      },
    });

    return payouts.map(
      (p: {
        id: any;
        participation: { cycle: { name: any }; contributionMode: any };
        amount: any;
        scheduledMonth: any;
        scheduledDate: any;
        paidAt: any;
        status: any;
        transferReference: any;
      }) => ({
        id: p.id,
        cycleName: p.participation.cycle.name,
        contributionMode: p.participation.contributionMode,
        amount: p.amount,
        scheduledMonth: p.scheduledMonth,
        scheduledDate: p.scheduledDate,
        paidAt: p.paidAt,
        status: p.status,
        transferReference: p.transferReference,
      }),
    );
  } catch (error) {
    console.error("Error getting user payouts:", error);
    return [];
  }
}
