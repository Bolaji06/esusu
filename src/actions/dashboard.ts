"use server";

import prisma from "../lib/prisma";

export async function getDashboardData(userId: string) {
  try {
    // Get user with participations
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        participations: {
          include: {
            cycle: true,
            payments: {
              orderBy: { monthNumber: "asc" },
            },
            payout: true,
          },
          orderBy: { registeredAt: "desc" },
        },
      },
    });

    if (!user) {
      return null;
    }

    // Get active participation
    const activeParticipation = user.participations.find(
      (p) => p.cycle.status === "ACTIVE" && !p.hasOptedOut
    );

    // Calculate statistics
    const totalContributed = user.participations.reduce((sum, p) => {
      const paidPayments = p.payments.filter((pay) => pay.status === "PAID");
      return (
        sum +
        paidPayments.reduce((paySum, pay) => paySum + (pay.paidAmount || 0), 0)
      );
    }, 0);

    const pendingPayments = activeParticipation
      ? activeParticipation.payments.filter((p) => p.status === "PENDING")
          .length
      : 0;

    const overduePayments = activeParticipation
      ? activeParticipation.payments.filter((p) => {
          return p.status === "PENDING" && new Date() > p.dueDate;
        }).length
      : 0;

    const totalFines = user.participations.reduce((sum, p) => {
      return (
        sum +
        p.payments.reduce(
          (fineSum, pay) => fineSum + (pay.hasFine ? pay.fineAmount : 0),
          0
        )
      );
    }, 0);

    const expectedPayout = activeParticipation
      ? activeParticipation.totalPayout
      : 0;

    return {
      user: {
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        occupation: user.occupation,
        address: user.address,
        status: user.status,
      },
      activeParticipation: activeParticipation
        ? {
            id: activeParticipation.id,
            cycleName: activeParticipation.cycle.name,
            contributionMode: activeParticipation.contributionMode,
            pickedNumber: activeParticipation.pickedNumber,
            monthlyAmount: activeParticipation.monthlyAmount,
            totalPayout: activeParticipation.totalPayout,
            registeredAt: activeParticipation.registeredAt,
            payoutScheduled: activeParticipation.payout?.scheduledDate,
            payoutStatus: activeParticipation.payout?.status,
          }
        : null,
      stats: {
        totalContributed,
        pendingPayments,
        overduePayments,
        totalFines,
        expectedPayout,
      },
      recentPayments: activeParticipation
        ? activeParticipation.payments.slice(0, 5).map((p) => ({
            id: p.id,
            monthNumber: p.monthNumber,
            amount: p.amount,
            dueDate: p.dueDate,
            paidAt: p.paidAt,
            status: p.status,
            hasFine: p.hasFine,
            fineAmount: p.fineAmount,
          }))
        : [],
      allParticipations: user.participations.map((p) => ({
        id: p.id,
        cycleName: p.cycle.name,
        status: p.cycle.status,
        contributionMode: p.contributionMode,
        hasOptedOut: p.hasOptedOut,
      })),
    };
  } catch (error) {
    console.error("Error getting dashboard data:", error);
    return null;
  }
}

export async function getActiveCycles() {
  try {
    const cycles = await prisma.contributionCycle.findMany({
      where: {
        OR: [{ status: "ACTIVE" }, { status: "UPCOMING" }],
        registrationDeadline: {
          gte: new Date(),
        },
      },
      orderBy: { startDate: "asc" },
    });

    return cycles.map((c) => ({
      id: c.id,
      name: c.name,
      startDate: c.startDate,
      endDate: c.endDate,
      registrationDeadline: c.registrationDeadline,
      totalSlots: c.totalSlots,
      status: c.status,
    }));
  } catch (error) {
    console.error("Error getting active cycles:", error);
    return [];
  }
}
