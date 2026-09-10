"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy,
  Plus,
  Radio,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Users,
  Code2,
  Calendar,
  Loader2,
  RefreshCw,
  Play,
  Pause,
  Square,
  Sparkles,
} from "lucide-react";

interface ContestItem {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: "SCHEDULED" | "ACTIVE" | "PAUSED" | "ENDED";
  startsAt: string;
  endsAt: string;
  difficulty: string | null;
  bannerUrl: string | null;
  event?: { id: string; name: string } | null;
  problems?: Array<{ id: string; title: string; difficulty: string; points?: number; isPublished?: boolean }>;
  _count?: {
    participants: number;
    submissions: number;
    problems: number;
  };
}

interface ProblemOption {
  id: string;
  title: string;
  difficulty: string;
}

export default function AdminContestsClient({ userRole }: { userRole: string }) {
  const [contests, setContests] = useState<ContestItem[]>([]);
  const [problems, setProblems] = useState<ProblemOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter tab
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContest, setEditingContest] = useState<ContestItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("WEEKLY");
  const [status, setStatus] = useState<"SCHEDULED" | "ACTIVE" | "PAUSED" | "ENDED">("SCHEDULED");
  const [difficulty, setDifficulty] = useState("Mixed");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [selectedProblemIds, setSelectedProblemIds] = useState<string[]>([]);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/contests");
      if (!res.ok) throw new Error("Failed to load contests");
      const data = await res.json();
      setContests(data);
    } catch (err: any) {
      setError(err.message || "Failed to load contests");
    } finally {
      setLoading(false);
    }
  };

  const fetchProblems = async () => {
    try {
      const res = await fetch("/api/problems?limit=50");
      if (res.ok) {
        const data = await res.json();
        setProblems(
          data.problems?.map((p: any) => ({
            id: p.id,
            title: p.title,
            difficulty: p.difficulty,
          })) || []
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchContests();
    fetchProblems();
  }, []);

  const openCreateModal = () => {
    setEditingContest(null);
    setTitle("");
    setDescription("");
    setType("WEEKLY");
    setStatus("SCHEDULED");
    setDifficulty("Mixed");
    const now = new Date();
    setStartsAt(now.toISOString().slice(0, 16));
    setEndsAt(new Date(now.getTime() + 90 * 60 * 1000).toISOString().slice(0, 16));
    setSelectedProblemIds([]);
    setModalOpen(true);
  };

  const openEditModal = (contest: ContestItem) => {
    setEditingContest(contest);
    setTitle(contest.title);
    setDescription(contest.description || "");
    setType(contest.type);
    setStatus(contest.status);
    setDifficulty(contest.difficulty || "Mixed");
    setStartsAt(new Date(contest.startsAt).toISOString().slice(0, 16));
    setEndsAt(new Date(contest.endsAt).toISOString().slice(0, 16));
    setSelectedProblemIds(contest.problems?.map((p) => p.id) || []);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startsAt || !endsAt) return;

    setSubmitting(true);
    setError(null);
    try {
      if (editingContest) {
        const res = await fetch(`/api/admin/contests/${editingContest.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            type,
            status,
            difficulty,
            startsAt: new Date(startsAt).toISOString(),
            endsAt: new Date(endsAt).toISOString(),
            problemIds: selectedProblemIds,
          }),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to update contest");
        }
        setSuccessMsg(`Contest "${title}" updated successfully!`);
      } else {
        const res = await fetch("/api/admin/contests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            type,
            status,
            difficulty,
            startsAt: new Date(startsAt).toISOString(),
            endsAt: new Date(endsAt).toISOString(),
            problemIds: selectedProblemIds,
          }),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to create contest");
        }
        setSuccessMsg(`New contest "${title}" published / scheduled!`);
      }

      setModalOpen(false);
      fetchContests();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to save contest");
    } finally {
      setSubmitting(false);
    }
  };

  const setContestStatus = async (
    contest: ContestItem,
    newStatus: "SCHEDULED" | "ACTIVE" | "PAUSED" | "ENDED"
  ) => {
    try {
      const res = await fetch(`/api/admin/contests/${contest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to change contest status");
      setContests((prev) =>
        prev.map((c) => (c.id === contest.id ? { ...c, status: newStatus } : c))
      );
      setSuccessMsg(
        `Contest "${contest.title}" is now ${
          newStatus === "ACTIVE"
            ? "PUBLISHED & LIVE (ACTIVE)"
            : newStatus === "PAUSED"
            ? "PAUSED (ON HOLD)"
            : newStatus === "SCHEDULED"
            ? "SCHEDULED (UPCOMING)"
            : "ENDED (ARCHIVED)"
        }!`
      );
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    }
  };

  // Toggle individual question active/pause state
  const toggleProblemActive = async (contestId: string, problemId: string, currentPublished: boolean = true) => {
    const nextPublished = !currentPublished;
    try {
      const res = await fetch(`/api/admin/problems/${problemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: nextPublished }),
      });
      if (!res.ok) throw new Error("Failed to toggle question status");

      setContests((prev) =>
        prev.map((c) => {
          if (c.id !== contestId || !c.problems) return c;
          return {
            ...c,
            problems: c.problems.map((p) =>
              p.id === problemId ? { ...p, isPublished: nextPublished } : p
            ),
          };
        })
      );
      setSuccessMsg(`Question status updated to ${nextPublished ? "ACTIVE" : "PAUSED / HIDDEN"}.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to update question status");
    }
  };

  const toggleProblemSelection = (id: string) => {
    setSelectedProblemIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const filteredContests = contests.filter((c) => {
    if (statusFilter === "ALL") return true;
    return c.status === statusFilter;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#7F45DB]/15 text-[#7F45DB] border border-[#7F45DB]/30 text-[10px] font-mono font-black uppercase">
              Super Admin Console
            </span>
            <span className="text-xs font-mono text-[#6E6E6E]">({userRole})</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight font-display">
            Contest Publishing & Management
          </h1>
          <p className="text-xs text-[#6E6E6E] mt-1 font-mono">
            Publish weekly challenges, toggle live status, and manage problem sets
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchContests}
            className="p-2.5 rounded-xl border-2 border-[#1E1B4B] bg-white shadow-[2px_2px_0px_0px_#1E1B4B] hover:bg-[#F0F2F8] transition-all"
            title="Refresh Contests"
          >
            <RefreshCw className={`w-4 h-4 text-[#1E1B4B] ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl border-2 border-[#1E1B4B] bg-[#7F45DB] text-white font-mono font-black text-xs shadow-[3px_3px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#1E1B4B] transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE & PUBLISH CONTEST</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl border-2 border-rose-600 bg-rose-50 text-rose-800 text-xs font-mono flex items-center gap-2 shadow-[2px_2px_0px_0px_#1E1B4B]">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-rose-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl border-2 border-emerald-600 bg-emerald-50 text-emerald-800 text-xs font-mono flex items-center gap-2 shadow-[2px_2px_0px_0px_#1E1B4B]">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-[#1E1B4B]/10 pb-3 flex-wrap">
        {[
          { key: "ALL", label: `All Contests (${contests.length})` },
          {
            key: "ACTIVE",
            label: `Live / Active (${contests.filter((c) => c.status === "ACTIVE").length})`,
          },
          {
            key: "SCHEDULED",
            label: `Upcoming / Scheduled (${
              contests.filter((c) => c.status === "SCHEDULED").length
            })`,
          },
          {
            key: "ENDED",
            label: `Concluded (${contests.filter((c) => c.status === "ENDED").length})`,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
              statusFilter === tab.key
                ? "bg-[#7F45DB] text-white border-2 border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B]"
                : "bg-white text-[#6E6E6E] hover:text-[#0F172A] border border-transparent"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contests Grid / Cards */}
      {loading ? (
        <div className="p-12 text-center text-[#7F45DB] font-mono text-sm border-2 border-dashed border-[#1E1B4B]/20 rounded-2xl bg-white">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          Loading contests...
        </div>
      ) : filteredContests.length === 0 ? (
        <div className="p-12 text-center text-[#6E6E6E] font-mono text-sm border-2 border-dashed border-[#1E1B4B]/20 rounded-2xl bg-white">
          No contests in this category. Click "CREATE & PUBLISH CONTEST" above!
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredContests.map((contest) => (
            <div
              key={contest.id}
              className={`p-6 rounded-2xl border-2 border-[#1E1B4B] bg-white shadow-[4px_4px_0px_0px_#1E1B4B] transition-all ${
                contest.status === "ACTIVE" ? "ring-2 ring-emerald-500/60" : ""
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {contest.status === "ACTIVE" && (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border-2 border-emerald-500 font-mono text-xs font-black flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#1E1B4B]">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                        LIVE NOW (ACTIVE)
                      </span>
                    )}

                    {contest.status === "SCHEDULED" && (
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 border-2 border-blue-400 font-mono text-xs font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        UPCOMING / SCHEDULED
                      </span>
                    )}

                    {contest.status === "ENDED" && (
                      <span className="px-3 py-1 rounded-full bg-[#F0F2F8] text-[#6E6E6E] border-2 border-[#1E1B4B]/20 font-mono text-xs font-bold">
                        CONCLUDED / ARCHIVED
                      </span>
                    )}

                    <span className="px-2.5 py-0.5 rounded-lg bg-[#7F45DB]/10 text-[#4A2293] border border-[#7F45DB]/30 font-mono text-xs font-bold">
                      {contest.type}
                    </span>

                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300 font-mono text-[11px] font-bold">
                      {contest.difficulty || "Mixed"}
                    </span>

                    <span className="text-xs font-mono text-[#6E6E6E]">
                      ID: <code className="text-[#0F172A] font-bold">{contest.id}</code>
                    </span>
                  </div>

                  <h3 className="text-2xl font-extrabold text-[#0F172A] font-display">
                    {contest.title}
                  </h3>

                  {contest.description && (
                    <p className="text-xs text-[#6E6E6E] line-clamp-2 leading-relaxed">
                      {contest.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs font-mono text-[#6E6E6E] flex-wrap pt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#7F45DB]" />
                      <span>
                        {new Date(contest.startsAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        –{" "}
                        {new Date(contest.endsAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pl-2 border-l border-[#1E1B4B]/20">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-cyan-600" />
                        <strong>{contest._count?.participants ?? 0}</strong> Registered
                      </span>
                      <span className="flex items-center gap-1">
                        <Code2 className="w-3.5 h-3.5 text-amber-600" />
                        <strong>{contest._count?.problems ?? contest.problems?.length ?? 0}</strong>{" "}
                        Problems
                      </span>
                    </div>
                  </div>

                  {/* Problems in Contest with Activate/Pause toggles */}
                  {contest.problems && contest.problems.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-[#1E1B4B]/10">
                      <div className="text-[10px] font-mono font-bold text-[#6E6E6E] uppercase">
                        Questions ({contest.problems.length}) — Click to Toggle Active / Paused:
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {contest.problems.map((p) => {
                          const isPub = p.isPublished !== false;
                          return (
                            <button
                              key={p.id}
                              onClick={() => toggleProblemActive(contest.id, p.id, isPub)}
                              title={`Click to ${isPub ? "Pause / Hide" : "Activate"} this question`}
                              className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                                isPub
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                                  : "bg-slate-100 text-slate-500 border-slate-300 line-through hover:bg-slate-200"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${isPub ? "bg-emerald-600" : "bg-slate-400"}`} />
                              <span>{p.title}</span>
                              <span className="text-[9px] opacity-75">({isPub ? "ACTIVE" : "PAUSED"})</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status & Action Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 border-t lg:border-t-0 pt-4 lg:pt-0 border-[#1E1B4B]/10">
                  {contest.status === "ACTIVE" && (
                    <>
                      <button
                        onClick={() => setContestStatus(contest, "PAUSED")}
                        className="px-3 py-2 rounded-xl border-2 border-[#1E1B4B] bg-amber-500 text-black font-mono font-bold text-xs shadow-[2px_2px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-1.5"
                        title="Pause contest"
                      >
                        <Pause className="w-3.5 h-3.5 fill-black" />
                        <span>Pause</span>
                      </button>
                      <button
                        onClick={() => setContestStatus(contest, "ENDED")}
                        className="px-3 py-2 rounded-xl border-2 border-[#1E1B4B] bg-rose-500 text-white font-mono font-bold text-xs shadow-[2px_2px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-1.5"
                        title="End contest"
                      >
                        <Square className="w-3.5 h-3.5 fill-white" />
                        <span>End</span>
                      </button>
                    </>
                  )}

                  {contest.status === "PAUSED" && (
                    <>
                      <button
                        onClick={() => setContestStatus(contest, "ACTIVE")}
                        className="px-3 py-2 rounded-xl border-2 border-[#1E1B4B] bg-emerald-500 text-white font-mono font-bold text-xs shadow-[2px_2px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-1.5"
                        title="Resume contest"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Resume</span>
                      </button>
                      <button
                        onClick={() => setContestStatus(contest, "ENDED")}
                        className="px-3 py-2 rounded-xl border-2 border-[#1E1B4B] bg-rose-500 text-white font-mono font-bold text-xs shadow-[2px_2px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-1.5"
                        title="End contest"
                      >
                        <Square className="w-3.5 h-3.5 fill-white" />
                        <span>End</span>
                      </button>
                    </>
                  )}

                  {contest.status === "SCHEDULED" && (
                    <button
                      onClick={() => setContestStatus(contest, "ACTIVE")}
                      className="px-3.5 py-2 rounded-xl border-2 border-[#1E1B4B] bg-emerald-500 text-white font-mono font-bold text-xs shadow-[2px_2px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-1.5"
                      title="Activate contest live now"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Publish Live</span>
                    </button>
                  )}

                  {contest.status === "ENDED" && (
                    <button
                      onClick={() => setContestStatus(contest, "SCHEDULED")}
                      className="px-3.5 py-2 rounded-xl border-2 border-[#1E1B4B] bg-white text-[#0F172A] font-mono font-bold text-xs shadow-[2px_2px_0px_0px_#1E1B4B] hover:bg-[#F0F2F8] transition-all"
                    >
                      Reschedule
                    </button>
                  )}

                  <button
                    onClick={() => openEditModal(contest)}
                    className="px-3.5 py-2 rounded-xl border-2 border-[#1E1B4B] bg-white font-mono font-bold text-xs text-[#0F172A] shadow-[2px_2px_0px_0px_#1E1B4B] hover:bg-[#F0F2F8] transition-all"
                  >
                    Edit / Problems
                  </button>

                  <Link
                    href={`/contest/${contest.id}`}
                    target="_blank"
                    className="p-2 rounded-xl border-2 border-[#1E1B4B] bg-white text-[#6E6E6E] hover:text-[#0F172A] shadow-[2px_2px_0px_0px_#1E1B4B] hover:bg-[#F0F2F8] transition-all flex items-center justify-center"
                    title="View live contest page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Contest Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1E1B4B]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-4 border-[#1E1B4B] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-[8px_8px_0px_0px_#1E1B4B] my-8 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#1E1B4B]/10 mb-6">
              <h3 className="text-xl font-black font-mono text-[#0F172A] uppercase">
                {editingContest ? "Edit Contest & Problems" : "Create & Schedule Contest"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg border-2 border-[#1E1B4B] hover:bg-[#F0F2F8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-[#0F172A] uppercase mb-1">
                  Contest Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekly Contest 102"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-[#1E1B4B] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#7F45DB]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#0F172A] uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Rules, scoring criteria, and target audience..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-[#1E1B4B] font-sans text-xs focus:outline-none focus:ring-2 focus:ring-[#7F45DB]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#0F172A] uppercase mb-1">
                    Contest Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-[#1E1B4B] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#7F45DB] bg-white"
                  >
                    <option value="WEEKLY">WEEKLY</option>
                    <option value="BIWEEKLY">BIWEEKLY</option>
                    <option value="COLLEGE">COLLEGE</option>
                    <option value="CHALLENGE">CHALLENGE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#0F172A] uppercase mb-1">
                    Initial Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-[#1E1B4B] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#7F45DB] bg-white"
                  >
                    <option value="SCHEDULED">SCHEDULED (Upcoming)</option>
                    <option value="ACTIVE">ACTIVE (Publish Live Now)</option>
                    <option value="ENDED">ENDED (Past)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#0F172A] uppercase mb-1">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-[#1E1B4B] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#7F45DB] bg-white"
                  >
                    <option value="Mixed">Mixed</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#0F172A] uppercase mb-1">
                    Starts At *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-[#1E1B4B] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#7F45DB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#0F172A] uppercase mb-1">
                    Ends At *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-[#1E1B4B] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#7F45DB]"
                  />
                </div>
              </div>

              {/* Problem Selection Checkboxes */}
              <div className="pt-2 border-t border-[#1E1B4B]/10">
                <label className="block text-xs font-mono font-bold text-[#0F172A] uppercase mb-2">
                  Select Contest Problems ({selectedProblemIds.length} Selected)
                </label>
                <div className="max-h-40 overflow-y-auto border-2 border-[#1E1B4B] rounded-xl p-3 space-y-1.5 bg-[#F8FAFC]">
                  {problems.length === 0 ? (
                    <div className="text-xs font-mono text-[#6E6E6E]">No problems available</div>
                  ) : (
                    problems.map((p) => {
                      const isSelected = selectedProblemIds.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className={`flex items-center justify-between p-2 rounded-lg border text-xs font-mono cursor-pointer transition-all ${
                            isSelected
                              ? "bg-[#7F45DB]/10 border-[#7F45DB] text-[#4A2293] font-bold"
                              : "bg-white border-[#1E1B4B]/10 text-[#0F172A] hover:bg-white/80"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleProblemSelection(p.id)}
                              className="rounded border-[#1E1B4B] text-[#7F45DB] focus:ring-0"
                            />
                            <span>{p.title}</span>
                          </div>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              p.difficulty === "Easy"
                                ? "text-emerald-700 bg-emerald-100"
                                : p.difficulty === "Medium"
                                ? "text-amber-700 bg-amber-100"
                                : "text-rose-700 bg-rose-100"
                            }`}
                          >
                            {p.difficulty}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E1B4B]/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border-2 border-[#1E1B4B] bg-white font-mono text-xs font-bold text-[#6E6E6E] hover:bg-[#F0F2F8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl border-2 border-[#1E1B4B] bg-[#7F45DB] text-white font-mono text-xs font-black shadow-[3px_3px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingContest ? "SAVE CONTEST" : "PUBLISH CONTEST"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
