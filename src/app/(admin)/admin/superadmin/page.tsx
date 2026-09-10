"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Activity,
  UserCheck,
  UserX,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Trophy,
  ExternalLink,
  Code2,
  Eye,
  Radio,
  Sparkles,
} from "lucide-react";

interface ActivitySubmission {
  id: string;
  userId: string;
  language: string;
  status: string;
  rawScore: number;
  finalScore: number;
  executionTimeMs?: number;
  memoryUsedMb?: number;
  submittedAt: string;
  problemId?: string;
  contestId?: string;
  roundId?: string;
  user: {
    id: string;
    name: string;
    email: string;
    college?: string;
    role: string;
  };
  problem?: {
    id: string;
    title: string;
    difficulty: string;
  };
  contest?: {
    id: string;
    title: string;
  };
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  college?: string;
  role: string;
  createdAt: string;
}

export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState<"surveillance" | "roles">("surveillance");
  const [activityData, setActivityData] = useState<{
    submissions: ActivitySubmission[];
    auditLogs: any[];
    disqualifications: any[];
  }>({
    submissions: [],
    auditLogs: [],
    disqualifications: [],
  });
  const [users, setUsers] = useState<UserItem[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // 1. Fetch live activity stream
  const fetchActivity = async () => {
    try {
      const res = await fetch("/api/admin/activity?limit=50");
      if (res.ok) {
        const data = await res.json();
        setActivityData(data);
      }
    } catch (err) {
      console.error("Failed to load activity stream:", err);
    }
  };

  // 2. Fetch users for role management
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users?limit=100");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([fetchActivity(), fetchUsers()]);
      setLoading(false);
    }
    init();

    // Auto-refresh surveillance every 15 seconds
    const interval = setInterval(fetchActivity, 15000);
    return () => clearInterval(interval);
  }, []);

  // Update a user's role
  const handleRoleChange = async (targetUserId: string, newRole: "PARTICIPANT" | "ORGANIZER" | "ADMIN" | "SUPER_ADMIN") => {
    setActionLoadingId(targetUserId);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, newRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role");

      setStatusMsg({ text: data.message, type: "success" });
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u))
      );
      setTimeout(() => setStatusMsg(null), 5000);
    } catch (err: any) {
      setStatusMsg({ text: err.message, type: "error" });
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.college && u.college.toLowerCase().includes(userSearch.toLowerCase()))
  );

  const adminUsers = users.filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN");

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Top Banner (Light Theme) */}
      <div className="bg-white border-2 border-[#1E1B4B] rounded-3xl p-6 sm:p-8 shadow-[4px_4px_0px_0px_#1E1B4B] relative overflow-hidden text-[#0F172A]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-300 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>SuperAdmin Authority</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                <span>Live Platform Surveillance</span>
              </span>
            </div>
            <h1 className="text-3xl font-display font-black tracking-tight text-[#0F172A]">
              SuperAdmin Command Center
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6E6E] font-medium max-w-2xl leading-relaxed">
              Complete surveillance over all user activities, submissions, and contest attempts. Manage platform administrators, promote or demote roles, and maintain system integrity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchActivity();
                fetchUsers();
              }}
              className="px-4 py-2.5 rounded-xl border-2 border-[#1E1B4B] bg-white text-[#0F172A] hover:bg-[#F0F2F8] font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-[2px_2px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#7F45DB]" />
              <span>Refresh Feed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alert status notification */}
      {statusMsg && (
        <div
          className={`p-4 rounded-xl border-2 font-mono text-xs flex items-center justify-between shadow-[2px_2px_0px_0px_#1E1B4B] ${
            statusMsg.type === "success"
              ? "bg-emerald-50 border-emerald-600 text-emerald-900"
              : "bg-rose-50 border-rose-600 text-rose-900"
          }`}
        >
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} className="underline text-[11px] font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Quick Stats Grid (Light Theme) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-[#1E1B4B] p-5 rounded-2xl shadow-[4px_4px_0px_0px_#1E1B4B]">
          <div className="text-[11px] font-mono uppercase text-[#6E6E6E] font-bold">Total Platform Users</div>
          <div className="text-3xl font-black font-mono text-[#0F172A] mt-1">{users.length}</div>
          <div className="text-[10px] font-mono text-[#8A8A8A] mt-1">Across all registered accounts</div>
        </div>

        <div className="bg-white border-2 border-[#1E1B4B] p-5 rounded-2xl shadow-[4px_4px_0px_0px_#1E1B4B]">
          <div className="text-[11px] font-mono uppercase text-[#6E6E6E] font-bold">Active Administrators</div>
          <div className="text-3xl font-black font-mono text-[#7F45DB] mt-1">{adminUsers.length}</div>
          <div className="text-[10px] font-mono text-[#8A8A8A] mt-1">Authorized event & contest hosts</div>
        </div>

        <div className="bg-white border-2 border-[#1E1B4B] p-5 rounded-2xl shadow-[4px_4px_0px_0px_#1E1B4B]">
          <div className="text-[11px] font-mono uppercase text-[#6E6E6E] font-bold">Recent Submissions</div>
          <div className="text-3xl font-black font-mono text-blue-600 mt-1">
            {activityData.submissions.length}
          </div>
          <div className="text-[10px] font-mono text-[#8A8A8A] mt-1">Tracked in surveillance stream</div>
        </div>

        <div className="bg-white border-2 border-[#1E1B4B] p-5 rounded-2xl shadow-[4px_4px_0px_0px_#1E1B4B]">
          <div className="text-[11px] font-mono uppercase text-[#6E6E6E] font-bold">Audit Records</div>
          <div className="text-3xl font-black font-mono text-emerald-600 mt-1">
            {activityData.auditLogs.length}
          </div>
          <div className="text-[10px] font-mono text-[#8A8A8A] mt-1">Logged security events</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b-2 border-[#1E1B4B]/15 pb-3 font-mono text-xs flex-wrap">
        <button
          onClick={() => setActiveTab("surveillance")}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all border-2 border-[#1E1B4B] ${
            activeTab === "surveillance"
              ? "bg-[#7F45DB] text-white shadow-[2px_2px_0px_0px_#1E1B4B] font-black"
              : "bg-white text-[#0F172A] hover:bg-[#F0F2F8]"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Live User Surveillance ({activityData.submissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("roles")}
          className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all border-2 border-[#1E1B4B] ${
            activeTab === "roles"
              ? "bg-[#7F45DB] text-white shadow-[2px_2px_0px_0px_#1E1B4B] font-black"
              : "bg-white text-[#0F172A] hover:bg-[#F0F2F8]"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Admin & Role Governance ({users.length})</span>
        </button>
      </div>

      {/* TAB 1: SURVEILLANCE FEED */}
      {activeTab === "surveillance" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-bold text-[#0F172A] font-display flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#7F45DB]" />
              <span>Real-Time User Code & Submission Surveillance</span>
            </h2>
            <span className="text-xs font-mono text-[#6E6E6E]">
              Auto-syncs every 15s • Last checked {new Date().toLocaleTimeString()}
            </span>
          </div>

          {activityData.submissions.length === 0 ? (
            <div className="p-12 text-center text-[#6E6E6E] font-mono text-xs bg-white border-2 border-[#1E1B4B] rounded-2xl shadow-[4px_4px_0px_0px_#1E1B4B]">
              No live submissions recorded in this window. When participants run or submit code, it will stream here in real time.
            </div>
          ) : (
            <div className="bg-white border-2 border-[#1E1B4B] rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_#1E1B4B]">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="bg-[#F8F9FD] border-b-2 border-[#1E1B4B]/20 text-[#6E6E6E] uppercase text-[10px]">
                      <th className="py-3.5 px-4">User</th>
                      <th className="py-3.5 px-4">Problem / Challenge</th>
                      <th className="py-3.5 px-4">Contest / Event</th>
                      <th className="py-3.5 px-4">Language</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Score</th>
                      <th className="py-3.5 px-4 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E1B4B]/10">
                    {activityData.submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-[#F8F9FD] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#0F172A]">{sub.user.name}</div>
                          <div className="text-[11px] text-[#6E6E6E]">{sub.user.email}</div>
                          {sub.user.college && (
                            <div className="text-[10px] text-[#8A8A8A]">{sub.user.college}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[#0F172A]">
                          <div className="font-bold">{sub.problem?.title || sub.problemId}</div>
                          {sub.problem?.difficulty && (
                            <span className="text-[10px] text-[#6E6E6E]">{sub.problem.difficulty}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[#6E6E6E]">
                          {sub.contest?.title || sub.contestId || sub.roundId || "Practice Arena"}
                        </td>
                        <td className="py-3.5 px-4 uppercase text-[#0F172A] font-bold">{sub.language}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                              sub.status === "ACCEPTED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                                : sub.status === "WRONG_ANSWER"
                                ? "bg-rose-50 text-rose-700 border border-rose-300"
                                : "bg-amber-50 text-amber-700 border border-amber-300"
                            }`}
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-[#7F45DB]">
                          {sub.finalScore ?? sub.rawScore} pts
                        </td>
                        <td className="py-3.5 px-4 text-right text-[#6E6E6E] text-[11px]">
                          {new Date(sub.submittedAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ROLE GOVERNANCE */}
      {activeTab === "roles" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#0F172A] font-display">
                Administrator & Role Authority
              </h2>
              <p className="text-xs font-mono text-[#6E6E6E]">
                Grant or revoke Admin access. Admins can host events, activate/pause contests, and toggle problems.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#8A8A8A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#1E1B4B] rounded-xl text-xs font-mono text-[#0F172A] focus:outline-none focus:border-[#7F45DB] shadow-[2px_2px_0px_0px_#1E1B4B]"
              />
            </div>
          </div>

          <div className="bg-white border-2 border-[#1E1B4B] rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_#1E1B4B]">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="bg-[#F8F9FD] border-b-2 border-[#1E1B4B]/20 text-[#6E6E6E] uppercase text-[10px]">
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Current Role</th>
                    <th className="py-3.5 px-4">College</th>
                    <th className="py-3.5 px-4 text-right">SuperAdmin Authority Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E1B4B]/10">
                  {filteredUsers.map((u) => {
                    const isWorking = actionLoadingId === u.id;
                    return (
                      <tr key={u.id} className="hover:bg-[#F8F9FD] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#0F172A]">{u.name}</div>
                          <div className="text-[11px] text-[#6E6E6E]">{u.email}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                              u.role === "SUPER_ADMIN"
                                ? "bg-rose-50 text-rose-700 border border-rose-300 font-black"
                                : u.role === "ADMIN"
                                ? "bg-purple-50 text-purple-700 border border-purple-300 font-bold"
                                : u.role === "ORGANIZER"
                                ? "bg-amber-50 text-amber-700 border border-amber-300 font-bold"
                                : "bg-slate-100 text-slate-700 border border-slate-300 font-medium"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-[#6E6E6E]">{u.college || "—"}</td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {u.role !== "ADMIN" && u.role !== "SUPER_ADMIN" && (
                              <button
                                onClick={() => handleRoleChange(u.id, "ADMIN")}
                                disabled={isWorking}
                                className="px-3 py-1.5 rounded-lg bg-[#7F45DB] text-white hover:bg-[#6D35C7] border border-[#1E1B4B] font-bold text-[11px] transition-all disabled:opacity-50 shadow-[1px_1px_0px_0px_#1E1B4B]"
                              >
                                Promote to Admin
                              </button>
                            )}

                            {u.role === "ADMIN" && (
                              <button
                                onClick={() => handleRoleChange(u.id, "PARTICIPANT")}
                                disabled={isWorking}
                                className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 font-bold text-[11px] transition-all disabled:opacity-50"
                              >
                                Demote to Participant
                              </button>
                            )}

                            {u.role !== "ORGANIZER" && (
                              <button
                                onClick={() => handleRoleChange(u.id, "ORGANIZER")}
                                disabled={isWorking}
                                className="px-3 py-1.5 rounded-lg bg-white border border-[#1E1B4B] text-[#0F172A] hover:bg-[#F0F2F8] text-[11px] font-bold transition-all disabled:opacity-50 shadow-[1px_1px_0px_0px_#1E1B4B]"
                              >
                                Set Organizer
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
