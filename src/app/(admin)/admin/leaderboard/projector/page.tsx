"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Trophy,
  Maximize,
  Minimize,
  ArrowLeft,
  Users,
  User,
  Radio
} from "lucide-react";
import { IndividualLeaderboardEntry, TeamLeaderboardEntry } from "@/types";

interface LeaderboardState {
  individual: IndividualLeaderboardEntry[];
  team: TeamLeaderboardEntry[];
}

const EVENT_ID = process.env.NEXT_PUBLIC_EVENT_ID ?? "byteverse-2026";

export default function AdminProjectorLeaderboardPage() {
  const [data, setData] = useState<LeaderboardState>({ individual: [], team: [] });
  const [viewMode, setViewMode] = useState<"team" | "individual">("team");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fetchData = async () => {
    try {
      const [ind, tm] = await Promise.all([
        fetch(`/api/leaderboard/individual?eventId=${EVENT_ID}`).then((r) => r.json()),
        fetch(`/api/leaderboard/team?eventId=${EVENT_ID}`).then((r) => r.json()),
      ]);
      setData({
        individual: Array.isArray(ind) ? ind : [],
        team: Array.isArray(tm) ? tm : [],
      });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchData();

    const es = new EventSource(`/api/leaderboard/sse?eventId=${EVENT_ID}`);
    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "SCORE_UPDATE" || msg.type === "AI_PENALTY" || msg.type === "SUBMISSION_ACCEPTED") {
          fetchData();
        }
      } catch {
        // ignore
      }
    };

    const poll = setInterval(fetchData, 10000);
    return () => {
      es.close();
      clearInterval(poll);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => { });
      setIsFullscreen(false);
    }
  };

  const top3Teams = useMemo(() => data.team.slice(0, 3), [data.team]);

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-[#0F172A] flex flex-col p-6 font-sans overflow-hidden">
      {/* Top Projector Bar */}
      <header className="flex items-center justify-between pb-6 border-b-2 border-[#1E1B4B] flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/leaderboard"
            className="p-2.5 rounded-xl bg-white border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 text-[#0F172A] transition-all"
            title="Back to Leaderboard"
          >
            <ArrowLeft className="w-5 h-5 text-[#7F45DB]" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black uppercase text-[#7F45DB] tracking-widest">
                BYTEVERSE 2026 · GRAND ARENA STAGE
              </span>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-400 text-emerald-800 text-[10px] font-mono font-bold">
                <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                <span>LIVE SYNC</span>
              </div>
            </div>
            <h1 className="font-display font-black text-3xl text-[#0F172A] uppercase tracking-tight">
              {viewMode === "team" ? "Team Championship Standings" : "Individual Cadet Rankings"}
            </h1>
          </div>
        </div>

        {/* View Switcher & Fullscreen Button */}
        <div className="flex items-center gap-3">
          <div className="inline-flex p-1 bg-[#F0F2F8] border-2 border-[#1E1B4B] rounded-xl shadow-[3px_3px_0px_0px_#1E1B4B]">
            <button
              onClick={() => setViewMode("team")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${viewMode === "team"
                  ? "bg-[#7F45DB] text-white shadow-sm"
                  : "text-[#6E6E6E] hover:text-[#0F172A]"
                }`}
            >
              <Users className="w-4 h-4" />
              <span>Teams</span>
            </button>
            <button
              onClick={() => setViewMode("individual")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${viewMode === "individual"
                  ? "bg-[#7F45DB] text-white shadow-sm"
                  : "text-[#6E6E6E] hover:text-[#0F172A]"
                }`}
            >
              <User className="w-4 h-4" />
              <span>Individuals</span>
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-xl bg-white border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] text-[#0F172A] hover:bg-[#F0F2F8] transition-all cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-5 h-5 text-[#7F45DB]" /> : <Maximize className="w-5 h-5 text-[#7F45DB]" />}
          </button>
        </div>
      </header>

      {/* Main Projector Board */}
      <main className="flex-1 py-6 space-y-6 overflow-y-auto">
        {/* Top 3 Podium Cards */}
        {viewMode === "team" && top3Teams.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 2nd Place */}
            {top3Teams[1] && (
              <div className="bg-white border-2 border-[#1E1B4B] shadow-[5px_5px_0px_0px_#1E1B4B] rounded-2xl p-6 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="w-10 h-10 rounded-xl bg-slate-100 text-[#0F172A] font-mono font-black text-lg flex items-center justify-center border-2 border-[#1E1B4B]">
                    #2
                  </span>
                  <span className="text-xs font-mono text-slate-700 font-bold uppercase">Silver Rank</span>
                </div>
                <div className="my-4">
                  <h3 className="font-display font-black text-2xl text-[#0F172A] truncate">{top3Teams[1].teamName}</h3>
                  <p className="text-xs font-mono text-[#6E6E6E] mt-1 truncate">
                    {top3Teams[1].member1Name} & {top3Teams[1].member2Name}
                  </p>
                </div>
                <div className="border-t-2 border-[#1E1B4B]/10 pt-3 flex items-center justify-between">
                  <span className="text-xs font-mono text-[#6E6E6E]">Score</span>
                  <span className="text-2xl font-mono font-black text-[#0F172A]">{top3Teams[1].totalScore.toFixed(1)} <span className="text-xs text-[#6E6E6E]">pts</span></span>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {top3Teams[0] && (
              <div className="bg-[#7F45DB]/5 border-2 border-[#1E1B4B] shadow-[6px_6px_0px_0px_#7F45DB] rounded-2xl p-6 flex flex-col justify-between -translate-y-2">
                <div className="flex items-start justify-between">
                  <span className="w-12 h-12 rounded-xl bg-[#7F45DB] text-white font-mono font-black text-xl flex items-center justify-center border-2 border-[#1E1B4B]">
                    #1
                  </span>
                  <span className="text-xs font-mono text-[#7F45DB] font-extrabold uppercase tracking-wider flex items-center gap-1">
                    👑 Champion
                  </span>
                </div>
                <div className="my-4">
                  <h3 className="font-display font-black text-3xl text-[#0F172A] truncate">{top3Teams[0].teamName}</h3>
                  <p className="text-sm font-mono text-[#4A2293] font-bold mt-1 truncate">
                    {top3Teams[0].member1Name} & {top3Teams[0].member2Name}
                  </p>
                </div>
                <div className="border-t-2 border-[#1E1B4B]/20 pt-3 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#4A2293]">Score</span>
                  <span className="text-3xl font-mono font-black text-[#7F45DB]">{top3Teams[0].totalScore.toFixed(1)} <span className="text-xs text-[#6E6E6E]">pts</span></span>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {top3Teams[2] && (
              <div className="bg-white border-2 border-[#1E1B4B] shadow-[5px_5px_0px_0px_#1E1B4B] rounded-2xl p-6 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="w-10 h-10 rounded-xl bg-amber-100 text-amber-950 font-mono font-black text-lg flex items-center justify-center border-2 border-[#1E1B4B]">
                    #3
                  </span>
                  <span className="text-xs font-mono text-amber-800 font-bold uppercase">Bronze Rank</span>
                </div>
                <div className="my-4">
                  <h3 className="font-display font-black text-2xl text-[#0F172A] truncate">{top3Teams[2].teamName}</h3>
                  <p className="text-xs font-mono text-[#6E6E6E] mt-1 truncate">
                    {top3Teams[2].member1Name} & {top3Teams[2].member2Name}
                  </p>
                </div>
                <div className="border-t-2 border-[#1E1B4B]/10 pt-3 flex items-center justify-between">
                  <span className="text-xs font-mono text-[#6E6E6E]">Score</span>
                  <span className="text-2xl font-mono font-black text-[#0F172A]">{top3Teams[2].totalScore.toFixed(1)} <span className="text-xs text-[#6E6E6E]">pts</span></span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Full Table */}
        <div className="bg-white border-2 border-[#1E1B4B] rounded-2xl overflow-hidden shadow-[5px_5px_0px_0px_#1E1B4B]">
          <table className="w-full text-left font-mono">
            <thead>
              <tr className="border-b-2 border-[#1E1B4B] bg-[#F0F2F8] text-[#0F172A] text-xs font-extrabold uppercase tracking-wider">
                <th className="p-4 pl-6 w-20">Rank</th>
                <th className="p-4">{viewMode === "team" ? "Team Roster" : "Participant"}</th>
                <th className="p-4 text-center">Round 1</th>
                <th className="p-4 text-center">Round 2</th>
                <th className="p-4 text-center">Round 3</th>
                <th className="p-4 text-center">Round 4</th>
                <th className="p-4 text-center">Round 5</th>
                <th className="p-4 text-right pr-6 font-bold text-[#7F45DB]">Total Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-sm">
              {viewMode === "team" ? (
                data.team.map((t) => (
                  <tr key={t.teamId} className="hover:bg-[#F8F9FD]">
                    <td className="p-4 pl-6 font-black text-base">{t.rank}</td>
                    <td className="p-4">
                      <div className="font-display font-bold text-base text-[#0F172A]">{t.teamName}</div>
                      <div className="text-xs text-[#6E6E6E]">{t.member1Name} & {t.member2Name}</div>
                    </td>
                    <td className="p-4 text-center font-bold">{(t.roundScores["1"] ?? t.roundScores[1]) ? Number(t.roundScores["1"] ?? t.roundScores[1]).toFixed(0) : "—"}</td>
                    <td className="p-4 text-center font-bold">{(t.roundScores["2"] ?? t.roundScores[2]) ? Number(t.roundScores["2"] ?? t.roundScores[2]).toFixed(0) : "—"}</td>
                    <td className="p-4 text-center font-bold">{(t.roundScores["3"] ?? t.roundScores[3]) ? Number(t.roundScores["3"] ?? t.roundScores[3]).toFixed(0) : "—"}</td>
                    <td className="p-4 text-center font-bold">{(t.roundScores["4"] ?? t.roundScores[4]) ? Number(t.roundScores["4"] ?? t.roundScores[4]).toFixed(0) : "—"}</td>
                    <td className="p-4 text-center font-bold">{(t.roundScores["5"] ?? t.roundScores[5]) ? Number(t.roundScores["5"] ?? t.roundScores[5]).toFixed(0) : "—"}</td>
                    <td className="p-4 text-right pr-6 font-black text-xl text-[#7F45DB]">{t.totalScore.toFixed(1)} pts</td>
                  </tr>
                ))
              ) : (
                data.individual.map((p) => (
                  <tr key={p.participantId} className="hover:bg-[#F8F9FD]">
                    <td className="p-4 pl-6 font-black text-base">{p.rank}</td>
                    <td className="p-4">
                      <div className="font-display font-bold text-base text-[#0F172A]">{p.name}</div>
                      <div className="text-xs text-[#6E6E6E]">{p.college ? p.college : "Participant"}</div>
                    </td>
                    <td className="p-4 text-center font-bold">{(p.roundScores["1"] ?? p.roundScores[1]) ? Number(p.roundScores["1"] ?? p.roundScores[1]).toFixed(0) : "—"}</td>
                    <td className="p-4 text-center font-bold">{(p.roundScores["2"] ?? p.roundScores[2]) ? Number(p.roundScores["2"] ?? p.roundScores[2]).toFixed(0) : "—"}</td>
                    <td className="p-4 text-center font-bold">{(p.roundScores["3"] ?? p.roundScores[3]) ? Number(p.roundScores["3"] ?? p.roundScores[3]).toFixed(0) : "—"}</td>
                    <td className="p-4 text-center font-bold">{(p.roundScores["4"] ?? p.roundScores[4]) ? Number(p.roundScores["4"] ?? p.roundScores[4]).toFixed(0) : "—"}</td>
                    <td className="p-4 text-center font-bold">{(p.roundScores["5"] ?? p.roundScores[5]) ? Number(p.roundScores["5"] ?? p.roundScores[5]).toFixed(0) : "—"}</td>
                    <td className="p-4 text-right pr-6 font-black text-xl text-[#7F45DB]">{p.totalScore.toFixed(1)} pts</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
