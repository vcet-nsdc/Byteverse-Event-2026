import { NextRequest, NextResponse } from "next/server";
import { auth, requireRole } from "@/lib/auth";
import { getAllKeysTelemetry, testKeyHealth } from "@/lib/ai-gateway";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await auth();
  const isDev = process.env.NODE_ENV !== "production";

  if (!isDev) {
    if (!session?.user?.role || !requireRole("ORGANIZER", session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  let body: { keyIndex?: number; testAll?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    // defaults to testAll
  }

  const telemetry = await getAllKeysTelemetry();

  if (body.keyIndex !== undefined && body.keyIndex >= 0) {
    // Test single key
    const result = await testKeyHealth(body.keyIndex);
    return NextResponse.json({ results: [result] });
  }

  // Test all keys in pool in parallel
  const results = await Promise.all(
    telemetry.keys.map((k) => testKeyHealth(k.index))
  );

  return NextResponse.json({ results });
}
