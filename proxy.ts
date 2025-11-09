import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import prisma from "@/src/lib/prisma";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production"
);

// Define public routes that don't require authentication
const publicRoutes = ["/login", "/signin", "/api/auth"];

// Define admin-only routes
const adminRoutes = ["/admin", "/api/admin"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get("auth-token")?.value;

  // No token - redirect to login
  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  try {
    // Verify token
    const verified = await jwtVerify(token, SECRET_KEY);
    const payload = verified.payload as { userId: string; isAdmin: boolean };

    // Get user details from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, fullName: true, isAdmin: true },
    });

    if (!user) {
      // User not found, redirect to login
      const url = new URL("/login", request.url);
      return NextResponse.redirect(url);
    }

    // Check admin routes
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (!user.isAdmin) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }

    // Add user info to headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", user.id);
    requestHeaders.set("x-user-name", user.fullName);
    requestHeaders.set("x-user-admin", user.isAdmin.toString());

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    console.error("Token verification failed:", error);
    // Invalid token - redirect to login
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};