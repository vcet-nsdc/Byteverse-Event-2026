export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import ProblemCreatorClient from "@/features/admin/ProblemCreatorClient";

export default async function AdminRoundProblemsPage({
  params,
}: {
  params: Promise<{ roundId: string }>;
}) {
  const session = await auth();
  const isDev = process.env.NODE_ENV !== "production";
  if (!isDev) {
    if (!session?.user?.id) redirect("/login?callbackUrl=/admin/rounds");
    if (!session.user.role || !requireRole("ORGANIZER", session.user.role)) redirect("/team");
  }

  const { roundId } = await params;
  return <ProblemCreatorClient roundId={roundId} />;
}
