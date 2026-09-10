"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowBigUp,
  MessageSquare,
  Clock,
  User,
  Trash2,
  Edit2,
  Send,
  Eye,
  Check,
  Lock,
  Share2,
  ShieldCheck,
  Sparkles,
  Award,
} from "lucide-react";

interface CommentItem {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    college: string;
    role?: string;
  };
  isOwner: boolean;
}

interface DiscussionDetail {
  id: string;
  title: string;
  content: string;
  tags: string[];
  upvotes: number;
  views: number;
  createdAt: string;
  updatedAt: string;
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
  comments: CommentItem[];
  userVote: number;
  isOwner: boolean;
}

export default function DiscussionDetailPage({
  params,
}: {
  params: Promise<{ discussionId: string }>;
}) {
  const { discussionId } = use(params);
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [discussion, setDiscussion] = useState<DiscussionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [copied, setCopied] = useState(false);

  // Edit post state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Fetch session
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

  useEffect(() => {
    async function loadPost() {
      try {
        const res = await fetch(`/api/discussions/${discussionId}`);
        if (res.ok) {
          const data = await res.json();
          setDiscussion(data);
          setEditTitle(data.title);
          setEditContent(data.content);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [discussionId]);

  // Reddit Upvote Only (strictly NO downvote)
  const handleUpvote = async () => {
    if (!currentUser) {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/discussion/${discussionId}`)}`);
      return;
    }
    if (!discussion) return;

    try {
      const res = await fetch(`/api/discussions/${discussionId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: 1 }),
      });
      if (res.ok) {
        const data = await res.json();
        setDiscussion((prev) =>
          prev ? { ...prev, upvotes: data.upvotes, userVote: data.userVote } : null
        );
      }
    } catch {
      // ignore
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      router.push(`/login?callbackUrl=${encodeURIComponent(`/discussion/${discussionId}`)}`);
      return;
    }
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await fetch(`/api/discussions/${discussionId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      if (res.ok) {
        const created = await res.json();
        setDiscussion((prev) =>
          prev
            ? {
                ...prev,
                comments: [
                  ...prev.comments,
                  {
                    id: created.id,
                    content: created.content,
                    createdAt: created.createdAt,
                    author: created.author,
                    isOwner: true,
                  },
                ],
              }
            : null
        );
        setNewComment("");
      }
    } catch {
      // ignore
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/discussions/${discussionId}/comments?commentId=${commentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDiscussion((prev) =>
          prev
            ? {
                ...prev,
                comments: prev.comments.filter((c) => c.id !== commentId),
              }
            : null
        );
      }
    } catch {
      // ignore
    }
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/discussions/${discussionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });
      if (res.ok) {
        setDiscussion((prev) => (prev ? { ...prev, title: editTitle, content: editContent } : null));
        setIsEditing(false);
      }
    } catch {
      // ignore
    } finally {
      setSavingEdit(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F0F2F5] dark:bg-[#0B0F17] flex items-center justify-center font-mono text-xs text-[#6B7280] dark:text-[#9CA3AF]">
        Loading discussion thread...
      </main>
    );
  }

  if (!discussion) {
    return (
      <main className="min-h-screen bg-[#F0F2F5] dark:bg-[#0B0F17] flex flex-col items-center justify-center p-6 space-y-4 font-sans">
        <h1 className="text-xl font-bold text-[#0F172A] dark:text-white">Discussion Thread Not Found</h1>
        <p className="text-xs font-mono text-[#6B7280] dark:text-[#9CA3AF]">
          This post may have been deleted or the link is invalid.
        </p>
        <Link
          href="/discussion"
          className="px-4 py-2 rounded-xl bg-[#7F45DB] text-white font-mono font-bold text-xs uppercase"
        >
          Return to r/ByteVerse
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F0F2F5] dark:bg-[#0B0F17] text-[#0F172A] dark:text-[#F8FAFC] py-6 px-3 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <Link
            href="/discussion"
            className="inline-flex items-center gap-1 text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#0F172A] dark:hover:text-white font-bold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>r/ByteVerse</span>
          </Link>
          <span className="text-[#9CA3AF]">/</span>
          <span className="text-[#7F45DB] dark:text-[#A472F7] font-bold">
            c/{discussion.tags[0]?.toLowerCase() || "general"}
          </span>
        </div>

        {/* 2-Column Reddit Thread View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Content Column (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Main Post Card */}
            <div className="bg-white dark:bg-[#121824] border border-[#D1D5DB] dark:border-[#1F2937] rounded-xl shadow-sm overflow-hidden flex">
              {/* Left Reddit Upvote Column (STRICTLY NO DOWNVOTE) */}
              <div className="w-12 bg-[#F9FAFB] dark:bg-[#0E1420] border-r border-[#E5E7EB] dark:border-[#1F2937] p-2 flex flex-col items-center justify-start shrink-0 pt-3">
                <button
                  onClick={handleUpvote}
                  title={currentUser ? "Upvote" : "Log in to upvote"}
                  className={`p-1.5 rounded-lg transition-all ${
                    discussion.userVote === 1
                      ? "bg-[#7F45DB]/20 text-[#7F45DB] dark:text-[#A472F7] scale-110"
                      : "text-[#6B7280] dark:text-[#9CA3AF] hover:bg-slate-200 dark:hover:bg-[#1F2937] hover:text-[#7F45DB]"
                  }`}
                >
                  <ArrowBigUp
                    className={`w-5 h-5 ${
                      discussion.userVote === 1 ? "fill-[#7F45DB] dark:fill-[#A472F7]" : ""
                    }`}
                  />
                </button>
                <span
                  className={`font-mono text-xs font-black mt-1 ${
                    discussion.userVote === 1
                      ? "text-[#7F45DB] dark:text-[#A472F7]"
                      : "text-[#0F172A] dark:text-[#E2E8F0]"
                  }`}
                >
                  {discussion.upvotes}
                </span>
              </div>

              {/* Thread Content */}
              <div className="flex-1 p-4 sm:p-6 space-y-4 min-w-0">
                {/* Meta Header */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                  <span className="font-mono font-bold text-[#7F45DB] dark:text-[#A472F7]">
                    c/{discussion.tags[0]?.toLowerCase() || "algorithms"}
                  </span>
                  <span>•</span>
                  <span className="font-medium">
                    Posted by{" "}
                    <span className="font-mono font-bold text-[#0F172A] dark:text-white">
                      u/{discussion.author.name.replace(/\s+/g, "_").toLowerCase()}
                    </span>
                  </span>
                  {discussion.author.role && (
                    <span
                      className={`text-[9px] font-mono font-black uppercase px-1.5 py-0.5 rounded ${
                        discussion.author.role === "SUPER_ADMIN"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40"
                          : discussion.author.role === "ADMIN"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300/40"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {discussion.author.role.replace("_", " ")}
                    </span>
                  )}
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(discussion.createdAt)}
                  </span>
                </div>

                {/* Title */}
                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#F9FAFB] dark:bg-[#1A2234] border border-[#D1D5DB] dark:border-[#2D3748] font-bold text-base text-[#0F172A] dark:text-white"
                  />
                ) : (
                  <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight leading-snug">
                    {discussion.title}
                  </h1>
                )}

                {/* Topic tags */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {discussion.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1A2234] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#2D3748]"
                    >
                      #{t}
                    </span>
                  ))}
                  {discussion.problem && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                      Problem: {discussion.problem.title}
                    </span>
                  )}
                </div>

                {/* Main Body */}
                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      rows={10}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#F9FAFB] dark:bg-[#1A2234] border border-[#D1D5DB] dark:border-[#2D3748] font-mono text-xs text-[#0F172A] dark:text-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 rounded-lg border text-xs font-mono"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        disabled={savingEdit}
                        className="px-4 py-1.5 rounded-lg bg-[#7F45DB] text-white text-xs font-mono font-bold"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-[#374151] dark:text-[#D1D5DB] leading-relaxed whitespace-pre-wrap font-sans">
                    {discussion.content}
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center gap-4 pt-3 border-t border-slate-100 dark:border-[#1F2937] text-xs font-mono text-[#6B7280] dark:text-[#9CA3AF]">
                  <div className="flex items-center gap-1.5 font-bold text-[#0F172A] dark:text-white">
                    <MessageSquare className="w-3.5 h-3.5 text-[#7F45DB] dark:text-[#A472F7]" />
                    <span>{discussion.comments.length} Comments</span>
                  </div>

                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 hover:text-[#0F172A] dark:hover:text-white transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1 text-[11px] text-[#9CA3AF] ml-auto">
                    <Eye className="w-3 h-3" />
                    <span>{discussion.views} views</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comment Submission Section */}
            <div className="bg-white dark:bg-[#121824] border border-[#D1D5DB] dark:border-[#1F2937] rounded-xl p-4 sm:p-5 shadow-sm space-y-3">
              {currentUser ? (
                <form onSubmit={handleAddComment} className="space-y-3">
                  <div className="text-xs font-mono text-[#6B7280] dark:text-[#9CA3AF]">
                    Comment as{" "}
                    <span className="font-bold text-[#7F45DB] dark:text-[#A472F7]">
                      u/{currentUser.name?.replace(/\s+/g, "_").toLowerCase() || "contestant"}
                    </span>
                  </div>

                  <textarea
                    rows={3}
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="What are your thoughts? Keep feedback constructive and algorithmic..."
                    className="w-full px-3 py-2.5 rounded-lg bg-[#F9FAFB] dark:bg-[#1A2234] border border-[#D1D5DB] dark:border-[#2D3748] font-mono text-xs text-[#0F172A] dark:text-white placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7F45DB]"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingComment || !newComment.trim()}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#7F45DB] hover:bg-[#6D34C9] text-white font-mono font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" />
                      <span>{submittingComment ? "Posting..." : "Comment"}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 rounded-lg bg-[#F9FAFB] dark:bg-[#0E1420] border border-[#E5E7EB] dark:border-[#1F2937] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-[#0F172A] dark:text-white">
                      Log in to participate in the conversation
                    </h4>
                    <p className="text-[11px] font-mono text-[#6B7280] dark:text-[#9CA3AF]">
                      Discussion replies and upvoting require an authenticated account.
                    </p>
                  </div>
                  <Link
                    href={`/login?callbackUrl=${encodeURIComponent(`/discussion/${discussionId}`)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#7F45DB] hover:bg-[#6D34C9] text-white font-mono font-bold text-xs uppercase shrink-0 shadow-sm"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Log In to Comment</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Reddit Threaded Comments Section */}
            <div className="bg-white dark:bg-[#121824] border border-[#D1D5DB] dark:border-[#1F2937] rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1F2937] pb-3">
                <h3 className="font-mono font-bold text-xs text-[#0F172A] dark:text-white uppercase tracking-wider">
                  All Comments ({discussion.comments.length})
                </h3>
              </div>

              {discussion.comments.length > 0 ? (
                <div className="space-y-4">
                  {discussion.comments.map((c) => (
                    <div
                      key={c.id}
                      className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-800 space-y-1.5 hover:border-[#7F45DB] transition-colors"
                    >
                      {/* Comment Author Header */}
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-mono font-bold text-[10px] text-slate-700 dark:text-slate-300">
                          {c.author.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-mono font-bold text-xs text-[#0F172A] dark:text-white">
                          u/{c.author.name.replace(/\s+/g, "_").toLowerCase()}
                        </span>
                        {c.author.role && (
                          <span
                            className={`text-[8px] font-mono font-black uppercase px-1 py-0.2 rounded ${
                              c.author.role === "SUPER_ADMIN"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                                : c.author.role === "ADMIN"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {c.author.role.replace("_", " ")}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-[#9CA3AF]">
                          • {formatTimeAgo(c.createdAt)}
                        </span>
                      </div>

                      {/* Comment Content */}
                      <p className="text-xs text-[#374151] dark:text-[#D1D5DB] leading-relaxed font-sans pl-7 whitespace-pre-wrap">
                        {c.content}
                      </p>

                      {/* Comment Actions */}
                      <div className="flex items-center gap-3 pl-7 text-[11px] font-mono text-[#9CA3AF]">
                        {(c.isOwner ||
                          currentUser?.role === "ADMIN" ||
                          currentUser?.role === "SUPER_ADMIN") && (
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="text-rose-500 hover:text-rose-600 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center font-mono text-xs text-[#9CA3AF]">
                  No comments yet. Be the first to share your thoughts!
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* About Subreddit Card */}
            <div className="bg-white dark:bg-[#121824] border border-[#D1D5DB] dark:border-[#1F2937] rounded-xl overflow-hidden shadow-sm">
              <div className="h-14 bg-gradient-to-r from-[#7F45DB] to-[#A472F7] p-3 flex items-end">
                <span className="font-mono font-black text-white text-xs uppercase tracking-wider">
                  Community Info
                </span>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#7F45DB]/15 text-[#7F45DB] flex items-center justify-center font-mono font-black text-xs">
                    BV
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#0F172A] dark:text-white">
                      r/ByteVerse
                    </h3>
                    <p className="text-[10px] font-mono text-[#6B7280] dark:text-[#9CA3AF]">
                      Collegiate Algorithmic Hub
                    </p>
                  </div>
                </div>

                <p className="text-xs text-[#4B5563] dark:text-[#9CA3AF] leading-relaxed">
                  Community-driven discussion on time complexities, Fast I/O snippets, and contest strategy.
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#6B7280] dark:text-[#9CA3AF]">Post Score:</span>
                    <span className="font-bold text-[#7F45DB] dark:text-[#A472F7]">
                      ▲ {discussion.upvotes} upvotes
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280] dark:text-[#9CA3AF]">Views:</span>
                    <span className="font-bold text-[#0F172A] dark:text-white">
                      {discussion.views}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280] dark:text-[#9CA3AF]">Author College:</span>
                    <span className="font-bold text-[#0F172A] dark:text-white truncate max-w-[130px]">
                      {discussion.author.college}
                    </span>
                  </div>
                </div>

                <Link
                  href="/discussion"
                  className="w-full py-2 rounded-lg bg-slate-100 dark:bg-[#1A2234] hover:bg-slate-200 dark:hover:bg-[#253047] text-[#0F172A] dark:text-white font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Explore More Threads</span>
                </Link>
              </div>
            </div>

            {/* Posting Guidelines */}
            <div className="bg-white dark:bg-[#121824] border border-[#D1D5DB] dark:border-[#1F2937] rounded-xl p-4 shadow-sm space-y-2">
              <div className="flex items-center gap-1.5 font-mono font-bold text-xs uppercase text-[#0F172A] dark:text-white">
                <ShieldCheck className="w-4 h-4 text-[#7F45DB]" />
                <span>Discussion Policy</span>
              </div>
              <ul className="text-xs text-[#4B5563] dark:text-[#9CA3AF] space-y-1.5 list-disc list-inside font-medium leading-relaxed">
                <li>Upvotes only — constructive discourse.</li>
                <li>Verify your asymptotic time and space complexities.</li>
                <li>Cite external algorithmic references when applicable.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
