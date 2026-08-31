export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import AdminParticipantsClient from "@/features/admin/AdminParticipantsClient";

export default async function AdminParticipantsPage() {
  const session = await auth();
  const isDev = process.env.NODE_ENV !== "production";
  if (!isDev) {
    if (!session?.user?.id) redirect("/login?callbackUrl=/admin/participants");
    if (!session.user.role || !requireRole("ORGANIZER", session.user.role)) redirect("/team");
  }
  return <AdminParticipantsClient />;
}
