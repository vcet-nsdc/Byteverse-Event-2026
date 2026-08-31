"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Lock, Unlock, ShieldAlert, MessageSquare, Terminal, Code2, Users, CheckCircle2 } from "lucide-react";

interface Member {
  userId: string;
  name: string | null;
  email: string;
  isLeader: boolean;
  violationCount: number;
}

interface Team {
  id: string;
  name: string;
  inviteCode: string;
  status: string;
  isLocked: boolean;
  memberCount: number;
  members: Member[];
  aiChatCount: number;
  aiCodeCount: number;
  submissionsCount: number;
  teamScore: number;
  disqualification: { reason: string; disqualifiedAt: string } | null;
  hasCheated: boolean;
  violationCount: number;
  violationDetails: { memberName: string; reason: string }[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-[#6E6E6E] border-[#8A8A8A]/40 bg-[#F0F2F8]",
  ACTIVE: "text-[#7F45DB] border-[#7F45DB]/40 bg-[#7F45DB]/10",
  LOCKED: "text-amber-600 border-amber-400/40 bg-amber-50",
  DISQUALIFIED: "text-destructive border-destructive/40 bg-destructive/10",
};

export default function AdminTeamsClient() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);
  const [disqualModal, setDisqualModal] = useState<{ teamId: string; teamName: string } | null>(null);
  const [disqualReason, setDisqualReason] = useState("");

  const fetchTeams = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/teams?q=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setTeams(Array.isArray(data) ? data : []);
      }
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchTeams, 300);
    return () => clearTimeout(t);
  }, [fetchTeams]);

  async function toggleLock(team: Team) {
    setWorking(team.id + "_lock");
    try {
      await fetch(`/api/admin/teams/${team.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLocked: !team.isLocked }),
      });
      await fetchTeams();
    } finally {
      setWorking(null);
    }
  }

  async function disqualify() {
    if (!disqualModal || !disqualReason.trim()) return;
    setWorking(disqualModal.teamId + "_disqual");
    try {
      await fetch(`/api/admin/teams/${disqualModal.teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DISQUALIFIED", reason: disqualReason }),
      });
      setDisqualModal(null);
      setDisqualReason("");
      await fetchTeams();
    } finally {
      setWorking(null);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight font-display">
            Teams Info
          </h1>
          <p className="text-xs text-[#6E6E6E] mt-1 font-mono">
            Alphabetical team registry with integrity alerts, AI quotas, submission stats, and combined scores
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by team or member name..."
            className="w-full bg-white border-2 border-[#1E1B4B] focus:border-[#7F45DB] text-[#0F172A] text-xs rounded-xl pl-10 pr-4 py-2.5 font-mono shadow-[3px_3px_0px_0px_#1E1B4B] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Teams Table */}
      <div className="bg-white border-2 border-[#1E1B4B] rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_#1E1B4B]">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b-2 border-[#1E1B4B]/20 bg-[#F0F2F8] text-[#0F172A] font-mono text-[11px] uppercase tracking-wider">
                <th className="p-4 pl-6">Team Name</th>
                <th className="p-4 text-center">Cheat Detected</th>
                <th className="p-4 text-center">
                  Team Request AI Chat<br />
                  <span className="text-[10px] text-[#6E6E6E] font-normal">Max: 30</span>
                </th>
                <th className="p-4 text-center">
                  Team Request AI Code<br />
                  <span className="text-[10px] text-[#6E6E6E] font-normal">Max: 50</span>
                </th>
                <th className="p-4 text-center">Team Submissions</th>
                <th className="p-4 text-right pr-6 font-bold text-[#7F45DB]">Team Score</th>
                <th className="p-4 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] font-mono">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[#6E6E6E] font-mono">
                    Loading teams info...
                  </td>
                </tr>
              ) : teams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-[#6E6E6E] font-mono">
                    No teams found matching &quot;{search}&quot;.
                  </td>
                </tr>
              ) : (
                teams.map((t) => {
                  return (
                    <tr
                      key={t.id}
                      className={`transition-colors ${
                        t.hasCheated
                          ? "bg-red-50/90 hover:bg-red-100/90 border-l-4 border-l-destructive"
                          : "hover:bg-[#F8F9FD]"
                      }`}
                    >
                      {/* Team Name & Roster */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-2">
                          <span className={`font-display font-bold text-sm ${t.hasCheated ? "text-destructive" : "text-[#0F172A]"}`}>
                            {t.name}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold ${STATUS_COLORS[t.status] ?? "text-[#6E6E6E]"}`}>
                            {t.status}
                          </span>
                          {t.isLocked && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-400 text-amber-700 bg-amber-50 font-bold flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> Locked
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#6E6E6E] mt-1 flex items-center gap-1">
                          <Users className="w-3 h-3 text-[#8A8A8A] inline" />
                          {t.members.length > 0 ? (
                            t.members.map((m, idx) => (
                              <span key={m.userId}>
                                <span className={`${m.violationCount > 0 ? "text-destructive font-black" : m.isLeader ? "text-[#7F45DB] font-bold" : "text-[#0F172A]"}`}>
                                  {m.name || m.email} {m.violationCount > 0 ? `(🚩${m.violationCount})` : ""}
                                </span>
                                {idx < t.members.length - 1 ? " & " : ""}
                              </span>
                            ))
                          ) : (
                            <span className="text-[#8A8A8A]">No members joined yet</span>
                          )}
                        </div>
                      </td>

                      {/* Cheat Detected Column */}
                      <td className="p-4 text-center">
                        {t.hasCheated ? (
                          <div className="inline-flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl bg-destructive/15 border-2 border-destructive text-destructive font-black">
                            <div className="flex items-center gap-1 text-[11px]">
                              <ShieldAlert className="w-3.5 h-3.5 fill-current" />
                              <span>FLAGGED ({t.violationCount})</span>
                            </div>
                            {t.violationDetails.length > 0 && (
                              <div
                                className="text-[9px] font-normal text-destructive/90 max-w-[170px] truncate"
                                title={t.violationDetails.map((v) => `${v.memberName}: ${v.reason}`).join(" | ")}
                              >
                                {t.violationDetails[0].memberName}: {t.violationDetails[0].reason}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Clean
                          </span>
                        )}
                      </td>

                      {/* Team Request AI Chat: 30/ used */}
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold">
                          <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                          <span>30 / {t.aiChatCount}</span>
                        </div>
                      </td>

                      {/* Team Request AI Code: 50/ used */}
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 font-bold">
                          <Terminal className="w-3.5 h-3.5 text-amber-600" />
                          <span>50 / {t.aiCodeCount}</span>
                        </div>
                      </td>

                      {/* Team Submissions */}
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F0F2F8] border border-[#E2E8F0] text-[#0F172A] font-bold">
                          <Code2 className="w-3.5 h-3.5 text-[#7F45DB]" />
                          <span>{t.submissionsCount}</span>
                        </div>
                      </td>

                      {/* Team Score */}
                      <td className="p-4 text-right pr-6">
                        <div className="font-extrabold text-base text-[#7F45DB]">
                          {t.teamScore.toFixed(1)} <span className="text-[10px] text-[#6E6E6E] font-normal">pts</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => toggleLock(t)}
                            disabled={working === t.id + "_lock"}
                            className={`p-2 rounded-xl border-2 transition-all text-xs cursor-pointer ${
                              t.isLocked
                                ? "border-amber-500 bg-amber-100 text-amber-800 shadow-[2px_2px_0px_0px_#B45309]"
                                : "border-[#1E1B4B] text-[#0F172A] bg-white hover:bg-[#F0F2F8] shadow-[2px_2px_0px_0px_#1E1B4B]"
                            }`}
                            title={t.isLocked ? "Unlock Workstation" : "Lock Workstation"}
                          >
                            {t.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => setDisqualModal({ teamId: t.id, teamName: t.name })}
                            disabled={t.status === "DISQUALIFIED"}
                            className="p-2 rounded-xl border-2 border-destructive text-destructive bg-white hover:bg-destructive/10 transition-all text-xs shadow-[2px_2px_0px_0px_#EF4444] disabled:opacity-30 cursor-pointer"
                            title="Disqualify Team"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disqualify Modal */}
      {disqualModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white p-6 border-2 border-destructive max-w-md w-full rounded-2xl shadow-[6px_6px_0px_0px_#EF4444]">
            <h3 className="text-destructive font-bold text-lg font-display mb-2">
              Disqualify Team: {disqualModal.teamName}
            </h3>
            <p className="text-xs text-[#6E6E6E] mb-4 font-mono">
              Enter the reason for disqualification. The team will be immediately locked out of all rounds.
            </p>
            <textarea
              value={disqualReason}
              onChange={(e) => setDisqualReason(e.target.value)}
              placeholder="e.g., Tab switching / Mobile phone usage during Round 2..."
              rows={3}
              className="w-full bg-[#F8F9FD] text-[#0F172A] text-xs font-mono p-3 rounded-xl border-2 border-[#1E1B4B] focus:outline-none focus:border-destructive mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDisqualModal(null)}
                className="px-4 py-2 text-xs border-2 border-[#1E1B4B] rounded-xl text-[#0F172A] bg-white hover:bg-[#F0F2F8] font-mono font-bold"
              >
                Cancel
              </button>
              <button
                onClick={disqualify}
                disabled={!disqualReason.trim() || working === disqualModal.teamId + "_disqual"}
                className="px-4 py-2 text-xs bg-destructive text-white font-mono font-bold rounded-xl border-2 border-[#1E1B4B] hover:opacity-90 disabled:opacity-50"
              >
                Confirm Disqualify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
