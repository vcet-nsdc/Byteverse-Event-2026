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
  role: "PARTICIPANT" | "ORGANIZER" | "ADMIN" | "SUPER_ADMIN";
  createdAt: string;
  submissionsCount?: number;
}

export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState<"surveillance" | "roles" | "audit">("surveillance");
  const [activityData, setActivityData] = useState<{
    submissions: ActivitySubmission[];
    auditLogs: any[];
    registrations: any[];
  }>({ submissions: [], auditLogs: [], registrations: [] });

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

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
      {/* Top Banner */}
      <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>SuperAdmin Authority</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>Live Platform Surveillance</span>
              </span>
            </div>
            <h1 className="text-3xl font-display font-black tracking-tight text-white">
              SuperAdmin Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
              Complete surveillance over all user activities, submissions, and contest attempts. Manage platform administrators, promote or demote roles, and maintain system integrity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchActivity();
                fetchUsers();
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 hover:text-white font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Feed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alert status notification */}
      {statusMsg && (
        <div
          className={`p-4 rounded-xl border font-mono text-xs flex items-center justify-between shadow-md ${
            statusMsg.type === "success"
              ? "bg-emerald-950/80 border-emerald-600 text-emerald-300"
              : "bg-rose-950/80 border-rose-600 text-rose-300"
          }`}
        >
          <span>{statusMsg.text}</span>
          <button onClick={() => setStatusMsg(null)} className="underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111726] border border-[#382F60] p-5 rounded-2xl">
          <div className="text-[11px] font-mono uppercase text-slate-400 font-bold">Total Platform Users</div>
          <div className="text-3xl font-black font-mono text-white mt-1">{users.length}</div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">Across all registered accounts</div>
        </div>

        <div className="bg-[#111726] border border-[#382F60] p-5 rounded-2xl">
          <div className="text-[11px] font-mono uppercase text-slate-400 font-bold">Active Administrators</div>
          <div className="text-3xl font-black font-mono text-amber-400 mt-1">{adminUsers.length}</div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">Authorized event & contest hosts</div>
        </div>

        <div className="bg-[#111726] border border-[#382F60] p-5 rounded-2xl">
          <div className="text-[11px] font-mono uppercase text-slate-400 font-bold">Recent Submissions</div>
          <div className="text-3xl font-black font-mono text-[#A472F7] mt-1">
            {activityData.submissions.length}
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">Tracked in surveillance stream</div>
        </div>

        <div className="bg-[#111726] border border-[#382F60] p-5 rounded-2xl">
          <div className="text-[11px] font-mono uppercase text-slate-400 font-bold">Audit Records</div>
          <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
            {activityData.auditLogs.length}
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">Logged security events</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3 font-mono text-xs">
        <button
          onClick={() => setActiveTab("surveillance")}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            activeTab === "surveillance"
              ? "bg-[#7F45DB] text-white shadow-md font-black"
              : "bg-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Live User Surveillance ({activityData.submissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("roles")}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
            activeTab === "roles"
              ? "bg-[#7F45DB] text-white shadow-md font-black"
              : "bg-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Admin & Role Governance ({users.length})</span>
        </button>
      </div>

      {/* TAB 1: SURVEILLANCE FEED */}
      {activeTab === "surveillance" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-400" />
              <span>Real-Time User Code & Submission Surveillance</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">
              Auto-syncs every 15s • Last checked {new Date().toLocaleTimeString()}
            </span>
          </div>

          {activityData.submissions.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-mono text-xs bg-[#111726] border border-[#382F60] rounded-2xl">
              No live submissions recorded in this window. When participants run or submit code, it will stream here in real time.
            </div>
          ) : (
            <div className="bg-[#111726] border border-[#382F60] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Problem / Challenge</th>
                      <th className="py-3 px-4">Contest / Event</th>
                      <th className="py-3 px-4">Language</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Score</th>
                      <th className="py-3 px-4 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {activityData.submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{sub.user.name}</div>
                          <div className="text-[11px] text-slate-400">{sub.user.email}</div>
                          {sub.user.college && (
                            <div className="text-[10px] text-slate-500">{sub.user.college}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          <div className="font-bold">{sub.problem?.title || sub.problemId}</div>
                          {sub.problem?.difficulty && (
                            <span className="text-[10px] text-slate-500">{sub.problem.difficulty}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {sub.contest?.title || sub.contestId || sub.roundId || "Practice Arena"}
                        </td>
                        <td className="py-3 px-4 uppercase text-slate-400 font-bold">{sub.language}</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              sub.status === "ACCEPTED"
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                : sub.status === "WRONG_ANSWER"
                                ? "bg-rose-950 text-rose-400 border border-rose-800"
                                : "bg-amber-950 text-amber-400 border border-amber-800"
                            }`}
                          >
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-amber-400">
                          {sub.finalScore ?? sub.rawScore} pts
                        </td>
                        <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
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
              <h2 className="text-lg font-bold text-white font-display">
                Administrator & Role Authority
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Grant or revoke Admin access. Admins can host events, activate/pause contests, and toggle problems.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-[#7F45DB]"
              />
            </div>
          </div>

          <div className="bg-[#111726] border border-[#382F60] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Current Role</th>
                    <th className="py-3 px-4">College</th>
                    <th className="py-3 px-4 text-right">SuperAdmin Authority Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((u) => {
                    const isWorking = actionLoadingId === u.id;
                    return (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{u.name}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                              u.role === "SUPER_ADMIN"
                                ? "bg-rose-950 text-rose-300 border border-rose-800"
                                : u.role === "ADMIN"
                                ? "bg-purple-950 text-purple-300 border border-purple-800"
                                : u.role === "ORGANIZER"
                                ? "bg-amber-950 text-amber-300 border border-amber-800"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-400">{u.college || "—"}</td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {u.role !== "ADMIN" && u.role !== "SUPER_ADMIN" && (
                              <button
                                onClick={() => handleRoleChange(u.id, "ADMIN")}
                                disabled={isWorking}
                                className="px-3 py-1.5 rounded-lg bg-purple-900/60 text-purple-200 border border-purple-700 hover:bg-purple-800 font-bold text-[11px] transition-all disabled:opacity-50"
                              >
                                Promote to Admin
                              </button>
                            )}

                            {u.role === "ADMIN" && (
                              <button
                                onClick={() => handleRoleChange(u.id, "PARTICIPANT")}
                                disabled={isWorking}
                                className="px-3 py-1.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 font-bold text-[11px] transition-all disabled:opacity-50"
                              >
                                Demote to Participant
                              </button>
                            )}

                            {u.role !== "ORGANIZER" && (
                              <button
                                onClick={() => handleRoleChange(u.id, "ORGANIZER")}
                                disabled={isWorking}
                                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-[11px] transition-all disabled:opacity-50"
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
