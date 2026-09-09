"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  Trophy,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  MessageSquare,
  Flame,
  ArrowRight,
  ShieldAlert,
  Code2,
  Calendar,
} from "lucide-react";

interface ProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    college: string;
    role: string;
    joinedAt: string;
  };
  ranks: {
    platformRank: number;
    totalUsers: number;
    platformScore: number;
    contestScore: number;
  };
  solved: {
    total: number;
    totalAvailable: number;
    easy: { solved: number; total: number };
    medium: { solved: number; total: number };
    hard: { solved: number; total: number };
  };
  submissions: {
    total: number;
    accepted: number;
    acceptanceRate: string;
    languages: { name: string; count: number; percentage: number }[];
    recent: {
      id: string;
      problemId: string;
      problemTitle: string;
      difficulty: string;
      status: string;
      language: string;
      executionTimeMs?: number;
      memoryUsedMb?: number;
      submittedAt: string;
    }[];
  };
  community: {
    discussionsCreated: number;
    commentsPosted: number;
    upvotesReceived: number;
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-transparent flex items-center justify-center font-mono text-sm text-[#6E6E6E] dark:text-[#94A3B8]">
        Loading competitor profile and telemetry...
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 space-y-4">
        <h1 className="text-2xl font-black text-[#0F172A] dark:text-white">Please Sign In</h1>
        <p className="text-sm font-mono text-[#6E6E6E] dark:text-[#94A3B8]">Sign in to view your solved problems, rankings, and submission telemetry.</p>
        <Link
          href="/login"
          className="px-6 py-3.5 text-xs font-mono font-black uppercase tracking-wider bg-[#7F45DB] hover:bg-[#6D35C7] text-white rounded-xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1E1B4B] transition-all flex items-center justify-center gap-2"
        >
          <span>Sign In to ByteClash</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </main>
    );
  }

  const { user, ranks, solved, submissions, community } = profile;

  return (
    <main className="min-h-screen bg-transparent text-[#0F172A] dark:text-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-500">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* User Identity Header Card */}
        <div className="bg-white dark:bg-[#111726]/90 border-2 border-[#1E1B4B] dark:border-[#7F45DB]/60 rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1E1B4B] dark:shadow-[6px_6px_0px_0px_#7F45DB]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden transition-all duration-300">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#7F45DB] text-white font-mono font-black text-2xl sm:text-3xl flex items-center justify-center border-2 border-[#1E1B4B] dark:border-[#A472F7] shadow-[4px_4px_0px_0px_#1E1B4B] dark:shadow-[4px_4px_0px_0px_#A472F7]">
              {user.name ? user.name[0].toUpperCase() : "U"}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-display font-black text-[#0F172A] dark:text-white">
                  {user.name || "Anonymous Coder"}
                </h1>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black uppercase tracking-wider bg-[#7F45DB]/10 text-[#7F45DB] dark:text-[#A472F7] border border-[#7F45DB]/30">
                  {user.role}
                </span>
              </div>
              <p className="text-xs font-mono text-[#6E6E6E] dark:text-[#94A3B8]">
                {user.email} · <span className="font-bold text-[#0F172A] dark:text-white">{user.college}</span>
              </p>
              <p className="text-[11px] font-mono text-[#6E6E6E] dark:text-[#94A3B8] pt-0.5">
                Member since {new Date(user.joinedAt).toLocaleDateString([], { month: "long", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* Quick action / role specific */}
          {["ADMIN", "SUPER_ADMIN", "ORGANIZER"].includes(user.role) && (
            <Link
              href="/admin"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-600 dark:border-amber-500/50 text-amber-900 dark:text-amber-200 font-mono font-bold text-xs uppercase shadow-[3px_3px_0px_0px_#1E1B4B] dark:shadow-[3px_3px_0px_0px_#D97706] hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all shrink-0"
            >
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Admin Management</span>
            </Link>
          )}
        </div>

        {/* Dual Ranking Cards: Global Platform Rank vs Contest Rank */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Global Platform Rank */}
          <div className="bg-white dark:bg-[#111726]/90 border-2 border-[#1E1B4B] dark:border-[#7F45DB]/60 rounded-3xl p-6 shadow-[5px_5px_0px_0px_#1E1B4B] dark:shadow-[5px_5px_0px_0px_#7F45DB]/50 space-y-4 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black uppercase text-[#7F45DB] dark:text-[#A472F7] tracking-wider">
                PLATFORM STANDINGS
              </span>
              <div className="w-8 h-8 rounded-xl bg-[#7F45DB]/10 text-[#7F45DB] dark:text-[#A472F7] flex items-center justify-center border border-[#7F45DB]/20">
                <Trophy className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-mono font-black text-[#0F172A] dark:text-white">
                Rank #{ranks.platformRank}
                <span className="text-sm font-normal text-[#6E6E6E] dark:text-[#94A3B8] ml-2">
                  / {ranks.totalUsers.toLocaleString()} Coders
                </span>
              </div>
              <p className="text-xs font-mono text-[#6E6E6E] dark:text-[#94A3B8]">
                Platform Score: <strong className="text-[#7F45DB] dark:text-[#A472F7]">{ranks.platformScore.toLocaleString()}</strong> pts
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#F8F9FD] dark:bg-[#1A2035] border border-[#1E1B4B]/20 dark:border-[#382F60] text-[11px] font-mono text-[#6E6E6E] dark:text-[#94A3B8]">
              Score Formula: (Easy × 10) + (Med × 25) + (Hard × 50) + (Accepted × 2)
            </div>
          </div>

          {/* Tournament & Contest Rank */}
          <div className="bg-white dark:bg-[#111726]/90 border-2 border-[#1E1B4B] dark:border-[#7F45DB]/60 rounded-3xl p-6 shadow-[5px_5px_0px_0px_#1E1B4B] dark:shadow-[5px_5px_0px_0px_#7F45DB]/50 space-y-4 transition-all duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                CONTEST STANDINGS
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-300 dark:border-amber-600/50">
                <Award className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-mono font-black text-[#0F172A] dark:text-white">
                {ranks.contestScore.toLocaleString()}
                <span className="text-sm font-normal text-[#6E6E6E] dark:text-[#94A3B8] ml-2">
                  Tournament Points
                </span>
              </div>
              <p className="text-xs font-mono text-[#6E6E6E] dark:text-[#94A3B8]">
                Aggregated from official ByteClash tournament rounds & duels
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#F8F9FD] dark:bg-[#1A2035] border border-[#1E1B4B]/20 dark:border-[#382F60] text-[11px] font-mono text-[#6E6E6E] dark:text-[#94A3B8] flex items-center justify-between">
              <span>Status: Active Competitor</span>
              <Link href="/contest" className="text-[#7F45DB] dark:text-[#A472F7] font-bold hover:underline">
                View Arena →
              </Link>
            </div>
          </div>
        </div>

        {/* Problems Solved Breakdown & Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Solved Count Breakdown (Left 1 col) */}
          <div className="bg-white dark:bg-[#111726]/90 border-2 border-[#1E1B4B] dark:border-[#7F45DB]/60 rounded-3xl p-6 sm:p-7 shadow-[5px_5px_0px_0px_#1E1B4B] dark:shadow-[5px_5px_0px_0px_#7F45DB]/50 space-y-6 transition-all duration-300">
            <div className="flex items-center justify-between border-b-2 border-[#1E1B4B]/10 dark:border-[#2D2755] pb-3">
              <h2 className="text-base font-mono font-black uppercase text-[#0F172A] dark:text-white">
                Problems Solved
              </h2>
              <span className="text-xl font-mono font-black text-[#7F45DB] dark:text-[#A472F7]">
                {solved.total} <span className="text-xs text-[#6E6E6E] dark:text-[#94A3B8]">/ {solved.totalAvailable}</span>
              </span>
            </div>

            {/* Difficulties Gauge */}
            <div className="space-y-4">
              {/* Easy */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">Easy</span>
                  <span className="font-bold text-[#0F172A] dark:text-white">
                    {solved.easy.solved} / {solved.easy.total}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#0B0F19] overflow-hidden border border-[#1E1B4B]/15 dark:border-[#382F60]">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${solved.easy.total > 0 ? (solved.easy.solved / solved.easy.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Medium */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-bold text-amber-600 dark:text-amber-400">Medium</span>
                  <span className="font-bold text-[#0F172A] dark:text-white">
                    {solved.medium.solved} / {solved.medium.total}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#0B0F19] overflow-hidden border border-[#1E1B4B]/15 dark:border-[#382F60]">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${solved.medium.total > 0 ? (solved.medium.solved / solved.medium.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Hard */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-bold text-rose-600 dark:text-rose-400">Hard</span>
                  <span className="font-bold text-[#0F172A] dark:text-white">
                    {solved.hard.solved} / {solved.hard.total}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-[#0B0F19] overflow-hidden border border-[#1E1B4B]/15 dark:border-[#382F60]">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{
                      width: `${solved.hard.total > 0 ? (solved.hard.solved / solved.hard.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Community Activity Summary */}
            <div className="pt-4 border-t-2 border-[#1E1B4B]/10 dark:border-[#2D2755] space-y-3">
              <h3 className="text-xs font-mono font-black uppercase text-[#6E6E6E] dark:text-[#94A3B8]">
                Community Engagement
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-[#F8F9FD] dark:bg-[#1A2035] border border-[#1E1B4B]/20 dark:border-[#382F60]">
                  <span className="text-lg font-mono font-black text-[#0F172A] dark:text-white block">
                    {community.discussionsCreated}
                  </span>
                  <span className="text-[9px] font-mono text-[#6E6E6E] dark:text-[#94A3B8] uppercase">Posts</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F8F9FD] dark:bg-[#1A2035] border border-[#1E1B4B]/20 dark:border-[#382F60]">
                  <span className="text-lg font-mono font-black text-[#0F172A] dark:text-white block">
                    {community.commentsPosted}
                  </span>
                  <span className="text-[9px] font-mono text-[#6E6E6E] dark:text-[#94A3B8] uppercase">Comments</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#F8F9FD] dark:bg-[#1A2035] border border-[#1E1B4B]/20 dark:border-[#382F60]">
                  <span className="text-lg font-mono font-black text-[#7F45DB] dark:text-[#A472F7] block">
                    {community.upvotesReceived}
                  </span>
                  <span className="text-[9px] font-mono text-[#6E6E6E] dark:text-[#94A3B8] uppercase">Upvotes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submissions & Language Telemetry (Right 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Top stats bar */}
            <div className="bg-white dark:bg-[#111726]/90 border-2 border-[#1E1B4B] dark:border-[#7F45DB]/60 rounded-3xl p-6 sm:p-7 shadow-[5px_5px_0px_0px_#1E1B4B] dark:shadow-[5px_5px_0px_0px_#7F45DB]/50 space-y-6 transition-all duration-300">
              <h2 className="text-base font-mono font-black uppercase text-[#0F172A] dark:text-white border-b-2 border-[#1E1B4B]/10 dark:border-[#2D2755] pb-3">
                Submission Statistics & Languages
              </h2>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl bg-[#F8F9FD] dark:bg-[#1A2035] border-2 border-[#1E1B4B] dark:border-[#382F60]">
                  <span className="text-[10px] font-mono text-[#6E6E6E] dark:text-[#94A3B8] uppercase block">Total Submissions</span>
                  <span className="text-xl font-mono font-black text-[#0F172A] dark:text-white mt-0.5 block">
                    {submissions.total}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8F9FD] dark:bg-[#1A2035] border-2 border-[#1E1B4B] dark:border-[#382F60]">
                  <span className="text-[10px] font-mono text-[#6E6E6E] dark:text-[#94A3B8] uppercase block">Accepted Solutions</span>
                  <span className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    {submissions.accepted}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F8F9FD] dark:bg-[#1A2035] border-2 border-[#1E1B4B] dark:border-[#382F60]">
                  <span className="text-[10px] font-mono text-[#6E6E6E] dark:text-[#94A3B8] uppercase block">Acceptance Rate</span>
                  <span className="text-xl font-mono font-black text-[#7F45DB] dark:text-[#A472F7] mt-0.5 block">
                    {submissions.acceptanceRate}
                  </span>
                </div>
              </div>

              {/* Language breakdown */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-mono text-[#6E6E6E] dark:text-[#94A3B8] uppercase font-bold">Languages Used</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {submissions.languages.map((l) => (
                    <div
                      key={l.name}
                      className="p-3 rounded-xl bg-[#F8F9FD] dark:bg-[#1A2035] border border-[#1E1B4B]/20 dark:border-[#382F60] text-xs font-mono"
                    >
                      <div className="flex justify-between font-bold text-[#0F172A] dark:text-white">
                        <span>{l.name}</span>
                        <span>{l.percentage}%</span>
                      </div>
                      <span className="text-[10px] text-[#6E6E6E] dark:text-[#94A3B8] block mt-0.5">{l.count} attempts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Submissions List */}
            <div className="bg-white dark:bg-[#111726]/90 border-2 border-[#1E1B4B] dark:border-[#7F45DB]/60 rounded-3xl p-6 sm:p-7 shadow-[5px_5px_0px_0px_#1E1B4B] dark:shadow-[5px_5px_0px_0px_#7F45DB]/50 space-y-4 transition-all duration-300">
              <h2 className="text-base font-mono font-black uppercase text-[#0F172A] dark:text-white">
                Recent Submissions
              </h2>

              {submissions.recent.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b-2 border-[#1E1B4B] dark:border-[#382F60] text-[#6E6E6E] dark:text-[#94A3B8] uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3 font-black">Status</th>
                        <th className="py-2.5 px-3 font-black">Problem</th>
                        <th className="py-2.5 px-3 font-black">Language</th>
                        <th className="py-2.5 px-3 font-black">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E1B4B]/10 dark:divide-[#382F60]">
                      {submissions.recent.map((s) => (
                        <tr key={s.id} className="hover:bg-[#F8F9FD] dark:hover:bg-[#1A2035]/80">
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                s.status === "ACCEPTED"
                                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                                  : "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300"
                              }`}
                            >
                              {s.status === "ACCEPTED" ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                              )}
                              <span>{s.status.replace(/_/g, " ")}</span>
                            </span>
                          </td>
                          <td className="py-3 px-3 font-bold text-[#0F172A] dark:text-white">
                            <Link href={`/practice/${s.problemId}`} className="hover:text-[#7F45DB] dark:hover:text-[#A472F7]">
                              {s.problemTitle}
                            </Link>
                          </td>
                          <td className="py-3 px-3 uppercase text-[#6E6E6E] dark:text-[#94A3B8]">{s.language}</td>
                          <td className="py-3 px-3 text-[#6E6E6E] dark:text-[#94A3B8]">
                            {new Date(s.submittedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-xs font-mono text-[#6E6E6E] dark:text-[#94A3B8]">
                  No recent submissions recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
