import { db } from "../src/lib/db";

async function safeMigrate() {
  console.log("Starting safe non-destructive migration...");

  // 1. Make roundId optional on problems & add contestId, tags
  await db.$executeRawUnsafe(`
    ALTER TABLE "problems" ALTER COLUMN "roundId" DROP NOT NULL;
  `);
  await db.$executeRawUnsafe(`
    ALTER TABLE "problems" ADD COLUMN IF NOT EXISTS "contestId" TEXT;
  `);
  await db.$executeRawUnsafe(`
    ALTER TABLE "problems" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
  `);
  console.log("Updated problems table.");

  // 2. Make roundId optional on submissions & add contestId
  await db.$executeRawUnsafe(`
    ALTER TABLE "submissions" ALTER COLUMN "roundId" DROP NOT NULL;
  `);
  await db.$executeRawUnsafe(`
    ALTER TABLE "submissions" ADD COLUMN IF NOT EXISTS "contestId" TEXT;
  `);
  console.log("Updated submissions table.");

  // 3. Extend events table
  await db.$executeRawUnsafe(`
    ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "bannerUrl" TEXT;
  `);
  await db.$executeRawUnsafe(`
    ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "venue" TEXT DEFAULT 'Campus Auditorium & Labs';
  `);
  await db.$executeRawUnsafe(`
    ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT 'Championship';
  `);
  console.log("Updated events table.");

  // 4. Create contests table
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "contests" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "description" TEXT,
      "type" TEXT NOT NULL DEFAULT 'WEEKLY',
      "status" "RoundStatus" NOT NULL DEFAULT 'SCHEDULED',
      "startsAt" TIMESTAMP(3) NOT NULL,
      "endsAt" TIMESTAMP(3) NOT NULL,
      "bannerUrl" TEXT,
      "difficulty" TEXT DEFAULT 'Mixed',
      "eventId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "contests_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE
    );
  `);
  await db.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "contests_eventId_idx" ON "contests"("eventId");
  `);
  await db.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "contests_status_idx" ON "contests"("status");
  `);
  console.log("Created contests table.");

  // 5. Create contest_participants table
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "contest_participants" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "contestId" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "rank" INTEGER,
      "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "contest_participants_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "contests"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "contest_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);
  await db.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "contest_participants_contestId_userId_key" ON "contest_participants"("contestId", "userId");
  `);
  await db.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "contest_participants_contestId_idx" ON "contest_participants"("contestId");
  `);
  await db.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "contest_participants_userId_idx" ON "contest_participants"("userId");
  `);
  console.log("Created contest_participants table.");

  // 6. Add foreign keys from problems & submissions to contests
  try {
    await db.$executeRawUnsafe(`
      ALTER TABLE "problems" 
      ADD CONSTRAINT "problems_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "contests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    `);
  } catch (e: any) {
    // Constraint may already exist
  }
  await db.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "problems_contestId_idx" ON "problems"("contestId");
  `);

  try {
    await db.$executeRawUnsafe(`
      ALTER TABLE "submissions" 
      ADD CONSTRAINT "submissions_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "contests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    `);
  } catch (e: any) {
    // Constraint may already exist
  }
  await db.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "submissions_contestId_idx" ON "submissions"("contestId");
  `);

  // 7. Create discussions table
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "discussions" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "authorId" TEXT NOT NULL,
      "problemId" TEXT,
      "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "views" INTEGER NOT NULL DEFAULT 0,
      "upvotes" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "discussions_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "discussions_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("id") ON DELETE SET NULL ON UPDATE CASCADE
    );
  `);
  await db.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "discussions_authorId_idx" ON "discussions"("authorId");
  `);
  await db.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "discussions_problemId_idx" ON "discussions"("problemId");
  `);
  await db.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "discussions_createdAt_idx" ON "discussions"("createdAt");
  `);
  await db.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "discussions_upvotes_idx" ON "discussions"("upvotes");
  `);
  console.log("Created discussions table.");

  // 8. Create discussion_comments table
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "discussion_comments" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "content" TEXT NOT NULL,
      "discussionId" TEXT NOT NULL,
      "authorId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "discussion_comments_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "discussions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "discussion_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);
  await db.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "discussion_comments_discussionId_idx" ON "discussion_comments"("discussionId");
  `);
  await db.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "discussion_comments_authorId_idx" ON "discussion_comments"("authorId");
  `);
  console.log("Created discussion_comments table.");

  // 9. Create discussion_votes table
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "discussion_votes" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "discussionId" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "value" INTEGER NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "discussion_votes_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "discussions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "discussion_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);
  await db.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "discussion_votes_discussionId_userId_key" ON "discussion_votes"("discussionId", "userId");
  `);
  await db.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "discussion_votes_discussionId_idx" ON "discussion_votes"("discussionId");
  `);
  await db.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "discussion_votes_userId_idx" ON "discussion_votes"("userId");
  `);
  console.log("Created discussion_votes table.");

  console.log("Safe migration completed successfully!");
}

safeMigrate()
  .catch(console.error)
  .finally(() => process.exit(0));
