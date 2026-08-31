import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Redirect to /api/leaderboard/individual by default
  const url = new URL(req.url);
  const eventId = url.searchParams.get("eventId") ?? "";
  return NextResponse.redirect(
    new URL(`/api/leaderboard/individual?eventId=${eventId}`, req.url)
  );
}
