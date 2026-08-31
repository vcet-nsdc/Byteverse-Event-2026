import { requireRole } from "@/lib/rbac";

describe("requireRole", () => {
  test("PARTICIPANT has PARTICIPANT access", () => {
    expect(requireRole("PARTICIPANT", "PARTICIPANT")).toBe(true);
  });

  test("PARTICIPANT denied ADMIN access", () => {
    expect(requireRole("ADMIN", "PARTICIPANT")).toBe(false);
  });

  test("ADMIN has ORGANIZER access", () => {
    expect(requireRole("ORGANIZER", "ADMIN")).toBe(true);
  });

  test("SUPER_ADMIN has all access", () => {
    expect(requireRole("SUPER_ADMIN", "SUPER_ADMIN")).toBe(true);
    expect(requireRole("ADMIN", "SUPER_ADMIN")).toBe(true);
    expect(requireRole("PARTICIPANT", "SUPER_ADMIN")).toBe(true);
  });
});
