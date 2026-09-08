"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface EventItem {
  id: string;
  name: string;
  description: string | null;
  venue: string;
  category: string;
  startsAt: string | null;
  endsAt: string | null;
  registrationOpen: boolean;
  isActive: boolean;
  teamCount: number;
  rounds: { id: string; name: string; type: string; sequence: number }[];
  contests: { id: string; title: string; status: string }[];
}

export default function EventHubPage() {
  const [activeTab, setActiveTab] = useState<"ongoing" | "past">("ongoing");
  const [events, setEvents] = useState<{
    ongoing: EventItem[];
    past: EventItem[];
  }>({
    ongoing: [],
    past: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch("/api/events");
        if (res.ok) {
          const data = await res.json();
          setEvents({
            ongoing: data.ongoing || [],
            past: data.past || [],
          });
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const currentList = activeTab === "ongoing" ? events.ongoing : events.past;

  return (
    <main className="min-h-screen bg-[#F8F9FD] text-[#0F172A] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Banner */}
        <div className="bg-white border-2 border-[#1E1B4B] rounded-3xl p-6 sm:p-10 shadow-[6px_6px_0px_0px_#1E1B4B] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#7F45DB]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7F45DB]/10 text-[#7F45DB] border border-[#7F45DB]/30 text-xs font-mono font-black uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              <span>Campus & Community Events</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-black text-[#0F172A] tracking-tight">
              Tech Fests & Competitions
            </h1>
            <p className="text-sm sm:text-base text-[#6E6E6E] font-medium leading-relaxed">
              Explore college tournaments, hackathons, product showcases, and developer bootcamps. Register with your team, compete across multiple rounds, and win prizes.
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-3 border-b-2 border-[#1E1B4B]/10 pb-4">
          <button
            onClick={() => setActiveTab("ongoing")}
            className={`px-5 py-2.5 rounded-2xl font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-2 border-2 ${
              activeTab === "ongoing"
                ? "bg-[#7F45DB] text-white border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] font-black"
                : "bg-white text-[#6E6E6E] border-[#1E1B4B] hover:text-[#0F172A] font-bold shadow-[2px_2px_0px_0px_#1E1B4B]"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Ongoing & Upcoming Events ({events.ongoing.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("past")}
            className={`px-5 py-2.5 rounded-2xl font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-2 border-2 ${
              activeTab === "past"
                ? "bg-[#7F45DB] text-white border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] font-black"
                : "bg-white text-[#6E6E6E] border-[#1E1B4B] hover:text-[#0F172A] font-bold shadow-[2px_2px_0px_0px_#1E1B4B]"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Past Events Archive ({events.past.length})</span>
          </button>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="py-16 text-center font-mono text-sm text-[#6E6E6E] animate-pulse">
            Loading events directory...
          </div>
        ) : currentList.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {currentList.map((event) => {
              const startDate = event.startsAt ? new Date(event.startsAt) : null;
              const endDate = event.endsAt ? new Date(event.endsAt) : null;

              return (
                <div
                  key={event.id}
                  className="bg-white border-2 border-[#1E1B4B] rounded-3xl p-6 sm:p-8 shadow-[5px_5px_0px_0px_#1E1B4B] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#1E1B4B] transition-all"
                >
                  <div className="space-y-4 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-[#7F45DB] text-white border border-[#1E1B4B]">
                        {event.category}
                      </span>
                      {event.isActive && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>ACTIVE NOW</span>
                        </span>
                      )}
                      {event.registrationOpen && (
                        <span className="px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300">
                          Registration Open
                        </span>
                      )}
                    </div>

                    <div>
                      <h2 className="text-2xl font-display font-black text-[#0F172A]">
                        {event.name}
                      </h2>
                      <p className="text-sm text-[#6E6E6E] font-medium leading-relaxed mt-1">
                        {event.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#6E6E6E]">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#7F45DB]" />
                        <span className="font-bold text-[#0F172A]">{event.venue}</span>
                      </div>

                      {startDate && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-[#7F45DB]" />
                          <span>{startDate.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#7F45DB]" />
                        <span>{event.teamCount} Teams Registered</span>
                      </div>
                    </div>

                    {/* Associated Rounds or Contests badges */}
                    {event.rounds.length > 0 && (
                      <div className="pt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-mono uppercase text-[#6E6E6E] font-bold mr-1">Rounds:</span>
                        {event.rounds.map((r) => (
                          <span
                            key={r.id}
                            className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-lg bg-[#F8F9FD] text-[#0F172A] border border-[#1E1B4B]/20"
                          >
                            R{r.sequence}: {r.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row md:flex-col items-stretch md:items-end gap-3 shrink-0">
                    <Link
                      href={event.id === "byteverse-2026" ? "/team" : `/contest`}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#7F45DB] text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                    >
                      <span>{event.isActive ? "Join Event / Team" : "View Archive"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    {event.contests.length > 0 && (
                      <Link
                        href={`/contest/${event.contests[0].id}`}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white text-[#0F172A] font-mono font-bold text-xs uppercase border-2 border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B] hover:bg-[#F0F2F8]"
                      >
                        <Trophy className="w-3.5 h-3.5 text-[#7F45DB]" />
                        <span>Associated Contest</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border-2 border-[#1E1B4B] rounded-3xl p-12 text-center shadow-[4px_4px_0px_0px_#1E1B4B]">
            <Calendar className="w-10 h-10 text-[#7F45DB] mx-auto mb-3" />
            <h3 className="text-lg font-black text-[#0F172A]">No events in this category</h3>
            <p className="text-xs font-mono text-[#6E6E6E] mt-1">Check back soon for upcoming campus hackathons and fests!</p>
          </div>
        )}
      </div>
    </main>
  );
}
