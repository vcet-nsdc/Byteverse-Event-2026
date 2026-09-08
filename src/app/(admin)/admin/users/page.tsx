export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import AdminUsersClient from "@/features/admin/AdminUsersClient";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/admin/users");
  if (!session.user.role || !requireRole("ORGANIZER", session.user.role)) redirect("/admin");

  return <AdminUsersClient userRole={session.user.role} currentUserEmail={session.user.email || ""} />;
}
