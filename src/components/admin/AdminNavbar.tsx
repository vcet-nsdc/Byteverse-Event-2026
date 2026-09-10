"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Trophy,
  Sparkles,
  Calendar,
  Users,
  LayoutDashboard,
  Megaphone,
  Layers,
  LucideIcon,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import { requireRole } from "@/lib/rbac";
import type { UserRole } from "@/types";

interface AdminNavbarProps {
  userRole: string;
  userEmail: string;
}

interface NavItem {
  label: string;
  href: string;
  exact: boolean;
  icon?: LucideIcon;
  minRole?: UserRole;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/admin", exact: true, icon: LayoutDashboard },
  { label: "SuperAdmin", href: "/admin/superadmin", exact: false, icon: ShieldAlert, minRole: "SUPER_ADMIN" },
  { label: "Contests", href: "/admin/contests", exact: false, icon: Trophy, minRole: "ADMIN" },
  { label: "Events", href: "/admin/events", exact: false, icon: Calendar, minRole: "ORGANIZER" },
  { label: "Registered Users", href: "/admin/users", exact: false, icon: Users, minRole: "ORGANIZER" },
  { label: "Round Control", href: "/admin/rounds", exact: false, icon: Layers, minRole: "ORGANIZER" },
  { label: "Teams", href: "/admin/teams", exact: false, icon: UserCheck, minRole: "ORGANIZER" },
  { label: "AI Key Pool", href: "/admin/ai", exact: false, icon: Sparkles, minRole: "ADMIN" },
  { label: "Announcements", href: "/admin/announcements", exact: false, icon: Megaphone, minRole: "ORGANIZER" },
  { label: "Leaderboard", href: "/admin/leaderboard", exact: false, icon: Trophy, minRole: "ORGANIZER" },
];

export default function AdminNavbar({ userRole, userEmail }: AdminNavbarProps) {
  const pathname = usePathname();

  const isAllowed = (minRole?: UserRole) => {
    if (!minRole) return true;
    return requireRole(minRole, userRole as UserRole);
  };

  return (
    <nav className="border-b-2 border-[#1E1B4B]/10 px-4 sm:px-6 py-2.5 flex items-center justify-between bg-white sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-4 lg:gap-6 flex-wrap">
        <Link href="/admin" className="flex items-center gap-2.5 shrink-0">
          <span className="w-3 h-3 rounded-full bg-[#7F45DB] animate-pulse" />
          <span className="font-extrabold font-mono text-base sm:text-lg text-[#0F172A] tracking-tight uppercase">
            BYTEVERSE <span className="text-[#7F45DB]">ADMIN</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 overflow-x-auto max-w-[65vw] pb-1 sm:pb-0 scrollbar-none text-xs font-semibold">
          {NAV_ITEMS.filter((item) => isAllowed(item.minRole)).map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-xl transition-all font-mono flex items-center gap-1.5 shrink-0 whitespace-nowrap text-xs ${
                  isActive
                    ? "bg-[#7F45DB] text-white border-2 border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B] font-black"
                    : "text-[#6E6E6E] hover:text-[#0F172A] hover:bg-[#F0F2F8] border-2 border-transparent font-bold"
                }`}
              >
                {Icon && (
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-[#7F45DB]"}`} />
                )}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2.5 text-xs shrink-0">
        <span className="font-mono text-[11px] font-black px-2.5 py-1 rounded-lg bg-[#7F45DB]/10 text-[#4A2293] border border-[#7F45DB]/30 uppercase flex items-center gap-1">
          {userRole === "SUPER_ADMIN" ? (
            <Shield className="w-3 h-3 text-rose-600 fill-rose-600" />
          ) : userRole === "ADMIN" ? (
            <ShieldCheck className="w-3 h-3 text-purple-600" />
          ) : (
            <Sparkles className="w-3 h-3 text-amber-600" />
          )}
          <span>{userRole}</span>
        </span>
        <span className="text-[#6E6E6E] hidden xl:inline font-mono text-xs font-medium max-w-[160px] truncate">
          {userEmail}
        </span>
      </div>
    </nav>
  );
}
