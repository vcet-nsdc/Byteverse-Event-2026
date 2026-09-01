export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import AdminAnnouncementsClient from "@/features/admin/AdminAnnouncementsClient";

export default async function AdminAnnouncementsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/admin/announcements");
  if (!session.user.role || !requireRole("ORGANIZER", session.user.role)) redirect("/team");
  return <AdminAnnouncementsClient />;
}
