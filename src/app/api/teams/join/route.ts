import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

const schema = z.object({
  inviteCode: z.string().min(1, "Invite code is required"),
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  college: z.string().min(1, "College name is required").optional(),
});

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
    const errorMsg = parsed.error.issues[0]?.message || "Invalid join details";
    return NextResponse.json({ error: errorMsg }, { status: 422 });
  }

  const { inviteCode, firstName, lastName, email, college } = parsed.data;

  // Verify whether current session user actually exists in the database
  let currentUser = session?.user?.id
    ? await db.user.findUnique({ where: { id: session.user.id } })
    : null;

  let userId = currentUser?.id;
  let autoAuthCredentials: { email: string; password: string } | null = null;

  if (!userId || email) {
    const emailToUse = (email || currentUser?.email)?.toLowerCase();
    if (!emailToUse) {
      return NextResponse.json(
        { error: "Your email address is required to join a team." },
        { status: 400 },
      );
    }

    const tempPassword = `BV-${Math.random().toString(36).slice(-8)}!`;
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const fullName = firstName && lastName 
      ? `${firstName} ${lastName}`.trim() 
      : currentUser?.name || "Team Member";

    try {
      const userRecord = await db.user.upsert({
        where: { email: emailToUse },
        update: { 
          name: fullName,
          ...(college ? { college: college.trim() } : {}),
        },
        create: {
          email: emailToUse,
          name: fullName,
          college: college?.trim() || "NSDC College",
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
        { error: "Could not create or access account. Please try again." },
        { status: 400 }
      );
    }
  }

  try {
    const updated = await db.$transaction(
      async (tx) => {
        const trimmedCode = inviteCode.trim();
        const team = await tx.team.findFirst({
          where: {
            OR: [
              { inviteCode: trimmedCode },
              { inviteCode: trimmedCode.toUpperCase() },
            ],
          },
          include: {
            members: true,
            event: { select: { teamRegistrationOpen: true } },
          },
        });

        if (!team) {
          throw Object.assign(new Error("Team not found"), { code: "NOT_FOUND" });
        }
        if (!team.event.teamRegistrationOpen) {
          throw Object.assign(new Error("Team registration is closed"), {
            code: "CLOSED",
          });
        }
        if (team.members.length >= 2) {
          throw Object.assign(new Error("Team is already full (maximum 2 members)."), {
            code: "FULL",
          });
        }
        if (team.status === "LOCKED" || team.status === "DISQUALIFIED") {
          throw Object.assign(new Error("This team is currently unavailable to accept members."), {
            code: "INACTIVE",
          });
        }

        if (team.members.some((m) => m.userId === userId)) {
          return team;
        }

        const existingMembership = await tx.teamMember.findUnique({
          where: { userId: userId! },
          include: { team: { select: { status: true } } },
        });
        if (existingMembership && existingMembership.team.status !== "DISQUALIFIED") {
          throw Object.assign(new Error("You are already in a team."), {
            code: "ALREADY_MEMBER",
          });
        }

        await tx.teamMember.create({
          data: { teamId: team.id, userId: userId!, isLeader: false },
        });

        return tx.team.findUnique({
          where: { id: team.id },
          include: { members: true },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return NextResponse.json({
      teamId: updated?.id,
      inviteCode: updated?.inviteCode,
      status: updated?.status,
      memberCount: updated?.members.length ?? 2,
      autoAuth: autoAuthCredentials,
    });
  } catch (err) {
    const e = err as { code?: string; message?: string };
    if (e.code === "NOT_FOUND") {
      return NextResponse.json(
        { error: "Invalid invite code. Please check the code with your Captain." },
        { status: 404 }
      );
    }
    if (e.code === "CLOSED") {
      return NextResponse.json(
        { error: "Team registration is currently closed." },
        { status: 403 }
      );
    }
    if (e.code === "FULL") {
      return NextResponse.json(
        { error: "This team is already full (maximum 2 members allowed)." },
        { status: 409 }
      );
    }
    if (e.code === "INACTIVE") {
      return NextResponse.json(
        { error: "This team is currently locked or inactive." },
        { status: 400 }
      );
    }
    if (e.code === "ALREADY_MEMBER") {
      return NextResponse.json(
        { error: "You are already a member of a team. Please leave your current team first." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to join team. Please check the invite code and try again." },
      { status: 400 },
    );
  }
}
