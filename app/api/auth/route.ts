import prisma from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

// Secret key for JWT signing (store this in .env file)
const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

async function createToken(userId: string, isAdmin: boolean) {
  const token = await new SignJWT({ userId, isAdmin })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("48h") // Token expires in 48 hours
    .sign(SECRET_KEY);

  return token;
}

export async function POST(request: NextRequest) {
  try {
    const { fullName, phone } = await request.json();

    // Validate input
    if (!fullName || !phone) {
      return NextResponse.json(
        { error: "Full name and phone are required" },
        { status: 400 }
      );
    }

    // Determine if this should be an admin
    const isAdmin = fullName === "admin" && phone === "admin";

    // Check if user already exists
    let user = await prisma.user.findFirst({
      where: {
        fullName,
        phone,
      },
    });

    if (!user) {
      // Create new user with isAdmin flag
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

    // Create response with token in cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        phone: user.phone,
        isAdmin: user.isAdmin,
      },
      message:
        user.createdAt.getTime() === user.createdAt.getTime()
          ? "User created and logged in successfully"
          : "User logged in successfully",
    });

    // Set HTTP-only cookie with the token
    response.cookies.set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 48, // 48 hours in seconds
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error in signup/login API:", error);
    return NextResponse.json(
      { error: "An error occurred during signup/login" },
      { status: 500 }
    );
  }
}
