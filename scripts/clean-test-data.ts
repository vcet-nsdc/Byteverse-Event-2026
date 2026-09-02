import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

async function main() {
  console.log("🧹 Wiping all test teams, participants, submissions, and scores...");

  // Delete submissions, AI usages, scores
  await db.submission.deleteMany();
  await db.aIUsage.deleteMany();
  await db.roundScore.deleteMany();
  await db.teamScore.deleteMany();
  await db.disqualification.deleteMany();

  // Delete team members & teams
  await db.teamMember.deleteMany();
  await db.team.deleteMany();

  // Delete audit logs & announcements
  await db.auditLog.deleteMany();
  await db.announcement.deleteMany();

  // Delete non-admin users
  const deletedUsers = await db.user.deleteMany({
    where: {
      role: {
        notIn: ["ADMIN", "SUPER_ADMIN"],
      },
    },
  });

  // Reset all tournament rounds back to fresh start (Round 1: SCHEDULED, Others: DRAFT)
  await db.round.updateMany({
    where: { sequence: 1 },
    data: {
      status: "SCHEDULED",
      startsAt: null,
      endsAt: null,
    },
  });

  await db.round.updateMany({
    where: { sequence: { gt: 1 } },
    data: {
      status: "DRAFT",
      startsAt: null,
      endsAt: null,
    },
  });

  console.log(`✅ Deleted ${deletedUsers.count} test participant users.`);
  console.log("✅ All rounds reset to initial pre-competition state (Round 1: Ready to Start).");
  console.log("✅ Database is now completely clean and ready for real competition data!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await db.$disconnect();
    await pool.end();
  });
