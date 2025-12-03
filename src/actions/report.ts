/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "../lib/prisma";

// Get financial summary report
export async function getFinancialSummary(cycleId?: string) {
  try {
    const where: any = {};
    if (cycleId) {
      where.cycleId = cycleId;
    }

    // Total collections
    const paidPayments = await prisma.payment.findMany({
      where: { ...where, status: "PAID" },
      select: { paidAmount: true, fineAmount: true, hasFine: true },
    });

    const totalCollected = paidPayments.reduce(
      (sum, p) => sum + (p.paidAmount || 0),
      0
    );

    const totalFines = paidPayments.reduce(
      (sum, p) => sum + (p.hasFine ? p.fineAmount : 0),
      0
    );

    // Pending collections
    const pendingPayments = await prisma.payment.findMany({
      where: { ...where, status: "PENDING" },
      select: { amount: true, fineAmount: true, dueDate: true },
    });

    const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
    
    const overdueAmount = pendingPayments
      .filter((p) => new Date() > p.dueDate)
      .reduce((sum, p) => sum + p.amount + p.fineAmount, 0);

    // Payouts
    const completedPayouts = await prisma.payout.aggregate({
      where: { ...where, status: "PAID" },
      _sum: { amount: true },
      _count: true,
    });

    const pendingPayouts = await prisma.payout.aggregate({
      where: { ...where, status: "PENDING" },
      _sum: { amount: true },
      _count: true,
    });

    // Calculate profit (collections - payouts)
    const totalPayouts = completedPayouts._sum.amount || 0;
    const profit = totalCollected - totalPayouts;

    return {
      collections: {
        total: totalCollected,
        fines: totalFines,
        pending: pendingAmount,
        overdue: overdueAmount,
      },
      payouts: {
        completed: {
          amount: totalPayouts,
          count: completedPayouts._count,
        },
        pending: {
          amount: pendingPayouts._sum.amount || 0,
          count: pendingPayouts._count,
        },
      },
      profit,
      netBalance: totalCollected - totalPayouts,
    };
  } catch (error) {
    console.error("Error getting financial summary:", error);
    throw error;
  }
}

// Get defaulters report
export async function getDefaultersReport(cycleId?: string) {
  try {
    const where: any = {
      status: "PENDING",
      dueDate: { lt: new Date() },
    };

    if (cycleId) {
      where.cycleId = cycleId;
    }

    const overduePayments = await prisma.payment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
        participation: {
          select: {
            contributionMode: true,
            cycle: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    // Group by user
    const defaultersByUser = overduePayments.reduce((acc, payment) => {
      const userId = payment.userId;
      if (!acc[userId]) {
        acc[userId] = {
          userId: payment.user.id,
          userName: payment.user.fullName,
          userPhone: payment.user.phone,
          userEmail: payment.user.email,
          overduePayments: [],
          totalOverdue: 0,
          totalFines: 0,
        };
      }

      const isOverdue = new Date() > payment.dueDate;
      const fineAmount = isOverdue ? payment.participation.contributionMode === "PACK_20K" ? 2000 : payment.participation.contributionMode === "PACK_50K" ? 2500 : 5000 : 0;

      acc[userId].overduePayments.push({
        id: payment.id,
        cycleName: payment.participation.cycle.name,
        monthNumber: payment.monthNumber,
        amount: payment.amount,
        dueDate: payment.dueDate,
        fineAmount,
        daysPastDue: Math.floor(
          (new Date().getTime() - payment.dueDate.getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      });

      acc[userId].totalOverdue += payment.amount + fineAmount;
      acc[userId].totalFines += fineAmount;

      return acc;
    }, {} as Record<string, any>);

    return Object.values(defaultersByUser).sort(
      (a: any, b: any) => b.totalOverdue - a.totalOverdue
    );
  } catch (error) {
    console.error("Error getting defaulters report:", error);
    return [];
  }
}

// Get cycle performance report
export async function getCyclePerformance() {
  try {
    const cycles = await prisma.contributionCycle.findMany({
      include: {
        participations: {
          include: {
            payments: {
              where: { status: "PAID" },
            },
          },
        },
        payments: {
          where: { status: "PENDING" },
        },
        payouts: true,
      },
      orderBy: { startDate: "desc" },
    });

    return cycles.map((cycle) => {
      const totalParticipants = cycle.participations.length;
      const totalSlots = cycle.totalSlots;
      const occupancyRate = (totalParticipants / totalSlots) * 100;

      const totalCollected = cycle.participations.reduce((sum, p) => {
        return (
          sum +
          p.payments.reduce((pSum, pay) => pSum + (pay.paidAmount || 0), 0)
        );
      }, 0);

      const pendingPayments = cycle.payments.length;
      const overduePayments = cycle.payments.filter(
        (p) => new Date() > p.dueDate
      ).length;

      const completedPayouts = cycle.payouts.filter((p) => p.status === "PAID")
        .length;
      const pendingPayouts = cycle.payouts.filter((p) => p.status === "PENDING")
        .length;

      const totalExpectedCollection =
        cycle.participations.length *
        (cycle.participations[0]?.monthlyAmount || 0) *
        Math.ceil(
          (cycle.endDate.getTime() - cycle.startDate.getTime()) /
            (1000 * 60 * 60 * 24 * 30)
        );

      const collectionRate =
        totalExpectedCollection > 0
          ? (totalCollected / totalExpectedCollection) * 100
          : 0;

      return {
        id: cycle.id,
        name: cycle.name,
        status: cycle.status,
        startDate: cycle.startDate,
        endDate: cycle.endDate,
        participants: {
          total: totalParticipants,
          capacity: totalSlots,
          occupancyRate: Math.round(occupancyRate),
        },
        payments: {
          pending: pendingPayments,
          overdue: overduePayments,
        },
        collections: {
          total: totalCollected,
          expected: totalExpectedCollection,
          collectionRate: Math.round(collectionRate),
        },
        payouts: {
          completed: completedPayouts,
          pending: pendingPayouts,
        },
      };
    });
  } catch (error) {
    console.error("Error getting cycle performance:", error);
    return [];
  }
}

// Get monthly reconciliation report
export async function getMonthlyReconciliation(month: number, year: number) {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Payments received in this month
    const paymentsReceived = await prisma.payment.findMany({
      where: {
        status: "PAID",
        paidAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: {
          select: { fullName: true },
        },
        participation: {
          select: {
            cycle: {
              select: { name: true },
            },
          },
        },
      },
    });

    const totalReceived = paymentsReceived.reduce(
      (sum, p) => sum + (p.paidAmount || 0),
      0
    );

    const finesReceived = paymentsReceived.reduce(
      (sum, p) => sum + (p.hasFine ? p.fineAmount : 0),
      0
    );

    // Payouts made in this month
    const payoutsMade = await prisma.payout.findMany({
      where: {
        status: "PAID",
        paidAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: {
          select: { fullName: true },
        },
        participation: {
          select: {
            cycle: {
              select: { name: true },
            },
          },
        },
      },
    });

    const totalPaidOut = payoutsMade.reduce((sum, p) => sum + p.amount, 0);

    // Net cash flow
    const netCashFlow = totalReceived - totalPaidOut;

    return {
      month,
      year,
      period: {
        start: startDate,
        end: endDate,
      },
      payments: {
        count: paymentsReceived.length,
        total: totalReceived,
        fines: finesReceived,
        details: paymentsReceived.map((p) => ({
          id: p.id,
          userName: p.user.fullName,
          cycleName: p.participation.cycle.name,
          amount: p.paidAmount,
          paidAt: p.paidAt,
          hasFine: p.hasFine,
          fineAmount: p.fineAmount,
        })),
      },
      payouts: {
        count: payoutsMade.length,
        total: totalPaidOut,
        details: payoutsMade.map((p) => ({
          id: p.id,
          userName: p.user.fullName,
          cycleName: p.participation.cycle.name,
          amount: p.amount,
          paidAt: p.paidAt,
          transferReference: p.transferReference,
        })),
      },
      summary: {
        totalReceived,
        totalPaidOut,
        netCashFlow,
        finesCollected: finesReceived,
      },
    };
  } catch (error) {
    console.error("Error getting monthly reconciliation:", error);
    throw error;
  }
}

// Get payment trends (last 12 months)
export async function getPaymentTrends() {
  try {
    const trends = [];
    const currentDate = new Date();

    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const nextMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i + 1,
        1
      );

      const payments = await prisma.payment.aggregate({
        where: {
          status: "PAID",
          paidAt: {
            gte: monthDate,
            lt: nextMonth,
          },
        },
        _sum: {
          paidAmount: true,
        },
        _count: true,
      });

      trends.push({
        month: monthDate.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        amount: payments._sum.paidAmount || 0,
        count: payments._count,
      });
    }

    return trends;
  } catch (error) {
    console.error("Error getting payment trends:", error);
    return [];
  }
}

// Export data to CSV format
export async function exportReportData(reportType: string, data: any) {
  try {
    let csv = "";

    switch (reportType) {
      case "financial":
        csv = "Category,Amount\n";
        csv += `Total Collections,${data.collections.total}\n`;
        csv += `Fines Collected,${data.collections.fines}\n`;
        csv += `Pending Collections,${data.collections.pending}\n`;
        csv += `Overdue Collections,${data.collections.overdue}\n`;
        csv += `Completed Payouts,${data.payouts.completed.amount}\n`;
        csv += `Pending Payouts,${data.payouts.pending.amount}\n`;
        csv += `Net Balance,${data.netBalance}\n`;
        csv += `Profit,${data.profit}\n`;
        break;

      case "defaulters":
        csv = "Name,Phone,Email,Total Overdue,Total Fines,Overdue Payments\n";
        data.forEach((d: any) => {
          csv += `${d.userName},${d.userPhone},${d.userEmail || "N/A"},${
            d.totalOverdue
          },${d.totalFines},${d.overduePayments.length}\n`;
        });
        break;

      case "cycles":
        csv = "Cycle,Status,Participants,Occupancy Rate,Total Collected,Collection Rate\n";
        data.forEach((c: any) => {
          csv += `${c.name},${c.status},${c.participants.total}/${c.participants.capacity},${c.participants.occupancyRate}%,${c.collections.total},${c.collections.collectionRate}%\n`;
        });
        break;
    }

    return csv;
  } catch (error) {
    console.error("Error exporting report data:", error);
    return "";
  }
}