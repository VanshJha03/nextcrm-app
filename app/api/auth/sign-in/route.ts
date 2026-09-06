import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createInternalAdapter } from "better-auth/db";
import { prismaAdapter } from "better-auth/adapters/prisma";
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

    // Create a user object for the session
    const userId = `admin-${emailIndex}-${email.toLowerCase()}`;
    
    // Create internal adapter to manually create session
    const adapter = createInternalAdapter(
      prismaAdapter(prismadb, { provider: "postgresql" }),
      {
        options: {},
        logger: console,
        hooks: [],
        generateId: () => crypto.randomUUID(),
      }
    );

    // Create session using the internal adapter
    const session = await adapter.createSession(userId, false, {
      userId: userId,
      token: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000), // 7 days
      ipAddress: request.headers.get("x-forwarded-for") || null,
      userAgent: request.headers.get("user-agent") || null,
    });

    if (!session) {
      return NextResponse.json(
        { message: "Failed to create session" },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: { email: email.toLowerCase(), id: userId },
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
