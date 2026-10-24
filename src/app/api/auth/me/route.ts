import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, AUTH_COOKIE } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE.name)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, user: null, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = await verifySessionToken(token);

    if (!user) {
      return NextResponse.json(
        { success: false, user: null, message: "Invalid or expired session" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: unknown) {
    console.error("Auth me check error:", error);
    return NextResponse.json(
      { success: false, user: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
