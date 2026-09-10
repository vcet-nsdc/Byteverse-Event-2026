"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Search,
  Plus,
  ArrowBigUp,
  Clock,
  User,
  X,
  Send,
  Flame,
  Sparkles,
  Award,
  Share2,
  Check,
  Lock,
  ExternalLink,
  ShieldCheck,
  Bookmark,
  TrendingUp,
} from "lucide-react";

interface DiscussionItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  upvotes: number;
  views: number;
  createdAt: string;
  author: {
    id: string;
    name: string;
    college: string;
    role?: string;
  };
  problem?: {
    id: string;
    title: string;
    difficulty?: string;
  } | null;
  commentCount: number;
  userVote: number;
}

export default function DiscussionPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [discussions, setDiscussions] = useState<DiscussionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"newest" | "upvotes" | "comments">("newest");
  const [tag, setTag] = useState("All");
  const [search, setSearch] = useState("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState<string[]>(["General"]);
  const [creating, setCreating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Fetch session on mount
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data?.user?.id) {
            setCurrentUser(data.user);
          }
        }
      } catch {
        // ignore
      }
    }
    loadSession();
  }, []);

  const fetchDiscussions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tag !== "All") params.set("tag", tag);
      if (sort) params.set("sort", sort);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/discussions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDiscussions(data.discussions || []);
        if (data.tags) setAvailableTags(data.tags);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [tag, sort, search]);

  useEffect(() => {
    fetchDiscussions();
  }, [fetchDiscussions]);

  // Reddit-Style Upvote Only (strictly NO downvote)
  const handleUpvote = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      router.push(`/login?callbackUrl=${encodeURIComponent("/discussion")}`);
      return;
    }

    try {
      const res = await fetch(`/api/discussions/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: 1 }),
      });
      if (res.ok) {
        const data = await res.json();
        setDiscussions((prev) =>
          prev.map((d) =>
            d.id === id ? { ...d, upvotes: data.upvotes, userVote: data.userVote } : d
          )
        );
      }
    } catch {
      // ignore
    }
  };

  const handleShare = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/discussion/${id}`;
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleOpenCreateModal = () => {
    if (!currentUser) {
      router.push(`/login?callbackUrl=${encodeURIComponent("/discussion")}`);
      return;
    }
    setAuthError(null);
    setShowCreateModal(true);
  };

  // Submit new discussion
  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      router.push(`/login?callbackUrl=${encodeURIComponent("/discussion")}`);
      return;
    }
    if (!newTitle.trim() || !newContent.trim()) return;

    setCreating(true);
    setAuthError(null);

    try {
      const res = await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          tags: newTags,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewTitle("");
        setNewContent("");
        fetchDiscussions();
      } else {
        const err = await res.json();
        setAuthError(err.error || "Failed to post discussion");
      }
    } catch {
      setAuthError("Network error. Please retry.");
    } finally {
      setCreating(false);
    }
  };

  const formatTimeAgo = (iso: string) => {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${Math.max(1, mins)}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <main className="min-h-screen bg-[#F0F2F5] dark:bg-[#0B0F17] text-[#0F172A] dark:text-[#F8FAFC] py-6 px-3 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Top Subreddit Header Banner */}
        <div className="bg-white dark:bg-[#121824] border border-[#D1D5DB] dark:border-[#1F2937] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#7F45DB] to-[#A472F7] flex items-center justify-center text-white shadow-md font-mono font-black text-xl shrink-0">
              c/
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-display font-black text-[#0F172A] dark:text-white tracking-tight">
                  r/ByteVerse
                </h1>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#7F45DB]/10 text-[#7F45DB] dark:text-[#A472F7] border border-[#7F45DB]/20">
                  Official CP Forum
                </span>
              </div>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] font-medium mt-0.5">
                Competitive programming discussions, algorithm optimizations, Judge0 fast I/O, and round prep.
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#7F45DB] hover:bg-[#6D34C9] text-white font-mono font-bold text-xs uppercase tracking-wider shadow-sm transition-all shrink-0"
          >
            {currentUser ? <Plus className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{currentUser ? "Create Post" : "Log In to Post"}</span>
          </button>
        </div>

        {/* 2-Column Reddit Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Feed Column (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Quick Filter & Sort Bar */}
            <div className="bg-white dark:bg-[#121824] border border-[#D1D5DB] dark:border-[#1F2937] rounded-xl p-3 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Reddit Sort Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSort("newest")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    sort === "newest"
                      ? "bg-[#7F45DB] text-white"
                      : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-slate-100 dark:hover:bg-[#1A2234]"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
                <button
                  onClick={() => setSort("upvotes")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    sort === "upvotes"
                      ? "bg-[#7F45DB] text-white"
                      : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-slate-100 dark:hover:bg-[#1A2234]"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Top Rated</span>
                </button>
                <button
                  onClick={() => setSort("comments")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    sort === "comments"
                      ? "bg-[#7F45DB] text-white"
                      : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-slate-100 dark:hover:bg-[#1A2234]"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Most Discussed</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search discussions..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#F9FAFB] dark:bg-[#1A2234] border border-[#D1D5DB] dark:border-[#2D3748] text-xs font-mono text-[#0F172A] dark:text-white placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7F45DB]"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
              <span className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] uppercase font-bold shrink-0 mr-1">
                Topics:
              </span>
              <button
                onClick={() => setTag("All")}
                className={`px-2.5 py-1 rounded-full border text-xs shrink-0 transition-all ${
                  tag === "All"
                    ? "bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] border-[#0F172A] dark:border-white font-bold"
                    : "bg-white dark:bg-[#121824] text-[#6B7280] dark:text-[#9CA3AF] border-[#D1D5DB] dark:border-[#1F2937] hover:border-[#7F45DB]"
                }`}
              >
                c/all
              </button>
              {availableTags.map((t) => (
                <button
                  key={t}
                  onClick={() => setTag(t)}
                  className={`px-2.5 py-1 rounded-full border text-xs shrink-0 transition-all ${
                    tag === t
                      ? "bg-[#7F45DB] text-white border-[#7F45DB] font-bold"
                      : "bg-white dark:bg-[#121824] text-[#6B7280] dark:text-[#9CA3AF] border-[#D1D5DB] dark:border-[#1F2937] hover:border-[#7F45DB]"
                  }`}
                >
                  c/{t.toLowerCase()}
                </button>
              ))}
            </div>

            {/* Feed Cards */}
            {loading ? (
              <div className="py-16 text-center font-mono text-xs text-[#6B7280] dark:text-[#9CA3AF] bg-white dark:bg-[#121824] border border-[#D1D5DB] dark:border-[#1F2937] rounded-xl animate-pulse">
                Loading Reddit-style community feed...
              </div>
            ) : discussions.length > 0 ? (
              <div className="space-y-3">
                {discussions.map((d) => (
                  <div
                    key={d.id}
                    className="bg-white dark:bg-[#121824] border border-[#D1D5DB] dark:border-[#1F2937] hover:border-[#9CA3AF] dark:hover:border-[#374151] rounded-xl shadow-sm transition-all overflow-hidden flex"
                  >
                    {/* Left Reddit Upvote Column (STRICTLY NO DOWNVOTE) */}
                    <div className="w-12 bg-[#F9FAFB] dark:bg-[#0E1420] border-r border-[#E5E7EB] dark:border-[#1F2937] p-2 flex flex-col items-center justify-start shrink-0 pt-3">
                      <button
                        onClick={(e) => handleUpvote(d.id, e)}
                        title={currentUser ? "Upvote" : "Log in to upvote"}
                        className={`p-1.5 rounded-lg transition-all ${
                          d.userVote === 1
                            ? "bg-[#7F45DB]/20 text-[#7F45DB] dark:text-[#A472F7] scale-110"
                            : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-slate-200 dark:hover:bg-[#1F2937] hover:text-[#7F45DB]"
                        }`}
                      >
                        <ArrowBigUp
                          className={`w-5 h-5 ${
                            d.userVote === 1 ? "fill-[#7F45DB] dark:fill-[#A472F7]" : ""
                          }`}
                        />
                      </button>
                      <span
                        className={`font-mono text-xs font-black mt-1 ${
                          d.userVote === 1
                            ? "text-[#7F45DB] dark:text-[#A472F7]"
                            : "text-[#0F172A] dark:text-[#E2E8F0]"
                        }`}
                      >
                        {d.upvotes}
                      </span>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 p-4 sm:p-5 space-y-2.5 min-w-0">
                      {/* Meta Header */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                        <span className="font-mono font-bold text-[#7F45DB] dark:text-[#A472F7]">
                          c/{d.tags[0]?.toLowerCase() || "algorithms"}
                        </span>
                        <span>•</span>
                        <span className="font-medium">
                          Posted by{" "}
                          <span className="font-mono font-bold text-[#0F172A] dark:text-white">
                            u/{d.author.name.replace(/\s+/g, "_").toLowerCase()}
                          </span>
                        </span>
                        {d.author.role && (
                          <span
                            className={`text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded ${
                              d.author.role === "SUPER_ADMIN"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40"
                                : d.author.role === "ADMIN"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300/40"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {d.author.role.replace("_", " ")}
                          </span>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(d.createdAt)}
                        </span>
                      </div>

                      {/* Title */}
                      <Link href={`/discussion/${d.id}`} className="block group">
                        <h2 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white group-hover:text-[#7F45DB] dark:group-hover:text-[#A472F7] transition-colors leading-snug">
                          {d.title}
                        </h2>
                      </Link>

                      {/* Content Preview */}
                      <p className="text-xs sm:text-sm text-[#4B5563] dark:text-[#9CA3AF] font-normal line-clamp-2 leading-relaxed font-sans">
                        {d.content.replace(/```[\s\S]*?```/g, "[code snippet]").slice(0, 220)}
                      </p>

                      {/* Tag Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {d.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1A2234] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#2D3748]"
                          >
                            #{t}
                          </span>
                        ))}
                        {d.problem && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                            Problem: {d.problem.title}
                          </span>
                        )}
                      </div>

                      {/* Reddit Action Footer */}
                      <div className="flex items-center gap-4 pt-2 border-t border-[#F3F4F6] dark:border-[#1F2937] text-xs font-mono text-[#6B7280] dark:text-[#9CA3AF]">
                        <Link
                          href={`/discussion/${d.id}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors font-bold text-[#0F172A] dark:text-white"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#7F45DB] dark:text-[#A472F7]" />
                          <span>{d.commentCount} Comments</span>
                        </Link>

                        <button
                          onClick={(e) => handleShare(d.id, e)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors"
                        >
                          {copiedId === d.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-500 font-bold">Link Copied!</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3.5 h-3.5" />
                              <span>Share</span>
                            </>
                          )}
                        </button>

                        <span className="ml-auto text-[11px] text-[#9CA3AF]">
                          {d.views} views
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#121824] border border-[#D1D5DB] dark:border-[#1F2937] rounded-xl p-10 text-center space-y-3">
                <MessageSquare className="w-10 h-10 text-[#7F45DB] mx-auto opacity-70" />
                <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                  No discussions found in this category
                </h3>
                <p className="text-xs font-mono text-[#6B7280] dark:text-[#9CA3AF]">
                  Try clearing filters or start the conversation with your own post.
                </p>
                <button
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2 rounded-xl bg-[#7F45DB] text-white font-mono font-bold text-xs uppercase"
                >
                  Create First Post
                </button>
              </div>
            )}
          </div>

          {/* Right Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* About Community Card */}
            <div className="bg-white dark:bg-[#121824] border border-[#D1D5DB] dark:border-[#1F2937] rounded-xl overflow-hidden shadow-sm">
              <div className="h-16 bg-gradient-to-r from-[#7F45DB] to-[#A472F7] p-3 flex items-end">
                <span className="font-mono font-black text-white text-xs uppercase tracking-wider">
                  About Community
                </span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#7F45DB]/15 text-[#7F45DB] flex items-center justify-center font-mono font-black text-sm">
                    BV
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#0F172A] dark:text-white">
                      r/ByteVerseDiscussion
                    </h3>
                    <p className="text-[11px] font-mono text-[#6B7280] dark:text-[#9CA3AF]">
                      Collegiate CP Network
                    </p>
                  </div>
                </div>

                <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] leading-relaxed">
                  The peer-led algorithmic discussion hub for NSDC ByteVerse 2026. Exchange approaches, analyze edge cases, and share runtime optimizations.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center font-mono">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#1A2234]">
                    <div className="text-sm font-black text-[#0F172A] dark:text-white">
                      {discussions.length}
                    </div>
                    <div className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">Posts</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#1A2234]">
                    <div className="text-sm font-black text-emerald-600">Online</div>
                    <div className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">Judge0 Cluster</div>
                  </div>
                </div>

                <button
                  onClick={handleOpenCreateModal}
                  className="w-full py-2.5 rounded-xl bg-[#7F45DB] hover:bg-[#6D34C9] text-white font-mono font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  {currentUser ? <Plus className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{currentUser ? "Create Discussion" : "Log In to Participate"}</span>
                </button>
              </div>
            </div>

            {/* Community Rules Card */}
            <div className="bg-white dark:bg-[#121824] border border-[#D1D5DB] dark:border-[#1F2937] rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2 font-mono font-black text-xs uppercase text-[#0F172A] dark:text-white">
                <ShieldCheck className="w-4 h-4 text-[#7F45DB]" />
                <span>r/ByteVerse Rules</span>
              </div>
              <ol className="space-y-2 text-xs text-[#4B5563] dark:text-[#9CA3AF] list-decimal list-inside font-medium leading-relaxed">
                <li>
                  <strong className="text-[#0F172A] dark:text-white font-semibold">
                    Upvotes Only:
                  </strong>{" "}
                  Constructive feedback only. Downvoting is disabled to promote collaborative learning.
                </li>
                <li>
                  <strong className="text-[#0F172A] dark:text-white font-semibold">
                    Mandatory Authentication:
                  </strong>{" "}
                  Users must be logged in to create discussions, upvote, or leave comments.
                </li>
                <li>
                  <strong className="text-[#0F172A] dark:text-white font-semibold">
                    No Spoilers During Live Contests:
                  </strong>{" "}
                  Discussions on active contest problems are locked until round conclusion.
                </li>
                <li>
                  <strong className="text-[#0F172A] dark:text-white font-semibold">
                    Benchmark Code:
                  </strong>{" "}
                  Specify language and compiler flags when sharing Fast I/O snippets.
                </li>
              </ol>
            </div>

            {/* Quick Demo Threads Card */}
            <div className="bg-white dark:bg-[#121824] border border-[#D1D5DB] dark:border-[#1F2937] rounded-xl p-4 shadow-sm space-y-2.5">
              <div className="flex items-center gap-2 font-mono font-black text-xs uppercase text-[#0F172A] dark:text-white">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Featured Threads</span>
              </div>
              <div className="space-y-2 text-xs">
                {discussions.slice(0, 3).map((d) => (
                  <Link
                    key={d.id}
                    href={`/discussion/${d.id}`}
                    className="block p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1A2234] border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all"
                  >
                    <div className="font-bold text-[#0F172A] dark:text-white line-clamp-1">
                      {d.title}
                    </div>
                    <div className="text-[11px] font-mono text-[#7F45DB] dark:text-[#A472F7] mt-0.5">
                      ▲ {d.upvotes} upvotes · {d.commentCount} comments
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Create Discussion Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#121824] border-2 border-[#1E1B4B] dark:border-[#7F45DB] rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#7F45DB] text-white flex items-center justify-center font-mono font-black text-xs">
                    c/
                  </div>
                  <h2 className="text-lg font-display font-black text-[#0F172A] dark:text-white">
                    Create Post in r/ByteVerse
                  </h2>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-[#6B7280]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {authError && (
                <div className="p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-mono font-bold">
                  {authError}
                </div>
              )}

              <form onSubmit={handleCreateDiscussion} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-[#6B7280] dark:text-[#9CA3AF]">
                    Topic Tag
                  </label>
                  <select
                    value={newTags[0] || "General"}
                    onChange={(e) => setNewTags([e.target.value])}
                    className="w-full px-3 py-2 rounded-lg bg-[#F9FAFB] dark:bg-[#1A2234] border border-[#D1D5DB] dark:border-[#2D3748] font-mono text-xs text-[#0F172A] dark:text-white focus:outline-none focus:border-[#7F45DB]"
                  >
                    <option value="Algorithms">c/algorithms</option>
                    <option value="FastIO">c/fast-io</option>
                    <option value="Tips">c/tips</option>
                    <option value="Two Sum">c/two-sum</option>
                    <option value="Dynamic Programming">c/dynamic-programming</option>
                    <option value="Judge0">c/judge0</option>
                    <option value="General">c/general</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-[#6B7280] dark:text-[#9CA3AF]">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="An interesting title (e.g. [Complexity] Trade-offs in QuickSort vs MergeSort)..."
                    className="w-full px-3 py-2 rounded-lg bg-[#F9FAFB] dark:bg-[#1A2234] border border-[#D1D5DB] dark:border-[#2D3748] font-sans text-xs text-[#0F172A] dark:text-white focus:outline-none focus:border-[#7F45DB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-[#6B7280] dark:text-[#9CA3AF]">
                    Body (Markdown and code blocks supported)
                  </label>
                  <textarea
                    required
                    rows={7}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Share your algorithmic approach, code snippets, or question..."
                    className="w-full px-3 py-2 rounded-lg bg-[#F9FAFB] dark:bg-[#1A2234] border border-[#D1D5DB] dark:border-[#2D3748] font-mono text-xs text-[#0F172A] dark:text-white focus:outline-none focus:border-[#7F45DB]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-mono font-bold text-xs text-[#6B7280] dark:text-[#9CA3AF]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-2 rounded-lg bg-[#7F45DB] hover:bg-[#6D34C9] text-white font-mono font-bold text-xs uppercase tracking-wider disabled:opacity-50"
                  >
                    {creating ? "Posting..." : "Post"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
