import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import type { UserRole } from "@/types";

export interface FallbackUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
  college?: string;
  createdAt: string;
}

// In-memory global store to survive Next.js HMR
const globalStore = (globalThis as any).__bv_fallback_users || ((globalThis as any).__bv_fallback_users = new Map<string, FallbackUser>());

const STORE_PATH = path.resolve(process.cwd(), "prisma", "fallback-users.json");

let isInitialized = false;

function loadFromDisk() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8");
      const list: FallbackUser[] = JSON.parse(raw);
      for (const u of list) {
        if (u.email) globalStore.set(u.email.toLowerCase(), u);
      }
    }
  } catch (err) {
    console.error("[UserStore] Error loading fallback users from disk:", err);
  }
}

function saveToDisk() {
  try {
    const list = Array.from(globalStore.values());
    fs.writeFileSync(STORE_PATH, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("[UserStore] Error persisting fallback users to disk:", err);
  }
}

export async function ensureInitialized() {
  if (isInitialized) return;
  loadFromDisk();

  // Generate valid bcrypt hashes for the accounts
  const adminHash = await bcrypt.hash("admin2026", 10);
  const superAdminHash = await bcrypt.hash("superadmin2026", 10);
  const coderHash = await bcrypt.hash("coder2026", 10);

  // 1. Admin Account (Sole Event Admin)
  globalStore.set("admin@byteverse.dev", {
    id: "user_admin_primary",
    email: "admin@byteverse.dev",
    name: "ByteVerse Admin",
    passwordHash: adminHash,
    role: "ADMIN",
    college: "NSDC Technical University",
    createdAt: "2026-09-10T00:00:00.000Z",
  });

  // 2. SuperAdmin Account (Sole SuperAdmin)
  globalStore.set("superadmin@byteverse.dev", {
    id: "user_superadmin_root",
    email: "superadmin@byteverse.dev",
    name: "ByteVerse Super Admin",
    passwordHash: superAdminHash,
    role: "SUPER_ADMIN",
    college: "NSDC ByteVerse Board",
    createdAt: "2026-09-10T00:00:00.000Z",
  });

  // 3. Public Participant Test Account
  if (!globalStore.has("coder@byteverse.dev")) {
    globalStore.set("coder@byteverse.dev", {
      id: "user_participant_coder",
      email: "coder@byteverse.dev",
      name: "Aryan Sharma",
      passwordHash: coderHash,
      role: "PARTICIPANT",
      college: "NSDC Engineering Institute",
      createdAt: "2026-09-10T00:00:00.000Z",
    });
  }

  // Purge any legacy deprecated accounts
  globalStore.delete("organizer@byteverse.dev");
  globalStore.delete("events@byteverse.dev");

  saveToDisk();
  isInitialized = true;
}

export function getFallbackUserByEmail(email: string): FallbackUser | undefined {
  if (!isInitialized) {
    loadFromDisk();
  }
  return globalStore.get(email.toLowerCase().trim());
}

export function getAllFallbackUsers(): FallbackUser[] {
  if (!isInitialized) {
    loadFromDisk();
  }
  return Array.from(globalStore.values());
}

export function addFallbackUser(user: {
  name: string;
  email: string;
  passwordHash: string;
  college?: string;
  role?: UserRole;
}): FallbackUser {
  const normEmail = user.email.toLowerCase().trim();
  const newUser: FallbackUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    email: normEmail,
    name: user.name.trim(),
    passwordHash: user.passwordHash,
    role: user.role || "PARTICIPANT",
    college: user.college || "Collegiate Contestant",
    createdAt: new Date().toISOString(),
  };

  globalStore.set(normEmail, newUser);
  saveToDisk();
  return newUser;
}
