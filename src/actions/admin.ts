"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../lib/prisma";

// Check if user is admin
export async function verifyAdmin(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    });

    return user?.isAdmin || false;
  } catch (error) {
    console.error("Error verifying admin:", error);
    return false;
  }
}

// Get admin dashboard stats
export async function getAdminDashboardStats() {
  try {
    const [
      totalUsers,
      totalCycles,
      activeCycles,
      totalParticipations,
      pendingPayments,
      overduePayments,
      unverifiedPayments,
      pendingPayoutsCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.contributionCycle.count(),
      prisma.contributionCycle.count({ where: { status: "ACTIVE" } }),
      prisma.participation.count(),
      prisma.payment.count({ where: { status: "PENDING" } }),
      prisma.payment.count({
        where: {
          status: "PENDING",
          dueDate: { lt: new Date() },
        },
      }),
      prisma.payment.count({
        where: {
          proofOfPayment: { not: null },
          verifiedBy: null,
        },
      }),
      prisma.payout.count({ where: { status: "PENDING" } }),
    ]);

    // Calculate financial stats
    const paidPayments = await prisma.payment.findMany({
      where: { status: "PAID" },
      select: { paidAmount: true },
    });

    const totalCollected = paidPayments.reduce(
      (sum: any, p: { paidAmount: any }) => sum + (p.paidAmount || 0),
      0,
    );

    const finesCollected = await prisma.payment.aggregate({
      where: { hasFine: true },
      _sum: { fineAmount: true },
    });

    const pendingPayouts = await prisma.payout.aggregate({
      where: { status: "PENDING" },
      _sum: { amount: true },
    });

    return {
      users: {
        total: totalUsers,
        active: await prisma.user.count({ where: { status: "ACTIVE" } }),
        suspended: await prisma.user.count({ where: { status: "SUSPENDED" } }),
      },
      cycles: {
        total: totalCycles,
        active: activeCycles,
        upcoming: await prisma.contributionCycle.count({
          where: { status: "UPCOMING" },
        }),
      },
      participations: {
        total: totalParticipations,
        active: await prisma.participation.count({
          where: { hasOptedOut: false },
        }),
      },
      payments: {
        pending: pendingPayments,
        overdue: overduePayments,
        unverified: unverifiedPayments,
      },
      payouts: {
        pending: pendingPayoutsCount,
      },
      financial: {
        totalCollected,
        finesCollected: finesCollected._sum.fineAmount || 0,
        pendingPayouts: pendingPayouts._sum.amount || 0,
      },
    };
  } catch (error) {
    console.error("Error getting admin stats:", error);
    throw error;
  }
}

// Get recent activities
export async function getRecentActivities() {
  try {
    const recentPayments = await prisma.payment.findMany({
      where: { status: "PAID" },
      take: 5,
      orderBy: { paidAt: "desc" },
      include: {
        user: { select: { fullName: true } },
        participation: { select: { contributionMode: true } },
      },
    });

    const recentRegistrations = await prisma.participation.findMany({
      take: 5,
      orderBy: { registeredAt: "desc" },
      include: {
        user: { select: { fullName: true } },
        cycle: { select: { name: true } },
      },
    });

    return {
      recentPayments: recentPayments.map(
        (p: {
          id: any;
          user: { fullName: any };
          paidAmount: any;
          amount: any;
          monthNumber: any;
          paidAt: any;
        }) => ({
          id: p.id,
          userName: p.user.fullName,
          amount: p.paidAmount || p.amount,
          monthNumber: p.monthNumber,
          paidAt: p.paidAt,
        }),
      ),
      recentRegistrations: recentRegistrations.map(
        (r: {
          id: any;
          user: { fullName: any };
          cycle: { name: any };
          contributionMode: any;
          registeredAt: any;
        }) => ({
          id: r.id,
          userName: r.user.fullName,
          cycleName: r.cycle.name,
          contributionMode: r.contributionMode,
          registeredAt: r.registeredAt,
        }),
      ),
    };
  } catch (error) {
    console.error("Error getting recent activities:", error);
    return {
      recentPayments: [],
      recentRegistrations: [],
    };
  }
}

// Get payments needing verification
export async function getPaymentsNeedingVerification() {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        proofOfPayment: { not: null },
        verifiedBy: null,
      },
      orderBy: { updatedAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
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
    });

    return payments.map(
      (p: {
        id: any;
        userId: any;
        user: { fullName: any; phone: any };
        participation: { cycle: { name: any }; contributionMode: any };
        monthNumber: any;
        amount: any;
        dueDate: any;
        proofOfPayment: any;
        hasFine: any;
        fineAmount: any;
        updatedAt: any;
      }) => ({
        id: p.id,
        userId: p.userId,
        userName: p.user.fullName,
        userPhone: p.user.phone,
        cycleName: p.participation.cycle.name,
        contributionMode: p.participation.contributionMode,
        monthNumber: p.monthNumber,
        amount: p.amount,
        dueDate: p.dueDate,
        proofOfPayment: p.proofOfPayment,
        hasFine: p.hasFine,
        fineAmount: p.fineAmount,
        uploadedAt: p.updatedAt,
      }),
    );
  } catch (error) {
    console.error("Error getting payments needing verification:", error);
    return [];
  }
}

// Verify payment
export async function verifyPayment(
  paymentId: string,
  adminId: string,
  approved: boolean,
  notes?: string,
) {
  try {
    const isAdmin = await verifyAdmin(adminId);
    if (!isAdmin) {
      return {
        success: false,
        error: "Unauthorized: Admin access required",
      };
    }

    if (approved) {
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "PAID",
          paidAt: new Date(),
          verifiedBy: adminId,
          verifiedAt: new Date(),
          notes: notes || null,
        },
      });
    } else {
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          proofOfPayment: null,
          verifiedBy: adminId,
          verifiedAt: new Date(),
          notes: notes || "Payment proof rejected by admin",
        },
      });
    }

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/contributions");

    return {
      success: true,
      message: approved
        ? "Payment verified successfully"
        : "Payment proof rejected",
    };
  } catch (error) {
    console.error("Error verifying payment:", error);
    return {
      success: false,
      error: "Failed to verify payment",
    };
  }
}

// Get all users
export async function getAllUsers(page: number = 1, limit: number = 20) {
  try {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          participations: {
            select: {
              id: true,
              cycle: { select: { name: true } },
            },
          },
        },
      }),
      prisma.user.count(),
    ]);

    return {
      users: users.map(
        (u: {
          id: any;
          fullName: any;
          phone: any;
          email: any;
          occupation: any;
          status: any;
          isAdmin: any;
          createdAt: any;
          participations: string | any[];
        }) => ({
          id: u.id,
          fullName: u.fullName,
          phone: u.phone,
          email: u.email,
          occupation: u.occupation,
          status: u.status,
          isAdmin: u.isAdmin,
          createdAt: u.createdAt,
          participationCount: u.participations.length,
        }),
      ),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error getting all users:", error);
    return {
      users: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  }
}

// Get all cycles
export async function getAllCycles() {
  try {
    const cycles = await prisma.contributionCycle.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        participations: {
          select: { id: true },
        },
      },
    });

    return cycles.map(
      (c: {
        id: any;
        name: any;
        startDate: any;
        endDate: any;
        registrationDeadline: any;
        status: any;
        totalSlots: number;
        participations: string | any[];
      }) => ({
        id: c.id,
        name: c.name,
        startDate: c.startDate,
        endDate: c.endDate,
        registrationDeadline: c.registrationDeadline,
        status: c.status,
        totalSlots: c.totalSlots,
        participantCount: c.participations.length,
        availableSlots: c.totalSlots - c.participations.length,
      }),
    );
  } catch (error) {
    console.error("Error getting all cycles:", error);
    return [];
  }
}

// Suspend/Activate user
export async function toggleUserStatus(
  userId: string,
  adminId: string,
  action: "suspend" | "activate",
) {
  try {
    const isAdmin = await verifyAdmin(adminId);
    if (!isAdmin) {
      return {
        success: false,
        error: "Unauthorized: Admin access required",
      };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        status: action === "suspend" ? "SUSPENDED" : "ACTIVE",
      },
    });

    revalidatePath("/dashboard/admin");

    return {
      success: true,
      message: `User ${action === "suspend" ? "suspended" : "activated"} successfully`,
    };
  } catch (error) {
    console.error("Error toggling user status:", error);
    return {
      success: false,
      error: "Failed to update user status",
    };
  }
}
