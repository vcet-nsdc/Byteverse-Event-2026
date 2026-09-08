export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import AdminContestsClient from "@/features/admin/AdminContestsClient";

export default async function AdminContestsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/admin/contests");
  // Super Admin or Admin required
  if (!session.user.role || !requireRole("ADMIN", session.user.role)) redirect("/admin");

  return <AdminContestsClient userRole={session.user.role} />;
}
