import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Quick probe to check if PostgreSQL is reachable
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "healthy", database: "connected" });
  } catch (err: any) {
    return NextResponse.json(
      { 
        status: "unhealthy", 
        database: "offline", 
        error: "DATABASE_UNREACHABLE",
        message: "Cannot connect to PostgreSQL server. Ensure Docker is running."
      },
      { status: 503 }
    );
  }
}
