"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Radio,
  ExternalLink,
  Users,
  Trophy,
  Terminal,
} from "lucide-react";

type PortalType = "admin" | "superadmin";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPortal = searchParams.get("portal") === "superadmin" ? "superadmin" : "admin";

  const [portal, setPortal] = useState<PortalType>(initialPortal);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("portal") === "superadmin") {
      setPortal("superadmin");
    } else if (searchParams.get("portal") === "admin") {
      setPortal("admin");
    }
  }, [searchParams]);

  // Set default credentials helper based on active portal
  const fillPresetCredentials = (type: PortalType) => {
    setError(null);
    if (type === "admin") {
      setEmail("admin@byteverse.dev");
      setPassword("admin2026");
    } else {
      setEmail("superadmin@byteverse.dev");
      setPassword("superadmin2026");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        if (res.error.includes("DATABASE_OFFLINE") || res.code === "DATABASE_OFFLINE") {
          setError("Database Server Offline: Cannot reach the backend database container.");
        } else {
          setError("Authentication failed: Invalid credentials for this administrative gateway.");
        }
        setLoading(false);
        return;
      }

      // Verify user's actual session role
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      const userRole = sessionData?.user?.role;

      if (!userRole) {
        setError("Could not verify administrative privileges. Please try again.");
        setLoading(false);
        return;
      }

      // Strict Role Gates
      if (portal === "superadmin") {
        if (userRole !== "SUPER_ADMIN") {
          // Sign out immediately to prevent session escalation
          await signOut({ redirect: false });
          setError(
            `Access Denied: Your account role is "${userRole}". Root SuperAdmin authority is strictly required to enter this command gateway.`
          );
          setLoading(false);
          return;
        }

        setSuccessMsg("SuperAdmin clearance verified. Directing to Platform Command Center...");
        setTimeout(() => {
          router.push("/admin/superadmin");
        }, 800);
        return;
      }

      // Portal === "admin"
      if (!["ADMIN", "SUPER_ADMIN", "ORGANIZER"].includes(userRole)) {
        await signOut({ redirect: false });
        setError(
          `Access Denied: Your account role is "${userRole}". This section is restricted to Event Admins and Organizers. Please log in via the Participant Arena.`
        );
        setLoading(false);
        return;
      }

      const callbackUrl = searchParams.get("callbackUrl") || "/admin";
      setSuccessMsg(`Clearance verified as ${userRole}. Directing to Administration Console...`);
      setTimeout(() => {
        router.push(callbackUrl);
      }, 800);
    } catch {
      setError("An unexpected network or server error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg space-y-6 font-sans">
      {/* Header Badge */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-block hover:scale-105 transition-transform mb-1">
          <div className="relative h-12 w-40 mx-auto">
            <Image
              src="/assets/byteverse-logo.png"
              alt="ByteVerse Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border-2 border-[#1E1B4B] bg-[#0F172A] text-white text-[11px] font-mono font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#1E1B4B]">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>RESTRICTED ACCESS • SECURITY LEVEL 4</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] uppercase tracking-tight font-display">
          Staff Authentication
        </h1>
        <p className="text-xs font-mono text-[#6E6E6E]">
          Dedicated login gateway for platform administrators, contest leads, and superadmins
        </p>
      </div>

      {/* Portal Switcher Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#0F172A] rounded-2xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B]">
        <button
          type="button"
          onClick={() => {
            setPortal("admin");
            setError(null);
            setSuccessMsg(null);
          }}
          className={`py-3 px-3 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            portal === "admin"
              ? "bg-[#7F45DB] text-white shadow-[2px_2px_0px_0px_#1E1B4B] border border-white/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Admin Portal</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setPortal("superadmin");
            setError(null);
            setSuccessMsg(null);
          }}
          className={`py-3 px-3 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            portal === "superadmin"
              ? "bg-rose-600 text-white shadow-[2px_2px_0px_0px_#1E1B4B] border border-white/20"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-300" />
          <span>SuperAdmin Master</span>
        </button>
      </div>

      {/* Main Authentication Card */}
      <div className="bg-white border-4 border-[#1E1B4B] rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_#1E1B4B]">
        {/* Portal Information Banner */}
        {portal === "admin" ? (
          <div className="mb-6 p-4 rounded-2xl border-2 border-[#7F45DB]/30 bg-violet-50 space-y-1">
            <div className="flex items-center gap-2 text-[#7F45DB] font-mono font-bold text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>EVENT & CONTEST ADMINISTRATOR</span>
            </div>
            <p className="text-[11px] font-mono text-[#4A2293] leading-relaxed">
              Provides authority to activate/pause contests, configure event venues, release problem sets, and monitor round timing.
            </p>
          </div>
        ) : (
          <div className="mb-6 p-4 rounded-2xl border-2 border-rose-300 bg-rose-50 space-y-1">
            <div className="flex items-center gap-2 text-rose-700 font-mono font-bold text-xs">
              <KeyRound className="w-4 h-4 shrink-0" />
              <span>SUPERADMIN ROOT COMMAND GATEWAY</span>
            </div>
            <p className="text-[11px] font-mono text-rose-900 leading-relaxed">
              Full platform sovereignty: live surveillance telemetry, participant activity auditing, and admin role governance.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-[#0F172A] font-extrabold uppercase tracking-wider block mb-1.5 font-mono">
              Staff Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  portal === "admin" ? "admin@byteverse.dev" : "superadmin@byteverse.dev"
                }
                className="w-full bg-[#F8F9FD] text-[#0F172A] rounded-xl pl-10 pr-4 py-3 text-xs font-mono border-2 border-[#1E1B4B] focus:outline-none focus:border-[#7F45DB] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#0F172A] font-extrabold uppercase tracking-wider block mb-1.5 font-mono">
              Master Access Passphrase
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#F8F9FD] text-[#0F172A] rounded-xl pl-10 pr-4 py-3 text-xs font-mono border-2 border-[#1E1B4B] focus:outline-none focus:border-[#7F45DB] transition-all"
              />
            </div>
          </div>

          {/* Quick Preset Credentials Button for Dev/Testing */}
          <div className="flex items-center justify-between text-[11px] font-mono pt-1">
            <span className="text-[#6E6E6E]">Demo Environment?</span>
            <button
              type="button"
              onClick={() => fillPresetCredentials(portal)}
              className="text-[#7F45DB] hover:text-[#4A2293] font-bold underline cursor-pointer"
            >
              Autofill {portal === "admin" ? "Admin" : "SuperAdmin"} Credentials
            </button>
          </div>

          {/* Status Notifications */}
          {successMsg && (
            <div className="p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-emerald-900 text-xs font-mono flex items-start gap-2.5 shadow-[2px_2px_0px_0px_#10B981]">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl border-2 border-rose-500 bg-rose-50 text-rose-900 text-xs font-mono leading-relaxed flex items-start gap-2.5 shadow-[2px_2px_0px_0px_#EF4444]">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
              <div>
                <div className="font-bold">Access Verification Failed</div>
                <div className="text-[11px] mt-0.5">{error}</div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 text-xs font-mono font-black uppercase tracking-wider text-white rounded-xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1E1B4B] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2 ${
              portal === "superadmin"
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-[#7F45DB] hover:bg-[#6D35C7]"
            }`}
          >
            <span>
              {loading
                ? "Verifying Administrative Clearance..."
                : portal === "superadmin"
                ? "Authenticate as SuperAdmin"
                : "Enter Admin Dashboard"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Cross Navigation Footers */}
      <div className="p-4 rounded-2xl border-2 border-[#1E1B4B] bg-white shadow-[4px_4px_0px_0px_#1E1B4B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div>
          <div className="font-bold text-[#0F172A]">Not an Administrator?</div>
          <div className="text-[#6E6E6E] text-[11px]">Looking to compete or practice coding?</div>
        </div>
        <Link
          href="/login"
          className="px-3.5 py-2 rounded-xl border-2 border-[#1E1B4B] bg-[#F0F2F8] hover:bg-[#E2E6F2] font-black text-[#0F172A] text-center shadow-[2px_2px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
        >
          Participant Login →
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#F0F2F8] flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="text-center font-mono text-xs text-[#6E6E6E] animate-pulse">
            Loading Staff Security Portal...
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
