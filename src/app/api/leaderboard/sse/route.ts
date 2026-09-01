import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { redisClient } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const eventId = req.nextUrl.searchParams.get("eventId");
  if (!eventId) return new Response("eventId required", { status: 400 });

  const encoder = new TextEncoder();
  let cleanup: (() => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: string) => {
        try {
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        } catch { /* client disconnected */ }
      };

      send(JSON.stringify({ type: "connected" }));

      // Subscribe to per-event channel — prevents cross-event score leakage
      cleanup = redisClient.subscribe(`scores:${eventId}`, (msg) => {
        send(msg);
      });

      const heartbeat = setInterval(() => {
        send(JSON.stringify({ type: "heartbeat" }));
      }, 30000);

      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        cleanup?.();
        controller.close();
      });
    },
    cancel() {
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
