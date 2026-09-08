"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Clock,
  Users,
  BookOpen,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Medal,
  Award,
  Zap,
} from "lucide-react";

interface Contest {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  difficulty: string;
  startsAt: string;
  endsAt: string;
  problemCount: number;
  participantCount: number;
  isRegistered?: boolean;
  userScore?: number | null;
  userRank?: number | null;
}

export default function ContestHubPage() {
  const [activeTab, setActiveTab] = useState<"active" | "weekly" | "past">("active");
  const [contests, setContests] = useState<{
    active: Contest[];
    weekly: Contest[];
    past: Contest[];
  }>({
    active: [],
    weekly: [],
    past: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContests() {
      try {
        const res = await fetch("/api/contests");
        if (res.ok) {
          const data = await res.json();
          setContests({
            active: data.active || [],
            weekly: data.weekly || [],
            past: data.past || [],
          });
          if (data.active?.length === 0 && data.weekly?.length > 0) {
            setActiveTab("weekly");
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadContests();
  }, []);

  const currentList =
    activeTab === "active"
      ? contests.active
      : activeTab === "weekly"
      ? contests.weekly
      : contests.past;

  return (
    <main className="min-h-screen bg-[#F8F9FD] text-[#0F172A] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-white border-2 border-[#1E1B4B] rounded-3xl p-6 sm:p-10 shadow-[6px_6px_0px_0px_#1E1B4B] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#7F45DB]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7F45DB]/10 text-[#7F45DB] border border-[#7F45DB]/30 text-xs font-mono font-black uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" />
              <span>ByteVerse Competitive Arena</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-black text-[#0F172A] tracking-tight">
              Programming Contests
            </h1>
            <p className="text-sm sm:text-base text-[#6E6E6E] font-medium leading-relaxed">
              Test your algorithmic speed, strategic problem decomposition, and debugging prowess under real contest conditions. Compete for global rating points, badges, and tournament supremacy.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 border-b-2 border-[#1E1B4B]/10 pb-4 overflow-x-auto">
          {[
            { key: "active", label: "Active Contests", count: contests.active.length, icon: Zap },
            { key: "weekly", label: "Weekly Contests", count: contests.weekly.length, icon: Trophy },
            { key: "past", label: "Past Contests", count: contests.past.length, icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-5 py-2.5 rounded-2xl font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-2 border-2 whitespace-nowrap ${
                  isSelected
                    ? "bg-[#7F45DB] text-white border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] font-black"
                    : "bg-white text-[#6E6E6E] border-[#1E1B4B] hover:text-[#0F172A] hover:bg-[#F0F2F8] font-bold shadow-[2px_2px_0px_0px_#1E1B4B]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                    isSelected ? "bg-white text-[#7F45DB]" : "bg-[#F0F2F8] text-[#0F172A]"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Contest Cards Grid */}
        {loading ? (
          <div className="py-16 text-center font-mono text-sm text-[#6E6E6E] animate-pulse">
            Loading contest arena telemetry...
          </div>
        ) : currentList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentList.map((contest) => {
              const isActive = contest.status === "ACTIVE";
              const isEnded = contest.status === "ENDED";
              const startDate = new Date(contest.startsAt);
              const endDate = new Date(contest.endsAt);

              return (
                <div
                  key={contest.id}
                  className="bg-white border-2 border-[#1E1B4B] rounded-3xl p-6 sm:p-7 shadow-[5px_5px_0px_0px_#1E1B4B] flex flex-col justify-between hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#1E1B4B] transition-all space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wider border ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : isEnded
                            ? "bg-slate-100 text-slate-700 border-slate-300"
                            : "bg-blue-50 text-blue-700 border-blue-300"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isActive
                              ? "bg-emerald-500 animate-pulse"
                              : isEnded
                              ? "bg-slate-400"
                              : "bg-blue-500"
                          }`}
                        />
                        <span>{contest.status}</span>
                      </span>

                      <span className="text-xs font-mono font-bold text-[#7F45DB] bg-[#7F45DB]/10 px-3 py-1 rounded-xl border border-[#7F45DB]/20">
                        {contest.difficulty}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-display font-black text-[#0F172A] hover:text-[#7F45DB] transition-colors">
                        <Link href={`/contest/${contest.id}`}>{contest.title}</Link>
                      </h3>
                      <p className="text-xs sm:text-sm text-[#6E6E6E] font-medium mt-1 line-clamp-2">
                        {contest.description || "Official competitive challenge with synchronized scoring and live leaderboard."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
                      <div className="p-2.5 rounded-xl bg-[#F8F9FD] border border-[#1E1B4B]/20 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#7F45DB]" />
                        <div>
                          <span className="text-[10px] text-[#6E6E6E] block">Schedule</span>
                          <span className="font-bold text-[#0F172A]">
                            {startDate.toLocaleDateString([], { month: "short", day: "numeric" })} · {startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#F8F9FD] border border-[#1E1B4B]/20 flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#7F45DB]" />
                        <div>
                          <span className="text-[10px] text-[#6E6E6E] block">Coders</span>
                          <span className="font-bold text-[#0F172A]">
                            {contest.participantCount} Registered
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t-2 border-[#1E1B4B]/10 pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-[#6E6E6E]">
                      <BookOpen className="w-4 h-4 text-[#7F45DB]" />
                      <span>{contest.problemCount} Problems</span>
                    </div>

                    <Link
                      href={`/contest/${contest.id}`}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider border-2 border-[#1E1B4B] transition-all ${
                        isActive
                          ? "bg-[#7F45DB] text-white font-black shadow-[3px_3px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                          : "bg-white text-[#0F172A] font-bold shadow-[3px_3px_0px_0px_#1E1B4B] hover:bg-[#F0F2F8]"
                      }`}
                    >
                      <span>{isActive ? "Enter Contest" : isEnded ? "View Standings" : "View Details"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border-2 border-[#1E1B4B] rounded-3xl p-12 text-center shadow-[4px_4px_0px_0px_#1E1B4B] space-y-3">
            <Trophy className="w-10 h-10 text-[#7F45DB] mx-auto" />
            <h3 className="text-lg font-display font-black text-[#0F172A]">No contests in this category right now</h3>
            <p className="text-xs font-mono text-[#6E6E6E] max-w-sm mx-auto">
              Check back shortly or explore practice problems to prepare for the upcoming weekly rounds!
            </p>
            <div className="pt-2">
              <Link
                href="/practice"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7F45DB] text-white border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] text-xs font-mono font-black uppercase"
              >
                Browse Practice Library
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
