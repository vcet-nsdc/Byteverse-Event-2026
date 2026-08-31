import type { UserRole } from "@/types";

const HIERARCHY: UserRole[] = ["PARTICIPANT", "ORGANIZER", "ADMIN", "SUPER_ADMIN"];

export function requireRole(required: UserRole, actual: UserRole): boolean {
  return HIERARCHY.indexOf(actual) >= HIERARCHY.indexOf(required);
}
