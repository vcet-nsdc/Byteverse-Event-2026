"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Sparkles, LucideIcon } from "lucide-react";

interface AdminNavbarProps {
  userRole: string;
  userEmail: string;
}

interface NavItem {
  label: string;
  href: string;
  exact: boolean;
  icon?: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/admin", exact: true },
  { label: "Round Control", href: "/admin/rounds", exact: false },
  { label: "Teams Info", href: "/admin/teams", exact: false },
  { label: "Participants Info", href: "/admin/participants", exact: false },
  { label: "AI Key Pool", href: "/admin/ai", exact: false, icon: Sparkles },
  { label: "Announcements", href: "/admin/announcements", exact: false },
  { label: "Leaderboard", href: "/admin/leaderboard", exact: false, icon: Trophy },
];

export default function AdminNavbar({ userRole, userEmail }: AdminNavbarProps) {
  const pathname = usePathname();

  return (
    <nav className="border-b-2 border-[#1E1B4B]/10 px-6 py-3 flex items-center justify-between bg-white sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-8 flex-wrap">
        <Link href="/admin" className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-[#7F45DB] animate-pulse" />
          <span className="font-extrabold font-mono text-lg text-[#0F172A] tracking-tight uppercase">
            BYTEVERSE <span className="text-[#7F45DB]">ADMIN</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-2 text-xs font-semibold">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-xl transition-all font-mono flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#7F45DB] text-white border-2 border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B] font-black"
                    : "text-[#6E6E6E] hover:text-[#0F172A] hover:bg-[#F0F2F8] border-2 border-transparent font-bold"
                }`}
              >
                {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-[#7F45DB]"}`} />}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#7F45DB]/10 text-[#4A2293] border border-[#7F45DB]/30 uppercase">
          {userRole}
        </span>
        <span className="text-[#6E6E6E] hidden sm:inline font-mono text-xs font-medium">
          {userEmail}
        </span>
      </div>
    </nav>
  );
}
