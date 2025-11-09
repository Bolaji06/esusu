"use server";

import prisma from "@/src/lib/prisma";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production"
);

async function createToken(userId: string, isAdmin: boolean) {
  const token = await new SignJWT({ userId, isAdmin })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("48h")
    .sign(SECRET_KEY);

  return token;
}

export async function loginAction(prevState: unknown, formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;

  // Validate input
  if (!fullName?.trim() || !phone?.trim()) {
    return {
      error: "All fields are required",
      success: false,
    };
  }

  try {
    // Determine if this should be an admin
    const isAdmin = fullName === "admin" && phone === "12345";

    // Check if user already exists
    let user = await prisma.user.findFirst({
      where: {
        fullName,
      },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          fullName,
          phone,
          isAdmin,
        },
      });
    }

    // Create JWT token
    const token = await createToken(user.id, user.isAdmin);

    (await cookies()).set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 48, // 48 hours
      path: "/",
    });

    return {
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        isAdmin: user.isAdmin,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      error: "Something went wrong. Please try again.",
      success: false,
    };
  }
}
