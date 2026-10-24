import { AuthUser } from "./types";

const SESSION_SECRET =
  process.env.SESSION_SECRET || "sloth-auth-hackathon-secure-session-key-2025";
const COOKIE_NAME = "sloth_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

// Helper for Base64URL encoding
function base64UrlEncode(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str)
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  }
  return btoa(str)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(base64, "base64").toString("utf-8");
  }
  return atob(base64);
}

// Generate HMAC signature using Web Crypto API (compatible with Edge and Node)
async function generateSignature(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  const hashArray = Array.from(new Uint8Array(signature));
  const hashStr = String.fromCharCode.apply(null, hashArray);
  return base64UrlEncode(hashStr);
}

export interface SessionPayload {
  user: AuthUser;
  exp: number;
}

/**
 * Creates a signed session token containing user info.
 */
export async function createSessionToken(user: AuthUser): Promise<string> {
  const payload: SessionPayload = {
    user,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await generateSignature(encodedPayload, SESSION_SECRET);
  return `${encodedPayload}.${signature}`;
}

/**
 * Verifies a signed session token. Returns null if invalid or expired.
 */
export async function verifySessionToken(token: string): Promise<AuthUser | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [encodedPayload, receivedSignature] = parts;
    const expectedSignature = await generateSignature(encodedPayload, SESSION_SECRET);

    if (receivedSignature !== expectedSignature) {
      return null;
    }

    const jsonStr = base64UrlDecode(encodedPayload);
    const payload = JSON.parse(jsonStr) as SessionPayload;

    if (!payload.exp || Date.now() / 1000 > payload.exp) {
      return null;
    }

    return payload.user;
  } catch {
    return null;
  }
}

export const AUTH_COOKIE = {
  name: COOKIE_NAME,
  maxAge: MAX_AGE_SECONDS,
};
