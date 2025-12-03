
"use server";

import prisma from "../lib/prisma";

// Get user's payout information
export async function getUserPayoutInfo(userId: string) {
  try {
    const payouts = await prisma.payout.findMany({
      where: { userId },
      orderBy: { scheduledDate: "asc" },
      include: {
        participation: {
          include: {
            cycle: {
              select: {
                id: true,
                name: true,
                status: true,
                startDate: true,
                endDate: true,
              },
            },
            bankDetails: true,
          },
        },
      },
    });

    // Get active payout (next pending)
    const activePayout = payouts.find((p) => p.status === "PENDING");

    // Get completed payouts
    const completedPayouts = payouts.filter((p) => p.status === "PAID");

    // Calculate statistics
    const totalExpected = payouts.reduce((sum, p) => sum + p.amount, 0);
    const totalReceived = completedPayouts.reduce((sum, p) => sum + p.amount, 0);
    const totalPending = payouts
      .filter((p) => p.status === "PENDING")
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      payouts: payouts.map((p) => ({
        id: p.id,
        cycleName: p.participation.cycle.name,
        cycleStatus: p.participation.cycle.status,
        contributionMode: p.participation.contributionMode,
        amount: p.amount,
        scheduledMonth: p.scheduledMonth,
        scheduledDate: p.scheduledDate,
        paidAt: p.paidAt,
        status: p.status,
        transferReference: p.transferReference,
        notes: p.notes,
        bankDetails: p.participation.bankDetails
          ? {
              bankName: p.participation.bankDetails.bankName,
              accountNumber: p.participation.bankDetails.accountNumber,
              accountName: p.participation.bankDetails.accountName,
            }
          : null,
      })),
      activePayout: activePayout
        ? {
            id: activePayout.id,
            cycleName: activePayout.participation.cycle.name,
            amount: activePayout.amount,
            scheduledMonth: activePayout.scheduledMonth,
            scheduledDate: activePayout.scheduledDate,
            bankDetails: activePayout.participation.bankDetails,
          }
        : null,
      statistics: {
        totalExpected,
        totalReceived,
        totalPending,
        completedCount: completedPayouts.length,
        pendingCount: payouts.filter((p) => p.status === "PENDING").length,
      },
    };
  } catch (error) {
    console.error("Error getting user payout info:", error);
    return {
      payouts: [],
      activePayout: null,
      statistics: {
        totalExpected: 0,
        totalReceived: 0,
        totalPending: 0,
        completedCount: 0,
        pendingCount: 0,
      },
    };
  }
}

// Get payout timeline for visualization
export async function getPayoutTimeline(userId: string) {
  try {
    // Get active participation
    const activeCycle = await prisma.contributionCycle.findFirst({
      where: { status: "ACTIVE" },
    });

    if (!activeCycle) {
      return {
        timeline: [],
        currentMonth: 0,
        userPosition: null,
      };
    }

    // Get all payouts for this cycle
    const allPayouts = await prisma.payout.findMany({
      where: { cycleId: activeCycle.id },
      orderBy: { scheduledMonth: "asc" },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    // Get user's position
    const userPayout = allPayouts.find((p) => p.userId === userId);

    // Calculate current month in the cycle
    const now = new Date();
    const cycleStart = new Date(activeCycle.startDate);
    const monthsDiff =
      (now.getFullYear() - cycleStart.getFullYear()) * 12 +
      (now.getMonth() - cycleStart.getMonth()) +
      1;
    const currentMonth = Math.max(1, Math.min(monthsDiff, activeCycle.totalSlots));

    return {
      timeline: allPayouts.map((p) => ({
        month: p.scheduledMonth,
        userName: p.user.fullName,
        userId: p.user.id,
        status: p.status,
        amount: p.amount,
        scheduledDate: p.scheduledDate,
        isCurrentUser: p.userId === userId,
      })),
      currentMonth,
      userPosition: userPayout?.scheduledMonth || null,
      cycleName: activeCycle.name,
      totalSlots: activeCycle.totalSlots,
    };
  } catch (error) {
    console.error("Error getting payout timeline:", error);
    return {
      timeline: [],
      currentMonth: 0,
      userPosition: null,
      cycleName: "",
      totalSlots: 0,
    };
  }
}

// Get payout details
export async function getPayoutDetails(payoutId: string, userId: string) {
  try {
    const payout = await prisma.payout.findUnique({
      where: { id: payoutId },
      include: {
        participation: {
          include: {
            cycle: true,
            bankDetails: true,
            payments: {
              where: { status: "PAID" },
              orderBy: { monthNumber: "asc" },
            },
          },
        },
      },
    });

    if (!payout || payout.userId !== userId) {
      return null;
    }

    // Calculate contribution progress
    const totalPayments = payout.participation.cycle.totalSlots;
    const paidPayments = payout.participation.payments.length;
    const totalContributed = payout.participation.payments.reduce(
      (sum, p) => sum + (p.paidAmount || 0),
      0
    );

    return {
      id: payout.id,
      cycleName: payout.participation.cycle.name,
      cycleStatus: payout.participation.cycle.status,
      contributionMode: payout.participation.contributionMode,
      monthlyAmount: payout.participation.monthlyAmount,
      amount: payout.amount,
      scheduledMonth: payout.scheduledMonth,
      scheduledDate: payout.scheduledDate,
      paidAt: payout.paidAt,
      status: payout.status,
      transferReference: payout.transferReference,
      processedBy: payout.processedBy,
      notes: payout.notes,
      bankDetails: payout.participation.bankDetails,
      contributionProgress: {
        paid: paidPayments,
        total: totalPayments,
        percentage: Math.round((paidPayments / totalPayments) * 100),
        totalContributed,
      },
    };
  } catch (error) {
    console.error("Error getting payout details:", error);
    return null;
  }
}