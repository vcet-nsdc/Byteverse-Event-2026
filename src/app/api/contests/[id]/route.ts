import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPlatformContestById } from "@/lib/platform-data";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  const contest = await getPlatformContestById(id, userId);

  if (!contest) {
    return NextResponse.json({ error: "Contest not found" }, { status: 404 });
  }

  return NextResponse.json(contest);
}
