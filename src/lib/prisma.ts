import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prismaClient: PrismaClient | undefined;
};

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:mysecretpassword@localhost:5432/postgres",
});

// Ensure hot-reloaded dev server doesn't keep a stale client without appUser
const hasAppUser = Boolean(
  globalForPrisma.prismaClient && (globalForPrisma.prismaClient as any).appUser
);

export const prisma =
  (hasAppUser ? globalForPrisma.prismaClient : undefined) ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaClient = prisma;
}

export const prismaClient = prisma;
export default prisma;