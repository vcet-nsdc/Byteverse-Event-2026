import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  statement: z.string().min(1).optional(),
  constraints: z.string().optional(),
  sampleInput: z.string().optional(),
  sampleOutput: z.string().optional(),
  inputFormat: z.string().optional(),
  outputFormat: z.string().optional(),
  timeLimitMs: z.number().int().min(500).max(10000).optional(),
  memoryLimitMb: z.number().int().min(32).max(512).optional(),
  allowedLangs: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  aiBaselineSolution: z.string().optional(),
  set: z.enum(["A", "B"]).optional(),
  starterCodes: z.any().optional(),
  options: z.any().optional(),
  correctOption: z.string().optional(),
});

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.role || !requireRole("ORGANIZER", session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await db.problem.delete({ where: { id } });
  return NextResponse.json({ message: "Problem deleted successfully" });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.role || !requireRole("ORGANIZER", session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const problem = await db.problem.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json(problem);
}
