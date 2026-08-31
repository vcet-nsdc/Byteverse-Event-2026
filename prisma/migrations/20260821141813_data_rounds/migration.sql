-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PARTICIPANT', 'ORGANIZER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "TeamStatus" AS ENUM ('PENDING', 'ACTIVE', 'LOCKED', 'DISQUALIFIED');

-- CreateEnum
CREATE TYPE "RoundType" AS ENUM ('CODE_LOGIC', 'AI_REPAIR', 'TRADITIONAL', 'TYPE_TRANSFORM', 'HUMAN_VS_MACHINE');

-- CreateEnum
CREATE TYPE "RoundStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'ENDED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('QUEUED', 'RUNNING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'COMPILATION_ERROR', 'RUNTIME_ERROR', 'SYSTEM_ERROR');

-- CreateEnum
CREATE TYPE "AIType" AS ENUM ('EXPLAIN', 'CODE');

-- CreateEnum
CREATE TYPE "MissingMemberPolicy" AS ENUM ('TREAT_AS_ZERO', 'MARK_INCOMPLETE', 'TEAM_INELIGIBLE', 'REQUIRE_BOTH');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "image" TEXT,
    "passwordHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'PARTICIPANT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "college" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "status" "TeamStatus" NOT NULL DEFAULT 'PENDING',
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_members" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "isLeader" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "registrationOpen" BOOLEAN NOT NULL DEFAULT true,
    "teamRegistrationOpen" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "missingMemberPolicy" "MissingMemberPolicy" NOT NULL DEFAULT 'TREAT_AS_ZERO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rounds" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "RoundType" NOT NULL,
    "status" "RoundStatus" NOT NULL DEFAULT 'DRAFT',
    "sequence" INTEGER NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 60,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "maxScore" INTEGER NOT NULL DEFAULT 100,
    "aiExplainPenalty" INTEGER NOT NULL DEFAULT 75,
    "aiCodePenalty" INTEGER NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problems" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "statement" TEXT NOT NULL,
    "inputFormat" TEXT,
    "outputFormat" TEXT,
    "constraints" TEXT,
    "sampleInput" TEXT,
    "sampleOutput" TEXT,
    "difficulty" TEXT,
    "timeLimitMs" INTEGER NOT NULL DEFAULT 2000,
    "memoryLimitMb" INTEGER NOT NULL DEFAULT 256,
    "allowedLangs" TEXT[] DEFAULT ARRAY['cpp', 'c', 'java', 'python', 'javascript']::TEXT[],
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "aiBaselineSolution" TEXT,
    "sequence" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_cases" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "expected" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER NOT NULL DEFAULT 0,
    "sequence" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "options" JSONB,
    "correctAnswer" TEXT,
    "explanation" TEXT,
    "points" INTEGER NOT NULL DEFAULT 10,
    "sequence" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problem_assignments" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "problem_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "sourceCode" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'QUEUED',
    "rawScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "aiScoreCap" INTEGER NOT NULL DEFAULT 100,
    "executionTimeMs" INTEGER,
    "memoryUsedMb" DOUBLE PRECISION,
    "judgeToken" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "judgedAt" TIMESTAMP(3),

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submission_results" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "testCaseId" TEXT NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "output" TEXT,
    "executionTimeMs" INTEGER,
    "memoryUsedMb" DOUBLE PRECISION,

    CONSTRAINT "submission_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_usages" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "type" "AIType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "tokensUsed" INTEGER,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "round_scores" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "rawScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "aiScoreCap" INTEGER NOT NULL DEFAULT 100,
    "explainUsed" BOOLEAN NOT NULL DEFAULT false,
    "codeUsed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "round_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_scores" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "member1Score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "member2Score" DOUBLE PRECISION,
    "avgScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disqualifications" (
    "id" TEXT NOT NULL,
    "participantId" TEXT,
    "teamId" TEXT,
    "reason" TEXT NOT NULL,
    "disqualifiedBy" TEXT NOT NULL,
    "disqualifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disqualifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "metadata" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "participants_userId_key" ON "participants"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "participants_participantId_key" ON "participants"("participantId");

-- CreateIndex
CREATE INDEX "participants_userId_idx" ON "participants"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "teams_name_key" ON "teams"("name");

-- CreateIndex
CREATE UNIQUE INDEX "teams_inviteCode_key" ON "teams"("inviteCode");

-- CreateIndex
CREATE INDEX "teams_inviteCode_idx" ON "teams"("inviteCode");

-- CreateIndex
CREATE INDEX "teams_eventId_idx" ON "teams"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_participantId_key" ON "team_members"("participantId");

-- CreateIndex
CREATE INDEX "team_members_teamId_idx" ON "team_members"("teamId");

-- CreateIndex
CREATE INDEX "rounds_eventId_idx" ON "rounds"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "rounds_eventId_sequence_key" ON "rounds"("eventId", "sequence");

-- CreateIndex
CREATE INDEX "problems_roundId_idx" ON "problems"("roundId");

-- CreateIndex
CREATE INDEX "test_cases_problemId_idx" ON "test_cases"("problemId");

-- CreateIndex
CREATE INDEX "questions_problemId_idx" ON "questions"("problemId");

-- CreateIndex
CREATE INDEX "problem_assignments_roundId_idx" ON "problem_assignments"("roundId");

-- CreateIndex
CREATE UNIQUE INDEX "problem_assignments_participantId_roundId_key" ON "problem_assignments"("participantId", "roundId");

-- CreateIndex
CREATE UNIQUE INDEX "submissions_idempotencyKey_key" ON "submissions"("idempotencyKey");

-- CreateIndex
CREATE INDEX "submissions_participantId_roundId_idx" ON "submissions"("participantId", "roundId");

-- CreateIndex
CREATE INDEX "submissions_problemId_idx" ON "submissions"("problemId");

-- CreateIndex
CREATE INDEX "submissions_roundId_idx" ON "submissions"("roundId");

-- CreateIndex
CREATE INDEX "submissions_judgeToken_idx" ON "submissions"("judgeToken");

-- CreateIndex
CREATE INDEX "submission_results_submissionId_idx" ON "submission_results"("submissionId");

-- CreateIndex
CREATE INDEX "ai_usages_participantId_roundId_idx" ON "ai_usages"("participantId", "roundId");

-- CreateIndex
CREATE INDEX "round_scores_roundId_idx" ON "round_scores"("roundId");

-- CreateIndex
CREATE INDEX "round_scores_participantId_idx" ON "round_scores"("participantId");

-- CreateIndex
CREATE UNIQUE INDEX "round_scores_participantId_roundId_key" ON "round_scores"("participantId", "roundId");

-- CreateIndex
CREATE INDEX "team_scores_teamId_idx" ON "team_scores"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "team_scores_teamId_roundId_key" ON "team_scores"("teamId", "roundId");

-- CreateIndex
CREATE UNIQUE INDEX "disqualifications_participantId_key" ON "disqualifications"("participantId");

-- CreateIndex
CREATE UNIQUE INDEX "disqualifications_teamId_key" ON "disqualifications"("teamId");

-- CreateIndex
CREATE INDEX "announcements_eventId_idx" ON "announcements"("eventId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problems" ADD CONSTRAINT "problems_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "rounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_assignments" ADD CONSTRAINT "problem_assignments_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_assignments" ADD CONSTRAINT "problem_assignments_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "participants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "problems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_results" ADD CONSTRAINT "submission_results_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_results" ADD CONSTRAINT "submission_results_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "test_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usages" ADD CONSTRAINT "ai_usages_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "participants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "round_scores" ADD CONSTRAINT "round_scores_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "participants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "round_scores" ADD CONSTRAINT "round_scores_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "rounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_scores" ADD CONSTRAINT "team_scores_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_scores" ADD CONSTRAINT "team_scores_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "rounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disqualifications" ADD CONSTRAINT "disqualifications_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "participants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disqualifications" ADD CONSTRAINT "disqualifications_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
