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

// Pre-computed bcrypt hashes for fast deterministic initialization
// "admin2026"
const ADMIN_HASH = "$2a$12$R.u77fV5YqV4qZqM8fF5w.lKj7k19bW7m4tB7pQ4xV2m6sN8rT1e.";
// "coder2026"
const CODER_HASH = "$2a$12$q7O8mK1rW9yZ8bC2dE3f.gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3a.";

const DEFAULT_USERS: FallbackUser[] = [
  {
    id: "user_admin_root",
    email: "admin@byteverse.dev",
    name: "ByteVerse Admin",
    passwordHash: "$2a$12$KkQ1b8U4d3d7c7U7c9Q8Xe8Y9bC2dE3f.gH4iJ5kL6mN7oP8qR9sT", // replaced on init with actual bcrypt
    role: "SUPER_ADMIN",
    college: "NSDC Technical University",
    createdAt: new Date().toISOString(),
  },
  {
    id: "user_organizer_head",
    email: "organizer@byteverse.dev",
    name: "Lead Event Organizer",
    passwordHash: "$2a$12$KkQ1b8U4d3d7c7U7c9Q8Xe8Y9bC2dE3f.gH4iJ5kL6mN7oP8qR9sT",
    role: "ORGANIZER",
    college: "NSDC Technical University",
    createdAt: new Date().toISOString(),
  },
  {
    id: "user_participant_aryan",
    email: "coder@byteverse.dev",
    name: "Aryan Sharma",
    passwordHash: "$2a$12$KkQ1b8U4d3d7c7U7c9Q8Xe8Y9bC2dE3f.gH4iJ5kL6mN7oP8qR9sT",
    role: "PARTICIPANT",
    college: "NSDC Engineering Institute",
    createdAt: new Date().toISOString(),
  },
];

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

  // Ensure default accounts exist with valid bcrypt hash
  const adminHash = await bcrypt.hash("admin2026", 10);
  const coderHash = await bcrypt.hash("coder2026", 10);

  if (!globalStore.has("admin@byteverse.dev")) {
    globalStore.set("admin@byteverse.dev", {
      id: "user_admin_root",
      email: "admin@byteverse.dev",
      name: "ByteVerse Admin",
      passwordHash: adminHash,
      role: "SUPER_ADMIN",
      college: "NSDC Technical University",
      createdAt: new Date().toISOString(),
    });
  }

  if (!globalStore.has("organizer@byteverse.dev")) {
    globalStore.set("organizer@byteverse.dev", {
      id: "user_organizer_head",
      email: "organizer@byteverse.dev",
      name: "Lead Event Organizer",
      passwordHash: adminHash,
      role: "ORGANIZER",
      college: "NSDC Technical University",
      createdAt: new Date().toISOString(),
    });
  }

  if (!globalStore.has("coder@byteverse.dev")) {
    globalStore.set("coder@byteverse.dev", {
      id: "user_participant_coder",
      email: "coder@byteverse.dev",
      name: "Aryan Sharma",
      passwordHash: coderHash,
      role: "PARTICIPANT",
      college: "NSDC Engineering Institute",
      createdAt: new Date().toISOString(),
    });
  }

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
