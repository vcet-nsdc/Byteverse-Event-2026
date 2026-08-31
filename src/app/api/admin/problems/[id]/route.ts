import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const isDev = process.env.NODE_ENV !== "production";
  if (!isDev) {
    if (!session?.user?.role || !requireRole("ORGANIZER", session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
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
  const isDev = process.env.NODE_ENV !== "production";
  if (!isDev) {
    if (!session?.user?.role || !requireRole("ORGANIZER", session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const { id } = await params;
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const problem = await db.problem.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(problem);
}
