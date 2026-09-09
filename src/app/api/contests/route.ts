import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPlatformContests } from "@/lib/platform-data";

export async function GET(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;

  const data = await getPlatformContests(userId);

  return NextResponse.json(data);
}
