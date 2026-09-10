"use client";

import { useState, Suspense } from "react";
import { signIn, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Shield,
  ShieldAlert,
} from "lucide-react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fillCredentials = (role: "admin" | "superadmin") => {
    setError(null);
    if (role === "superadmin") {
      setEmail("superadmin@byteverse.dev");
      setPassword("superadmin2026");
    } else {
      setEmail("admin@byteverse.dev");
      setPassword("admin2026");
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
          setError("Database Server Offline: Backend database container is unreachable.");
        } else {
          setError("Authentication failed: Invalid credentials for the administrative console.");
        }
        setLoading(false);
        return;
      }

      // Verify user's actual session role
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      const userRole = sessionData?.user?.role;

      if (!userRole) {
        setError("Could not verify administrative authority. Please try again.");
        setLoading(false);
        return;
      }

      // Verify Administrative Role (Strictly ADMIN or SUPER_ADMIN)
      const allowedRoles = ["ADMIN", "SUPER_ADMIN"];
      if (!allowedRoles.includes(userRole)) {
        await signOut({ redirect: false });
        setError(
          `Access Denied: Your account role is "${userRole}". This gateway is reserved exclusively for Admin and SuperAdmin.`
        );
        setLoading(false);
        return;
      }

      const callbackUrl = searchParams.get("callbackUrl");

      if (userRole === "SUPER_ADMIN") {
        setSuccessMsg("SuperAdmin clearance verified. Directing to SuperAdmin Command Center...");
        setTimeout(() => {
          router.push(callbackUrl || "/admin/superadmin");
        }, 700);
      } else {
        setSuccessMsg("Admin clearance verified. Directing to Administration Console...");
        setTimeout(() => {
          router.push(callbackUrl || "/admin");
        }, 700);
      }
    } catch {
      setError("An unexpected network error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg space-y-6 font-sans">
      {/* Header Badge */}
      <div className="text-center space-y-2.5">
        <Link href="/" className="inline-block hover:scale-105 transition-transform mb-1">
          <div className="relative h-12 w-44 mx-auto">
            <Image
              src="/assets/byteverse-logo.png"
              alt="ByteVerse Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border-2 border-[#1E1B4B] bg-[#7F45DB]/10 text-[#4A2293] text-[11px] font-mono font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#1E1B4B]">
          <ShieldAlert className="w-3.5 h-3.5 text-[#7F45DB]" />
          <span>ADMINISTRATIVE COMMAND GATEWAY</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight font-display">
          Staff Authentication
        </h1>
        <p className="text-xs font-mono text-[#6E6E6E] max-w-sm mx-auto">
          Unified administration portal for Admins, SuperAdmins, and Event Organizers
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="bg-white border-2 border-[#1E1B4B] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1E1B4B]">
        <div className="mb-6 p-4 rounded-2xl border-2 border-[#7F45DB]/20 bg-[#7F45DB]/5 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#7F45DB] text-white shrink-0 shadow-[1px_1px_0px_0px_#1E1B4B]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-mono font-bold text-[#0F172A]">
              Single Unified Console
            </div>
            <p className="text-[11px] font-mono text-[#6E6E6E] leading-relaxed">
              Sign in with your administrative credentials. Role permissions (Admin vs. SuperAdmin) are validated automatically.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-[#0F172A] font-extrabold uppercase tracking-wider block mb-1.5 font-mono">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@byteverse.dev"
                className="w-full bg-[#F8F9FD] text-[#0F172A] rounded-xl pl-10 pr-4 py-3 text-xs font-mono border-2 border-[#1E1B4B] focus:outline-none focus:border-[#7F45DB] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#0F172A] font-extrabold uppercase tracking-wider block mb-1.5 font-mono">
              Access Passphrase
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

          {/* Preset Buttons for Quick Testing */}
          <div className="p-3.5 rounded-2xl bg-[#F8F9FD] border-2 border-[#1E1B4B]/20 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#6E6E6E] font-extrabold">
              <span>Quick Test Access:</span>
              <span className="text-[#7F45DB]">Admin &amp; SuperAdmin Only</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials("superadmin")}
                className="py-2 px-3 rounded-xl bg-white border-2 border-[#1E1B4B] hover:bg-[#F0F2F8] text-[11px] font-mono font-black text-[#0F172A] transition-all flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#1E1B4B] active:translate-x-0.5 active:translate-y-0.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#7F45DB]" />
                <span>Super Admin</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials("admin")}
                className="py-2 px-3 rounded-xl bg-white border-2 border-[#1E1B4B] hover:bg-[#F0F2F8] text-[11px] font-mono font-black text-[#0F172A] transition-all flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_0px_#1E1B4B] active:translate-x-0.5 active:translate-y-0.5"
              >
                <Shield className="w-3.5 h-3.5 text-purple-700" />
                <span>Admin</span>
              </button>
            </div>
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
            className="w-full py-3.5 text-xs font-mono font-black uppercase tracking-wider text-white rounded-xl border-2 border-[#1E1B4B] bg-[#7F45DB] hover:bg-[#6D35C7] shadow-[4px_4px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1E1B4B] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>
              {loading ? "Verifying Administrative Clearance..." : "Access Administrative Console"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Cross Navigation Footers */}
      <div className="p-4 rounded-2xl border-2 border-[#1E1B4B] bg-white shadow-[4px_4px_0px_0px_#1E1B4B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div>
          <div className="font-bold text-[#0F172A]">Contestant or Participant?</div>
          <div className="text-[#6E6E6E] text-[11px]">Go to the public tournament and practice arena</div>
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
    <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="text-center font-mono text-xs text-[#6E6E6E] animate-pulse">
            Loading Administrative Portal...
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
