import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SuperAdminEntryPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
    redirect("/admin-login?portal=superadmin&callbackUrl=/admin/superadmin");
  }

  redirect("/admin/superadmin");
}
