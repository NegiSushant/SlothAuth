import crypto from "crypto";
import { prisma } from "../prisma";
import { AuthUser, SignInCredentials, SignUpCredentials } from "./types";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, originalHash] = storedHash.split(":");
    if (!salt || !originalHash) return false;
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return hash === originalHash;
  } catch {
    return false;
  }
}

interface RawUserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  organization: string;
  created_at: Date;
}

/**
 * Look up user by email and verify password.
 */
export async function authenticateUser(credentials: SignInCredentials): Promise<AuthUser | null> {
  const email = credentials.email.trim().toLowerCase();

  let user: {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    role: string;
    organization: string;
    created_at: Date | string;
  } | null = null;

  // Use typed prisma.appUser if available on the client delegate, otherwise fallback to raw query
  if ((prisma as any)?.appUser?.findFirst) {
    user = await (prisma as any).appUser.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });
  } else {
    const rows = await prisma.$queryRawUnsafe<RawUserRow[]>(
      "SELECT id, name, email, password_hash, role, organization, created_at FROM app_users WHERE LOWER(email) = $1 LIMIT 1",
      email
    );
    if (rows && rows.length > 0) {
      user = rows[0];
    }
  }

  if (!user) {
    return null;
  }

  const isValid = verifyPassword(credentials.password, user.password_hash);
  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organization: user.organization,
    createdAt:
      typeof user.created_at === "string"
        ? user.created_at
        : user.created_at.toISOString(),
  };
}

/**
 * Register a new user in the app_users table.
 */
export async function registerUser(data: SignUpCredentials): Promise<AuthUser> {
  const email = data.email.trim().toLowerCase();
  const name = data.name.trim();
  const role = data.role || "CLINICAL_SPECIALIST";
  const organization = data.organization?.trim() || "Independent Health System";

  // Check if user already exists
  let existing = null;
  if ((prisma as any)?.appUser?.findFirst) {
    existing = await (prisma as any).appUser.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });
  } else {
    const rows = await prisma.$queryRawUnsafe<RawUserRow[]>(
      "SELECT id FROM app_users WHERE LOWER(email) = $1 LIMIT 1",
      email
    );
    if (rows && rows.length > 0) {
      existing = rows[0];
    }
  }

  if (existing) {
    throw new Error("An account with this email address already exists.");
  }

  const passwordHash = hashPassword(data.password);

  let newUser: {
    id: number;
    name: string;
    email: string;
    role: string;
    organization: string;
    created_at: Date | string;
  };

  if ((prisma as any)?.appUser?.create) {
    newUser = await (prisma as any).appUser.create({
      data: {
        name,
        email,
        password_hash: passwordHash,
        role,
        organization,
      },
    });
  } else {
    const inserted = await prisma.$queryRawUnsafe<RawUserRow[]>(
      `INSERT INTO app_users (name, email, password_hash, role, organization)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, organization, created_at`,
      name,
      email,
      passwordHash,
      role,
      organization
    );
    newUser = inserted[0];
  }

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    organization: newUser.organization,
    createdAt:
      typeof newUser.created_at === "string"
        ? newUser.created_at
        : newUser.created_at.toISOString(),
  };
}

/**
 * Get user by ID.
 */
export async function getUserById(id: number): Promise<AuthUser | null> {
  let user: {
    id: number;
    name: string;
    email: string;
    role: string;
    organization: string;
    created_at: Date | string;
  } | null = null;

  if ((prisma as any)?.appUser?.findUnique) {
    user = await (prisma as any).appUser.findUnique({
      where: { id },
    });
  } else {
    const rows = await prisma.$queryRawUnsafe<RawUserRow[]>(
      "SELECT id, name, email, role, organization, created_at FROM app_users WHERE id = $1 LIMIT 1",
      id
    );
    if (rows && rows.length > 0) {
      user = rows[0];
    }
  }

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organization: user.organization,
    createdAt:
      typeof user.created_at === "string"
        ? user.created_at
        : user.created_at.toISOString(),
  };
}
