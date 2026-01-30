"use server";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production",
);

async function createToken(userId: string, isAdmin: boolean) {
  const token = await new SignJWT({ userId, isAdmin })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("48h")
    .sign(SECRET_KEY);

  return token;
}

// REGISTER ACTION
export async function register(prevState: unknown, formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const occupation = formData.get("occupation") as string;
  const address = formData.get("address") as string;

  // Validation
  if (!fullName?.trim() || !phone?.trim() || !password?.trim()) {
    return {
      error: "Full name, phone, and password are required",
      success: false,
    };
  }

  if (password.length < 6) {
    return {
      error: "Password must be at least 6 characters",
      success: false,
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "Passwords do not match",
      success: false,
    };
  }

  // Phone validation (Nigerian format)
  const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
  if (!phoneRegex.test(phone)) {
    return {
      error: "Please enter a valid Nigerian phone number",
      success: false,
    };
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ phone }, { email: email || undefined }],
      },
    });

    if (existingUser) {
      return {
        error:
          existingUser.phone === phone
            ? "Phone number already registered"
            : "Email already registered",
        success: false,
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName,
        phone,
        email: email || null,
        password: hashedPassword,
        occupation: occupation || null,
        address: address || null,
      },
    });

    // Create JWT token
    const token = await createToken(user.id, user.isAdmin);

    // Set cookie
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
    console.error("Registration error:", error);
    return {
      error: "Something went wrong. Please try again.",
      success: false,
    };
  }
}

// LOGIN ACTION
export async function login(prevState: unknown, formData: FormData) {
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;

  // Validation
  if (!phone?.trim() || !password?.trim()) {
    return {
      error: "Phone and password are required",
      success: false,
    };
  }

  try {
    // Find user

    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return {
        error: "Invalid phone number or password",
        success: false,
      };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return {
        error: "Invalid phone number or password",
        success: false,
      };
    }

    // Check if user is suspended
    if (user.status === "SUSPENDED") {
      return {
        error: "Your account has been suspended. Please contact admin.",
        success: false,
      };
    }

    // Create JWT token
    const token = await createToken(user.id, user.isAdmin);

    // Set cookie
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

// LOGOUT ACTION
export async function logout() {
  (await cookies()).set({
    name: "auth-token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  redirect("/login");
}

// GET CURRENT USER
export async function getCurrentUser() {
  try {
    const token = (await cookies()).get("auth-token")?.value;

    if (!token) return null;

    const verified = await jwtVerify(token, SECRET_KEY);
    const payload = verified.payload as { userId: string; isAdmin: boolean };

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
        occupation: true,
        address: true,
        isAdmin: true,
        status: true,
      },
    });

    return user;
  } catch (error) {
    return null;
  }
}

// RESET PASSWORD ACTION
export async function resetPassword(prevState: unknown, formData: FormData) {
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validation
  if (!phone?.trim() || !password?.trim() || !confirmPassword?.trim()) {
    return {
      error: "Phone and both password fields are required",
      success: false,
    };
  }

  if (password.length < 6) {
    return {
      error: "Password must be at least 6 characters",
      success: false,
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "Passwords do not match",
      success: false,
    };
  }

  // Phone validation (Nigerian format)
  const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
  if (!phoneRegex.test(phone)) {
    return {
      error: "Please enter a valid Nigerian phone number",
      success: false,
    };
  }

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return {
        error: "User with this phone number not found",
        success: false,
      };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return {
      success: true,
      message:
        "Password reset successful! Please login with your new password.",
    };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      error: "Something went wrong. Please try again.",
      success: false,
    };
  }
}
