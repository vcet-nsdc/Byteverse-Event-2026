export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import AdminRoundsClient from "@/features/admin/AdminRoundsClient";

export default async function AdminRoundsPage() {
  const session = await auth();
  const isDev = process.env.NODE_ENV !== "production";
  if (!isDev) {
    if (!session?.user?.id) redirect("/login?callbackUrl=/admin/rounds");
    if (!session.user.role || !requireRole("ORGANIZER", session.user.role)) redirect("/team");
  }
  return <AdminRoundsClient />;
}
