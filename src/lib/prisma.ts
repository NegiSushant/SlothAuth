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

export const prisma =
  globalForPrisma.prismaClient ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaClient = prisma;
}

export const prismaClient = prisma;
export default prisma;