export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import AdminDashboardClient from "@/features/admin/AdminDashboardClient";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/admin-login?callbackUrl=/admin");
  if (!session.user.role || !requireRole("ADMIN", session.user.role)) redirect("/team");
  return <AdminDashboardClient />;
}
