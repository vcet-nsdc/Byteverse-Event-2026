import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; problemId: string }> }
) {
  const session = await auth();
  if (!session?.user?.role || !requireRole("ADMIN", session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { problemId } = await params;
  const body = await req.json();
  const problem = await db.problem.update({
    where: { id: problemId },
    data: { isPublished: body.isPublished },
  });
  return NextResponse.json(problem);
}
