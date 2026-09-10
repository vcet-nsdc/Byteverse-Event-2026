"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/theme/ThemeToggle";
import {
  Code2,
  Trophy,
  Calendar,
  BookOpen,
  MessageSquare,
  User,
  Menu,
  X,
  LogOut,
  ShieldAlert,
  ChevronDown,
  Sparkles,
} from "lucide-react";

interface NavLink {
  label: string;
  href: string;
  exact?: boolean;
  icon: any;
}

const NAV_LINKS: NavLink[] = [
  { label: "HOME", href: "/", exact: true, icon: Code2 },
  { label: "CONTEST", href: "/contest", icon: Trophy },
  { label: "EVENT", href: "/event", icon: Calendar },
  { label: "PRACTICE", href: "/practice", icon: BookOpen },
  { label: "DISCUSSION", href: "/discussion", icon: MessageSquare },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; name?: string; email?: string; role?: string } | null>(null);

  useEffect(() => {
    // Fetch current user session
    async function loadSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data?.user?.id) {
            setUser(data.user);
          }
        }
      } catch {
        // ignore
      }
    }
    loadSession();
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  // Hide Navbar in the full-screen tournament rounds workspace, contest arena, and admin portals
  if (
    pathname.startsWith("/rounds/") ||
    pathname.startsWith("/admin") ||
    pathname === "/admin-login" ||
    pathname === "/superadmin-login" ||
    (pathname.startsWith("/contest/") && pathname.includes("/arena/"))
  ) {
    return null;
  }

  const isAdmin = user?.role && ["ADMIN", "SUPER_ADMIN", "ORGANIZER"].includes(user.role);

  return (
    <nav className="sticky top-0 z-40 bg-white/95 dark:bg-[#0C0F1D]/90 backdrop-blur-md border-b-2 border-[#1E1B4B] dark:border-[#2D2755] shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-4 sm:gap-5">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="relative h-11 w-auto flex items-center">
                <Image
                  src="/assets/byteverse-logo.png?v=3"
                  alt="ByteVerse Logo"
                  width={150}
                  height={50}
                  className="h-10 sm:h-11 w-auto object-contain drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(164,114,247,0.35)] group-hover:scale-105 group-hover:-translate-y-0.5 transition-all duration-200"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1.5 pl-3.5 border-l-2 border-[#1E1B4B]/15 dark:border-[#A472F7]/20">
              {NAV_LINKS.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-mono tracking-wider transition-all flex items-center gap-1.5 ${
                      isActive
                        ? "bg-[#7F45DB] text-white border-2 border-[#1E1B4B] dark:border-[#A472F7] shadow-[3px_3px_0px_0px_#1E1B4B] dark:shadow-[3px_3px_0px_0px_#A472F7] font-black"
                        : "text-[#6E6E6E] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F0F2F8] dark:hover:bg-[#1A1830] border-2 border-transparent font-bold"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Controls: Theme Toggle & Profile / Auth */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border-2 border-[#1E1B4B] dark:border-[#A472F7] bg-white dark:bg-[#16122C] shadow-[3px_3px_0px_0px_#1E1B4B] dark:shadow-[3px_3px_0px_0px_#A472F7] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#7F45DB]/15 text-[#7F45DB] font-mono font-black text-xs flex items-center justify-center border border-[#7F45DB]/30">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                  <span className="text-xs font-mono font-black text-[#0F172A] dark:text-white max-w-[120px] truncate">
                    {user.name || "PROFILE"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6E6E6E] dark:text-[#94A3B8]" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#16122C] border-2 border-[#1E1B4B] dark:border-[#A472F7] rounded-2xl shadow-[5px_5px_0px_0px_#1E1B4B] dark:shadow-[5px_5px_0px_0px_#A472F7] py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-[#1E1B4B]/10 dark:border-[#2D2755]">
                      <p className="text-xs font-bold text-[#0F172A] dark:text-white truncate">{user.name || "User"}</p>
                      <p className="text-[10px] font-mono text-[#6E6E6E] dark:text-[#94A3B8] truncate">{user.email}</p>
                      {user.role && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-mono font-bold rounded-md bg-[#7F45DB]/10 text-[#7F45DB] border border-[#7F45DB]/20">
                          {user.role}
                        </span>
                      )}
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold text-[#0F172A] dark:text-white hover:bg-[#F0F2F8] dark:hover:bg-[#201A3F]"
                    >
                      <User className="w-4 h-4 text-[#7F45DB]" />
                      <span>My Profile & Stats</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <div className="border-t border-[#1E1B4B]/10 dark:border-[#2D2755] my-1" />

                    <Link
                      href="/login"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out / Switch</span>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-xl border-2 border-[#1E1B4B] dark:border-[#A472F7] bg-white dark:bg-[#16122C] text-[#0F172A] dark:text-white font-mono font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#1E1B4B] dark:shadow-[3px_3px_0px_0px_#A472F7] hover:bg-[#F0F2F8] dark:hover:bg-[#201A3F] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/login?mode=signup"
                  className="px-4 py-1.5 rounded-xl border-2 border-[#1E1B4B] dark:border-[#A472F7] bg-[#7F45DB] text-white font-mono font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#1E1B4B] dark:shadow-[3px_3px_0px_0px_#A472F7] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Controls: Theme Toggle & Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border-2 border-[#1E1B4B] dark:border-[#A472F7] bg-white dark:bg-[#16122C] text-[#0F172A] dark:text-white shadow-[2px_2px_0px_0px_#1E1B4B] dark:shadow-[2px_2px_0px_0px_#A472F7]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-[#1E1B4B] dark:border-[#2D2755] bg-[#F8F9FD] dark:bg-[#0C0F1D] px-4 pt-3 pb-6 space-y-2">
          {NAV_LINKS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-mono font-black tracking-wider ${
                  isActive
                    ? "bg-[#7F45DB] text-white border-2 border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B]"
                    : "text-[#0F172A] hover:bg-white border border-transparent"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="border-t border-[#1E1B4B]/10 pt-3">
            {user ? (
              <div className="space-y-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border-2 border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B] text-xs font-mono font-bold text-[#0F172A]"
                >
                  <User className="w-4 h-4 text-[#7F45DB]" />
                  <span>My Profile ({user.name || user.email})</span>
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-amber-50 border-2 border-amber-500 text-xs font-mono font-bold text-amber-900"
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white text-[#0F172A] border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] text-xs font-mono font-black uppercase"
                >
                  Sign In
                </Link>
                <Link
                  href="/login?mode=signup"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#7F45DB] text-white border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] text-xs font-mono font-black uppercase"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
