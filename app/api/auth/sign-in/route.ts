import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prismadb } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Get admin credentials from environment variables
    const adminEmailsEnv = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "";
    const adminPasswordsEnv = process.env.ADMIN_PASSWORDS || process.env.ADMIN_PASSWORD || "";

    const adminEmails = adminEmailsEnv.split(",").map((e) => e.trim()).filter(Boolean);
    const adminPasswords = adminPasswordsEnv.split(",").map((p) => p.trim()).filter(Boolean);

    // Validate email - find matching email
    const emailIndex = adminEmails.findIndex(
      (e) => e.toLowerCase() === email.toLowerCase()
    );

    if (emailIndex === -1) {
      return NextResponse.json(
        { message: "Invalid email address" },
        { status: 401 }
      );
    }

    // Validate password - must match the password at the same index
    if (adminPasswords[emailIndex] !== password) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 401 }
      );
    }

    // Find or create user in database
    let user = await prismadb.users.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Create new user with admin role
      user = await prismadb.users.create({
        data: {
          email: email.toLowerCase(),
          name: email.split("@")[0],
          role: "admin",
          userStatus: "ACTIVE",
          emailVerified: new Date(),
        },
      });
    } else {
      // Ensure existing user has admin role and is active
      if (user.role !== "admin" || user.userStatus !== "ACTIVE") {
        user = await prismadb.users.update({
          where: { id: user.id },
          data: { role: "admin", userStatus: "ACTIVE" },
        });
      }
    }

    // Create session using better-auth API
    const session = await auth.api.createSession({
      body: {
        userId: user.id,
      },
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { message: "Failed to create session" },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: { email: user.email, id: user.id },
    });

    // Set session cookie
    response.cookies.set("better-auth.session_token", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Sign-in error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
