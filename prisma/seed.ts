import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import "dotenv/config"; // Ensures process.env.DATABASE_URL loads correctly

// 1. Initialize the PostgreSQL native driver pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 2. Wrap it inside the Prisma Pg adapter handler
const adapter = new PrismaPg(pool);

// 3. Inject the driver adapter into the PrismaClient constructor
const db = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Starting ByteVerse Production Database Seeding...");

  // 1. Seed Super Admin
  const adminHash = await bcrypt.hash("admin2026", 12);
  const admin = await db.user.upsert({
    where: { email: "admin@byteverse.dev" },
    update: {
      passwordHash: adminHash,
    },
    create: {
      email: "admin@byteverse.dev",
      name: "admin",
      passwordHash: adminHash,
      role: "SUPER_ADMIN",
    },
  });
  console.log("✅ Admin seeded:", admin.email);

  // Load master seed data payload
  const seedDataPath = path.resolve(__dirname, "seed-data.json");
  const seedData = JSON.parse(fs.readFileSync(seedDataPath, "utf-8"));

  // 2. Seed Active Event (ByteVerse 2026)
  const eventId = process.env.NEXT_PUBLIC_EVENT_ID ?? "byteverse-2026";
  const activeEvent = await db.event.upsert({
    where: { id: eventId },
    update: {},
    create: {
      id: eventId,
      name: "ByteVerse 2026",
      description: "The Grand Coding Voyage — College Technical Fest",
      registrationOpen: true,
      teamRegistrationOpen: true,
      missingMemberPolicy: "TREAT_AS_ZERO",
      isActive: true,
    },
  });
  console.log("✅ Active Event seeded:", activeEvent.name);

  // Seed Event Rounds
  const rounds = [
    { name: "Logical Thinking", type: "CODE_LOGIC" as const, sequence: 1, durationMin: 20 },
    { name: "AI Code Optimization", type: "AI_REPAIR" as const, sequence: 2, durationMin: 25 },
    { name: "Debugging & Code Analysis", type: "TRADITIONAL" as const, sequence: 3, durationMin: 35 },
    { name: "Data Structures & Algorithms", type: "TYPE_TRANSFORM" as const, sequence: 4, durationMin: 45 },
    { name: "AI vs Human", type: "HUMAN_VS_MACHINE" as const, sequence: 5, durationMin: 35 },
  ];

  for (const r of rounds) {
    await db.round.upsert({
      where: { eventId_sequence: { eventId: activeEvent.id, sequence: r.sequence } },
      update: { name: r.name, durationMin: r.durationMin },
      create: { ...r, eventId: activeEvent.id },
    });
  }
  console.log("✅ 5 Active Event Rounds seeded successfully.");

  // 3. Seed Past Events (ByteVerse 2025)
  for (const pe of seedData.events.pastEvents) {
    const pastEventRecord = await db.event.upsert({
      where: { id: pe.id },
      update: {
        name: pe.title,
        description: pe.description,
        bannerUrl: pe.bannerUrl,
        isActive: false,
        startsAt: new Date(pe.startDate),
        endsAt: new Date(pe.endDate),
      },
      create: {
        id: pe.id,
        name: pe.title,
        description: pe.description,
        bannerUrl: pe.bannerUrl,
        isActive: false,
        registrationOpen: false,
        teamRegistrationOpen: false,
        startsAt: new Date(pe.startDate),
        endsAt: new Date(pe.endDate),
      },
    });

    // Seed past event rounds
    for (const rs of pe.roundsSummary) {
      const typeMap: Record<string, "CODE_LOGIC" | "AI_REPAIR" | "TRADITIONAL" | "TYPE_TRANSFORM" | "HUMAN_VS_MACHINE"> = {
        MCQ: "CODE_LOGIC",
        OPTIMIZE: "AI_REPAIR",
        DEBUG: "TRADITIONAL",
        DSA: "TYPE_TRANSFORM",
        CHALLENGE: "HUMAN_VS_MACHINE",
      };
      await db.round.upsert({
        where: { eventId_sequence: { eventId: pastEventRecord.id, sequence: rs.round } },
        update: { name: rs.name },
        create: {
          eventId: pastEventRecord.id,
          sequence: rs.round,
          name: rs.name,
          type: typeMap[rs.type] || "TRADITIONAL",
          maxScore: rs.points,
        },
      });
    }
    console.log(`✅ Past Event seeded: ${pe.title} (${pe.stats.registeredTeams} teams, ${pe.stats.collegesParticipated} colleges)`);
  }

  // 4. Seed Contests & Contest Problems
  for (const c of seedData.contests) {
    const contestRecord = await db.contest.upsert({
      where: { id: c.id },
      update: {
        title: c.title,
        description: c.description,
        type: c.type,
        difficulty: c.difficulty,
        bannerUrl: c.bannerUrl,
        startsAt: new Date(c.startsAt),
        endsAt: new Date(c.endsAt),
      },
      create: {
        id: c.id,
        title: c.title,
        description: c.description,
        type: c.type,
        difficulty: c.difficulty,
        bannerUrl: c.bannerUrl,
        status: "SCHEDULED",
        startsAt: new Date(c.startsAt),
        endsAt: new Date(c.endsAt),
      },
    });

    for (const p of c.problems) {
      const problemRecord = await db.problem.upsert({
        where: { id: p.id },
        update: {
          title: p.title,
          statement: p.statement,
          inputFormat: p.inputFormat,
          outputFormat: p.outputFormat,
          constraints: p.constraints,
          difficulty: p.difficulty,
          timeLimitMs: p.timeLimitMs,
          memoryLimitMb: p.memoryLimitMb,
          starterCodes: p.starterCodes,
          contestId: contestRecord.id,
          sequence: p.sequence,
          isPublished: true,
        },
        create: {
          id: p.id,
          title: p.title,
          statement: p.statement,
          inputFormat: p.inputFormat,
          outputFormat: p.outputFormat,
          constraints: p.constraints,
          difficulty: p.difficulty,
          timeLimitMs: p.timeLimitMs,
          memoryLimitMb: p.memoryLimitMb,
          starterCodes: p.starterCodes,
          contestId: contestRecord.id,
          sequence: p.sequence,
          isPublished: true,
        },
      });

      // Seed Test Cases
      await db.testCase.deleteMany({ where: { problemId: problemRecord.id } });
      for (let i = 0; i < p.testCases.length; i++) {
        const tc = p.testCases[i];
        await db.testCase.create({
          data: {
            problemId: problemRecord.id,
            input: tc.input,
            expected: tc.expected,
            isHidden: tc.isHidden,
            sequence: i + 1,
          },
        });
      }
    }
    console.log(`✅ Contest seeded: ${c.title} (${c.problems.length} problems with test cases)`);
  }

  // 5. Seed LeetCode / Udemy Style Practice Problems
  for (let idx = 0; idx < seedData.practiceProblems.length; idx++) {
    const pp = seedData.practiceProblems[idx];
    const problemRecord = await db.problem.upsert({
      where: { id: pp.id },
      update: {
        title: pp.title,
        statement: JSON.stringify(pp.description),
        difficulty: pp.difficulty,
        tags: pp.tags,
        starterCodes: pp.starterCodes,
        isPublished: true,
        sequence: idx + 1,
      },
      create: {
        id: pp.id,
        title: pp.title,
        statement: JSON.stringify(pp.description),
        difficulty: pp.difficulty,
        tags: pp.tags,
        starterCodes: pp.starterCodes,
        isPublished: true,
        sequence: idx + 1,
      },
    });

    // Seed Practice Test Cases
    await db.testCase.deleteMany({ where: { problemId: problemRecord.id } });
    for (let i = 0; i < pp.testCases.length; i++) {
      const tc = pp.testCases[i];
      await db.testCase.create({
        data: {
          problemId: problemRecord.id,
          input: tc.input,
          expected: tc.expected,
          isHidden: tc.isHidden,
          sequence: i + 1,
        },
      });
    }
  }
  console.log(`✅ Practice Library seeded: ${seedData.practiceProblems.length} pedagogical problems with test cases.`);

  console.log("🎉 Production Seed Complete!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await db.$disconnect();
    await pool.end();
  });
