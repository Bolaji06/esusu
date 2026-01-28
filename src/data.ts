"use server";

import { prisma } from "./lib/prisma";
import { revalidatePath } from "next/cache";

export async function pickNumber(userId: string, number: number) {
  try {
    // Check if user already has a pick
    const existingPick = await prisma.numberPick.findUnique({
      where: { userId },
    });

    if (existingPick) {
      return {
        success: false,
        error: "You have already picked a number",
        pickedNumber: existingPick.number,
      };
    }

    // Check if number is already taken
    const numberTaken = await prisma.numberPick.findUnique({
      where: { number },
    });

    if (numberTaken) {
      return {
        success: false,
        error: "This number has already been picked by another user",
      };
    }

    // Create the number pick
    const pick = await prisma.numberPick.create({
      data: {
        number,
        userId,
      },
    });

    revalidatePath("/");

    return {
      success: true,
      pick: {
        id: pick.id,
        number: pick.number,
      },
    };
  } catch (error) {
    console.error("Error picking number:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again.",
    };
  }
}

export async function getUserPick(userId: string) {
  try {
    const pick = await prisma.numberPick.findUnique({
      where: { userId },
    });

    return pick;
  } catch (error) {
    console.error("Error getting user pick:", error);
    return null;
  }
}

export async function getAllPicks() {
  try {
    const picks = await prisma.numberPick.findMany({
      select: {
        number: true,
      },
    });

    return picks.map((p: { number: number }) => p.number);
  } catch (error) {
    console.error("Error getting all picks:", error);
    return [];
  }
}

export async function getAllUserPicks() {
  try {
    const picks = await prisma.numberPick.findMany({
      include: {
        user: {
          select: {
            fullName: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return picks.map((pick: any) => ({
      id: pick.id,
      number: pick.number,
      userName: pick.user.fullName,
      userPhone: pick.user.phone,
      createdAt: pick.createdAt,
    }));
  } catch (error) {
    console.error("Error getting all user picks:", error);
    return [];
  }
}

export async function getPicksStats() {
  try {
    // Get current number settings to know total numbers
    const settings = await prisma.numberSettings.findFirst({
      where: { isActive: true },
    });

    const totalNumbers = settings?.totalNumbers || 20;
    const totalUsers = await prisma.user.count();
    const totalPicks = await prisma.numberPick.count();
    const availableNumbers = totalNumbers - totalPicks;

    return {
      totalUsers,
      totalPicks,
      availableNumbers,
      totalNumbers,
    };
  } catch (error) {
    console.error("Error getting stats:", error);
    return {
      totalUsers: 0,
      totalPicks: 0,
      availableNumbers: 20,
      totalNumbers: 20,
    };
  }
}
