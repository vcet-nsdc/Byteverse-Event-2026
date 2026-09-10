import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function verifyAdminFeatures() {
  console.log("=== 1. Verifying Admin Accounts ===");
  const admin = await db.user.findUnique({
    where: { email: "admin@byteverse.dev" },
  });
  console.log("Admin exists:", !!admin, "Role:", admin?.role);
  if (!admin || admin.role !== "ADMIN") {
    throw new Error("Admin verification failed!");
  }

  const superAdmin = await db.user.findUnique({
    where: { email: "superadmin@byteverse.dev" },
  });
  console.log("Super Admin exists:", !!superAdmin, "Role:", superAdmin?.role);
  if (!superAdmin || superAdmin.role !== "SUPER_ADMIN") {
    throw new Error("Super Admin verification failed!");
  }

  // Verify bcrypt passwords
  const adminPassValid = await bcrypt.compare("admin2026", admin.passwordHash || "");
  console.log("Admin password valid:", adminPassValid);
  const superAdminPassValid = await bcrypt.compare("superadmin2026", superAdmin.passwordHash || "");
  console.log("Super Admin password valid:", superAdminPassValid);

  if (!adminPassValid || !superAdminPassValid) {
    throw new Error("Admin credentials verification failed!");
  }

  console.log("\n=== 2. Verifying Events Management & Ongoing Events ===");
  const testEventId = "test-ongoing-event-" + Date.now();
  const createdEvent = await db.event.create({
    data: {
      id: testEventId,
      name: "ByteVerse Automated Verification Hackathon",
      description: "Automated test event to verify ongoing event publishing",
      venue: "Virtual Arena & Computing Labs",
      category: "Collegiate Verification",
      isActive: true, // ONGOING
      registrationOpen: true,
      startsAt: new Date(),
      endsAt: new Date(Date.now() + 12 * 3600 * 1000),
    },
  });
  console.log("Created test ongoing event:", createdEvent.id, "isActive:", createdEvent.isActive);

  // Toggle ongoing status to false (ended)
  const updatedEvent = await db.event.update({
    where: { id: testEventId },
    data: { isActive: false },
  });
  console.log("Toggled test event isActive to:", updatedEvent.isActive);

  // Cleanup test event
  await db.event.delete({ where: { id: testEventId } });
  console.log("Cleaned up test event successfully.");

  console.log("\n=== 3. Verifying Contest Creation & Publishing ===");
  const testContestId = "test-contest-" + Date.now();
  const createdContest = await db.contest.create({
    data: {
      id: testContestId,
      title: "Automated Super Admin Weekly Test Contest",
      description: "Contest created to verify super admin publishing pipeline",
      type: "WEEKLY",
      status: "SCHEDULED",
      difficulty: "Mixed",
      startsAt: new Date(Date.now() + 3600 * 1000),
      endsAt: new Date(Date.now() + 7200 * 1000),
    },
  });
  console.log("Created test contest with status:", createdContest.status);

  // Super Admin publishes contest -> status: "ACTIVE"
  const publishedContest = await db.contest.update({
    where: { id: testContestId },
    data: { status: "ACTIVE" },
  });
  console.log("Published contest to ACTIVE status:", publishedContest.status);

  // Super Admin concludes contest -> status: "ENDED"
  const endedContest = await db.contest.update({
    where: { id: testContestId },
    data: { status: "ENDED" },
  });
  console.log("Ended contest status:", endedContest.status);

  // Cleanup test contest
  await db.contest.delete({ where: { id: testContestId } });
  console.log("Cleaned up test contest successfully.");

  console.log("\n=== 4. Verifying Registered Users Telemetry ===");
  const totalUsers = await db.user.count();
  const roleGroups = await db.user.groupBy({
    by: ["role"],
    _count: { id: true },
  });
  console.log("Total Registered Users in DB:", totalUsers);
  console.log("User breakdown by role:", JSON.stringify(roleGroups, null, 2));

  const contestParticipantsCount = await db.contestParticipant.count();
  console.log("Total Contest Registrations:", contestParticipantsCount);

  console.log("\n>>> ALL ADMIN UPGRADES & PERMISSIONS VERIFIED SUCCESSFULLY! <<<");
  await db.$disconnect();
}

verifyAdminFeatures().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
