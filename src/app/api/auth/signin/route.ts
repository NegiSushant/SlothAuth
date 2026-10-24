import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth/auth-service";
import { createSessionToken, AUTH_COOKIE } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await authenticateUser({ email, password });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password. Please try again." },
        { status: 401 }
      );
    }

    const token = await createSessionToken(user);

    const response = NextResponse.json({
      success: true,
      user,
      message: "Signed in successfully",
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
    console.error("Sign-in error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Authentication failed.",
      },
      { status: 500 }
    );
  }
}
