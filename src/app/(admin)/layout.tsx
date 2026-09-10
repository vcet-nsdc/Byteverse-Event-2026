export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import AdminNavbar from "@/components/admin/AdminNavbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  // Strict Authentication Guard: Only authenticated ADMIN / ORGANIZER can access any /admin page
  if (!session?.user?.id || !session.user.role || !requireRole("ORGANIZER", session.user.role)) {
    redirect("/admin-login?callbackUrl=/admin");
  }

  const userRole = session.user.role;
  const userEmail = session.user.email ?? "admin@byteverse.dev";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Navigation Bar with active path highlight */}
      <AdminNavbar userRole={userRole} userEmail={userEmail} />

      {/* Main Admin Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
