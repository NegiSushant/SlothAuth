import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth/session";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Signed out successfully",
  });

  response.cookies.set(AUTH_COOKIE.name, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
