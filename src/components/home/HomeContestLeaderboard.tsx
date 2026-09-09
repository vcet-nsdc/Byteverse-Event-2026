"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Medal, Award, User, ArrowRight, ShieldCheck } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  participantId: string;
  name: string;
  college: string;
  score: number;
}

export default function HomeContestLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        // Fetch session to highlight current user
        const sessRes = await fetch("/api/auth/session");
        if (sessRes.ok) {
          const sess = await sessRes.json();
          if (sess?.user?.id) setCurrentUserId(sess.user.id);
        }

        // Fetch active contest details
        const contestRes = await fetch("/api/contests/weekly-contest-101");
        if (contestRes.ok) {
          const data = await contestRes.json();
          if (Array.isArray(data.leaderboard) && data.leaderboard.length > 0) {
            setEntries(data.leaderboard.slice(0, 5));
          } else {
            // Fallback to event leaderboard if contest is fresh
            const eventRes = await fetch("/api/leaderboard/individual?eventId=byteverse-2026");
            if (eventRes.ok) {
              const evData = await eventRes.json();
              if (Array.isArray(evData)) {
                setEntries(
                  evData.slice(0, 5).map((e: any, idx: number) => ({
                    rank: idx + 1,
                    participantId: e.participantId,
                    name: e.name || "Anonymous",
                    college: e.college || "NSDC",
                    score: e.totalScore || 0,
                  }))
                );
              }
            }
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, []);

  return (
    <div className="bg-white dark:bg-[#111726]/90 border-2 border-[#1E1B4B] dark:border-[#7F45DB]/60 rounded-2xl p-6 sm:p-8 shadow-[5px_5px_0px_0px_#1E1B4B] dark:shadow-[5px_5px_0px_0px_#7F45DB]/50 text-left transition-all duration-300">
      <div className="flex items-center justify-between border-b-2 border-[#1E1B4B]/10 dark:border-[#2D2755] pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-[#1E1B4B] flex items-center justify-center border-2 border-[#1E1B4B] dark:border-amber-300 shadow-[2px_2px_0px_0px_#1E1B4B] dark:shadow-[2px_2px_0px_0px_#D97706]">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-mono font-black tracking-widest text-[#7F45DB] dark:text-[#A472F7] uppercase">
              LIVE ARENA STANDINGS
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-black text-[#0F172A] dark:text-white">
              Active Contest Leaderboard
            </h2>
          </div>
        </div>

        <Link
          href="/contest"
          className="text-xs font-mono font-bold text-[#7F45DB] dark:text-[#A472F7] hover:underline flex items-center gap-1"
        >
          <span>All Contests</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="py-8 text-center font-mono text-sm text-[#6E6E6E] dark:text-[#94A3B8] animate-pulse">
          Retrieving live competitor scores...
        </div>
      ) : entries.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b-2 border-[#1E1B4B] dark:border-[#382F60] text-[#6E6E6E] dark:text-[#94A3B8] uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3 font-black">Rank</th>
                <th className="py-2.5 px-3 font-black">Competitor</th>
                <th className="py-2.5 px-3 font-black hidden sm:table-cell">Institution</th>
                <th className="py-2.5 px-3 font-black text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1B4B]/10 dark:divide-[#382F60]">
              {entries.map((entry) => {
                const isMe = currentUserId === entry.participantId;

                return (
                  <tr
                    key={entry.participantId}
                    className={`transition-colors ${
                      isMe
                        ? "bg-[#7F45DB]/15 dark:bg-[#7F45DB]/25 font-black border-l-4 border-l-[#7F45DB]"
                        : "hover:bg-[#F8F9FD] dark:hover:bg-[#1A2035]/80"
                    }`}
                  >
                    <td className="py-3 px-3">
                      {entry.rank === 1 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-600/50 font-bold">
                          <Medal className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> #1
                        </span>
                      ) : entry.rank === 2 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 font-bold">
                          <Medal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> #2
                        </span>
                      ) : entry.rank === 3 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-400/50 dark:border-amber-700/50 font-bold">
                          <Award className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" /> #3
                        </span>
                      ) : (
                        <span className="text-[#6E6E6E] dark:text-[#94A3B8] pl-2 font-bold">#{entry.rank}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#1E1B4B]/5 dark:bg-[#7F45DB]/20 border border-[#1E1B4B]/20 dark:border-[#7F45DB]/40 flex items-center justify-center text-[10px] text-[#7F45DB] dark:text-[#A472F7]">
                        {entry.name[0]?.toUpperCase() || "C"}
                      </div>
                      <span className="truncate max-w-[140px] sm:max-w-none">
                        {entry.name} {isMe && <span className="text-[10px] text-[#7F45DB] dark:text-[#A472F7] font-black">(You)</span>}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#6E6E6E] dark:text-[#94A3B8] hidden sm:table-cell truncate max-w-[180px]">
                      {entry.college}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-[#7F45DB] dark:text-[#A472F7] text-sm">
                      {entry.score.toLocaleString()} pts
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-8 text-center text-xs font-mono text-[#6E6E6E] dark:text-[#94A3B8]">
          No submissions logged for the active contest yet. Be the first to solve a problem and claim #1!
        </div>
      )}
    </div>
  );
}
