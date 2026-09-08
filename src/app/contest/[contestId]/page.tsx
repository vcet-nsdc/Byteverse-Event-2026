"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Trophy,
  Clock,
  Users,
  BookOpen,
  ArrowRight,
  Medal,
  Award,
  CheckCircle2,
  Calendar,
  Zap,
} from "lucide-react";

interface ContestDetail {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  difficulty: string;
  startsAt: string;
  endsAt: string;
  problemCount: number;
  participantCount: number;
  isRegistered: boolean;
  problems: {
    id: string;
    title: string;
    difficulty: string;
    tags: string[];
  }[];
  leaderboard: {
    rank: number;
    participantId: string;
    name: string;
    college: string;
    score: number;
  }[];
}

export default function ContestDetailPage({
  params,
}: {
  params: Promise<{ contestId: string }>;
}) {
  const { contestId } = use(params);
  const [contest, setContest] = useState<ContestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"problems" | "leaderboard">("problems");
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    async function loadContest() {
      try {
        const res = await fetch(`/api/contests/${contestId}`);
        if (res.ok) {
          const data = await res.json();
          setContest(data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadContest();
  }, [contestId]);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      const res = await fetch(`/api/contests/${contestId}/register`, {
        method: "POST",
      });
      if (res.ok) {
        setContest((prev) => (prev ? { ...prev, isRegistered: true, participantCount: prev.participantCount + 1 } : null));
      }
    } catch {
      // ignore
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F9FD] flex items-center justify-center font-mono text-sm text-[#6E6E6E]">
        Loading contest arena...
      </main>
    );
  }

  if (!contest) {
    return (
      <main className="min-h-screen bg-[#F8F9FD] flex flex-col items-center justify-center font-sans p-6 text-center space-y-4">
        <h1 className="text-2xl font-black text-[#0F172A]">Contest Not Found</h1>
        <p className="text-sm font-mono text-[#6E6E6E]">The requested contest could not be found or has concluded.</p>
        <Link
          href="/contest"
          className="px-6 py-2.5 rounded-xl bg-[#7F45DB] text-white font-mono font-bold text-xs uppercase"
        >
          Return to Contests
        </Link>
      </main>
    );
  }

  const isActive = contest.status === "ACTIVE";

  return (
    <main className="min-h-screen bg-[#F8F9FD] text-[#0F172A] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Contest Header Card */}
        <div className="bg-white border-2 border-[#1E1B4B] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1E1B4B] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[#1E1B4B]/10 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-[#7F45DB]/10 text-[#7F45DB] border border-[#7F45DB]/20">
                  {contest.type} CONTEST
                </span>
                <span
                  className={`px-3 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider ${
                    isActive
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-slate-100 text-slate-800 border border-slate-300"
                  }`}
                >
                  {contest.status}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-black text-[#0F172A]">
                {contest.title}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {!contest.isRegistered ? (
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="px-6 py-3 rounded-xl bg-[#7F45DB] text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50"
                >
                  {registering ? "Registering..." : "Register for Contest"}
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] font-mono font-black text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>REGISTERED</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-sm sm:text-base text-[#6E6E6E] font-medium leading-relaxed">
            {contest.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-xl bg-[#F8F9FD] border border-[#1E1B4B]/20">
              <span className="text-[10px] font-mono text-[#6E6E6E] uppercase block">Start Time</span>
              <span className="font-mono font-bold text-xs text-[#0F172A] block mt-0.5">
                {new Date(contest.startsAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F8F9FD] border border-[#1E1B4B]/20">
              <span className="text-[10px] font-mono text-[#6E6E6E] uppercase block">Duration</span>
              <span className="font-mono font-bold text-xs text-[#0F172A] block mt-0.5">
                90 Minutes
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F8F9FD] border border-[#1E1B4B]/20">
              <span className="text-[10px] font-mono text-[#6E6E6E] uppercase block">Problems</span>
              <span className="font-mono font-bold text-xs text-[#7F45DB] block mt-0.5">
                {contest.problemCount} Challenges
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#F8F9FD] border border-[#1E1B4B]/20">
              <span className="text-[10px] font-mono text-[#6E6E6E] uppercase block">Competitors</span>
              <span className="font-mono font-bold text-xs text-[#0F172A] block mt-0.5">
                {contest.participantCount} Coders
              </span>
            </div>
          </div>
        </div>

        {/* Tab Toggle: Problems vs Leaderboard */}
        <div className="flex items-center gap-3 border-b-2 border-[#1E1B4B]/10 pb-3">
          <button
            onClick={() => setActiveTab("problems")}
            className={`px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider border-2 transition-all flex items-center gap-2 ${
              activeTab === "problems"
                ? "bg-[#7F45DB] text-white border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] font-black"
                : "bg-white text-[#6E6E6E] border-[#1E1B4B] font-bold shadow-[2px_2px_0px_0px_#1E1B4B]"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Problem Set ({contest.problems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider border-2 transition-all flex items-center gap-2 ${
              activeTab === "leaderboard"
                ? "bg-[#7F45DB] text-white border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] font-black"
                : "bg-white text-[#6E6E6E] border-[#1E1B4B] font-bold shadow-[2px_2px_0px_0px_#1E1B4B]"
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Live Standings ({contest.leaderboard.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "problems" ? (
          <div className="space-y-4">
            {contest.problems.map((prob, idx) => (
              <div
                key={prob.id}
                className="bg-white border-2 border-[#1E1B4B] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1E1B4B] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1E1B4B] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-[#F0F2F8] border border-[#1E1B4B]/20 flex items-center justify-center font-mono font-black text-sm text-[#0F172A]">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0F172A] hover:text-[#7F45DB] transition-colors">
                      <Link href={`/practice/${prob.id}?contestId=${contest.id}`}>
                        {prob.title}
                      </Link>
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                          prob.difficulty === "Easy"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : prob.difficulty === "Hard"
                            ? "bg-rose-50 text-rose-700 border-rose-300"
                            : "bg-amber-50 text-amber-700 border-amber-300"
                        }`}
                      >
                        {prob.difficulty}
                      </span>
                      {prob.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-mono text-[#6E6E6E] bg-[#F8F9FD] px-2 py-0.5 rounded border border-[#1E1B4B]/10"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/practice/${prob.id}?contestId=${contest.id}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#7F45DB] text-white font-mono font-bold text-xs uppercase tracking-wider border-2 border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                >
                  <span>Solve Problem</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border-2 border-[#1E1B4B] rounded-2xl p-6 shadow-[5px_5px_0px_0px_#1E1B4B]">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b-2 border-[#1E1B4B] text-[#6E6E6E] uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3 font-black">Rank</th>
                    <th className="py-3 px-3 font-black">Competitor</th>
                    <th className="py-3 px-3 font-black">College</th>
                    <th className="py-3 px-3 font-black text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E1B4B]/10">
                  {contest.leaderboard.map((row) => (
                    <tr key={row.participantId} className="hover:bg-[#F8F9FD]">
                      <td className="py-3 px-3">
                        {row.rank === 1 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                            <Medal className="w-3.5 h-3.5 text-amber-600" /> #1
                          </span>
                        ) : row.rank === 2 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300 font-bold">
                            <Medal className="w-3.5 h-3.5 text-slate-500" /> #2
                          </span>
                        ) : row.rank === 3 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-400 font-bold">
                            <Award className="w-3.5 h-3.5 text-amber-700" /> #3
                          </span>
                        ) : (
                          <span className="pl-2 font-bold text-[#6E6E6E]">#{row.rank}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-bold text-[#0F172A]">{row.name}</td>
                      <td className="py-3 px-3 text-[#6E6E6E]">{row.college}</td>
                      <td className="py-3 px-3 text-right font-black text-[#7F45DB]">
                        {row.score} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
