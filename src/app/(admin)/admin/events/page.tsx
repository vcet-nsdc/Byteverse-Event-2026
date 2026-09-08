export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import AdminEventsClient from "@/features/admin/AdminEventsClient";

export default async function AdminEventsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/admin/events");
  if (!session.user.role || !requireRole("ORGANIZER", session.user.role)) redirect("/admin");

  return <AdminEventsClient userRole={session.user.role} />;
}
