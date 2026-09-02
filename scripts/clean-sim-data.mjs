import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function clean() {
  console.log("🧹 Cleaning up simulated test participants and teams...");
  await db.submission.deleteMany({ where: { user: { email: { startsWith: "sim-user-" } } } });
  await db.roundScore.deleteMany({ where: { user: { email: { startsWith: "sim-user-" } } } });
  await db.teamScore.deleteMany({ where: { team: { name: { startsWith: "Sim Team" } } } });
  await db.teamMember.deleteMany({ where: { user: { email: { startsWith: "sim-user-" } } } });
  await db.team.deleteMany({ where: { name: { startsWith: "Sim Team" } } });
  await db.user.deleteMany({ where: { email: { startsWith: "sim-user-" } } });
  console.log("✅ All simulated test data removed. Database clean!");
  await db.$disconnect();
  await pool.end();
}

clean().catch(console.error);
