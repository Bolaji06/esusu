/* eslint-disable @typescript-eslint/no-explicit-any */

"use server";

import prisma from "../lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// Get user profile
export async function getUserProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        participations: {
          include: {
            cycle: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
            bankDetails: true,
            payout: true,
          },
          orderBy: { registeredAt: "desc" },
        },
      },
    });

    if (!user) {
      return null;
    }

    // Get active participation with bank details
    const activeParticipation = user.participations.find(
      (p) => p.cycle.status === "ACTIVE" && !p.hasOptedOut
    );

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        occupation: user.occupation,
        address: user.address,
        status: user.status,
        createdAt: user.createdAt,
      },
      activeParticipation: activeParticipation
        ? {
            id: activeParticipation.id,
            cycleId: activeParticipation.cycleId,
            cycleName: activeParticipation.cycle.name,
            contributionMode: activeParticipation.contributionMode,
            pickedNumber: activeParticipation.pickedNumber,
            bankDetails: activeParticipation.bankDetails,
          }
        : null,
      participationHistory: user.participations.map((p) => ({
        id: p.id,
        cycleName: p.cycle.name,
        cycleStatus: p.cycle.status,
        contributionMode: p.contributionMode,
        hasOptedOut: p.hasOptedOut,
        registeredAt: p.registeredAt,
      })),
    };
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
}

// Update personal information
export async function updatePersonalInfo(
  prevState: any,
  formData: FormData
) {
  const userId = formData.get("userId") as string;
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const occupation = formData.get("occupation") as string;
  const address = formData.get("address") as string;

  // Validation
  if (!userId || !fullName?.trim()) {
    return {
      success: false,
      error: "User ID and full name are required",
    };
  }

  // Email validation (if provided)
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      success: false,
      error: "Please enter a valid email address",
    };
  }

  try {
    // Check if email is already taken by another user
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        return {
          success: false,
          error: "Email is already registered to another account",
        };
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: fullName.trim(),
        email: email?.trim() || null,
        occupation: occupation?.trim() || null,
        address: address?.trim() || null,
      },
    });

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Profile updated successfully",
    };
  } catch (error) {
    console.error("Error updating personal info:", error);
    return {
      success: false,
      error: "Failed to update profile. Please try again.",
    };
  }
}

// Update phone number
export async function updatePhoneNumber(
  prevState: any,
  formData: FormData
) {
  const userId = formData.get("userId") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;

  // Validation
  if (!userId || !phone?.trim() || !password) {
    return {
      success: false,
      error: "Phone number and password are required",
    };
  }

  // Phone validation (Nigerian format)
  const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
  if (!phoneRegex.test(phone)) {
    return {
      success: false,
      error: "Please enter a valid Nigerian phone number",
    };
  }

  try {
    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return {
        success: false,
        error: "Incorrect password",
      };
    }

    // Check if phone is already taken
    const existingUser = await prisma.user.findFirst({
      where: {
        phone,
        NOT: { id: userId },
      },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Phone number is already registered to another account",
      };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { phone },
    });

    revalidatePath("/dashboard/profile");

    return {
      success: true,
      message: "Phone number updated successfully",
    };
  } catch (error) {
    console.error("Error updating phone number:", error);
    return {
      success: false,
      error: "Failed to update phone number. Please try again.",
    };
  }
}

// Change password
export async function changePassword(
  prevState: any,
  formData: FormData
) {
  const userId = formData.get("userId") as string;
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validation
  if (!userId || !currentPassword || !newPassword || !confirmPassword) {
    return {
      success: false,
      error: "All fields are required",
    };
  }

  if (newPassword.length < 6) {
    return {
      success: false,
      error: "New password must be at least 6 characters",
    };
  }

  if (newPassword !== confirmPassword) {
    return {
      success: false,
      error: "New passwords do not match",
    };
  }

  try {
    // Get user and verify current password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return {
        success: false,
        error: "Current password is incorrect",
      };
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return {
      success: true,
      message: "Password changed successfully",
    };
  } catch (error) {
    console.error("Error changing password:", error);
    return {
      success: false,
      error: "Failed to change password. Please try again.",
    };
  }
}

// Update bank details
export async function updateBankDetails(
  prevState: any,
  formData: FormData
) {
  const participationId = formData.get("participationId") as string;
  const bankName = formData.get("bankName") as string;
  const accountNumber = formData.get("accountNumber") as string;
  const accountName = formData.get("accountName") as string;

  // Validation
  if (!participationId || !bankName || !accountNumber || !accountName) {
    return {
      success: false,
      error: "All bank details are required",
    };
  }

  // Account number validation (10 digits)
  if (!/^\d{10}$/.test(accountNumber)) {
    return {
      success: false,
      error: "Account number must be 10 digits",
    };
  }

  try {
    // Check if participation exists
    const participation = await prisma.participation.findUnique({
      where: { id: participationId },
      include: { bankDetails: true },
    });

    if (!participation) {
      return {
        success: false,
        error: "Participation not found",
      };
    }

    if (participation.bankDetails) {
      // Update existing bank details
      await prisma.bankDetails.update({
        where: { participationId },
        data: {
          bankName,
          accountNumber,
          accountName,
        },
      });
    } else {
      // Create new bank details
      await prisma.bankDetails.create({
        data: {
          participationId,
          bankName,
          accountNumber,
          accountName,
        },
      });
    }

    revalidatePath("/dashboard/profile");

    return {
      success: true,
      message: "Bank details updated successfully",
    };
  } catch (error) {
    console.error("Error updating bank details:", error);
    return {
      success: false,
      error: "Failed to update bank details. Please try again.",
    };
  }
}