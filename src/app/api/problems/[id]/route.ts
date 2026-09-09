import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPlatformProblemById } from "@/lib/platform-data";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  const problem = await getPlatformProblemById(id, userId);

  if (!problem) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  }

  return NextResponse.json(problem);
}
