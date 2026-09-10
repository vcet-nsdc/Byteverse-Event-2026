"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Lock, Mail, User, School, AlertTriangle, CheckCircle2 } from "lucide-react";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isDbOffline, setIsDbOffline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("mode") === "signup") {
      setMode("signup");
    } else if (searchParams.get("mode") === "signin") {
      setMode("signin");
    }
  }, [searchParams]);

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/contest" });
    } catch {
      setError("Google authentication failed. Please verify that Google OAuth is configured or use email authentication.");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");
    setIsDbOffline(false);

    try {
      if (mode === "signup") {
        // Register new account
        const regRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            college: college.trim() || undefined,
          }),
        });

        const regData = await regRes.json();

        if (!regRes.ok) {
          if (regRes.status === 409) {
            setError("This email address is already registered. Please sign in instead.");
          } else {
            setError(regData.error || "Registration failed. Please check your details and try again.");
          }
          setLoading(false);
          return;
        }

        setSuccessMsg("Account created successfully! Signing you in...");
      }

      // Authenticate with credentials
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        // Check health endpoint to detect if Docker/database is offline
        try {
          const healthRes = await fetch("/api/health");
          if (!healthRes.ok) {
            setIsDbOffline(true);
            setError("Database Server Offline: Docker or PostgreSQL container is offline. Please start Docker Desktop.");
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
          setError(mode === "signup" ? "Account registered but automatic sign-in failed. Please switch to Sign In." : "Invalid email or password. Please check your credentials and try again.");
        }
        setLoading(false);
        return;
      }

      if (email.includes("admin") || email.includes("organizer")) {
        router.push("/admin");
      } else {
        router.push("/contest");
      }
    } catch {
      setError("An unexpected authentication error occurred. Please check your network and Docker status.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Brand & Mode Header */}
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
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border-2 border-[#1E1B4B] bg-[#7F45DB]/10 text-[#4A2293] text-xs font-mono font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#1E1B4B]">
          <span className="w-2 h-2 rounded-full bg-[#7F45DB] animate-pulse" />
          ByteVerse 2026 Arena
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] uppercase tracking-tight font-display">
          {mode === "signin" ? "Sign In" : "Create Account"}
        </h1>
        <p className="text-[#6E6E6E] text-xs font-medium">
          {mode === "signin"
            ? "Access your contest dashboard, practice arena, and live duels"
            : "Join ByteVerse to compete in official collegiate programming contests"}
        </p>
      </div>

      {/* Main Neo-Brutalist Form Card */}
      <div className="bg-white border-2 border-[#1E1B4B] rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1E1B4B]">
        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#F1F3FA] rounded-xl border-2 border-[#1E1B4B] mb-6">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError("");
              setSuccessMsg("");
            }}
            className={`py-2 text-xs font-mono font-black uppercase tracking-wider rounded-lg transition-all ${
              mode === "signin"
                ? "bg-[#7F45DB] text-white shadow-[2px_2px_0px_0px_#1E1B4B] border border-[#1E1B4B]"
                : "text-[#6E6E6E] hover:text-[#0F172A]"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError("");
              setSuccessMsg("");
            }}
            className={`py-2 text-xs font-mono font-black uppercase tracking-wider rounded-lg transition-all ${
              mode === "signup"
                ? "bg-[#7F45DB] text-white shadow-[2px_2px_0px_0px_#1E1B4B] border border-[#1E1B4B]"
                : "text-[#6E6E6E] hover:text-[#0F172A]"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full py-3 px-4 rounded-xl border-2 border-[#1E1B4B] bg-white hover:bg-[#F8F9FD] text-[#0F172A] font-mono font-bold text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#1E1B4B] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
        >
          {/* Authentic Google 'G' Icon */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>
            {googleLoading
              ? "Connecting Google..."
              : mode === "signin"
              ? "Continue with Google"
              : "Sign Up with Google"}
          </span>
        </button>

        {/* Visual Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-[#1E1B4B]/15" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-mono font-black text-[#6E6E6E]">
            <span className="bg-white px-3 tracking-widest">or continue with email</span>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div>
                <label className="text-xs text-[#0F172A] font-extrabold uppercase tracking-wider block mb-1.5 font-mono">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Sharma"
                    required={mode === "signup"}
                    className="w-full bg-[#F8F9FD] text-[#0F172A] rounded-xl pl-10 pr-4 py-3 text-xs font-mono border-2 border-[#1E1B4B] focus:outline-none focus:border-[#7F45DB] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-[#0F172A] font-extrabold uppercase tracking-wider block mb-1.5 font-mono">
                  College / Institution <span className="text-[#8A8A8A] font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <School className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. VCET / Engineering Dept"
                    className="w-full bg-[#F8F9FD] text-[#0F172A] rounded-xl pl-10 pr-4 py-3 text-xs font-mono border-2 border-[#1E1B4B] focus:outline-none focus:border-[#7F45DB] transition-all"
                  />
                </div>
              </div>
            </>
          )}

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
              Password {mode === "signup" && <span className="text-[#8A8A8A] font-normal">(Min 8 chars)</span>}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={mode === "signup" ? 8 : 1}
                className="w-full bg-[#F8F9FD] text-[#0F172A] rounded-xl pl-10 pr-4 py-3 text-xs font-mono border-2 border-[#1E1B4B] focus:outline-none focus:border-[#7F45DB] transition-all"
              />
            </div>
          </div>

          {successMsg && (
            <div className="p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-50 text-emerald-900 text-xs font-mono flex items-start gap-2.5 shadow-[2px_2px_0px_0px_#10B981]">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

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
                <div className="font-bold">{isDbOffline ? "Database Server Offline" : "Authentication Notice"}</div>
                <div className="text-[11px] mt-0.5">{error}</div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3.5 text-xs font-mono font-black uppercase tracking-wider bg-[#7F45DB] hover:bg-[#6D35C7] text-white rounded-xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1E1B4B] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>
              {loading
                ? mode === "signup"
                  ? "Creating Account..."
                  : "Authenticating..."
                : mode === "signup"
                ? "Register & Enter ByteVerse"
                : "Sign In to ByteVerse"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Switch Footer Link */}
      <div className="text-center text-xs font-mono">
        {mode === "signin" ? (
          <p className="text-[#6E6E6E]">
            Don&apos;t have an account yet?{" "}
            <button
              onClick={() => {
                setMode("signup");
                setError("");
                setSuccessMsg("");
              }}
              className="text-[#7F45DB] font-black underline hover:text-[#4A2293] cursor-pointer"
            >
              Sign Up for Free
            </button>
          </p>
        ) : (
          <p className="text-[#6E6E6E]">
            Already have an account?{" "}
            <button
              onClick={() => {
                setMode("signin");
                setError("");
                setSuccessMsg("");
              }}
              className="text-[#7F45DB] font-black underline hover:text-[#4A2293] cursor-pointer"
            >
              Sign In here
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center p-4 font-sans">
      <Suspense
        fallback={
          <div className="text-center font-mono text-xs text-[#6E6E6E] animate-pulse">
            Loading ByteVerse Portal...
          </div>
        }
      >
        <AuthForm />
      </Suspense>
    </div>
  );
}
