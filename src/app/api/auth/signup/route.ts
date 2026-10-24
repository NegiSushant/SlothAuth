import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/auth/auth-service";
import { createSessionToken, AUTH_COOKIE } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role, organization } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Full name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const user = await registerUser({
      name,
      email,
      password,
      role: role || "CLINICAL_SPECIALIST",
      organization: organization || "General Hospital",
    });

    const token = await createSessionToken(user);

    const response = NextResponse.json({
      success: true,
      user,
      message: "Account created successfully",
    });

    response.cookies.set(AUTH_COOKIE.name, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: AUTH_COOKIE.maxAge,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("Sign-up error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Account registration failed.",
      },
      { status: 400 }
    );
  }
}
