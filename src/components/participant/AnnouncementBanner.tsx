"use client";

import { useEffect, useState, useCallback } from "react";
import { Megaphone, X, Pin, Bell } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  body: string;
  isPinned: boolean;
  createdAt: string;
}

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Load dismissed IDs from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("bv_dismissed_announcements");
      if (stored) {
        setDismissedIds(new Set(JSON.parse(stored)));
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch("/api/announcements");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.announcements) && data.announcements.length > 0) {
          setAnnouncements(data.announcements);
          // Find most recent announcement that is either pinned or un-dismissed
          const latest = data.announcements[0];
          setActiveAnnouncement((prev) => {
            if (!prev || prev.id !== latest.id) {
              setIsDismissed(false); // Pop open for fresh announcements!
            }
            return latest;
          });
        }
      }
    } catch {
      // ignore network errors
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 8000); // 8-second polling
    return () => clearInterval(interval);
  }, [fetchAnnouncements]);

  const handleDismiss = (id: string) => {
    setIsDismissed(true);
    const updated = new Set(dismissedIds);
    updated.add(id);
    setDismissedIds(updated);
    try {
      sessionStorage.setItem("bv_dismissed_announcements", JSON.stringify(Array.from(updated)));
    } catch {
      // ignore
    }
  };

  if (!activeAnnouncement || (isDismissed && dismissedIds.has(activeAnnouncement.id))) {
    // If there's an announcement but it's dismissed, show a small floating bell in bottom-left corner
    if (activeAnnouncement) {
      return (
        <div className="fixed bottom-4 left-4 z-40">
          <button
            onClick={() => setIsDismissed(false)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1E1B4B] text-white border-2 border-[#7F45DB] shadow-[3px_3px_0px_0px_#7F45DB] hover:translate-x-0.5 hover:translate-y-0.5 text-xs font-mono font-bold cursor-pointer transition-all animate-bounce"
            title="View latest announcement"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Announcement ({new Date(activeAnnouncement.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
          </button>
        </div>
      );
    }
    return null;
  }

  const isUrgent = activeAnnouncement.isPinned;

  return (
    <aside
      aria-label="Tournament Announcement"
      className={`fixed top-0 left-0 right-0 z-50 p-3 sm:px-6 sm:py-2.5 transition-all animate-in slide-in-from-top duration-300 border-b-4 shadow-xl ${
        isUrgent
          ? "bg-[#1E1B4B] border-amber-500 text-white shadow-amber-500/20"
          : "bg-[#0F172A] border-[#7F45DB] text-white shadow-purple-900/30"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-start sm:items-center justify-between gap-3 font-mono">
        {/* Left: Icon & Badge */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
            isUrgent
              ? "bg-amber-500/20 border-amber-400 text-amber-400"
              : "bg-[#7F45DB]/20 border-[#7F45DB] text-purple-300"
          }`}>
            <Megaphone className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                isUrgent ? "bg-amber-400 text-black" : "bg-[#7F45DB] text-white"
              }`}>
                {isUrgent ? "⚠️ URGENT ANNOUNCEMENT" : "📢 TOURNAMENT ALERT"}
              </span>
              <span className="text-[10px] text-gray-400">
                {new Date(activeAnnouncement.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <strong className="text-xs sm:text-sm font-bold font-display text-white mt-0.5 tracking-tight">
              {activeAnnouncement.title}
            </strong>
          </div>
        </div>

        {/* Center: Body message */}
        <div className="hidden md:block flex-1 text-xs text-gray-200 pl-4 border-l border-white/10 max-h-12 overflow-y-auto leading-relaxed">
          {activeAnnouncement.body}
        </div>

        {/* Right: Close button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleDismiss(activeAnnouncement.id)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20 cursor-pointer"
            title="Dismiss announcement"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile message body view */}
      <div className="block md:hidden text-xs text-gray-200 mt-2 pt-2 border-t border-white/10 leading-relaxed">
        {activeAnnouncement.body}
      </div>
    </aside>
  );
}
