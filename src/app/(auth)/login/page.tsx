"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isDbOffline, setIsDbOffline] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setIsDbOffline(false);

    try {
      const res = await signIn("credentials", { email, password, redirect: false });

      if (res?.error) {
        // Check health endpoint to detect if Docker/database is offline
        try {
          const healthRes = await fetch("/api/health");
          if (!healthRes.ok) {
            setIsDbOffline(true);
            setError("Database Server Offline: Docker is not running or PostgreSQL container is offline. Please launch Docker Desktop to connect.");
            setLoading(false);
            return;
          }
        } catch {
          setIsDbOffline(true);
          setError("Database Server Offline: Docker is not running. Please start Docker Desktop.");
          setLoading(false);
          return;
        }

        if (res.error.includes("DATABASE_OFFLINE") || res.code === "DATABASE_OFFLINE") {
          setIsDbOffline(true);
          setError("Database Server Offline: Cannot reach database container. Please ensure Docker is running.");
        } else {
          setError("Invalid email or password. Please check your credentials and try again.");
        }
        setLoading(false);
        return;
      }

      if (email.includes("admin") || email.includes("organizer")) {
        router.push("/admin");
      } else {
        router.push("/team");
      }
    } catch {
      setError("An unexpected authentication error occurred. Please check if Docker is running.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-[#1E1B4B] bg-[#7F45DB]/10 text-[#4A2293] text-xs font-mono font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#1E1B4B]">
            <span className="w-2 h-2 rounded-full bg-[#7F45DB] animate-pulse" />
            ByteClash 2026 · Portal Login
          </div>
          <h1 className="text-4xl font-extrabold text-[#0F172A] uppercase tracking-tight font-display">
            Sign In
          </h1>
          <p className="text-[#6E6E6E] text-xs font-medium">
            Enter your credentials to access the competition console
          </p>
        </div>

        <div className="bg-white border-2 border-[#1E1B4B] rounded-2xl p-8 shadow-[6px_6px_0px_0px_#1E1B4B]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-[#0F172A] font-extrabold uppercase tracking-wider block mb-1.5 font-mono">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu"
                  required
                  className="w-full bg-[#F8F9FD] text-[#0F172A] rounded-xl pl-10 pr-4 py-3 text-xs font-mono border-2 border-[#1E1B4B] focus:outline-none focus:border-[#7F45DB] transition-all"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-[#0F172A] font-extrabold uppercase tracking-wider block mb-1.5 font-mono">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#F8F9FD] text-[#0F172A] rounded-xl pl-10 pr-4 py-3 text-xs font-mono border-2 border-[#1E1B4B] focus:outline-none focus:border-[#7F45DB] transition-all"
                />
              </div>
            </div>

            {error && (
              <div
                className={`p-3.5 rounded-xl border-2 text-xs font-mono leading-relaxed flex items-start gap-2.5 ${
                  isDbOffline
                    ? "bg-amber-50 border-amber-500 text-amber-900 shadow-[2px_2px_0px_0px_#D97706]"
                    : "bg-destructive/10 border-destructive text-destructive font-bold shadow-[2px_2px_0px_0px_#EF4444]"
                }`}
              >
                <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${isDbOffline ? "text-amber-700" : "text-destructive"}`} />
                <div>
                  <div className="font-bold">{isDbOffline ? "Database Server Offline" : "Authentication Failed"}</div>
                  <div className="text-[11px] mt-0.5">{error}</div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-xs font-mono font-black uppercase tracking-wider bg-[#7F45DB] hover:bg-[#6D35C7] text-white rounded-xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1E1B4B] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{loading ? "Authenticating..." : "Sign In to Arena"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
