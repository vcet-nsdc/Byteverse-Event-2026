"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, MessageSquare, Terminal, Users, ShieldAlert, CheckCircle2, Clock } from "lucide-react";

interface ParticipantItem {
  id: string;
  name: string;
  email: string;
  role: string;
  college: string;
  department: string;
  teamName: string;
  teamId: string | null;
  aiChatCount: number;
  aiCodeCount: number;
  totalSubmissions: number;
  pointsEarned: number;
  isDisqualified: boolean;
  hasCheated: boolean;
  violationCount: number;
  violationReasons: string[];
  timeTaken?: string;
  totalSecondsTaken?: number;
  aiChatPenalty?: number;
  aiCodePenalty?: number;
  totalAIPenalty?: number;
  totalRawScore?: number;
}

export default function AdminParticipantsClient() {
  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchParticipants = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/participants?q=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setParticipants(Array.isArray(data.participants) ? data.participants : []);
      }
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchParticipants, 300);
    return () => clearTimeout(t);
  }, [fetchParticipants]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight font-display">
            Participants Info
          </h1>
          <p className="text-xs text-[#6E6E6E] mt-1 font-mono">
            Alphabetical participant directory with individual integrity alerts, AI limits, and points earned
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by participant or team name..."
            className="w-full bg-white border-2 border-[#1E1B4B] focus:border-[#7F45DB] text-[#0F172A] text-xs rounded-xl pl-10 pr-4 py-2.5 font-mono shadow-[3px_3px_0px_0px_#1E1B4B] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white border-2 border-[#1E1B4B] rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_#1E1B4B]">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b-2 border-[#1E1B4B]/20 bg-[#F0F2F8] text-[#0F172A] font-mono text-[11px] uppercase tracking-wider">
                <th className="p-4 pl-6">Participant Name</th>
                <th className="p-4">Team Name</th>
                <th className="p-4 text-center">Cheat Detected</th>
                <th className="p-4 text-center">Time Taken</th>
                <th className="p-4 text-center">
                  AI Chat Req<br />
                  <span className="text-[10px] text-[#6E6E6E] font-normal">Max: 15</span>
                </th>
                <th className="p-4 text-center">
                  AI Code Req<br />
                  <span className="text-[10px] text-[#6E6E6E] font-normal">Max: 25</span>
                </th>
                <th className="p-4 text-right pr-6 font-bold text-[#7F45DB]">Points Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] font-mono">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[#6E6E6E] font-mono">
                    Loading participants info...
                  </td>
                </tr>
              ) : participants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[#6E6E6E] font-mono">
                    No participants found matching &quot;{search}&quot;.
                  </td>
                </tr>
              ) : (
                participants.map((p) => {
                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${
                        p.isDisqualified
                          ? "bg-slate-950 text-white hover:bg-slate-900 border-l-8 border-l-red-600 shadow-[inset_0_0_25px_rgba(0,0,0,0.9)]"
                          : p.hasCheated
                          ? "bg-red-50/90 hover:bg-red-100/90 border-l-4 border-l-destructive"
                          : "hover:bg-[#F8F9FD]"
                      }`}
                    >
                      {/* Name & College/Email */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-2">
                          <span className={`font-display font-bold text-sm ${p.isDisqualified ? "text-white line-through" : p.hasCheated ? "text-destructive" : "text-[#0F172A]"}`}>
                            {p.name}
                          </span>
                          {p.isDisqualified && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white font-black uppercase">
                              DISQUALIFIED
                            </span>
                          )}
                        </div>
                        <div className={`text-[11px] mt-0.5 ${p.isDisqualified ? "text-gray-400" : "text-[#6E6E6E]"}`}>
                          {p.email} {p.college ? `· ${p.college}` : ""}
                        </div>
                      </td>

                      {/* Team Name */}
                      <td className="p-4">
                        {p.teamName !== "—" ? (
                          <span className={`font-semibold flex items-center gap-1.5 ${p.isDisqualified ? "text-red-400 font-black line-through" : "text-[#0F172A]"}`}>
                            <Users className="w-3.5 h-3.5 text-[#7F45DB]" />
                            {p.teamName}
                          </span>
                        ) : (
                          <span className="text-[#8A8A8A]">No Team</span>
                        )}
                      </td>

                      {/* Cheat Detected Column */}
                      <td className="p-4 text-center">
                        {p.hasCheated ? (
                          <div className="inline-flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl bg-destructive/15 border-2 border-destructive text-destructive font-black">
                            <div className="flex items-center gap-1 text-[11px]">
                              <ShieldAlert className="w-3.5 h-3.5 fill-current" />
                              <span>FLAGGED ({p.violationCount})</span>
                            </div>
                            {p.violationReasons.length > 0 && (
                              <div className="text-[9px] font-normal text-destructive/90 max-w-[170px] truncate" title={p.violationReasons.join(" | ")}>
                                {p.violationReasons[0]}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Clean
                          </span>
                        )}
                      </td>

                      {/* Time Taken Column */}
                      <td className="p-4 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold ${
                          p.isDisqualified
                            ? "bg-slate-800 text-gray-300 border border-gray-700"
                            : "bg-purple-50 border border-purple-200 text-purple-900"
                        }`}>
                          <Clock className="w-3.5 h-3.5 text-[#7F45DB] shrink-0" />
                          <span>{p.timeTaken || "—"}</span>
                        </div>
                      </td>

                      {/* AI Chat Req */}
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold">
                            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                            <span>{p.aiChatCount} / 15</span>
                          </div>
                          {(p.aiChatPenalty ?? 0) > 0 && (
                            <span className="text-[10px] text-rose-600 font-mono font-bold mt-0.5">
                              -{(p.aiChatPenalty ?? 0) % 1 === 0 ? p.aiChatPenalty : (p.aiChatPenalty ?? 0).toFixed(2)} pts
                            </span>
                          )}
                        </div>
                      </td>

                      {/* AI Code Req */}
                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-bold">
                            <Terminal className="w-3.5 h-3.5 text-amber-600" />
                            <span>{p.aiCodeCount} / 25</span>
                          </div>
                          {(p.aiCodePenalty ?? 0) > 0 && (
                            <span className="text-[10px] text-rose-600 font-mono font-bold mt-0.5">
                              -{(p.aiCodePenalty ?? 0) % 1 === 0 ? p.aiCodePenalty : (p.aiCodePenalty ?? 0).toFixed(2)} pts
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Points Earned */}
                      <td className="p-4 text-right pr-6">
                        <div className={`font-extrabold text-base ${p.isDisqualified ? "text-gray-400 line-through" : "text-[#7F45DB]"}`}>
                          {p.pointsEarned.toFixed(1)} <span className="text-[10px] text-[#6E6E6E] font-normal">pts</span>
                        </div>
                        {(p.totalAIPenalty ?? 0) > 0 && !p.isDisqualified && (
                          <div className="text-[10px] text-rose-600 font-mono font-bold">
                            (-{(p.totalAIPenalty ?? 0) % 1 === 0 ? p.totalAIPenalty : (p.totalAIPenalty ?? 0).toFixed(2)} AI penalty)
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
