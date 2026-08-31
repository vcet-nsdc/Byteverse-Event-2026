import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  const user = await db.user.findUnique({
    where: { email: "admin@byteverse.dev" },
  });
  console.log("Found user:", user?.id, user?.email, user?.role);
  if (user?.passwordHash) {
    const isMatch = await bcrypt.compare("admin2026", user.passwordHash);
    console.log("Password 'admin2026' matches:", isMatch);
  } else {
    console.log("NO PASSWORD HASH FOUND! Setting password now...");
    const hash = await bcrypt.hash("admin2026", 12);
    await db.user.upsert({
      where: { email: "admin@byteverse.dev" },
      update: { passwordHash: hash, role: "SUPER_ADMIN" },
      create: { email: "admin@byteverse.dev", name: "admin", passwordHash: hash, role: "SUPER_ADMIN" },
    });
    console.log("Password 'admin2026' set successfully!");
  }
}

main().catch(console.error).finally(() => process.exit(0));
