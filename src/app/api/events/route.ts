import { NextResponse } from "next/server";
import { getPlatformEvents } from "@/lib/platform-data";

export async function GET() {
  const data = await getPlatformEvents();
  return NextResponse.json(data);
}
