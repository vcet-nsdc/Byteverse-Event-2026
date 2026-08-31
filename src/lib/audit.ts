import type { Prisma } from "@prisma/client";
import { db } from "./db";

export async function logAction(
  userId: string,
  action: string,
  target?: string,
  metadata?: Prisma.InputJsonValue,
  ip?: string
): Promise<void> {
  try {
    await db.auditLog.create({ data: { userId, action, target, metadata, ip } });
  } catch (err) {
    console.error("[Audit] Failed to log action:", err);
  }
}
