"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

  // Hide Navbar in the full-screen tournament rounds workspace
  if (pathname.startsWith("/rounds/")) {
    return null;
  }

  // Admin layouts already have AdminNavbar
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const isAdmin = user?.role && ["ADMIN", "SUPER_ADMIN", "ORGANIZER"].includes(user.role);

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-[#1E1B4B] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#7F45DB] border-2 border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B] flex items-center justify-center text-white font-mono font-black text-base group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none transition-all">
                BV
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-lg text-[#0F172A] tracking-tight uppercase">
                    BYTE<span className="text-[#7F45DB]">VERSE</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-mono font-black uppercase rounded bg-[#7F45DB]/10 text-[#7F45DB] border border-[#7F45DB]/30">
                    2026
                  </span>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1.5 pl-4 border-l-2 border-[#1E1B4B]/10">
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
                        ? "bg-[#7F45DB] text-white border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] font-black"
                        : "text-[#6E6E6E] hover:text-[#0F172A] hover:bg-[#F0F2F8] border-2 border-transparent font-bold"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Controls: Profile / Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border-2 border-[#1E1B4B] bg-white shadow-[3px_3px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#1E1B4B] transition-all"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#7F45DB]/15 text-[#7F45DB] font-mono font-black text-xs flex items-center justify-center border border-[#7F45DB]/30">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                  <span className="text-xs font-mono font-black text-[#0F172A] max-w-[120px] truncate">
                    {user.name || "PROFILE"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#6E6E6E]" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border-2 border-[#1E1B4B] rounded-2xl shadow-[5px_5px_0px_0px_#1E1B4B] py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-[#1E1B4B]/10">
                      <p className="text-xs font-bold text-[#0F172A] truncate">{user.name || "User"}</p>
                      <p className="text-[10px] font-mono text-[#6E6E6E] truncate">{user.email}</p>
                      {user.role && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-mono font-bold rounded-md bg-[#7F45DB]/10 text-[#7F45DB] border border-[#7F45DB]/20">
                          {user.role}
                        </span>
                      )}
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold text-[#0F172A] hover:bg-[#F0F2F8]"
                    >
                      <User className="w-4 h-4 text-[#7F45DB]" />
                      <span>My Profile & Stats</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold text-amber-700 hover:bg-amber-50"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-600" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <div className="border-t border-[#1E1B4B]/10 my-1" />

                    <Link
                      href="/login"
                      className="flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold text-rose-600 hover:bg-rose-50"
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
                  className="px-4 py-1.5 rounded-xl border-2 border-[#1E1B4B] bg-[#7F45DB] text-white font-mono font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#1E1B4B] transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/team"
                  className="px-3.5 py-1.5 rounded-xl border-2 border-[#1E1B4B] bg-white text-[#0F172A] font-mono font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#1E1B4B] hover:bg-[#F0F2F8] transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border-2 border-[#1E1B4B] bg-white text-[#0F172A] shadow-[2px_2px_0px_0px_#1E1B4B]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-[#1E1B4B] bg-[#F8F9FD] px-4 pt-3 pb-6 space-y-2">
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
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#7F45DB] text-white border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] text-xs font-mono font-black uppercase"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
