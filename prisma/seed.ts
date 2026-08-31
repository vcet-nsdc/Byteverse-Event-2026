import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config"; // Ensures process.env.DATABASE_URL loads correctly

// 1. Initialize the PostgreSQL native driver pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 2. Wrap it inside the Prisma Pg adapter handler
const adapter = new PrismaPg(pool);

// 3. Inject the driver adapter into the PrismaClient constructor
const db = new PrismaClient({ adapter });

async function main() {
  const adminHash = await bcrypt.hash("admin2026", 12);

  const admin = await db.user.upsert({
    where: { email: "admin@byteverse.dev" },
    update: {
      passwordHash: adminHash, // Forces existing admin records to update to the new password
    },
    create: {
      email: "admin@byteverse.dev",
      name: "admin",
      passwordHash: adminHash,
      role: "SUPER_ADMIN",
    },
  });
  console.log("Admin seeded:", admin.email);

  const eventId = process.env.NEXT_PUBLIC_EVENT_ID ?? "byteverse-2026";
  const event = await db.event.upsert({
    where: { id: eventId },
    update: {},
    create: {
      id: eventId,
      name: "ByteVerse 2026",
      description: "The Grand Coding Voyage — College Technical Fest",
      registrationOpen: true,
      teamRegistrationOpen: true,
      missingMemberPolicy: "TREAT_AS_ZERO",
    },
  });
  console.log("Event seeded:", event.name);

  const rounds = [
    { name: "Logical Thinking", type: "CODE_LOGIC" as const, sequence: 1, durationMin: 20 },
    { name: "AI Code Optimization", type: "AI_REPAIR" as const, sequence: 2, durationMin: 25 },
    { name: "Debugging & Code Analysis", type: "TRADITIONAL" as const, sequence: 3, durationMin: 35 },
    { name: "Data Structures & Algorithms", type: "TYPE_TRANSFORM" as const, sequence: 4, durationMin: 45 },
    { name: "AI vs Human", type: "HUMAN_VS_MACHINE" as const, sequence: 5, durationMin: 35 },
  ];

  for (const r of rounds) {
    await db.round.upsert({
      where: { eventId_sequence: { eventId: event.id, sequence: r.sequence } },
      update: { name: r.name, durationMin: r.durationMin },
      create: { ...r, eventId: event.id },
    });
    console.log(`Round seeded: ${r.name} (${r.durationMin} mins)`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await db.$disconnect();
    await pool.end(); // Cleanly close the driver pool connection
  });
