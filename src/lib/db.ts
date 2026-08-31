import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// 1. Initialize a reusable Node-Postgres connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 2. Wrap it inside the native PrismaPg adapter translator
const adapter = new PrismaPg(pool);

function createPrismaClient() {
  return new PrismaClient({
    adapter,
    log: ["error", "warn"], // Query spam removed so terminal stays clean
  });
}

// 3. Instantiate the client with your driver adapter mapping
export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
