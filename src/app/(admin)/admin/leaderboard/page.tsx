"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Trophy,
  Users,
  User,
  Tv2,
  Search,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { IndividualLeaderboardEntry, TeamLeaderboardEntry } from "@/types";

interface LeaderboardState {
  individual: IndividualLeaderboardEntry[];
  team: TeamLeaderboardEntry[];
}

const EVENT_ID = process.env.NEXT_PUBLIC_EVENT_ID ?? "byteverse-2026";

export default function AdminLeaderboardPage() {
  const [data, setData] = useState<LeaderboardState>({ individual: [], team: [] });
  const [tab, setTab] = useState<"team" | "individual">("team");
  const [search, setSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [livePulse, setLivePulse] = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [ind, tm] = await Promise.all([
        fetch(`/api/leaderboard/individual?eventId=${EVENT_ID}`).then((r) => r.json()),
        fetch(`/api/leaderboard/team?eventId=${EVENT_ID}`).then((r) => r.json()),
      ]);
      setData({
        individual: Array.isArray(ind) ? ind : [],
        team: Array.isArray(tm) ? tm : [],
      });
      setLastUpdated(new Date());
      setLivePulse(true);
      setTimeout(() => setLivePulse(false), 1200);
    } catch {
      // ignore
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // SSE connection for live score updates from Redis pub/sub
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

    // Auto-poll fallback every 15 seconds
    const pollInterval = setInterval(fetchData, 15000);

    return () => {
      es.close();
      clearInterval(pollInterval);
    };
  }, []);

  // Filtered Teams
  const filteredTeams = useMemo(() => {
    if (!search.trim()) return data.team;
    const q = search.toLowerCase();
    return data.team.filter(
      (t) =>
        t.teamName.toLowerCase().includes(q) ||
        t.member1Name.toLowerCase().includes(q) ||
        t.member2Name.toLowerCase().includes(q)
    );
  }, [data.team, search]);

  // Filtered Individuals
  const filteredIndividuals = useMemo(() => {
    if (!search.trim()) return data.individual;
    const q = search.toLowerCase();
    return data.individual.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.college.toLowerCase().includes(q)
    );
  }, [data.individual, search]);

  // Top 3 Podium Teams
  const top3Teams = useMemo(() => data.team.slice(0, 3), [data.team]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#7F45DB] font-extrabold uppercase tracking-widest mb-1">
            <Trophy className="w-4 h-4 text-[#7F45DB]" />
            Admin Exclusive · Live Standings
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-[#0F172A] tracking-tight uppercase">
            Tournament Leaderboard
          </h1>
          <p className="text-xs text-[#6E6E6E] mt-1 font-mono">
            Real-time synchronized scoring across all 5 competitive rounds
          </p>
        </div>

        {/* Action Controls & Projector View Button */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/admin/leaderboard/projector"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7F45DB] text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#1E1B4B] transition-all cursor-pointer"
          >
            <Tv2 className="w-4 h-4" />
            <span>Launch Projector Stage</span>
          </Link>

          <button
            onClick={fetchData}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-white border-2 border-[#1E1B4B] text-[#0F172A] hover:bg-[#F0F2F8] shadow-[3px_3px_0px_0px_#1E1B4B] transition-all cursor-pointer"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`w-4 h-4 text-[#7F45DB] ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Top 3 Podium Cards (Team View) */}
      {tab === "team" && top3Teams.length > 0 && !search && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rank 2 (Silver) */}
          {top3Teams[1] && (
            <div className="order-2 md:order-1 bg-white border-2 border-[#1E1B4B] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1E1B4B] flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="w-8 h-8 rounded-xl bg-slate-100 text-[#0F172A] font-mono font-black text-sm flex items-center justify-center border-2 border-[#1E1B4B]">
                  #2
                </span>
                <span className="text-xs font-mono text-slate-700 font-bold uppercase">Silver</span>
              </div>
              <div className="my-3">
                <h3 className="font-display font-bold text-lg text-[#0F172A] truncate">{top3Teams[1].teamName}</h3>
                <p className="text-xs text-[#6E6E6E] mt-0.5 truncate">
                  {top3Teams[1].member1Name} & {top3Teams[1].member2Name}
                </p>
              </div>
              <div className="border-t-2 border-[#1E1B4B]/10 pt-3 flex items-center justify-between">
                <span className="text-xs text-[#6E6E6E] font-mono">Total Score</span>
                <span className="text-xl font-mono font-extrabold text-[#0F172A]">{top3Teams[1].totalScore.toFixed(1)} <span className="text-xs text-[#6E6E6E] font-normal">pts</span></span>
              </div>
            </div>
          )}

          {/* Rank 1 (Gold) */}
          {top3Teams[0] && (
            <div className="order-1 md:order-2 bg-[#7F45DB]/5 border-2 border-[#1E1B4B] rounded-2xl p-6 shadow-[5px_5px_0px_0px_#7F45DB] flex flex-col justify-between -translate-y-1">
              <div className="flex items-start justify-between">
                <span className="w-9 h-9 rounded-xl bg-[#7F45DB] text-white font-mono font-black text-base flex items-center justify-center border-2 border-[#1E1B4B]">
                  #1
                </span>
                <span className="text-xs font-mono text-[#7F45DB] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  👑 Champion
                </span>
              </div>
              <div className="my-3">
                <h3 className="font-display font-black text-2xl text-[#0F172A] truncate">{top3Teams[0].teamName}</h3>
                <p className="text-xs text-[#4A2293] font-semibold mt-0.5 truncate">
                  {top3Teams[0].member1Name} & {top3Teams[0].member2Name}
                </p>
              </div>
              <div className="border-t-2 border-[#1E1B4B]/20 pt-3 flex items-center justify-between">
                <span className="text-xs text-[#4A2293] font-mono font-bold">Total Score</span>
                <span className="text-2xl font-mono font-black text-[#7F45DB]">{top3Teams[0].totalScore.toFixed(1)} <span className="text-xs text-[#6E6E6E] font-normal">pts</span></span>
              </div>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {top3Teams[2] && (
            <div className="order-3 bg-white border-2 border-[#1E1B4B] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1E1B4B] flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-950 font-mono font-black text-sm flex items-center justify-center border-2 border-[#1E1B4B]">
                  #3
                </span>
                <span className="text-xs font-mono text-amber-800 font-bold uppercase">Bronze</span>
              </div>
              <div className="my-3">
                <h3 className="font-display font-bold text-lg text-[#0F172A] truncate">{top3Teams[2].teamName}</h3>
                <p className="text-xs text-[#6E6E6E] mt-0.5 truncate">
                  {top3Teams[2].member1Name} & {top3Teams[2].member2Name}
                </p>
              </div>
              <div className="border-t-2 border-[#1E1B4B]/10 pt-3 flex items-center justify-between">
                <span className="text-xs text-[#6E6E6E] font-mono">Total Score</span>
                <span className="text-xl font-mono font-extrabold text-[#0F172A]">{top3Teams[2].totalScore.toFixed(1)} <span className="text-xs text-[#6E6E6E] font-normal">pts</span></span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Toggle View */}
        <div className="inline-flex p-1 bg-[#F0F2F8] border-2 border-[#1E1B4B] rounded-xl shadow-[3px_3px_0px_0px_#1E1B4B]">
          <button
            onClick={() => setTab("team")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${tab === "team"
                ? "bg-[#7F45DB] text-white shadow-sm"
                : "text-[#6E6E6E] hover:text-[#0F172A]"
              }`}
          >
            <Users className="w-4 h-4" />
            <span>Team Rankings ({data.team.length})</span>
          </button>
          <button
            onClick={() => setTab("individual")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${tab === "individual"
                ? "bg-[#7F45DB] text-white shadow-sm"
                : "text-[#6E6E6E] hover:text-[#0F172A]"
              }`}
          >
            <User className="w-4 h-4" />
            <span>Individual Roster ({data.individual.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === "team" ? "Search team or member..." : "Search participant or college..."}
            className="w-full bg-white border-2 border-[#1E1B4B] focus:border-[#7F45DB] text-[#0F172A] text-xs rounded-xl pl-10 pr-4 py-2.5 font-mono shadow-[3px_3px_0px_0px_#1E1B4B] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Standings Table */}
      <div className="bg-white border-2 border-[#1E1B4B] rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_#1E1B4B]">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b-2 border-[#1E1B4B]/20 bg-[#F0F2F8] text-[#0F172A] font-mono text-[11px] uppercase tracking-wider">
                <th className="p-4 pl-6 w-20">Rank</th>
                <th className="p-4">{tab === "team" ? "Team Roster" : "Participant"}</th>
                <th className="p-4 text-center">R1</th>
                <th className="p-4 text-center">R2</th>
                <th className="p-4 text-center">R3</th>
                <th className="p-4 text-center">R4</th>
                <th className="p-4 text-center">R5</th>
                <th className="p-4 text-right pr-6 font-bold text-[#7F45DB]">Total Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] font-mono">
              {tab === "team" ? (
                filteredTeams.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-[#6E6E6E] font-mono">
                      No teams on the leaderboard yet.
                    </td>
                  </tr>
                ) : (
                  filteredTeams.map((t) => (
                    <tr key={t.teamId} className="hover:bg-[#F8F9FD] transition-colors">
                      <td className="p-4 pl-6">
                        <span className={`w-7 h-7 rounded-lg text-xs font-mono font-black flex items-center justify-center border ${t.rank === 1 ? "bg-[#7F45DB] text-white border-[#1E1B4B]" :
                            t.rank === 2 ? "bg-slate-200 text-slate-900 border-[#1E1B4B]" :
                              t.rank === 3 ? "bg-amber-100 text-amber-900 border-[#1E1B4B]" :
                                "bg-[#F0F2F8] text-[#6E6E6E] border-[#E2E8F0]"
                          }`}>
                          {t.rank}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-display font-bold text-sm text-[#0F172A]">{t.teamName}</div>
                        <div className="text-[11px] text-[#6E6E6E] mt-0.5">
                          {t.member1Name} & {t.member2Name}
                        </div>
                      </td>
                      <td className="p-4 text-center text-[#0F172A]">{(t.roundScores["1"] ?? t.roundScores[1]) ? Number(t.roundScores["1"] ?? t.roundScores[1]).toFixed(0) : "—"}</td>
                      <td className="p-4 text-center text-[#0F172A]">{(t.roundScores["2"] ?? t.roundScores[2]) ? Number(t.roundScores["2"] ?? t.roundScores[2]).toFixed(0) : "—"}</td>
                      <td className="p-4 text-center text-[#0F172A]">{(t.roundScores["3"] ?? t.roundScores[3]) ? Number(t.roundScores["3"] ?? t.roundScores[3]).toFixed(0) : "—"}</td>
                      <td className="p-4 text-center text-[#0F172A]">{(t.roundScores["4"] ?? t.roundScores[4]) ? Number(t.roundScores["4"] ?? t.roundScores[4]).toFixed(0) : "—"}</td>
                      <td className="p-4 text-center text-[#0F172A]">{(t.roundScores["5"] ?? t.roundScores[5]) ? Number(t.roundScores["5"] ?? t.roundScores[5]).toFixed(0) : "—"}</td>
                      <td className="p-4 text-right pr-6 font-extrabold text-base text-[#7F45DB]">
                        {t.totalScore.toFixed(1)} <span className="text-[10px] text-[#6E6E6E] font-normal">pts</span>
                      </td>
                    </tr>
                  ))
                )
              ) : (
                filteredIndividuals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-[#6E6E6E] font-mono">
                      No participants on the leaderboard yet.
                    </td>
                  </tr>
                ) : (
                  filteredIndividuals.map((p) => (
                    <tr key={p.participantId} className="hover:bg-[#F8F9FD] transition-colors">
                      <td className="p-4 pl-6">
                        <span className="w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center bg-[#F0F2F8] text-[#0F172A] border border-[#E2E8F0]">
                          {p.rank}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-display font-bold text-sm text-[#0F172A]">{p.name}</div>
                        <div className="text-[11px] text-[#6E6E6E] mt-0.5">
                          {p.college ? p.college : "Participant"}
                        </div>
                      </td>
                      <td className="p-4 text-center text-[#0F172A]">{(p.roundScores["1"] ?? p.roundScores[1]) ? Number(p.roundScores["1"] ?? p.roundScores[1]).toFixed(0) : "—"}</td>
                      <td className="p-4 text-center text-[#0F172A]">{(p.roundScores["2"] ?? p.roundScores[2]) ? Number(p.roundScores["2"] ?? p.roundScores[2]).toFixed(0) : "—"}</td>
                      <td className="p-4 text-center text-[#0F172A]">{(p.roundScores["3"] ?? p.roundScores[3]) ? Number(p.roundScores["3"] ?? p.roundScores[3]).toFixed(0) : "—"}</td>
                      <td className="p-4 text-center text-[#0F172A]">{(p.roundScores["4"] ?? p.roundScores[4]) ? Number(p.roundScores["4"] ?? p.roundScores[4]).toFixed(0) : "—"}</td>
                      <td className="p-4 text-center text-[#0F172A]">{(p.roundScores["5"] ?? p.roundScores[5]) ? Number(p.roundScores["5"] ?? p.roundScores[5]).toFixed(0) : "—"}</td>
                      <td className="p-4 text-right pr-6 font-extrabold text-base text-[#7F45DB]">
                        {p.totalScore.toFixed(1)} <span className="text-[10px] text-[#6E6E6E] font-normal">pts</span>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
