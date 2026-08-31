"use client";

import { useEffect, useState } from "react";
import { Megaphone, Pin, Send, Clock } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  body: string;
  isPinned: boolean;
  createdAt: string;
}

export default function AdminAnnouncementsClient() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState("");

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/admin/announcements");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data.announcements ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, isPinned }),
      });
      if (res.ok) {
        setTitle("");
        setBody("");
        setIsPinned(false);
        setMessage("Announcement broadcasted successfully to all live workstations!");
        fetchAnnouncements();
      } else {
        const data = await res.json();
        setMessage(data.error ?? "Failed to publish announcement.");
      }
    } catch {
      setMessage("Error publishing announcement.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold text-[#0F172A] uppercase tracking-tight font-display">
          Live Announcements Broadcast
        </h1>
        <p className="text-[#6E6E6E] text-xs mt-1 font-mono">
          Broadcast alerts and notifications in real-time to all connected participant workstations
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl text-xs font-bold bg-[#7F45DB]/10 border-2 border-[#1E1B4B] text-[#4A2293] shadow-[3px_3px_0px_0px_#1E1B4B] font-mono">
          {message}
        </div>
      )}

      {/* Broadcast Form */}
      <form onSubmit={handlePublish} className="bg-white p-6 md:p-8 rounded-2xl border-2 border-[#1E1B4B] shadow-[5px_5px_0px_0px_#1E1B4B] space-y-4">
        <h2 className="text-lg font-bold text-[#0F172A] uppercase font-display flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-[#7F45DB]" />
          <span>Broadcast New Announcement</span>
        </h2>
        <div>
          <label className="text-xs text-[#0F172A] font-extrabold uppercase tracking-wider block mb-1.5 font-mono">
            Announcement Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Round 1 has commenced! 20 minutes on the clock."
            className="w-full bg-[#F8F9FD] text-[#0F172A] rounded-xl px-4 py-3 text-xs font-mono border-2 border-[#1E1B4B] focus:outline-none focus:border-[#7F45DB] transition-all"
          />
        </div>
        <div>
          <label className="text-xs text-[#0F172A] font-extrabold uppercase tracking-wider block mb-1.5 font-mono">
            Message Body
          </label>
          <textarea
            required
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Enter announcement details, instructions, or clarifications..."
            className="w-full bg-[#F8F9FD] text-[#0F172A] rounded-xl px-4 py-3 text-xs font-mono border-2 border-[#1E1B4B] focus:outline-none focus:border-[#7F45DB] resize-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPinned"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            className="w-4 h-4 rounded border-2 border-[#1E1B4B] accent-[#7F45DB] cursor-pointer"
          />
          <label htmlFor="isPinned" className="text-xs text-[#0F172A] cursor-pointer font-bold font-mono">
            Pin as urgent banner on participant screens
          </label>
        </div>
        <button
          type="submit"
          disabled={publishing}
          className="w-full sm:w-auto px-8 py-3 text-xs font-mono font-black uppercase tracking-wider bg-[#7F45DB] hover:bg-[#6D35C7] text-white rounded-xl border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#1E1B4B] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>{publishing ? "Broadcasting..." : "Broadcast Announcement"}</span>
        </button>
      </form>

      {/* Existing Announcements */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-[#0F172A] uppercase font-display">Broadcast History</h2>
        {loading ? (
          <div className="text-xs text-[#6E6E6E] font-mono">Loading announcements...</div>
        ) : announcements.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border-2 border-[#1E1B4B] text-center text-xs text-[#6E6E6E] font-mono shadow-[3px_3px_0px_0px_#1E1B4B]">
            No announcements broadcasted yet.
          </div>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="bg-white p-5 rounded-2xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {a.isPinned && (
                    <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-400 flex items-center gap-1">
                      <Pin className="w-3 h-3 text-amber-700" /> PINNED
                    </span>
                  )}
                  <h3 className="text-base font-bold text-[#0F172A]">{a.title}</h3>
                </div>
                <span className="text-[11px] font-mono text-[#6E6E6E] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#8A8A8A]" />
                  {new Date(a.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-xs text-[#6E6E6E] leading-relaxed whitespace-pre-wrap">{a.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
