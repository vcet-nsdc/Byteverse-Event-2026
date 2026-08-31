import { NextResponse } from "next/server";
export async function PUT() {
  return NextResponse.json({ error: "Use /api/judge/webhook" }, { status: 404 });
}
