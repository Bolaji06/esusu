/* eslint-disable @typescript-eslint/no-explicit-any */

"use server";

import prisma from "../lib/prisma";
import { revalidatePath } from "next/cache";

// Get all users with filters and pagination
export async function getAllUsersWithDetails(
  page: number = 1,
  limit: number = 20,
  searchTerm?: string,
  statusFilter?: string
) {
  try {
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (searchTerm) {
      where.OR = [
        { fullName: { contains: searchTerm, mode: "insensitive" } },
        { phone: { contains: searchTerm, mode: "insensitive" } },
        { email: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    if (statusFilter && statusFilter !== "all") {
      where.status = statusFilter.toUpperCase();
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          participations: {
            include: {
              cycle: {
                select: { name: true, status: true },
              },
              payments: {
                where: { status: "PAID" },
              },
            },
          },
          payments: {
            where: { status: "PENDING", dueDate: { lt: new Date() } },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users: users.map((u) => {
        const totalContributed = u.participations.reduce((sum, p) => {
          return (
            sum +
            p.payments.reduce((pSum, pay) => pSum + (pay.paidAmount || 0), 0)
          );
        }, 0);

        const overduePayments = u.payments.length;

        return {
          id: u.id,
          fullName: u.fullName,
          phone: u.phone,
          email: u.email,
          occupation: u.occupation,
          address: u.address,
          isAdmin: u.isAdmin,
          status: u.status,
          createdAt: u.createdAt,
          participationCount: u.participations.length,
          activeParticipations: u.participations.filter(
            (p) => p.cycle.status === "ACTIVE" && !p.hasOptedOut
          ).length,
          totalContributed,
          overduePayments,
        };
      }),
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

// Get single user details
export async function getUserDetails(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        participations: {
          include: {
            cycle: true,
            bankDetails: true,
            payments: {
              orderBy: { monthNumber: "asc" },
            },
            payout: true,
          },
        },
        payments: true,
        payouts: true,
        optOutRequests: {
          orderBy: { requestedAt: "desc" },
        },
      },
    });

    if (!user) {
      return null;
    }

    // Calculate statistics
    const totalContributed = user.participations.reduce((sum, p) => {
      return (
        sum +
        p.payments
          .filter((pay) => pay.status === "PAID")
          .reduce((pSum, pay) => pSum + (pay.paidAmount || 0), 0)
      );
    }, 0);

    const totalFines = user.participations.reduce((sum, p) => {
      return (
        sum +
        p.payments.reduce(
          (fSum, pay) => fSum + (pay.hasFine ? pay.fineAmount : 0),
          0
        )
      );
    }, 0);

    const overduePayments = user.payments.filter(
      (p) => p.status === "PENDING" && new Date() > p.dueDate
    ).length;

    const completedPayouts = user.payouts.filter((p) => p.status === "PAID")
      .length;
    const totalPayoutsReceived = user.payouts
      .filter((p) => p.status === "PAID")
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        occupation: user.occupation,
        address: user.address,
        isAdmin: user.isAdmin,
        status: user.status,
        createdAt: user.createdAt,
      },
      statistics: {
        totalContributed,
        totalFines,
        overduePayments,
        completedPayouts,
        totalPayoutsReceived,
        participationCount: user.participations.length,
        activeParticipations: user.participations.filter(
          (p) => p.cycle.status === "ACTIVE" && !p.hasOptedOut
        ).length,
      },
      participations: user.participations.map((p) => ({
        id: p.id,
        cycleName: p.cycle.name,
        cycleStatus: p.cycle.status,
        contributionMode: p.contributionMode,
        pickedNumber: p.pickedNumber,
        monthlyAmount: p.monthlyAmount,
        totalPayout: p.totalPayout,
        hasOptedOut: p.hasOptedOut,
        registeredAt: p.registeredAt,
        bankDetails: p.bankDetails,
        paidPayments: p.payments.filter((pay) => pay.status === "PAID").length,
        totalPayments: p.payments.length,
        payout: p.payout,
      })),
      recentPayments: user.payments
        .filter((p) => p.status === "PAID")
        .sort(
          (a, b) =>
            (b.paidAt?.getTime() || 0) - (a.paidAt?.getTime() || 0)
        )
        .slice(0, 5),
      optOutRequests: user.optOutRequests,
    };
  } catch (error) {
    console.error("Error getting user details:", error);
    return null;
  }
}

// Suspend user
export async function suspendUser(
  userId: string,
  adminId: string,
  reason: string
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

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    if (user.isAdmin) {
      return {
        success: false,
        error: "Cannot suspend admin users",
      };
    }

    if (user.status === "SUSPENDED") {
      return {
        success: false,
        error: "User is already suspended",
      };
    }

    // Suspend user
    await prisma.user.update({
      where: { id: userId },
      data: {
        status: "SUSPENDED",
      },
    });

    // Log the action (you can create an audit log table for this)
    console.log(
      `User ${userId} suspended by admin ${adminId}. Reason: ${reason}`
    );

    revalidatePath("/dashboard/admin/users");

    return {
      success: true,
      message: "User suspended successfully",
    };
  } catch (error) {
    console.error("Error suspending user:", error);
    return {
      success: false,
      error: "Failed to suspend user",
    };
  }
}

// Activate user
export async function activateUser(userId: string, adminId: string) {
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

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    if (user.status === "ACTIVE") {
      return {
        success: false,
        error: "User is already active",
      };
    }

    // Activate user
    await prisma.user.update({
      where: { id: userId },
      data: {
        status: "ACTIVE",
      },
    });

    console.log(`User ${userId} activated by admin ${adminId}`);

    revalidatePath("/dashboard/admin/users");

    return {
      success: true,
      message: "User activated successfully",
    };
  } catch (error) {
    console.error("Error activating user:", error);
    return {
      success: false,
      error: "Failed to activate user",
    };
  }
}

// Make user admin
export async function makeUserAdmin(userId: string, adminId: string) {
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

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    if (user.isAdmin) {
      return {
        success: false,
        error: "User is already an admin",
      };
    }

    // Make admin
    await prisma.user.update({
      where: { id: userId },
      data: {
        isAdmin: true,
      },
    });

    console.log(`User ${userId} made admin by ${adminId}`);

    revalidatePath("/dashboard/admin/users");

    return {
      success: true,
      message: "User is now an admin",
    };
  } catch (error) {
    console.error("Error making user admin:", error);
    return {
      success: false,
      error: "Failed to make user admin",
    };
  }
}

// Remove admin privileges
export async function removeAdminPrivileges(userId: string, adminId: string) {
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

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    if (!user.isAdmin) {
      return {
        success: false,
        error: "User is not an admin",
      };
    }

    // Prevent removing own admin privileges
    if (userId === adminId) {
      return {
        success: false,
        error: "You cannot remove your own admin privileges",
      };
    }

    // Remove admin
    await prisma.user.update({
      where: { id: userId },
      data: {
        isAdmin: false,
      },
    });

    console.log(`Admin privileges removed from user ${userId} by ${adminId}`);

    revalidatePath("/dashboard/admin/users");

    return {
      success: true,
      message: "Admin privileges removed",
    };
  } catch (error) {
    console.error("Error removing admin privileges:", error);
    return {
      success: false,
      error: "Failed to remove admin privileges",
    };
  }
}

// Get user management statistics
export async function getUserManagementStats() {
  try {
    const [totalUsers, activeUsers, suspendedUsers, adminUsers, newThisMonth] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: "ACTIVE" } }),
        prisma.user.count({ where: { status: "SUSPENDED" } }),
        prisma.user.count({ where: { isAdmin: true } }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1
              ),
            },
          },
        }),
      ]);

    return {
      totalUsers,
      activeUsers,
      suspendedUsers,
      adminUsers,
      newThisMonth,
    };
  } catch (error) {
    console.error("Error getting user management stats:", error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      suspendedUsers: 0,
      adminUsers: 0,
      newThisMonth: 0,
    };
  }
}

// Delete user (soft delete - mark as inactive)
export async function deleteUser(
  userId: string,
  adminId: string,
  reason: string
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

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        participations: {
          include: {
            cycle: { select: { status: true } },
          },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    if (user.isAdmin) {
      return {
        success: false,
        error: "Cannot delete admin users",
      };
    }

    // Check if user has active participations
    const hasActiveParticipations = user.participations.some(
      (p) => p.cycle.status === "ACTIVE" && !p.hasOptedOut
    );

    if (hasActiveParticipations) {
      return {
        success: false,
        error:
          "Cannot delete user with active participations. Please have them opt-out first.",
      };
    }

    // Instead of deleting, mark as suspended with special status
    await prisma.user.update({
      where: { id: userId },
      data: {
        status: "SUSPENDED",
      },
    });

    console.log(
      `User ${userId} deleted by admin ${adminId}. Reason: ${reason}`
    );

    revalidatePath("/dashboard/admin/users");

    return {
      success: true,
      message: "User account deactivated successfully",
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: "Failed to delete user",
    };
  }
}