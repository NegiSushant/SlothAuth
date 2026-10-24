import { prisma } from "../src/lib/prisma";
import crypto from "crypto";

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

async function initAuthTable() {
  console.log("Checking and creating app_users table if not exists...");
  
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS app_users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'CLINICIAN',
      organization VARCHAR(150) NOT NULL DEFAULT 'St. Jude Clinical Network',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);

  console.log("app_users table is ready.");

  // Check if default demo users exist
  const existingUsers = await prisma.$queryRawUnsafe<Array<{ email: string }>>(
    "SELECT email FROM app_users WHERE email IN ('dr.chen@slothauth.health', 'admin@slothauth.health')"
  );

  const existingEmails = new Set(existingUsers.map((u) => u.email));

  if (!existingEmails.has("dr.chen@slothauth.health")) {
    const hash = hashPassword("password123");
    await prisma.$executeRawUnsafe(
      `INSERT INTO app_users (name, email, password_hash, role, organization) 
       VALUES ('Dr. Sarah Chen, MD', 'dr.chen@slothauth.health', $1, 'CHIEF_MEDICAL_OFFICER', 'Pacific Health Hospital')`,
      hash
    );
    console.log("Created demo clinician: dr.chen@slothauth.health");
  }

  if (!existingEmails.has("admin@slothauth.health")) {
    const hash = hashPassword("password123");
    await prisma.$executeRawUnsafe(
      `INSERT INTO app_users (name, email, password_hash, role, organization) 
       VALUES ('Marcus Vance', 'admin@slothauth.health', $1, 'PRIOR_AUTH_DIRECTOR', 'St. Jude Clinical Network')`,
      hash
    );
    console.log("Created demo admin: admin@slothauth.health");
  }

  console.log("Auth setup verified successfully!");
}

initAuthTable()
  .catch((e) => {
    console.error("Auth table init error:", e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
