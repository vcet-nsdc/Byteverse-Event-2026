import { NextResponse } from "next/server";

export async function GET() {
  const googleClientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  
  const configured = Boolean(
    googleClientId &&
    googleClientSecret &&
    !googleClientId.includes("your-google-client-id") &&
    googleClientId.trim().length > 5
  );

  return NextResponse.json({
    configured,
    devMode: process.env.NODE_ENV !== "production" || !configured,
  });
}
