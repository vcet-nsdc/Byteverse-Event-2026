export type UserRole = "PARTICIPANT" | "ORGANIZER" | "ADMIN" | "SUPER_ADMIN";
export type RoundType = "CODE_LOGIC" | "AI_REPAIR" | "TRADITIONAL" | "TYPE_TRANSFORM" | "HUMAN_VS_MACHINE";
export type RoundStatus = "DRAFT" | "SCHEDULED" | "ACTIVE" | "PAUSED" | "ENDED";
export type SubmissionStatus =
  | "QUEUED" | "RUNNING" | "ACCEPTED" | "WRONG_ANSWER"
  | "TIME_LIMIT_EXCEEDED" | "MEMORY_LIMIT_EXCEEDED"
  | "COMPILATION_ERROR" | "RUNTIME_ERROR" | "SYSTEM_ERROR";

export interface IndividualLeaderboardEntry {
  rank: number;
  participantId: string;
  name: string;
  college: string;
  roundScores: Record<string, number>;
  totalScore: number;
  explainUsed: boolean;
  codeUsed: boolean;
  lastActivity?: Date;
}

export interface TeamLeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  member1Name: string;
  member2Name: string;
  roundScores: Record<string, number>;
  totalScore: number;
}

export interface SubmissionPayload {
  problemId: string;
  roundId: string;
  language: string;
  sourceCode: string;
  idempotencyKey: string;
}

export interface AIRequest {
  roundId: string;
  type: "EXPLAIN" | "CODE";
  message: string;
}

export interface JudgeWebhookPayload {
  token: string;
  status: { id: number; description: string };
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  time?: string;
  memory?: number;
}
