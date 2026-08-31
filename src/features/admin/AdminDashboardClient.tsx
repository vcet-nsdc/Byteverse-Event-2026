"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, UserCheck, Code2, MessageSquare, Terminal, Trophy } from "lucide-react";

interface ActiveRound {
  id: string;
  name: string;
  type: string;
  sequence: number;
  status: string;
  startsAt: string | null;
  endsAt: string | null;
}

interface Stats {
  totalParticipants: number;
  totalTeamsRegistered: number;
  totalTeamsVerified: number;
  totalSubmissions: number;
  totalAiChat: number;
  totalAiCode: number;
  activeRound: ActiveRound | null;
}

const ROUND_TYPE_LABELS: Record<string, string> = {
  CODE_LOGIC: "Logical Thinking",
  AI_REPAIR: "AI Code Optimization",
  TRADITIONAL: "Debugging & Code Analysis",
  TYPE_TRANSFORM: "Data Structures & Algorithms",
  HUMAN_VS_MACHINE: "AI vs Human",
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "text-muted-foreground border-muted-foreground/30",
  SCHEDULED: "text-blue-500 border-blue-500/30",
  ACTIVE: "text-[#7F45DB] border-[#7F45DB]/40 bg-[#7F45DB]/10",
  PAUSED: "text-amber-500 border-amber-500/30 bg-amber-500/10",
  ENDED: "text-destructive border-destructive/30",
};

export default function AdminDashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null);

  const fetchStats = () => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-[#7F45DB] font-mono text-sm">
        Loading Overview...
      </div>
    );
  }

  const round = stats.activeRound;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight font-display">
            Event Overview
          </h1>
          <p className="text-xs text-[#6E6E6E] mt-1 font-mono">
            Live tournament metrics and activity status
          </p>
        </div>
        <span className="flex items-center gap-2 text-xs font-mono font-bold text-[#4A2293] border-2 border-[#1E1B4B] bg-[#7F45DB]/10 px-3.5 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_#1E1B4B]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#7F45DB] animate-pulse" />
          Live Sync Active
        </span>
      </div>

      {/* Active round banner */}
      {round ? (
        <div className="bg-white p-5 border-2 border-[#1E1B4B] flex items-center justify-between flex-wrap gap-4 rounded-2xl shadow-[4px_4px_0px_0px_#1E1B4B]">
          <div>
            <div className="text-xs font-mono text-[#6E6E6E] mb-1 font-bold">
              Round {round.sequence} · {ROUND_TYPE_LABELS[round.type] ?? round.type}
            </div>
            <div className="text-[#7F45DB] font-bold text-xl font-display">{round.name}</div>
            {round.startsAt && (
              <div className="text-xs text-[#6E6E6E] mt-1 font-mono">
                Started at: {new Date(round.startsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                {round.endsAt && ` · Ends at: ${new Date(round.endsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-mono font-bold px-3 py-1 rounded-lg border ${STATUS_COLORS[round.status] ?? "text-muted-foreground"}`}>
              {round.status}
            </span>
            <Link
              href="/admin/rounds"
              className="px-4 py-2 text-xs bg-[#7F45DB] text-white font-mono font-bold rounded-xl border-2 border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              Manage Round →
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white p-5 border-2 border-[#1E1B4B] text-[#6E6E6E] text-sm flex items-center justify-between rounded-2xl shadow-[3px_3px_0px_0px_#1E1B4B] font-mono">
          <span>No round is currently active.</span>
          <Link href="/admin/rounds" className="text-[#7F45DB] font-mono text-xs font-bold hover:underline">
            Go to Round Control →
          </Link>
        </div>
      )}

      {/* 6 Key Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Total Teams Verified */}
        <div className="bg-white p-6 rounded-2xl border-2 border-[#1E1B4B] relative overflow-hidden shadow-[4px_4px_0px_0px_#1E1B4B]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase font-bold text-[#6E6E6E]">
              Total Teams Verified
            </span>
            <div className="p-2.5 rounded-xl bg-[#7F45DB]/10 border border-[#7F45DB]/30 text-[#7F45DB]">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-[#7F45DB] font-mono tabular-nums">
            {stats.totalTeamsVerified}
          </div>
          <div className="text-xs text-[#6E6E6E] mt-2 font-mono">
            Rosters locked & ready to compete
          </div>
        </div>

        {/* Total Teams Registered */}
        <div className="bg-white p-6 rounded-2xl border-2 border-[#1E1B4B] relative overflow-hidden shadow-[4px_4px_0px_0px_#1E1B4B]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase font-bold text-[#6E6E6E]">
              Total Teams Registered
            </span>
            <div className="p-2.5 rounded-xl bg-[#F0F2F8] border border-[#E2E8F0] text-[#0F172A]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-[#0F172A] font-mono tabular-nums">
            {stats.totalTeamsRegistered}
          </div>
          <div className="text-xs text-[#6E6E6E] mt-2 font-mono">
            Combined active & pending teams
          </div>
        </div>

        {/* Total Participants */}
        <div className="bg-white p-6 rounded-2xl border-2 border-[#1E1B4B] relative overflow-hidden shadow-[4px_4px_0px_0px_#1E1B4B]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase font-bold text-[#6E6E6E]">
              Total Participants
            </span>
            <div className="p-2.5 rounded-xl bg-[#F0F2F8] border border-[#E2E8F0] text-[#0F172A]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-[#0F172A] font-mono tabular-nums">
            {stats.totalParticipants}
          </div>
          <div className="text-xs text-[#6E6E6E] mt-2 font-mono">
            Registered students across all years
          </div>
        </div>

        {/* Total Submissions */}
        <div className="bg-white p-6 rounded-2xl border-2 border-[#1E1B4B] relative overflow-hidden shadow-[4px_4px_0px_0px_#1E1B4B]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase font-bold text-[#6E6E6E]">
              Total Submissions
            </span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-600">
              <Code2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-cyan-600 font-mono tabular-nums">
            {stats.totalSubmissions}
          </div>
          <div className="text-xs text-[#6E6E6E] mt-2 font-mono">
            Evaluated code submissions
          </div>
        </div>

        {/* Total AI Chat Requests */}
        <div className="bg-white p-6 rounded-2xl border-2 border-[#1E1B4B] relative overflow-hidden shadow-[4px_4px_0px_0px_#1E1B4B]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase font-bold text-[#6E6E6E]">
              Total AI Chat Requests
            </span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-600">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-blue-600 font-mono tabular-nums">
            {stats.totalAiChat}
          </div>
          <div className="text-xs text-[#6E6E6E] mt-2 font-mono">
            Concept & hint queries
          </div>
        </div>

        {/* Total AI Code Requests */}
        <div className="bg-white p-6 rounded-2xl border-2 border-[#1E1B4B] relative overflow-hidden shadow-[4px_4px_0px_0px_#1E1B4B]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase font-bold text-[#6E6E6E]">
              Total AI Code Requests
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600">
              <Terminal className="w-5 h-5" />
            </div>
          </div>
          <div className="text-4xl font-extrabold text-amber-600 font-mono tabular-nums">
            {stats.totalAiCode}
          </div>
          <div className="text-xs text-[#6E6E6E] mt-2 font-mono">
            Code review & optimization queries
          </div>
        </div>
      </div>
    </div>
  );
}
