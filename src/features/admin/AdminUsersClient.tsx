"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Download,
  Shield,
  ShieldCheck,
  Sparkles,
  Trophy,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Loader2,
  RefreshCw,
  Mail,
  School,
  Code2,
} from "lucide-react";

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  college: string;
  role: "PARTICIPANT" | "ORGANIZER" | "ADMIN" | "SUPER_ADMIN";
  createdAt: string;
  team: {
    name: string;
    status: string;
    isLeader: boolean;
  } | null;
  contestsCount: number;
  contests: Array<{
    title: string;
    status: string;
    score: number;
    rank: number | null;
  }>;
  submissionsCount: number;
  solvedCount: number;
  discussionsCount: number;
}

interface RoleCounts {
  TOTAL: number;
  PARTICIPANT: number;
  ORGANIZER: number;
  ADMIN: number;
  SUPER_ADMIN: number;
}

export default function AdminUsersClient({
  userRole,
  currentUserEmail,
}: {
  userRole: string;
  currentUserEmail: string;
}) {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [roleCounts, setRoleCounts] = useState<RoleCounts>({
    TOTAL: 0,
    PARTICIPANT: 0,
    ORGANIZER: 0,
    ADMIN: 0,
    SUPER_ADMIN: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (selectedRole !== "ALL") params.set("role", selectedRole);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load registered users");
      const data = await res.json();
      setUsers(data.users || []);
      if (data.roleCounts) setRoleCounts(data.roleCounts);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedRole]);

  const exportCSV = () => {
    if (users.length === 0) return;
    const headers = [
      "User ID",
      "Name",
      "Email",
      "Role",
      "College",
      "Team",
      "Contests Count",
      "Problems Solved",
      "Total Submissions",
      "Joined Date",
    ];
    const rows = users.map((u) => [
      u.id,
      `"${u.name}"`,
      `"${u.email}"`,
      u.role,
      `"${u.college}"`,
      `"${u.team?.name || "None"}"`,
      u.contestsCount,
      u.solvedCount,
      u.submissionsCount,
      `"${new Date(u.createdAt).toISOString()}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `byteverse_registered_users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border-2 border-rose-500 text-[10px] font-mono font-black uppercase flex items-center gap-1 shadow-[1px_1px_0px_0px_#1E1B4B]">
            <Shield className="w-3 h-3 fill-rose-600 text-rose-600" />
            SUPER ADMIN
          </span>
        );
      case "ADMIN":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border-2 border-purple-500 text-[10px] font-mono font-black uppercase flex items-center gap-1 shadow-[1px_1px_0px_0px_#1E1B4B]">
            <ShieldCheck className="w-3 h-3 text-purple-600" />
            ADMIN
          </span>
        );
      case "ORGANIZER":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border-2 border-amber-500 text-[10px] font-mono font-black uppercase flex items-center gap-1 shadow-[1px_1px_0px_0px_#1E1B4B]">
            <Sparkles className="w-3 h-3 text-amber-600" />
            ORGANIZER
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-lg bg-[#F0F2F8] text-[#0F172A] border border-[#1E1B4B]/20 text-[10px] font-mono font-bold uppercase">
            PARTICIPANT
          </span>
        );
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#7F45DB]/15 text-[#7F45DB] border border-[#7F45DB]/30 text-[10px] font-mono font-black uppercase">
              Registered Users Directory
            </span>
            <span className="text-xs font-mono text-[#6E6E6E]">({userRole})</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight font-display">
            Registered Users & Members
          </h1>
          <p className="text-xs text-[#6E6E6E] mt-1 font-mono">
            Inspect all platform registrations, tournament participants, roles, and contest activity
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            className="p-2.5 rounded-xl border-2 border-[#1E1B4B] bg-white shadow-[2px_2px_0px_0px_#1E1B4B] hover:bg-[#F0F2F8] transition-all"
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 text-[#1E1B4B] ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={exportCSV}
            disabled={users.length === 0}
            className="px-4 py-2.5 rounded-xl border-2 border-[#1E1B4B] bg-white text-[#0F172A] font-mono font-black text-xs shadow-[3px_3px_0px_0px_#1E1B4B] hover:bg-[#F0F2F8] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border-2 border-[#1E1B4B] bg-white shadow-[4px_4px_0px_0px_#1E1B4B]">
          <div className="text-[11px] font-mono uppercase font-bold text-[#6E6E6E] mb-1">
            Total Members
          </div>
          <div className="text-3xl font-black font-mono text-[#0F172A]">
            {roleCounts.TOTAL || users.length}
          </div>
          <div className="text-[11px] font-mono text-[#6E6E6E] mt-1">Across all roles</div>
        </div>

        <div className="p-5 rounded-2xl border-2 border-[#1E1B4B] bg-white shadow-[4px_4px_0px_0px_#1E1B4B]">
          <div className="text-[11px] font-mono uppercase font-bold text-[#6E6E6E] mb-1">
            Participants
          </div>
          <div className="text-3xl font-black font-mono text-[#7F45DB]">
            {roleCounts.PARTICIPANT}
          </div>
          <div className="text-[11px] font-mono text-[#6E6E6E] mt-1">Competitive coders</div>
        </div>

        <div className="p-5 rounded-2xl border-2 border-[#1E1B4B] bg-white shadow-[4px_4px_0px_0px_#1E1B4B]">
          <div className="text-[11px] font-mono uppercase font-bold text-[#6E6E6E] mb-1">
            Organizers / Event Leads
          </div>
          <div className="text-3xl font-black font-mono text-amber-700">
            {roleCounts.ORGANIZER}
          </div>
          <div className="text-[11px] font-mono text-[#6E6E6E] mt-1">Event staff</div>
        </div>

        <div className="p-5 rounded-2xl border-2 border-[#1E1B4B] bg-white shadow-[4px_4px_0px_0px_#1E1B4B]">
          <div className="text-[11px] font-mono uppercase font-bold text-[#6E6E6E] mb-1">
            Admins & Super Admins
          </div>
          <div className="text-3xl font-black font-mono text-rose-700">
            {roleCounts.SUPER_ADMIN + roleCounts.ADMIN}
          </div>
          <div className="text-[11px] font-mono text-[#6E6E6E] mt-1">Full control</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#6E6E6E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by user name, email, college, or team name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-[#1E1B4B] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#7F45DB]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { key: "ALL", label: `All (${roleCounts.TOTAL})` },
              { key: "PARTICIPANT", label: `Participants (${roleCounts.PARTICIPANT})` },
              { key: "ORGANIZER", label: `Organizers (${roleCounts.ORGANIZER})` },
              { key: "ADMIN", label: `Admins (${roleCounts.ADMIN})` },
              { key: "SUPER_ADMIN", label: `Super Admins (${roleCounts.SUPER_ADMIN})` },
            ].map((rf) => (
              <button
                key={rf.key}
                onClick={() => setSelectedRole(rf.key)}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold whitespace-nowrap transition-all ${
                  selectedRole === rf.key
                    ? "bg-[#7F45DB] text-white border-2 border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B]"
                    : "bg-[#F0F2F8] text-[#6E6E6E] hover:text-[#0F172A] border border-transparent"
                }`}
              >
                {rf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="p-12 text-center text-[#7F45DB] font-mono text-sm border-2 border-dashed border-[#1E1B4B]/20 rounded-2xl bg-white">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          Loading registered users...
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 text-center text-[#6E6E6E] font-mono text-sm border-2 border-dashed border-[#1E1B4B]/20 rounded-2xl bg-white">
          No users matching this search or filter.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b-2 border-[#1E1B4B] text-[11px] font-mono uppercase font-black text-[#0F172A]">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">College</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-4">Contests</th>
                  <th className="py-3 px-4 text-center">Solved / Subs</th>
                  <th className="py-3 px-4">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E1B4B]/10 text-xs">
                {users.map((u) => {
                  const isCurrent = u.email === currentUserEmail;
                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-[#F0F2F8]/70 transition-colors ${
                        isCurrent ? "bg-[#7F45DB]/5 font-bold" : ""
                      }`}
                    >
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#7F45DB]/15 text-[#7F45DB] font-mono font-black text-xs flex items-center justify-center border border-[#7F45DB]/30 shrink-0">
                            {u.name ? u.name[0].toUpperCase() : "U"}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-[#0F172A] truncate flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 text-[9px] bg-[#7F45DB] text-white rounded font-mono font-normal">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-[#6E6E6E] truncate">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge / SuperAdmin Quick Edit */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {userRole === "SUPER_ADMIN" ? (
                          <select
                            value={u.role}
                            onChange={async (e) => {
                              const newRole = e.target.value as any;
                              try {
                                const res = await fetch("/api/admin/roles", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ targetUserId: u.id, newRole }),
                                });
                                if (res.ok) {
                                  setUsers((prev) =>
                                    prev.map((usr) => (usr.id === u.id ? { ...usr, role: newRole } : usr))
                                  );
                                }
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            className={`px-2 py-1 rounded-md text-[11px] font-mono font-bold border focus:outline-none cursor-pointer ${
                              u.role === "SUPER_ADMIN"
                                ? "bg-rose-100 text-rose-800 border-rose-400"
                                : u.role === "ADMIN"
                                ? "bg-purple-100 text-purple-800 border-purple-400"
                                : u.role === "ORGANIZER"
                                ? "bg-amber-100 text-amber-800 border-amber-400"
                                : "bg-slate-100 text-slate-700 border-slate-300"
                            }`}
                          >
                            <option value="PARTICIPANT">PARTICIPANT</option>
                            <option value="ORGANIZER">ORGANIZER</option>
                            <option value="ADMIN">ADMIN</option>
                            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                          </select>
                        ) : (
                          getRoleBadge(u.role)
                        )}
                      </td>

                      {/* College */}
                      <td className="py-3.5 px-4 font-mono text-[#6E6E6E] max-w-[160px] truncate">
                        {u.college || "—"}
                      </td>

                      {/* Team */}
                      <td className="py-3.5 px-4">
                        {u.team ? (
                          <div className="font-mono text-xs">
                            <span className="font-bold text-[#0F172A]">{u.team.name}</span>
                            {u.team.isLeader && (
                              <span className="ml-1 text-[10px] text-amber-700 font-bold">
                                (Lead)
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#6E6E6E] font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* Contests Count */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {u.contestsCount > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-[#7F45DB]/10 text-[#4A2293] border border-[#7F45DB]/30 font-mono text-xs font-bold">
                              {u.contestsCount} Contest{u.contestsCount > 1 ? "s" : ""}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#6E6E6E] font-mono text-[11px]">0</span>
                        )}
                      </td>

                      {/* Solved / Submissions */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="font-bold text-emerald-700">{u.solvedCount}</span>
                        <span className="text-[#6E6E6E] mx-1">/</span>
                        <span className="text-[#0F172A]">{u.submissionsCount}</span>
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#6E6E6E] whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
