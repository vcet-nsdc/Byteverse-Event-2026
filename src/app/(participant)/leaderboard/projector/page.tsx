import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function ProjectorRedirect() {
  const session = await auth();
  if (session?.user?.role === "ADMIN") {
    redirect("/admin/leaderboard/projector");
  }
  redirect("/");
}
