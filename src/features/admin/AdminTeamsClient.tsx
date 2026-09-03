"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Search, 
  Lock, 
  Unlock, 
  ShieldAlert, 
  ShieldCheck, 
  Trash2, 
  MessageSquare, 
  Terminal, 
  Code2, 
  Users, 
  CheckCircle2,
  AlertTriangle 
} from "lucide-react";

interface Member {
  userId: string;
  name: string | null;
  email: string;
  college?: string | null;
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
  DISQUALIFIED: "text-red-400 border-red-500/60 bg-red-950/80",
};

export default function AdminTeamsClient() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);

  // Action Modals
  const [lockModal, setLockModal] = useState<Team | null>(null);
  const [disqualModal, setDisqualModal] = useState<{ teamId: string; teamName: string } | null>(null);
  const [disqualReason, setDisqualReason] = useState("");
  const [requalifyModal, setRequalifyModal] = useState<{ teamId: string; teamName: string } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ teamId: string; teamName: string } | null>(null);

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

  async function handleToggleLock() {
    if (!lockModal) return;
    setWorking(lockModal.id + "_lock");
    try {
      await fetch(`/api/admin/teams/${lockModal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLocked: !lockModal.isLocked }),
      });
      setLockModal(null);
      await fetchTeams();
    } finally {
      setWorking(null);
    }
  }

  async function handleDisqualify() {
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

  async function handleRequalify() {
    if (!requalifyModal) return;
    setWorking(requalifyModal.teamId + "_requal");
    try {
      await fetch(`/api/admin/teams/${requalifyModal.teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACTIVE" }),
      });
      setRequalifyModal(null);
      await fetchTeams();
    } finally {
      setWorking(null);
    }
  }

  async function handleDeleteTeam() {
    if (!deleteModal) return;
    setWorking(deleteModal.teamId + "_delete");
    try {
      await fetch(`/api/admin/teams/${deleteModal.teamId}`, {
        method: "DELETE",
      });
      setDeleteModal(null);
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
                <th className="p-4 text-center">Actions</th>
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
                  <td colSpan={7} className="p-12 text-center text-[#8A8A8A] font-mono">
                    No teams found matching &quot;{search}&quot;.
                  </td>
                </tr>
              ) : (
                teams.map((t) => {
                  const isDisqualified = t.status === "DISQUALIFIED";

                  return (
                    <tr
                      key={t.id}
                      className={`transition-colors ${
                        isDisqualified
                          ? "bg-slate-950 text-white hover:bg-slate-900 border-l-8 border-l-red-600 shadow-[inset_0_0_25px_rgba(0,0,0,0.9)]"
                          : t.hasCheated
                          ? "bg-red-50/90 hover:bg-red-100/90 border-l-4 border-l-destructive"
                          : "hover:bg-[#F8F9FD]"
                      }`}
                    >
                      {/* Team Name & Roster */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-2">
                          <span className={`font-display font-bold text-sm ${isDisqualified ? "text-white line-through" : t.hasCheated ? "text-destructive" : "text-[#0F172A]"}`}>
                            {t.name}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold ${STATUS_COLORS[t.status] ?? "text-[#6E6E6E]"}`}>
                            {t.status}
                          </span>
                          {t.isLocked && !isDisqualified && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-400 text-amber-700 bg-amber-50 font-bold flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> Locked
                            </span>
                          )}
                          {isDisqualified && (
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black uppercase tracking-wider">
                              DISQUALIFIED
                            </span>
                          )}
                        </div>
                        <div className={`text-[11px] mt-1 flex items-center gap-1 ${isDisqualified ? "text-gray-400" : "text-[#6E6E6E]"}`}>
                          <Users className="w-3 h-3 text-[#8A8A8A] inline" />
                          {t.members.length > 0 ? (
                            t.members.map((m, idx) => (
                              <span key={m.userId}>
                                <span className={`${isDisqualified ? "text-gray-300" : m.violationCount > 0 ? "text-destructive font-black" : m.isLeader ? "text-[#7F45DB] font-bold" : "text-[#0F172A]"}`}>
                                  {m.name || m.email} {m.college ? <span className="text-[10px] text-[#8A8A8A] font-normal">[{m.college}]</span> : ""} {m.violationCount > 0 ? `(🚩${m.violationCount})` : ""}
                                </span>
                                {idx < t.members.length - 1 ? " & " : ""}
                              </span>
                            ))
                          ) : (
                            <span className="text-[#8A8A8A]">No members joined yet</span>
                          )}
                        </div>
                        {isDisqualified && t.disqualification?.reason && (
                          <div className="text-[10px] text-red-400 mt-1 italic">
                            Reason: {t.disqualification.reason}
                          </div>
                        )}
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

                      {/* Team Request AI Chat */}
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F0F2F8] border border-[#E2E8F0] text-[#0F172A] font-bold">
                          <MessageSquare className="w-3.5 h-3.5 text-[#7F45DB]" />
                          <span>{t.aiChatCount}</span>
                        </div>
                      </td>

                      {/* Team Request AI Code */}
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F0F2F8] border border-[#E2E8F0] text-[#0F172A] font-bold">
                          <Terminal className="w-3.5 h-3.5 text-[#7F45DB]" />
                          <span>{t.aiCodeCount}</span>
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
                        <div className={`font-extrabold text-base ${isDisqualified ? "text-gray-400 line-through" : "text-[#7F45DB]"}`}>
                          {t.teamScore.toFixed(1)} <span className="text-[10px] text-[#6E6E6E] font-normal">pts</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Lock / Unlock Workstation */}
                          <button
                            onClick={() => setLockModal(t)}
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

                          {/* Disqualify or Re-qualify Action */}
                          {isDisqualified ? (
                            <button
                              onClick={() => setRequalifyModal({ teamId: t.id, teamName: t.name })}
                              disabled={working === t.id + "_requal"}
                              className="px-2.5 py-1.5 rounded-xl border-2 border-emerald-500 text-emerald-400 bg-emerald-950/80 hover:bg-emerald-900 transition-all text-[11px] font-bold shadow-[2px_2px_0px_0px_#10B981] flex items-center gap-1 cursor-pointer"
                              title="Re-qualify Team"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Re-qualify</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setDisqualModal({ teamId: t.id, teamName: t.name })}
                              disabled={working === t.id + "_disqual"}
                              className="p-2 rounded-xl border-2 border-destructive text-destructive bg-white hover:bg-destructive/10 transition-all text-xs shadow-[2px_2px_0px_0px_#EF4444] cursor-pointer"
                              title="Disqualify Team"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete & Wipe Team */}
                          <button
                            onClick={() => setDeleteModal({ teamId: t.id, teamName: t.name })}
                            disabled={working === t.id + "_delete"}
                            className="p-2 rounded-xl border-2 border-rose-600 text-rose-600 bg-white hover:bg-rose-50 transition-all text-xs shadow-[2px_2px_0px_0px_#E11D48] cursor-pointer"
                            title="Delete Team & Wipe Participants"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Lock / Unlock Confirmation Modal */}
      {lockModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white p-6 border-2 border-[#1E1B4B] max-w-md w-full rounded-2xl shadow-[6px_6px_0px_0px_#1E1B4B]">
            <h3 className="text-[#0F172A] font-bold text-lg font-display mb-2 flex items-center gap-2">
              {lockModal.isLocked ? <Unlock className="w-5 h-5 text-emerald-600" /> : <Lock className="w-5 h-5 text-amber-600" />}
              {lockModal.isLocked ? "Unlock Workstation" : "Lock Workstation"}
            </h3>
            <p className="text-xs text-[#6E6E6E] mb-6 font-mono">
              Are you sure you want to {lockModal.isLocked ? "UNLOCK" : "LOCK"} workstation for team <strong>&quot;{lockModal.name}&quot;</strong>?
              {lockModal.isLocked
                ? " Their screens will immediately unfreeze and allow coding."
                : " Their screens will freeze immediately."}
            </p>
            <div className="flex gap-2 justify-end font-mono text-xs font-bold">
              <button
                onClick={() => setLockModal(null)}
                className="px-4 py-2 border-2 border-[#1E1B4B] rounded-xl text-[#0F172A] bg-white hover:bg-[#F0F2F8]"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleLock}
                disabled={working === lockModal.id + "_lock"}
                className={`px-4 py-2 rounded-xl text-white border-2 border-[#1E1B4B] ${
                  lockModal.isLocked ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                Confirm {lockModal.isLocked ? "Unlock" : "Lock"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disqualify Modal */}
      {disqualModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white p-6 border-2 border-destructive max-w-md w-full rounded-2xl shadow-[6px_6px_0px_0px_#EF4444]">
            <h3 className="text-destructive font-bold text-lg font-display mb-2 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-destructive" />
              Disqualify Team: {disqualModal.teamName}
            </h3>
            <p className="text-xs text-[#6E6E6E] mb-4 font-mono">
              Enter the reason for disqualification. The team workstation will freeze with a disqualification notice.
            </p>
            <textarea
              value={disqualReason}
              onChange={(e) => setDisqualReason(e.target.value)}
              placeholder="e.g., Mobile phone usage / Unpermitted assistance during Round 2..."
              rows={3}
              className="w-full bg-[#F8F9FD] text-[#0F172A] text-xs font-mono p-3 rounded-xl border-2 border-[#1E1B4B] focus:outline-none focus:border-destructive mb-4"
            />
            <div className="flex gap-2 justify-end font-mono text-xs font-bold">
              <button
                onClick={() => setDisqualModal(null)}
                className="px-4 py-2 border-2 border-[#1E1B4B] rounded-xl text-[#0F172A] bg-white hover:bg-[#F0F2F8]"
              >
                Cancel
              </button>
              <button
                onClick={handleDisqualify}
                disabled={!disqualReason.trim() || working === disqualModal.teamId + "_disqual"}
                className="px-4 py-2 bg-destructive text-white rounded-xl border-2 border-[#1E1B4B] hover:opacity-90 disabled:opacity-50"
              >
                Confirm Disqualification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Re-qualify Modal */}
      {requalifyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white p-6 border-2 border-emerald-600 max-w-md w-full rounded-2xl shadow-[6px_6px_0px_0px_#059669]">
            <h3 className="text-emerald-700 font-bold text-lg font-display mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Re-qualify Team: {requalifyModal.teamName}
            </h3>
            <p className="text-xs text-[#6E6E6E] mb-6 font-mono">
              Are you sure you want to <strong>RE-QUALIFY</strong> team <strong>&quot;{requalifyModal.teamName}&quot;</strong>?
              Their workstation will be un-frozen, and they will be eligible to continue submitting.
            </p>
            <div className="flex gap-2 justify-end font-mono text-xs font-bold">
              <button
                onClick={() => setRequalifyModal(null)}
                className="px-4 py-2 border-2 border-[#1E1B4B] rounded-xl text-[#0F172A] bg-white hover:bg-[#F0F2F8]"
              >
                Cancel
              </button>
              <button
                onClick={handleRequalify}
                disabled={working === requalifyModal.teamId + "_requal"}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl border-2 border-[#1E1B4B] hover:bg-emerald-700"
              >
                Confirm Re-qualification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete / Wipe Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white p-6 border-4 border-rose-600 max-w-md w-full rounded-2xl shadow-[8px_8px_0px_0px_#E11D48]">
            <div className="flex items-center gap-2 text-rose-600 mb-2">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-extrabold text-lg font-display">
                Permanent Team & Participant Wipe
              </h3>
            </div>
            <p className="text-xs text-[#0F172A] mb-3 font-mono font-bold">
              Are you sure you want to permanently delete and wipe team &quot;{deleteModal.teamName}&quot;?
            </p>
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-[11px] text-rose-900 font-mono space-y-1 mb-6">
              <div>⚠️ <strong>This action is completely IRREVERSIBLE.</strong></div>
              <div>• All member participant accounts will be deleted.</div>
              <div>• All submissions and scores will be wiped from database.</div>
              <div>• Team invite code and records will be erased.</div>
            </div>
            <div className="flex gap-2 justify-end font-mono text-xs font-bold">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2 border-2 border-[#1E1B4B] rounded-xl text-[#0F172A] bg-white hover:bg-[#F0F2F8]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTeam}
                disabled={working === deleteModal.teamId + "_delete"}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl border-2 border-[#1E1B4B] hover:bg-rose-700 disabled:opacity-50"
              >
                Yes, Wipe Team Completely
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
