"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Plus,
  Radio,
  MapPin,
  Tag,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Users,
  Trophy,
  Loader2,
  RefreshCw,
  Play,
  Pause,
  Square,
} from "lucide-react";

interface EventItem {
  id: string;
  name: string;
  description: string | null;
  venue: string | null;
  category: string | null;
  bannerUrl: string | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  registrationOpen: boolean;
  teamRegistrationOpen: boolean;
  createdAt: string;
  _count?: {
    teams: number;
    rounds: number;
    contests: number;
  };
}

export default function AdminEventsClient({ userRole }: { userRole: string }) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("Main Auditorium & Lab Complex");
  const [category, setCategory] = useState("College Championship");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [teamRegistrationOpen, setTeamRegistrationOpen] = useState(true);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/events");
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      setEvents(data);
    } catch (err: any) {
      setError(err.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openCreateModal = () => {
    setEditingEvent(null);
    setName("");
    setDescription("");
    setVenue("Main Auditorium & Lab Complex");
    setCategory("College Championship");
    setStartsAt(new Date().toISOString().slice(0, 16));
    setEndsAt(new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 16));
    setIsActive(true);
    setRegistrationOpen(true);
    setTeamRegistrationOpen(true);
    setModalOpen(true);
  };

  const openEditModal = (event: EventItem) => {
    setEditingEvent(event);
    setName(event.name);
    setDescription(event.description || "");
    setVenue(event.venue || "Main Auditorium & Lab Complex");
    setCategory(event.category || "College Championship");
    setStartsAt(event.startsAt ? new Date(event.startsAt).toISOString().slice(0, 16) : "");
    setEndsAt(event.endsAt ? new Date(event.endsAt).toISOString().slice(0, 16) : "");
    setIsActive(event.isActive);
    setRegistrationOpen(event.registrationOpen);
    setTeamRegistrationOpen(event.teamRegistrationOpen);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      if (editingEvent) {
        // PATCH
        const res = await fetch(`/api/admin/events/${editingEvent.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description,
            venue,
            category,
            startsAt: startsAt ? new Date(startsAt).toISOString() : null,
            endsAt: endsAt ? new Date(endsAt).toISOString() : null,
            isActive,
            registrationOpen,
            teamRegistrationOpen,
          }),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to update event");
        }
        setSuccessMsg(`Event "${name}" updated successfully!`);
      } else {
        // POST
        const res = await fetch("/api/admin/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description,
            venue,
            category,
            startsAt: startsAt ? new Date(startsAt).toISOString() : null,
            endsAt: endsAt ? new Date(endsAt).toISOString() : null,
            isActive,
            registrationOpen,
            teamRegistrationOpen,
          }),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to create event");
        }
        setSuccessMsg(`New Event "${name}" created and configured!`);
      }

      setModalOpen(false);
      fetchEvents();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const setEventLifecycle = async (
    event: EventItem,
    action: "ACTIVATE" | "PAUSE" | "END"
  ) => {
    try {
      let payload: Record<string, any> = {};
      if (action === "ACTIVATE") {
        payload = { isActive: true, registrationOpen: true };
      } else if (action === "PAUSE") {
        payload = { isActive: false, registrationOpen: false };
      } else if (action === "END") {
        payload = { isActive: false, registrationOpen: false, endsAt: new Date().toISOString() };
      }

      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update event lifecycle status");

      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id ? { ...e, ...payload } : e
        )
      );
      setSuccessMsg(
        `Event "${event.name}" has been successfully ${
          action === "ACTIVATE"
            ? "ACTIVATED & SET TO LIVE"
            : action === "PAUSE"
            ? "PAUSED (ON HOLD)"
            : "CONCLUDED & ENDED"
        }!`
      );
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to update event status");
    }
  };

  const ongoingEvents = events.filter((e) => e.isActive);
  const pastEvents = events.filter((e) => !e.isActive);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#7F45DB]/15 text-[#7F45DB] border border-[#7F45DB]/30 text-[10px] font-mono font-black uppercase">
              Event Administration
            </span>
            <span className="text-xs font-mono text-[#6E6E6E]">({userRole})</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight font-display">
            Events Manager
          </h1>
          <p className="text-xs text-[#6E6E6E] mt-1 font-mono">
            Control ongoing campus championships, manage venues, and add future events
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchEvents}
            className="p-2.5 rounded-xl border-2 border-[#1E1B4B] bg-white shadow-[2px_2px_0px_0px_#1E1B4B] hover:bg-[#F0F2F8] transition-all"
            title="Refresh events"
          >
            <RefreshCw className={`w-4 h-4 text-[#1E1B4B] ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl border-2 border-[#1E1B4B] bg-[#7F45DB] text-white font-mono font-black text-xs shadow-[3px_3px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#1E1B4B] transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>ADD NEW EVENT</span>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border-2 border-[#1E1B4B] bg-white shadow-[4px_4px_0px_0px_#1E1B4B]">
          <div className="text-[11px] font-mono uppercase font-bold text-[#6E6E6E] mb-1">
            Ongoing Active Events
          </div>
          <div className="text-3xl font-black font-mono text-[#7F45DB] flex items-center gap-2">
            <Radio className="w-6 h-6 text-emerald-600 animate-pulse" />
            {ongoingEvents.length}
          </div>
          <div className="text-[11px] font-mono text-[#6E6E6E] mt-1">
            Currently live on the platform
          </div>
        </div>

        <div className="p-5 rounded-2xl border-2 border-[#1E1B4B] bg-white shadow-[4px_4px_0px_0px_#1E1B4B]">
          <div className="text-[11px] font-mono uppercase font-bold text-[#6E6E6E] mb-1">
            Past / Concluded Events
          </div>
          <div className="text-3xl font-black font-mono text-[#0F172A]">
            {pastEvents.length}
          </div>
          <div className="text-[11px] font-mono text-[#6E6E6E] mt-1">
            Archived collegiate records
          </div>
        </div>

        <div className="p-5 rounded-2xl border-2 border-[#1E1B4B] bg-white shadow-[4px_4px_0px_0px_#1E1B4B]">
          <div className="text-[11px] font-mono uppercase font-bold text-[#6E6E6E] mb-1">
            Total Events Configured
          </div>
          <div className="text-3xl font-black font-mono text-[#0F172A]">
            {events.length}
          </div>
          <div className="text-[11px] font-mono text-[#6E6E6E] mt-1">
            Across all seasons
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold font-mono text-[#0F172A] flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#7F45DB]" />
          <span>All Events ({events.length})</span>
        </h2>

        {loading ? (
          <div className="p-12 text-center text-[#7F45DB] font-mono text-sm border-2 border-dashed border-[#1E1B4B]/20 rounded-2xl bg-white">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-[#6E6E6E] font-mono text-sm border-2 border-dashed border-[#1E1B4B]/20 rounded-2xl bg-white">
            No events found. Click &quot;ADD NEW EVENT&quot; above to create one!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {events.map((ev) => (
              <div
                key={ev.id}
                className={`p-6 rounded-2xl border-2 border-[#1E1B4B] bg-white shadow-[4px_4px_0px_0px_#1E1B4B] transition-all ${
                  ev.isActive ? "ring-2 ring-[#7F45DB]/50" : ""
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {ev.isActive ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border-2 border-emerald-500 font-mono text-xs font-black flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#1E1B4B]">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                          ONGOING / LIVE
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-[#F0F2F8] text-[#6E6E6E] border-2 border-[#1E1B4B]/20 font-mono text-xs font-bold">
                          CONCLUDED / INACTIVE
                        </span>
                      )}

                      <span className="px-2.5 py-0.5 rounded-lg bg-[#7F45DB]/10 text-[#4A2293] border border-[#7F45DB]/30 font-mono text-xs font-bold">
                        {ev.category || "Championship"}
                      </span>

                      <span className="text-xs font-mono text-[#6E6E6E]">
                        ID: <code className="text-[#0F172A] font-bold">{ev.id}</code>
                      </span>
                    </div>

                    <h3 className="text-2xl font-extrabold text-[#0F172A] font-display">
                      {ev.name}
                    </h3>

                    {ev.description && (
                      <p className="text-xs text-[#6E6E6E] line-clamp-2 leading-relaxed">
                        {ev.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs font-mono text-[#6E6E6E] flex-wrap pt-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#7F45DB]" />
                        <span>{ev.venue || "Campus Labs"}</span>
                      </div>

                      {ev.startsAt && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>
                            {new Date(ev.startsAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pl-2 border-l border-[#1E1B4B]/20">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-cyan-600" />
                          <strong>{ev._count?.teams ?? 0}</strong> Teams
                        </span>
                        <span className="flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5 text-amber-600" />
                          <strong>{ev._count?.rounds ?? 0}</strong> Rounds
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap border-t lg:border-t-0 pt-4 lg:pt-0 border-[#1E1B4B]/10">
                    {!ev.isActive ? (
                      <button
                        onClick={() => setEventLifecycle(ev, "ACTIVATE")}
                        className="px-3.5 py-2 rounded-xl border-2 border-[#1E1B4B] bg-emerald-500 text-white font-mono font-black text-xs shadow-[2px_2px_0px_0px_#1E1B4B] hover:bg-emerald-600 hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-1.5"
                        title="Publish and make this event live"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>ACTIVATE / LIVE</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setEventLifecycle(ev, "PAUSE")}
                          className="px-3.5 py-2 rounded-xl border-2 border-[#1E1B4B] bg-amber-400 text-[#1E1B4B] font-mono font-black text-xs shadow-[2px_2px_0px_0px_#1E1B4B] hover:bg-amber-500 hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-1.5"
                          title="Temporarily hold or pause this event"
                        >
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>PAUSE</span>
                        </button>

                        <button
                          onClick={() => setEventLifecycle(ev, "END")}
                          className="px-3.5 py-2 rounded-xl border-2 border-[#1E1B4B] bg-rose-500 text-white font-mono font-black text-xs shadow-[2px_2px_0px_0px_#1E1B4B] hover:bg-rose-600 hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-1.5"
                          title="Conclude and mark event as ended"
                        >
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>END EVENT</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => openEditModal(ev)}
                      className="px-3.5 py-2 rounded-xl border-2 border-[#1E1B4B] bg-white font-mono font-bold text-xs text-[#0F172A] shadow-[2px_2px_0px_0px_#1E1B4B] hover:bg-[#F0F2F8] transition-all"
                    >
                      Edit
                    </button>

                    <Link
                      href="/admin/rounds"
                      className="px-3 py-2 rounded-xl border-2 border-[#1E1B4B] bg-violet-50 text-[#7F45DB] font-mono font-bold text-xs shadow-[2px_2px_0px_0px_#1E1B4B] hover:bg-violet-100 transition-all flex items-center gap-1"
                      title="Manage event rounds and challenge problems"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Rounds</span>
                    </Link>

                    <Link
                      href="/event"
                      target="_blank"
                      className="p-2 rounded-xl border-2 border-[#1E1B4B] bg-white text-[#6E6E6E] hover:text-[#0F172A] shadow-[2px_2px_0px_0px_#1E1B4B] hover:bg-[#F0F2F8] transition-all"
                      title="View public event page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1E1B4B]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-4 border-[#1E1B4B] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-[8px_8px_0px_0px_#1E1B4B] my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b-2 border-[#1E1B4B]/10 mb-6">
              <h3 className="text-xl font-black font-mono text-[#0F172A] uppercase">
                {editingEvent ? "Edit Event Details" : "Create New Event"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg border-2 border-[#1E1B4B] hover:bg-[#F0F2F8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold text-[#0F172A] uppercase mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ByteVerse 2026 Championship"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-[#1E1B4B] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#7F45DB]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#0F172A] uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Overview of the competition, theme, and rounds..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-[#1E1B4B] font-sans text-xs focus:outline-none focus:ring-2 focus:ring-[#7F45DB]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#0F172A] uppercase mb-1">
                    Venue / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Main Auditorium & Lab 3"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-[#1E1B4B] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#7F45DB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#0F172A] uppercase mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. College Championship"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-[#1E1B4B] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#7F45DB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#0F172A] uppercase mb-1">
                    Starts At
                  </label>
                  <input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-[#1E1B4B] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#7F45DB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#0F172A] uppercase mb-1">
                    Ends At
                  </label>
                  <input
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-[#1E1B4B] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#7F45DB]"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#1E1B4B]/10 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#7F45DB] rounded border-2 border-[#1E1B4B] focus:ring-0"
                  />
                  <span className="text-xs font-mono font-bold text-[#0F172A]">
                    Mark as ONGOING / ACTIVE (Visible on live homepage)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={registrationOpen}
                    onChange={(e) => setRegistrationOpen(e.target.checked)}
                    className="w-4 h-4 text-[#7F45DB] rounded border-2 border-[#1E1B4B] focus:ring-0"
                  />
                  <span className="text-xs font-mono text-[#0F172A]">
                    Enable Individual Registration
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={teamRegistrationOpen}
                    onChange={(e) => setTeamRegistrationOpen(e.target.checked)}
                    className="w-4 h-4 text-[#7F45DB] rounded border-2 border-[#1E1B4B] focus:ring-0"
                  />
                  <span className="text-xs font-mono text-[#0F172A]">
                    Enable Team Creation & Invites
                  </span>
                </label>
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
                  <span>{editingEvent ? "SAVE CHANGES" : "CREATE EVENT"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
