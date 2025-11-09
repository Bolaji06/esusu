"use server";

import prisma from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getGameSettings() {
  try {
    let settings = await prisma.numberSettings.findFirst({
      where: { isActive: true },
    });

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.numberSettings.create({
        data: {
          totalNumbers: 20,
          isActive: true,
        },
      });
    }

    return settings;
  } catch (error) {
    console.error("Error getting game settings:", error);
    return {
      id: "",
      totalNumbers: 20,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

export async function updateTotalNumbers(
  totalNumbers: number,
  isAdmin: boolean
) {
  if (!isAdmin) {
    return {
      success: false,
      error: "Unauthorized: Only admins can update settings",
    };
  }

  // Validate input
  if (totalNumbers < 10 || totalNumbers > 100) {
    return {
      success: false,
      error: "Total numbers must be between 10 and 100",
    };
  }

  try {
    // Get current settings
    const currentSettings = await getGameSettings();

    // Check if any numbers beyond the new limit have been picked
    if (totalNumbers < currentSettings.totalNumbers) {
      const picksAboveLimit = await prisma.numberPick.count({
        where: {
          number: {
            gt: totalNumbers,
          },
        },
      });

      if (picksAboveLimit > 0) {
        return {
          success: false,
          error: `Cannot reduce to ${totalNumbers} numbers. ${picksAboveLimit} number(s) above this limit have already been picked.`,
        };
      }
    }

    // Update settings
    await prisma.numberSettings.updateMany({
      where: { isActive: true },
      data: { totalNumbers },
    });

    revalidatePath("/");

    return {
      success: true,
      totalNumbers,
    };
  } catch (error) {
    console.error("Error updating game settings:", error);
    return {
      success: false,
      error: "Failed to update settings",
    };
  }
}

export async function resetGame(isAdmin: boolean) {
  if (!isAdmin) {
    return {
      success: false,
      error: "Unauthorized: Only admins can reset the game",
    };
  }

  try {
    // Delete all number picks
    await prisma.numberPick.deleteMany({});

    revalidatePath("/");

    revalidatePath("/", "page");

    return {
      success: true,
      message: "Game reset successfully. All picks have been cleared.",
    };
  } catch (error) {
    console.error("Error resetting game:", error);
    return {
      success: false,
      error: "Failed to reset game",
    };
  }
}
