export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ParticipantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (
    session?.user?.role &&
    ["ORGANIZER", "ADMIN", "SUPER_ADMIN"].includes(session.user.role)
  ) {
    redirect("/admin");
  }

  return <div className="min-h-screen bg-bv-deep">{children}</div>;
}
