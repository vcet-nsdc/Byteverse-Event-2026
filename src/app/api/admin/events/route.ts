import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.role || !requireRole("ORGANIZER", session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const events = await db.event.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(events);
}
