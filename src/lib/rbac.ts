import type { UserRole } from "@/types";

const HIERARCHY: UserRole[] = ["PARTICIPANT", "ORGANIZER", "ADMIN", "SUPER_ADMIN"];

export function requireRole(required: UserRole, actual: UserRole): boolean {
  return HIERARCHY.indexOf(actual) >= HIERARCHY.indexOf(required);
}

/**
 * Check if a user has Admin or SuperAdmin permissions
 */
export function isAdmin(role?: UserRole | string | null): boolean {
  if (!role) return false;
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

/**
 * Check if a user is specifically a SuperAdmin (highest platform authority)
 */
export function isSuperAdmin(role?: UserRole | string | null): boolean {
  return role === "SUPER_ADMIN";
}

/**
 * Both Admin and SuperAdmin can activate/pause/end events, contests, and questions
 */
export function canControlCompetitions(role?: UserRole | string | null): boolean {
  if (!role) return false;
  return role === "ADMIN" || role === "SUPER_ADMIN" || role === "ORGANIZER";
}

/**
 * Only SuperAdmin can promote/demote admins or change user roles
 */
export function canManageAdmins(role?: UserRole | string | null): boolean {
  return role === "SUPER_ADMIN";
}

/**
 * Only SuperAdmin has full platform surveillance over all user activities and submissions
 */
export function canViewUserSurveillance(role?: UserRole | string | null): boolean {
  return role === "SUPER_ADMIN";
}
