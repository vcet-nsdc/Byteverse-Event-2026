"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Users, UserPlus, LogIn, CheckCircle2, Copy, Trash2, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

interface TeamInfo {
  id: string;
  name: string;
  inviteCode: string;
  status: string;
  members: Array<{ name: string; email: string; college?: string | null; isLeader: boolean }>;
  userIsLeader: boolean;
}

async function loadTeam(): Promise<TeamInfo | null> {
  const response = await fetch("/api/teams/mine");
  if (!response.ok) return null;
  const data = await response.json();
  if (!data.teamId) return null;
  return {
    id: data.teamId,
    name: data.teamName,
    inviteCode: data.inviteCode,
    status: data.status,
    members: data.members ?? [],
    userIsLeader: Boolean(data.userIsLeader),
  };
}

async function getRoundInterface() {
  const response = await fetch("/api/rounds/current");
  if (!response.ok) return null;
  const data = await response.json();
  return (data.roundId ?? null) as string | null;
}

export default function TeamPage() {
  const [team, setTeam] = useState<TeamInfo | null>(null);
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");
  const [teamName, setTeamName] = useState("");
  const [leaderFirstName, setLeaderFirstName] = useState("");
  const [leaderLastName, setLeaderLastName] = useState("");
  const [leaderEmail, setLeaderEmail] = useState("");
  const [leaderCollege, setLeaderCollege] = useState("");
  const [memberFirstName, setMemberFirstName] = useState("");
  const [memberLastName, setMemberLastName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberCollege, setMemberCollege] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [disbanding, setDisbanding] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadTeam().then((loadedTeam) => {
      setTeam(loadedTeam);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!team || team.status === "ACTIVE") return;
    const interval = window.setInterval(async () => {
      const latestTeam = await loadTeam();
      if (latestTeam) setTeam(latestTeam);
    }, 3000);
    return () => window.clearInterval(interval);
  }, [team]);

  async function disbandTeam() {
    const promptMsg = team?.userIsLeader
      ? "Are you sure you want to delete and disband this team? Both members will be freed to create or join a new team."
      : "Are you sure you want to leave this team?";
    if (!window.confirm(promptMsg)) return;

    setDisbanding(true);
    setMessage("");
    try {
      const response = await fetch("/api/teams", { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? "Failed to delete team.");
        setDisbanding(false);
        return;
      }
      setTeam(null);
      setMessage(data.message ?? "Team disbanded successfully.");
      window.location.reload();
    } catch {
      setMessage("Error processing request.");
      setDisbanding(false);
    }
  }

  async function createTeam(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setMessage("");
    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teamName,
          leaderFirstName,
          leaderLastName,
          leaderEmail,
          college: leaderCollege,
          eventId: process.env.NEXT_PUBLIC_EVENT_ID ?? "byteverse-2026",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        let error = typeof data.error === "string" ? data.error : "Failed to create team.";
        if (error.includes("prisma") || error.includes("constraint") || error.includes("invocation")) {
          error = "Please re-enter your team details and try again.";
        }
        setMessage(error);
        setCreating(false);
        return;
      }
      if (data.autoAuth) {
        await signIn("credentials", { email: data.autoAuth.email, password: data.autoAuth.password, redirect: false });
      }
      window.location.reload();
    } catch {
      setMessage("Failed to create team. Please try again.");
      setCreating(false);
    }
  }

  async function joinTeam(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setJoining(true);
    setMessage("");
    try {
      const response = await fetch("/api/teams/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          inviteCode, 
          firstName: memberFirstName, 
          lastName: memberLastName, 
          email: memberEmail,
          college: memberCollege,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        let error = typeof data.error === "string" ? data.error : "Failed to join team.";
        if (error.includes("prisma") || error.includes("constraint") || error.includes("invocation")) {
          error = "Could not join team. Please check the invite code and try again.";
        }
        setMessage(error);
        setJoining(false);
        return;
      }
      if (data.autoAuth) {
        await signIn("credentials", { email: data.autoAuth.email, password: data.autoAuth.password, redirect: false });
      }
      window.location.reload();
    } catch {
      setMessage("Failed to join team. Please verify your invite code.");
      setJoining(false);
    }
  }

  async function verifyTeam() {
    setVerifying(true);
    setMessage("");
    try {
      const response = await fetch("/api/teams/verify", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? "Failed to verify team.");
        setVerifying(false);
        return;
      }
      // Keep participant on the page: update team state so the Verified badge and large Proceed button display
      setTeam((prev) => (prev ? { ...prev, status: "ACTIVE" } : null));
    } catch {
      setMessage("Error verifying team.");
    } finally {
      setVerifying(false);
    }
  }

  function handleCopyCode() {
    if (!team) return;
    navigator.clipboard.writeText(team.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-transparent font-mono text-[#7F45DB] font-bold">
        Loading team registration portal...
      </main>
    );
  }

  const memberCount = team?.members.length ?? 0;
  const isComplete = memberCount >= 2;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-transparent text-[#0F172A] dark:text-[#F8FAFC] font-sans transition-colors duration-500">
      <div className="max-w-3xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-[#1E1B4B] bg-[#7F45DB]/10 text-[#4A2293] text-xs font-mono font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#1E1B4B]">
            <span className="w-2 h-2 rounded-full bg-[#7F45DB] animate-pulse" />
            ByteClash 2026 · Registration Portal
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] uppercase tracking-tight font-display">
            Assemble Your Team
          </h1>
          <p className="text-[#6E6E6E] text-xs sm:text-sm max-w-lg mx-auto font-medium">
            Each team consists of exactly 2 members. Register your team as Captain or enter an invite code to join your teammate.
          </p>
        </div>

        {message && (
          <div className="bg-white p-4 rounded-xl text-center text-xs font-bold text-[#7F45DB] border-2 border-[#1E1B4B] shadow-[3px_3px_0px_0px_#1E1B4B] font-mono">
            {message}
          </div>
        )}

        {/* Existing Team State */}
        {team ? (
          <div className="bg-white p-8 rounded-2xl border-2 border-[#1E1B4B] shadow-[6px_6px_0px_0px_#1E1B4B] space-y-6">
            {/* Verified Status Banner */}
            {team.status === "ACTIVE" && (
              <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-500 shadow-[3px_3px_0px_0px_#10B981] flex items-center gap-3.5 animate-in fade-in">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center border-2 border-[#1E1B4B] shadow-[2px_2px_0px_0px_#1E1B4B] shrink-0">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 font-mono font-black text-[10px] uppercase tracking-wider">
                    TEAM VERIFIED ✓
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-[#0F172A] font-display mt-0.5">
                    Your team is verified & authorized for ByteClash 2026!
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-b-2 border-[#1E1B4B]/10 pb-4 flex-wrap gap-4">
              <div>
                <div className="text-xs text-[#6E6E6E] uppercase font-mono font-bold">Your Team</div>
                <div className="text-3xl font-extrabold text-[#0F172A] font-display">{team.name}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#6E6E6E] uppercase font-mono font-bold">Team Invite Code</div>
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F0F2F8] border-2 border-[#1E1B4B] text-[#7F45DB] font-mono font-black text-lg tracking-widest hover:bg-[#E2E8F0] transition-all cursor-pointer mt-1"
                  title="Click to copy code"
                >
                  <span>{team.inviteCode}</span>
                  <Copy className="w-4 h-4 text-[#7F45DB]" />
                </button>
                {copied && <div className="text-[10px] text-emerald-600 font-bold font-mono mt-0.5">Copied to clipboard!</div>}
              </div>
            </div>

            {/* Team Roster */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#0F172A] uppercase tracking-wider">
                  Team Roster ({memberCount}/2)
                </span>
                <span
                  className={`text-xs font-mono font-bold px-3 py-1 rounded-full border-2 border-[#1E1B4B] ${isComplete
                      ? "bg-emerald-100 text-emerald-800 shadow-[2px_2px_0px_0px_#1E1B4B]"
                      : "bg-amber-100 text-amber-800 shadow-[2px_2px_0px_0px_#1E1B4B]"
                    }`}
                >
                  {isComplete ? "2/2 Members Ready" : "1/2 Member Waiting"}
                </span>
              </div>
              <div className="space-y-2">
                {team.members.map((m) => (
                  <div
                    key={m.email}
                    className="flex items-center justify-between p-3.5 bg-[#F8F9FD] rounded-xl text-sm border-2 border-[#1E1B4B]"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-[#7F45DB] shrink-0" />
                      <div>
                        <div className="text-[#0F172A] font-bold">{m.name || m.email}</div>
                        {m.college && (
                          <div className="text-[11px] text-[#6E6E6E] font-mono">{m.college}</div>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-lg font-mono font-black ${m.isLeader
                          ? "bg-[#7F45DB] text-white border border-[#1E1B4B]"
                          : "bg-white text-[#0F172A] border border-[#1E1B4B]"
                        }`}
                    >
                      {m.isLeader ? "Captain" : "Member"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t-2 border-[#1E1B4B]/10">
              {team.status === "ACTIVE" ? (
                /* VERIFIED TEAM: Single Large Prominent Proceed Button */
                <button
                  onClick={async () => {
                    const roundId = await getRoundInterface();
                    if (roundId) window.location.assign(`/rounds/${roundId}`);
                  }}
                  className="w-full py-4 rounded-2xl bg-[#7F45DB] hover:bg-[#6D35C7] text-white font-mono font-black text-sm sm:text-base uppercase tracking-wider border-2 border-[#1E1B4B] shadow-[5px_5px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1E1B4B] transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>PROCEED TO AGREEMENT & ARENA ➔</span>
                </button>
              ) : (
                /* PENDING TEAM: Disband & Verify Controls */
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <button
                    onClick={disbandTeam}
                    disabled={disbanding}
                    className="px-4 py-2.5 rounded-xl border-2 border-destructive text-destructive bg-white hover:bg-destructive/10 text-xs font-mono font-bold flex items-center gap-2 shadow-[2px_2px_0px_0px_#EF4444] transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{team.userIsLeader ? "Disband Team" : "Leave Team"}</span>
                  </button>

                  {team.userIsLeader ? (
                    isComplete ? (
                      <button
                        onClick={verifyTeam}
                        disabled={verifying}
                        className="px-8 py-3 rounded-xl bg-[#7F45DB] hover:bg-[#6D35C7] text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1E1B4B] transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{verifying ? "Verifying..." : "Verify Team & Enter Tournament"}</span>
                      </button>
                    ) : (
                      <div className="text-xs font-mono font-bold text-[#6E6E6E] bg-[#F0F2F8] px-4 py-2 rounded-xl border border-[#E2E8F0]">
                        Share Invite Code with your teammate to complete the crew
                      </div>
                    )
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-800 bg-amber-50 px-4 py-2.5 rounded-xl border-2 border-amber-300 shadow-[2px_2px_0px_0px_#D97706]">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span>Team Ready · Waiting for Captain to verify team...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Registration Form: Create vs Join Tabs */
          <div className="bg-white rounded-2xl border-2 border-[#1E1B4B] shadow-[6px_6px_0px_0px_#1E1B4B] overflow-hidden">
            {/* Tab Headers */}
            <div className="grid grid-cols-2 border-b-2 border-[#1E1B4B] bg-[#F0F2F8] text-xs font-mono font-extrabold">
              <button
                onClick={() => setActiveTab("create")}
                className={`py-3.5 flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === "create"
                    ? "bg-white text-[#7F45DB] border-b-2 border-[#7F45DB] shadow-sm"
                    : "text-[#6E6E6E] hover:text-[#0F172A]"
                  }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Create New Team (Captain)</span>
              </button>
              <button
                onClick={() => setActiveTab("join")}
                className={`py-3.5 flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === "join"
                    ? "bg-white text-[#7F45DB] border-b-2 border-[#7F45DB] shadow-sm"
                    : "text-[#6E6E6E] hover:text-[#0F172A]"
                  }`}
              >
                <LogIn className="w-4 h-4" />
                <span>Join Team via Code</span>
              </button>
            </div>

            <div className="p-6 md:p-8">
              {activeTab === "create" ? (
                /* CREATE TEAM FORM */
                <form onSubmit={createTeam} className="space-y-4">
                  <div>
                    <label className="text-xs text-[#0F172A] font-extrabold uppercase tracking-wider block mb-1.5 font-mono">
                      Team Name
                    </label>
                    <input
                      type="text"
                      required
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="e.g. Binary Beasts"
                      className="w-full bg-[#F8F9FD] text-[#0F172A] rounded-xl px-4 py-3 text-xs font-mono border-2 border-[#1E1B4B] focus:outline-none focus:border-[#7F45DB] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-[#0F172A] font-extrabold uppercase tracking-wider block mb-1.5 font-mono">
                        Captain First Name
                      </label>
                      <input
                        type="text"
                        required
                        value={leaderFirstName}
                        onChange={(e) => setLeaderFirstName(e.target.value)}
                        placeholder="Alex"
                        className="w-full bg-[#F8F9FD] text-[#0F172A] rounded-xl px-4 py-3 text-xs font-mono border-2 border-[#1E1B4B] focus:outline-none focus:border-[#7F45DB] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#0F172A] font-extrabold uppercase tracking-wider block mb-1.5 font-mono">
                        Captain Last Name
                      </label>
                      <input
                        type="text"
                        required
                        value={leaderLastName}
                        onChange={(e) => setLeaderLastName(e.target.value)}
                        placeholder="Mercer"
                        className="w-full bg-[#F8F9FD] text-[#0F172A] rounded-xl px-4 py-3 text-xs font-mono border-2 border-[#1E1B4B] focus:outline-none focus:border-[#7F45DB] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-[#0F172A] font-extrabold uppercase tracking-wider block mb-1.5 font-mono">
                      Captain Email
                    </label>
                    <input
                      type="email"
                      required
                      value={leaderEmail}
                      onChange={(e) => setLeaderEmail(e.target.value)}
                      placeholder="alex@college.edu"
                      className="w-full bg-[#F8F9FD] text-[#0F172A] rounded-xl px-4 py-3 text-xs font-mono border-2 border-[#1E1B4B] focus:outline-none focus:border-[#7F45DB] transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#0F172A] font-extrabold uppercase tracking-wider block mb-1.5 font-mono">
                      College / Institution Name
                    </label>
                    <input
                      type="text"
                      required
                      value={leaderCollege}
                      onChange={(e) => setLeaderCollege(e.target.value)}
                      placeholder="e.g. VCET / NSDC College of Engineering"
                      className="w-full bg-[#F8F9FD] text-[#0F172A] rounded-xl px-4 py-3 text-xs font-mono border-2 border-[#1E1B4B] focus:outline-none focus:border-[#7F45DB] transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={creating}
                    className="w-full py-3.5 text-xs font-mono font-black uppercase tracking-wider bg-[#7F45DB] hover:bg-[#6D35C7] text-white rounded-xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1E1B4B] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    <span>{creating ? "Creating Team..." : "Create Team & Get Invite Code"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* JOIN TEAM FORM */
                <form onSubmit={joinTeam} className="space-y-4">
                  <div>
                    <label className="text-xs text-[#0F172A] font-extrabold uppercase tracking-wider block mb-1.5 font-mono">
                      Team Invite Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={8}
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.trim().toUpperCase())}
                      placeholder="Enter 8-digit code (e.g. 74829103)"
                      className="w-full bg-[#F8F9FD] text-[#0F172A] rounded-xl px-4 py-3 text-sm font-mono border-2 border-[#1E1B4B] focus:outline-none focus:border-[#7F45DB] transition-all tracking-widest font-black"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-[#0F172A] font-extrabold uppercase tracking-wider block mb-1.5 font-mono">
                        Your First Name
                      </label>
                      <input
                        type="text"
                        required
                        value={memberFirstName}
                        onChange={(e) => setMemberFirstName(e.target.value)}
                        placeholder="Jordan"
                        className="w-full bg-[#F8F9FD] text-[#0F172A] rounded-xl px-4 py-3 text-xs font-mono border-2 border-[#1E1B4B] focus:outline-none focus:border-[#7F45DB] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#0F172A] font-extrabold uppercase tracking-wider block mb-1.5 font-mono">
                        Your Last Name
                      </label>
                      <input
                        type="text"
                        required
                        value={memberLastName}
                        onChange={(e) => setMemberLastName(e.target.value)}
                        placeholder="Hayes"
                        className="w-full bg-[#F8F9FD] text-[#0F172A] rounded-xl px-4 py-3 text-xs font-mono border-2 border-[#1E1B4B] focus:outline-none focus:border-[#7F45DB] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-[#0F172A] font-extrabold uppercase tracking-wider block mb-1.5 font-mono">
                      Your Email
                    </label>
                    <input
                      type="email"
                      required
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      placeholder="jordan@college.edu"
                      className="w-full bg-[#F8F9FD] text-[#0F172A] rounded-xl px-4 py-3 text-xs font-mono border-2 border-[#1E1B4B] focus:outline-none focus:border-[#7F45DB] transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-[#0F172A] font-extrabold uppercase tracking-wider block mb-1.5 font-mono">
                      College / Institution Name
                    </label>
                    <input
                      type="text"
                      required
                      value={memberCollege}
                      onChange={(e) => setMemberCollege(e.target.value)}
                      placeholder="e.g. VCET / NSDC College of Engineering"
                      className="w-full bg-[#F8F9FD] text-[#0F172A] rounded-xl px-4 py-3 text-xs font-mono border-2 border-[#1E1B4B] focus:outline-none focus:border-[#7F45DB] transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={joining}
                    className="w-full py-3.5 text-xs font-mono font-black uppercase tracking-wider bg-[#7F45DB] hover:bg-[#6D35C7] text-white rounded-xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1E1B4B] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    <span>{joining ? "Joining Team..." : "Join Team Roster"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
