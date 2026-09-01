import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

const schema = z.object({
  name: z.string().min(3, "Team name must be at least 3 characters").max(50),
  eventId: z.string().optional(),
  leaderFirstName: z.string().min(1, "First name is required").optional(),
  leaderLastName: z.string().min(1, "Last name is required").optional(),
  leaderEmail: z.string().email("Invalid email address").optional(),
});

function generate8DigitInviteCode(): string {
  const digits = "0123456789";
  let code = (Math.floor(Math.random() * 9) + 1).toString();
  for (let i = 1; i < 8; i++) {
    code += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return code;
}

export async function POST(req: NextRequest) {
  const session = await auth();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request data format" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Invalid registration data";
    return NextResponse.json({ error: errorMsg }, { status: 422 });
  }

  const { name, leaderFirstName, leaderLastName, leaderEmail } = parsed.data;
  let eventId = parsed.data.eventId;

  if (!eventId) {
    const activeEvent = await db.event.findFirst({
      where: { isActive: true },
      select: { id: true },
    });
    if (!activeEvent) {
      const anyEvent = await db.event.findFirst({ select: { id: true } });
      if (!anyEvent)
        return NextResponse.json({ error: "No active competition event found." }, { status: 400 });
      eventId = anyEvent.id;
    } else {
      eventId = activeEvent.id;
    }
  }

  // Verify whether current session user actually exists in the database
  let currentUser = session?.user?.id
    ? await db.user.findUnique({ where: { id: session.user.id } })
    : null;

  let userId = currentUser?.id;
  let autoAuthCredentials: { email: string; password: string } | null = null;

  // If not logged in or session user ID is stale/invalid in DB, upsert from provided captain details
  if (!userId || leaderEmail) {
    const emailToUse = (leaderEmail || currentUser?.email)?.toLowerCase();
    if (!emailToUse) {
      return NextResponse.json(
        { error: "Captain email is required to register." },
        { status: 400 },
      );
    }

    const tempPassword = `BV-${Math.random().toString(36).slice(-8)}!`;
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const fullName = leaderFirstName && leaderLastName 
      ? `${leaderFirstName} ${leaderLastName}`.trim()
      : currentUser?.name || "Team Captain";

    try {
      const userRecord = await db.user.upsert({
        where: { email: emailToUse },
        update: { name: fullName },
        create: {
          email: emailToUse,
          name: fullName,
          passwordHash,
          role: "PARTICIPANT",
        },
      });
      userId = userRecord.id;
      autoAuthCredentials = {
        email: emailToUse,
        password: tempPassword,
      };
    } catch {
      return NextResponse.json(
        { error: "Could not create or access captain account. Please try again." },
        { status: 400 }
      );
    }
  }

  let team: { id: string; inviteCode: string; status: string };
  try {
    team = await db.$transaction(
      async (tx) => {
        const event = await tx.event.findUnique({ where: { id: eventId } });
        if (!event?.teamRegistrationOpen) {
          throw Object.assign(new Error("Team registration is currently closed."), {
            code: "CLOSED",
          });
        }

        const existing = await tx.teamMember.findUnique({
          where: { userId: userId! },
          include: { team: { select: { status: true } } },
        });
        if (existing && existing.team.status !== "DISQUALIFIED") {
          throw Object.assign(new Error("You are already registered with an active team."), {
            code: "ALREADY_MEMBER",
          });
        }

        // Generate a unique 8-digit invite code
        let inviteCode = generate8DigitInviteCode();
        let attempts = 0;
        while (attempts < 10) {
          const existingCode = await tx.team.findUnique({ where: { inviteCode } });
          if (!existingCode) break;
          inviteCode = generate8DigitInviteCode();
          attempts++;
        }

        return tx.team.create({
          data: {
            name: name.trim(),
            inviteCode,
            eventId: eventId!,
            status: "PENDING",
            members: {
              create: { userId: userId!, isLeader: true },
            },
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (err) {
    const e = err as { code?: string; message?: string };
    if (e.code === "CLOSED") {
      return NextResponse.json(
        { error: "Team registration is currently closed." },
        { status: 403 },
      );
    }
    if (e.code === "ALREADY_MEMBER") {
      return NextResponse.json(
        { error: "You are already a member of a team. Please leave your current team first." },
        { status: 409 },
      );
    }
    if (e.code === "P2002") {
      return NextResponse.json(
        { error: "A team with that name already exists. Please choose a different team name." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create team. Please try a different team name or refresh the page." },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      teamId: team.id,
      inviteCode: team.inviteCode,
      status: team.status,
      autoAuth: autoAuthCredentials,
    },
    { status: 201 },
  );
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await db.teamMember.findUnique({
    where: { userId: session.user.id },
    include: { team: true },
  });

  if (!membership) {
    return NextResponse.json({ error: "You are not in a team" }, { status: 404 });
  }

  if (membership.isLeader) {
    await db.team.delete({
      where: { id: membership.teamId },
    });
    return NextResponse.json({ success: true, message: "Team disbanded successfully" });
  } else {
    await db.teamMember.delete({
      where: { id: membership.id },
    });
    return NextResponse.json({ success: true, message: "Left team successfully" });
  }
}
