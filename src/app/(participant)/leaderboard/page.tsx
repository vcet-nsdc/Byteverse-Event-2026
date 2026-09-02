import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function LeaderboardRedirect() {
  const session = await auth();
  if (session?.user?.role === "ADMIN") {
    redirect("/admin/leaderboard");
  }
  redirect("/");
}
