"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Clock,
  User,
  Trash2,
  Edit2,
  Send,
  Eye,
  Check,
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

  const [discussion, setDiscussion] = useState<DiscussionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Edit post state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

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

  const handleVote = async (val: number) => {
    if (!discussion) return;
    try {
      const res = await fetch(`/api/discussions/${discussionId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: val }),
      });
      if (res.ok) {
        const data = await res.json();
        setDiscussion((prev) => (prev ? { ...prev, upvotes: data.upvotes, userVote: data.userVote } : null));
      }
    } catch {
      // ignore
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
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

  if (loading) {
    return (
      <main className="min-h-screen bg-transparent flex items-center justify-center font-mono text-sm text-[#6E6E6E] dark:text-[#94A3B8]">
        Loading discussion thread...
      </main>
    );
  }

  if (!discussion) {
    return (
      <main className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 space-y-4">
        <h1 className="text-2xl font-black text-[#0F172A] dark:text-white">Discussion Not Found</h1>
        <Link href="/discussion" className="px-5 py-2.5 rounded-xl bg-[#7F45DB] text-white font-mono font-bold text-xs uppercase">
          Back to Discussions
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent text-[#0F172A] dark:text-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-500">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          href="/discussion"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#6E6E6E] hover:text-[#0F172A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all discussions</span>
        </Link>

        {/* Main Post Card */}
        <div className="bg-white border-2 border-[#1E1B4B] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#1E1B4B] space-y-6">
          <div className="flex items-start gap-4">
            {/* Upvote Pill */}
            <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-[#F8F9FD] border-2 border-[#1E1B4B] min-w-[50px] shrink-0">
              <button
                onClick={() => handleVote(1)}
                className={`p-1 rounded hover:bg-[#EAEAEA] transition-colors ${
                  discussion.userVote === 1 ? "text-[#7F45DB]" : "text-[#6E6E6E]"
                }`}
              >
                <ArrowBigUp className={`w-6 h-6 ${discussion.userVote === 1 ? "fill-[#7F45DB]" : ""}`} />
              </button>
              <span className="text-sm font-mono font-black text-[#0F172A]">
                {discussion.upvotes}
              </span>
              <button
                onClick={() => handleVote(-1)}
                className={`p-1 rounded hover:bg-[#EAEAEA] transition-colors ${
                  discussion.userVote === -1 ? "text-rose-600" : "text-[#6E6E6E]"
                }`}
              >
                <ArrowBigDown className={`w-6 h-6 ${discussion.userVote === -1 ? "fill-rose-600" : ""}`} />
              </button>
            </div>

            {/* Post Header & Body */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {discussion.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#7F45DB]/10 text-[#7F45DB] border border-[#7F45DB]/20"
                    >
                      #{t}
                    </span>
                  ))}
                  {discussion.problem && (
                    <Link
                      href={`/practice/${discussion.problem.id}`}
                      className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:underline"
                    >
                      Problem: {discussion.problem.title}
                    </Link>
                  )}
                </div>

                {discussion.isOwner && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#7F45DB] hover:underline"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{isEditing ? "Cancel" : "Edit"}</span>
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3 pt-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F9FD] border-2 border-[#1E1B4B] font-mono text-sm font-bold"
                  />
                  <textarea
                    rows={6}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F9FD] border-2 border-[#1E1B4B] font-mono text-xs"
                  />
                  <button
                    onClick={handleSaveEdit}
                    disabled={savingEdit}
                    className="px-4 py-2 rounded-xl bg-[#7F45DB] text-white font-mono font-bold text-xs uppercase"
                  >
                    {savingEdit ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-display font-black text-[#0F172A]">
                    {discussion.title}
                  </h1>

                  <div className="text-sm text-[#0F172A] font-sans leading-relaxed whitespace-pre-wrap">
                    {discussion.content}
                  </div>
                </>
              )}

              {/* Author & Telemetry footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#1E1B4B]/10 text-xs font-mono text-[#6E6E6E]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0F172A]">{discussion.author.name}</span>
                  <span>({discussion.author.college})</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(discussion.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-[#7F45DB]" />
                    {discussion.views} views
                  </span>
                  <span className="flex items-center gap-1 font-bold text-[#0F172A]">
                    <MessageSquare className="w-3.5 h-3.5 text-[#7F45DB]" />
                    {discussion.comments.length} comments
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white border-2 border-[#1E1B4B] rounded-3xl p-6 sm:p-8 shadow-[5px_5px_0px_0px_#1E1B4B] space-y-6">
          <h2 className="text-lg font-mono font-black uppercase text-[#0F172A] flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#7F45DB]" />
            <span>Comments ({discussion.comments.length})</span>
          </h2>

          {/* New Comment Input */}
          <form onSubmit={handleAddComment} className="space-y-3">
            <textarea
              required
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Join the discussion... Share code, feedback, or ask a question."
              className="w-full p-4 rounded-2xl bg-[#F8F9FD] border-2 border-[#1E1B4B]/20 font-mono text-xs text-[#0F172A] focus:outline-none focus:border-[#7F45DB]"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingComment || !newComment.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7F45DB] text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none disabled:opacity-50 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingComment ? "Posting..." : "Post Comment"}</span>
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4 pt-4 border-t border-[#1E1B4B]/10">
            {discussion.comments.length > 0 ? (
              discussion.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 rounded-2xl bg-[#F8F9FD] border border-[#1E1B4B]/20 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0F172A]">{comment.author.name}</span>
                      <span className="text-[#6E6E6E]">({comment.author.college})</span>
                      <span className="text-[#6E6E6E]">·</span>
                      <span className="text-[#6E6E6E]">
                        {new Date(comment.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </span>
                    </div>

                    {comment.isOwner && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-rose-600 hover:text-rose-800 p-1"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-[#0F172A] font-sans leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs font-mono text-[#6E6E6E]">
                No comments yet. Start the conversation above!
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
