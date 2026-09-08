"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Plus,
  ArrowBigUp,
  ArrowBigDown,
  Clock,
  User,
  X,
  Send,
  Flame,
  Filter,
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
  const [discussions, setDiscussions] = useState<DiscussionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"newest" | "upvotes" | "comments">("newest");
  const [tag, setTag] = useState("All");
  const [search, setSearch] = useState("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Create Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState<string[]>(["General"]);
  const [creating, setCreating] = useState(false);

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

  // Handle upvote / downvote
  const handleVote = async (id: string, value: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await fetch(`/api/discussions/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
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

  // Submit new discussion
  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setCreating(true);
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
      }
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FD] text-[#0F172A] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Banner */}
        <div className="bg-white border-2 border-[#1E1B4B] rounded-3xl p-6 sm:p-10 shadow-[6px_6px_0px_0px_#1E1B4B] flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
          <div className="relative z-10 max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7F45DB]/10 text-[#7F45DB] border border-[#7F45DB]/30 text-xs font-mono font-black uppercase tracking-wider">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Developer Community</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-black text-[#0F172A] tracking-tight">
              Discussions & Insights
            </h1>
            <p className="text-sm sm:text-base text-[#6E6E6E] font-medium leading-relaxed">
              Exchange algorithmic approaches, interview strategies, complexity trade-offs, and tournament tips with peers and mentors.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#7F45DB] text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Discussion</span>
          </button>
        </div>

        {/* Search and Sort Bar */}
        <div className="bg-white border-2 border-[#1E1B4B] rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_0px_#1E1B4B] space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#6E6E6E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search topics, questions, solutions..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#F8F9FD] border-2 border-[#1E1B4B]/20 text-xs font-mono text-[#0F172A] placeholder:text-[#6E6E6E] focus:outline-none focus:border-[#7F45DB]"
              />
            </div>

            {/* Sorting Tabs */}
            <div className="flex items-center gap-1 bg-[#F8F9FD] p-1 rounded-xl border border-[#1E1B4B]/20 shrink-0">
              {[
                { key: "newest", label: "Newest" },
                { key: "upvotes", label: "Top Rated" },
                { key: "comments", label: "Most Discussed" },
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSort(s.key as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    sort === s.key
                      ? "bg-[#7F45DB] text-white font-black"
                      : "text-[#6E6E6E] hover:text-[#0F172A]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tag filters */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#1E1B4B]/10">
            <span className="text-[11px] font-mono text-[#6E6E6E] uppercase font-bold mr-1">
              Category:
            </span>
            <button
              onClick={() => setTag("All")}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono border ${
                tag === "All"
                  ? "bg-[#0F172A] text-white border-[#0F172A] font-bold"
                  : "bg-[#F8F9FD] text-[#6E6E6E] border-[#1E1B4B]/15 hover:text-[#0F172A]"
              }`}
            >
              All
            </button>
            {availableTags.map((t) => (
              <button
                key={t}
                onClick={() => setTag(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono border ${
                  tag === t
                    ? "bg-[#7F45DB] text-white border-[#7F45DB] font-bold"
                    : "bg-[#F8F9FD] text-[#6E6E6E] border-[#1E1B4B]/15 hover:text-[#0F172A]"
                }`}
              >
                #{t}
              </button>
            ))}
          </div>
        </div>

        {/* Discussion List */}
        {loading ? (
          <div className="py-16 text-center font-mono text-sm text-[#6E6E6E] animate-pulse">
            Loading developer discussions...
          </div>
        ) : discussions.length > 0 ? (
          <div className="space-y-4">
            {discussions.map((d) => (
              <Link
                key={d.id}
                href={`/discussion/${d.id}`}
                className="block bg-white border-2 border-[#1E1B4B] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1E1B4B] transition-all group"
              >
                <div className="flex items-start gap-4">
                  {/* Upvote Pill */}
                  <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-[#F8F9FD] border-2 border-[#1E1B4B] min-w-[50px] shrink-0">
                    <button
                      onClick={(e) => handleVote(d.id, 1, e)}
                      className={`p-1 rounded hover:bg-[#EAEAEA] transition-colors ${
                        d.userVote === 1 ? "text-[#7F45DB]" : "text-[#6E6E6E]"
                      }`}
                    >
                      <ArrowBigUp className={`w-5 h-5 ${d.userVote === 1 ? "fill-[#7F45DB]" : ""}`} />
                    </button>
                    <span className="text-xs font-mono font-black text-[#0F172A]">
                      {d.upvotes}
                    </span>
                    <button
                      onClick={(e) => handleVote(d.id, -1, e)}
                      className={`p-1 rounded hover:bg-[#EAEAEA] transition-colors ${
                        d.userVote === -1 ? "text-rose-600" : "text-[#6E6E6E]"
                      }`}
                    >
                      <ArrowBigDown className={`w-5 h-5 ${d.userVote === -1 ? "fill-rose-600" : ""}`} />
                    </button>
                  </div>

                  {/* Main Card Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {d.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#7F45DB]/10 text-[#7F45DB] border border-[#7F45DB]/20"
                        >
                          #{t}
                        </span>
                      ))}
                      {d.problem && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          Problem: {d.problem.title}
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg font-bold text-[#0F172A] group-hover:text-[#7F45DB] transition-colors">
                      {d.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-[#6E6E6E] font-medium line-clamp-2 leading-relaxed">
                      {d.content.replace(/```[\s\S]*?```/g, "[code snippet]").slice(0, 200)}
                    </p>

                    <div className="flex items-center justify-between pt-2 text-[11px] font-mono text-[#6E6E6E]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0F172A]">{d.author.name}</span>
                        <span>·</span>
                        <span>{d.author.college}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(d.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[#0F172A] font-bold">
                        <MessageSquare className="w-3.5 h-3.5 text-[#7F45DB]" />
                        <span>{d.commentCount} comments</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white border-2 border-[#1E1B4B] rounded-3xl p-12 text-center shadow-[4px_4px_0px_0px_#1E1B4B] space-y-3">
            <MessageSquare className="w-10 h-10 text-[#7F45DB] mx-auto" />
            <h3 className="text-lg font-bold text-[#0F172A]">No discussions found</h3>
            <p className="text-xs font-mono text-[#6E6E6E]">Be the first to share an algorithm insight or ask a question!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 rounded-xl bg-[#7F45DB] text-white font-mono font-bold text-xs uppercase border-2 border-[#1E1B4B]"
            >
              Start Discussion
            </button>
          </div>
        )}

        {/* Create Discussion Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border-3 border-[#1E1B4B] rounded-3xl max-w-xl w-full p-6 shadow-[8px_8px_0px_0px_#1E1B4B] space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b-2 border-[#1E1B4B]/10 pb-3">
                <h2 className="text-xl font-display font-black text-[#0F172A]">
                  New Community Discussion
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 rounded-xl hover:bg-[#F0F2F8] border border-[#1E1B4B]/20"
                >
                  <X className="w-5 h-5 text-[#6E6E6E]" />
                </button>
              </div>

              <form onSubmit={handleCreateDiscussion} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-black uppercase text-[#6E6E6E]">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Optimal approach for sliding window edge cases..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F8F9FD] border-2 border-[#1E1B4B]/20 font-mono text-xs text-[#0F172A] focus:outline-none focus:border-[#7F45DB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-black uppercase text-[#6E6E6E]">
                    Body (Markdown & Code blocks supported)
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Describe your approach, complexity analysis, or question..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F8F9FD] border-2 border-[#1E1B4B]/20 font-mono text-xs text-[#0F172A] focus:outline-none focus:border-[#7F45DB]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#1E1B4B]/20 font-mono font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-2.5 rounded-xl bg-[#7F45DB] text-white border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] font-mono font-black text-xs uppercase tracking-wider hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none disabled:opacity-50"
                  >
                    {creating ? "Posting..." : "Publish Post"}
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
