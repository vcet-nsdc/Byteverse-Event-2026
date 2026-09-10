import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/rbac";
import { db } from "@/lib/db";
import { z } from "zod";

const roleUpdateSchema = z.object({
  targetUserId: z.string().min(1),
  newRole: z.enum(["PARTICIPANT", "ORGANIZER", "ADMIN", "SUPER_ADMIN"]),
});

export async function POST(req: NextRequest) {
  const session = await auth();

  // Strict Security Gate: Only authenticated SUPER_ADMIN can govern roles
  if (!session?.user?.role || !isSuperAdmin(session.user.role)) {
    return NextResponse.json(
      { error: "Access Denied: SuperAdmin privileges are strictly required to manage roles." },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = roleUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { targetUserId, newRole } = parsed.data;

  try {
    const targetUser = await db.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    // Protect against self-demotion if the user is demoting themselves from SUPER_ADMIN
    if (session.user.id === targetUserId && newRole !== "SUPER_ADMIN") {
      const superAdminCount = await db.user.count({ where: { role: "SUPER_ADMIN" } });
      if (superAdminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot demote the only remaining SuperAdmin account." },
          { status: 400 }
        );
      }
    }

    const updatedUser = await db.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: { id: true, name: true, email: true, role: true },
    });

    // Record audit trail in database
    try {
      await db.auditLog.create({
        data: {
          userId: session.user.id,
          action: "USER_ROLE_CHANGED",
          target: targetUserId,
          metadata: {
            targetEmail: targetUser.email,
            previousRole: targetUser.role,
            newRole,
            changedBy: session.user.email,
          },
        },
      });
    } catch {
      // Non-fatal if audit logging fails
    }

    return NextResponse.json({
      success: true,
      message: `User ${updatedUser.name} (${updatedUser.email}) role updated to ${newRole}.`,
      user: updatedUser,
    });
  } catch (err: any) {
    console.error("[Role Update Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to update user role in database" },
      { status: 500 }
    );
  }
}
