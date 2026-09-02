"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Sparkles, 
  Key, 
  Activity, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Users, 
  MessageSquare, 
  Terminal, 
  Cpu, 
  Clock, 
  Info,
  ShieldCheck
} from "lucide-react";

interface KeyTelemetry {
  index: number;
  maskedKey: string;
  totalRequests: number;
  dailyLimit: number;
  dailyRemaining: number;
  rpmLimit: number;
  currentRpm: number;
  peakRpm: number;
  tpmLimit: number;
  currentTpm: number;
  peakTpm: number;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  lastUsedAt: string | null;
  status: "HEALTHY" | "COOLDOWN" | "ERROR";
  cooldownUntil: number;
  lastError: string | null;
  lastLatencyMs: number | null;
}

interface ParticipantUsage {
  userId: string;
  name: string;
  email: string;
  teamName: string;
  totalPrompts: number;
  explainPrompts: number;
  codePrompts: number;
  totalTokensUsed: number;
}

interface TelemetryData {
  totalKeys: number;
  healthyCount: number;
  cooldownCount: number;
  errorCount: number;
  totalTokensConsumed: number;
  totalRequestsServed: number;
  poolCurrentRpm: number;
  poolPeakRpm: number;
  poolCurrentTpm: number;
  poolPeakTpm: number;
  dbTotalTokens: number;
  dbTotalPrompts: number;
  keys: KeyTelemetry[];
  topParticipants: ParticipantUsage[];
}

export default function AdminAIKeyPoolClient() {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [testingAll, setTestingAll] = useState(false);
  const [testingKeyIndex, setTestingKeyIndex] = useState<number | null>(null);
  const [testResults, setTestResults] = useState<Record<number, { status: string; latencyMs: number; error?: string }>>({});

  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/ai/keys");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 4000); // 4-second live polling
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  // Test single key
  const handleTestKey = async (index: number) => {
    setTestingKeyIndex(index);
    try {
      const res = await fetch("/api/admin/ai/keys/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyIndex: index }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.results?.[0]) {
          const r = json.results[0];
          setTestResults((prev) => ({
            ...prev,
            [index]: { status: r.status, latencyMs: r.latencyMs, error: r.error },
          }));
        }
      }
      await fetchTelemetry();
    } finally {
      setTestingKeyIndex(null);
    }
  };

  // Test all keys in parallel
  const handleTestAll = async () => {
    setTestingAll(true);
    try {
      const res = await fetch("/api/admin/ai/keys/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testAll: true }),
      });
      if (res.ok) {
        const json = await res.json();
        const resultsMap: Record<number, { status: string; latencyMs: number; error?: string }> = {};
        json.results?.forEach((r: { index: number; status: string; latencyMs: number; error?: string }) => {
          resultsMap[r.index] = { status: r.status, latencyMs: r.latencyMs, error: r.error };
        });
        setTestResults(resultsMap);
      }
      await fetchTelemetry();
    } finally {
      setTestingAll(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center font-mono text-sm text-[#7F45DB] gap-2">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span>Loading AI Multi-Account Key Pool & Token Tracker...</span>
      </div>
    );
  }

  const keys = data?.keys ?? [];
  const topParticipants = data?.topParticipants ?? [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7F45DB]/10 text-[#4A2293] border border-[#7F45DB]/30 text-xs font-mono font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Groq Multi-Account Load Balancer
          </div>
          <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight font-display">
            AI Token & Key Pool Tracker
          </h1>
          <p className="text-xs text-[#6E6E6E] mt-1 font-mono">
            Real-time multi-account rotation telemetry, rate-limit failover monitoring, and tournament token consumption
          </p>
        </div>

        <button
          onClick={handleTestAll}
          disabled={testingAll}
          className="px-5 py-3 rounded-2xl bg-[#7F45DB] hover:bg-[#6D35C7] text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1E1B4B] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Zap className={`w-4 h-4 ${testingAll ? "animate-spin" : "fill-white"}`} />
          <span>{testingAll ? "Testing All 15 Accounts..." : "⚡ Ping Test All Keys"}</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Key Pool Capacity */}
        <div className="bg-white p-5 rounded-2xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] space-y-2">
          <div className="flex items-center justify-between text-[#6E6E6E] text-xs font-mono font-bold">
            <span>Configured Key Pool</span>
            <Key className="w-4 h-4 text-[#7F45DB]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0F172A] font-mono">
            {data?.healthyCount ?? 0} / {data?.totalKeys ?? 0} <span className="text-xs font-bold text-[#6E6E6E]">Active</span>
          </div>
          <div className="text-[11px] font-mono text-emerald-600 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Round-Robin Load Balancing</span>
          </div>
        </div>

        {/* Card 2: Max Requests / Min (RPM) */}
        <div className="bg-white p-5 rounded-2xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] space-y-2">
          <div className="flex items-center justify-between text-[#6E6E6E] text-xs font-mono font-bold">
            <span>Max Requests / Min</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 font-mono">
            {data?.poolPeakRpm || data?.poolCurrentRpm || 0} <span className="text-xs font-bold text-[#6E6E6E]">/ {(data?.totalKeys ?? 1) * 30} RPM</span>
          </div>
          <div className="text-[11px] font-mono text-[#6E6E6E]">
            Current: {data?.poolCurrentRpm ?? 0} RPM · Cap: 30 RPM/acc
          </div>
        </div>

        {/* Card 3: Max Tokens / Min (TPM) */}
        <div className="bg-white p-5 rounded-2xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] space-y-2">
          <div className="flex items-center justify-between text-[#6E6E6E] text-xs font-mono font-bold">
            <span>Max Tokens / Min</span>
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">
            {(data?.poolPeakTpm || data?.poolCurrentTpm || 0).toLocaleString()} <span className="text-xs font-bold text-[#6E6E6E]">/ {((data?.totalKeys ?? 1) * 18000).toLocaleString()} TPM</span>
          </div>
          <div className="text-[11px] font-mono text-[#6E6E6E]">
            Current: {(data?.poolCurrentTpm ?? 0).toLocaleString()} TPM · Cap: 18k TPM/acc
          </div>
        </div>

        {/* Card 4: Total Requests (Daily Cap) */}
        <div className="bg-white p-5 rounded-2xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] space-y-2">
          <div className="flex items-center justify-between text-[#6E6E6E] text-xs font-mono font-bold">
            <span>Total Requests Served</span>
            <MessageSquare className="w-4 h-4 text-[#7F45DB]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#7F45DB] font-mono">
            {(data?.totalRequestsServed ?? 0).toLocaleString()} <span className="text-xs font-bold text-[#6E6E6E]">/ {((data?.totalKeys ?? 1) * 14400).toLocaleString()}</span>
          </div>
          <div className="text-[11px] font-mono text-[#6E6E6E]">
            14,400 daily requests per account cap
          </div>
        </div>
      </div>

      {/* Multi-Account Key Pool Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-xl font-black text-[#0F172A] font-display uppercase tracking-tight">
              Live Key Pool Matrix ({keys.length} Accounts)
            </h2>
            <p className="text-xs font-mono text-[#6E6E6E]">
              Keys switch automatically on 429 rate limit (60s cooldown) or round-robin rotation
            </p>
          </div>
          <span className="text-xs font-mono text-[#6E6E6E] bg-white px-3 py-1 rounded-xl border border-[#1E1B4B]/20">
            Model: <strong className="text-[#7F45DB]">{process.env.NEXT_PUBLIC_AI_MODEL ?? "qwen/qwen3.8-27b"}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {keys.map((k) => {
            const isTestingThis = testingKeyIndex === k.index;
            const singleResult = testResults[k.index];

            return (
              <div
                key={k.index}
                className={`bg-white p-5 rounded-2xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] flex flex-col justify-between transition-all ${
                  k.status === "COOLDOWN"
                    ? "bg-amber-50/50 border-amber-500"
                    : k.status === "ERROR"
                    ? "bg-red-50/50 border-red-500"
                    : ""
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header with Status Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#7F45DB] text-white font-mono font-bold text-xs flex items-center justify-center border border-[#1E1B4B]">
                        #{k.index + 1}
                      </span>
                      <span className="font-mono font-extrabold text-sm text-[#0F172A]">
                        Account {k.index + 1}
                      </span>
                    </div>

                    {k.status === "HEALTHY" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-mono font-bold uppercase">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                      </span>
                    )}
                    {k.status === "COOLDOWN" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-mono font-bold uppercase">
                        <Clock className="w-3 h-3 text-amber-600 animate-spin" /> Cooldown
                      </span>
                    )}
                    {k.status === "ERROR" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 text-[10px] font-mono font-bold uppercase">
                        <XCircle className="w-3 h-3 text-red-600" /> Error
                      </span>
                    )}
                  </div>

                  {/* Masked API Key */}
                  <div className="p-2.5 bg-[#F8F9FD] rounded-xl border border-[#1E1B4B]/20 font-mono text-xs text-[#0F172A] tracking-wider flex items-center justify-between">
                    <span className="truncate">{k.maskedKey}</span>
                    <Key className="w-3.5 h-3.5 text-[#8A8A8A] shrink-0 ml-1" />
                  </div>

                  {/* Key Stats Breakdown: RPM & TPM */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 bg-[#F8F9FD] rounded-xl border border-[#1E1B4B]/10">
                      <div className="text-[10px] text-[#6E6E6E] font-bold uppercase flex items-center justify-between">
                        <span>Max Req / Min</span>
                        <span className="text-blue-600 font-extrabold">30 cap</span>
                      </div>
                      <div className="text-base font-black text-[#0F172A] mt-0.5">
                        {k.currentRpm} <span className="text-[10px] text-[#6E6E6E] font-normal">RPM</span>
                      </div>
                      <div className="text-[10px] text-[#6E6E6E] mt-0.5">
                        Peak: <strong className="text-[#0F172A]">{k.peakRpm} RPM</strong>
                      </div>
                    </div>

                    <div className="p-2.5 bg-[#F8F9FD] rounded-xl border border-[#1E1B4B]/10">
                      <div className="text-[10px] text-[#6E6E6E] font-bold uppercase flex items-center justify-between">
                        <span>Max Token / Min</span>
                        <span className="text-amber-600 font-extrabold">18k cap</span>
                      </div>
                      <div className="text-base font-black text-[#7F45DB] mt-0.5">
                        {k.currentTpm.toLocaleString()} <span className="text-[10px] text-[#6E6E6E] font-normal">TPM</span>
                      </div>
                      <div className="text-[10px] text-[#6E6E6E] mt-0.5">
                        Peak: <strong className="text-[#0F172A]">{k.peakTpm.toLocaleString()} TPM</strong>
                      </div>
                    </div>
                  </div>

                  {/* Groq Account Daily Request Exhaustion Quota */}
                  <div className="space-y-1.5 font-mono pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#6E6E6E] font-bold uppercase text-[10px]">Total Requests:</span>
                      <strong className="text-[#7F45DB] font-black">
                        {k.totalRequests.toLocaleString()} / 14,400 daily requests
                      </strong>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[#E2E8F0] overflow-hidden border border-[#1E1B4B]/20">
                      <div
                        className={`h-full transition-all ${
                          k.totalRequests < 8000 ? "bg-emerald-500" : k.totalRequests < 12000 ? "bg-amber-500" : "bg-destructive"
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(3, (k.totalRequests / 14400) * 100))}%`,
                        }}
                      />
                    </div>
                    <div className="text-[10px] text-[#6E6E6E] flex items-center justify-between">
                      <span>Remaining: <strong className="text-emerald-700">{Math.max(0, 14400 - k.totalRequests).toLocaleString()} reqs</strong></span>
                      <span>{((k.totalRequests / 14400) * 100).toFixed(1)}% used</span>
                    </div>
                  </div>

                  {/* Rate Limits & Latency Footer */}
                  <div className="text-[11px] font-mono text-[#6E6E6E] flex items-center justify-between border-t border-[#1E1B4B]/10 pt-2">
                    <span>⚡ 18,000 TPM limit · 30 RPM limit</span>
                    <span>
                      Latency: <strong className="text-[#0F172A]">{k.lastLatencyMs ? `${k.lastLatencyMs}ms` : "—"}</strong>
                    </span>
                  </div>

                  {/* Error / Test Status Display */}
                  {singleResult && (
                    <div className={`p-2 rounded-lg text-[11px] font-mono font-bold border ${
                      singleResult.status === "HEALTHY"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-red-50 text-red-800 border-red-300"
                    }`}>
                      Ping: {singleResult.status} ({singleResult.latencyMs}ms)
                      {singleResult.error && <div className="text-[10px] font-normal mt-0.5">{singleResult.error}</div>}
                    </div>
                  )}

                  {k.lastError && !singleResult && (
                    <div className="p-2 rounded-lg bg-destructive/10 text-destructive text-[10px] font-mono font-bold border border-destructive/20 truncate">
                      {k.lastError}
                    </div>
                  )}
                </div>

                {/* Single Test Button */}
                <div className="pt-3 border-t border-[#1E1B4B]/10 mt-3">
                  <button
                    onClick={() => handleTestKey(k.index)}
                    disabled={isTestingThis || testingAll}
                    className="w-full py-2 rounded-xl bg-[#F8F9FD] hover:bg-[#E2E8F0] text-[#0F172A] font-mono font-bold text-xs uppercase border border-[#1E1B4B]/30 hover:border-[#1E1B4B] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <Zap className={`w-3 h-3 text-[#7F45DB] ${isTestingThis ? "animate-spin" : ""}`} />
                    <span>{isTestingThis ? "Pinging..." : "Test Key Health"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Participant Consumers Table */}
      <div className="bg-white p-6 rounded-3xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#7F45DB]" />
            <h3 className="font-display font-black text-lg text-[#0F172A] uppercase">
              Top Participant AI Token Consumers
            </h3>
          </div>
          <span className="text-xs font-mono text-[#6E6E6E]">
            Ranked by total tokens consumed across all rounds
          </span>
        </div>

        {topParticipants.length === 0 ? (
          <div className="text-center py-8 text-xs font-mono text-[#6E6E6E]">
            No AI prompts used by participants yet. Token stats will appear here live during rounds.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b-2 border-[#1E1B4B] text-[#6E6E6E] uppercase">
                  <th className="pb-3 font-black">#</th>
                  <th className="pb-3 font-black">Participant</th>
                  <th className="pb-3 font-black">Team</th>
                  <th className="pb-3 font-black text-center">AI Chat (15 max)</th>
                  <th className="pb-3 font-black text-center">AI Code (25 max)</th>
                  <th className="pb-3 font-black text-right">Total Tokens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E1B4B]/10">
                {topParticipants.map((p, idx) => (
                  <tr key={p.userId} className="hover:bg-[#F8F9FD] transition-colors">
                    <td className="py-3 font-bold text-[#7F45DB]">#{idx + 1}</td>
                    <td className="py-3">
                      <div className="font-bold text-[#0F172A]">{p.name}</div>
                      <div className="text-[10px] text-[#6E6E6E]">{p.email}</div>
                    </td>
                    <td className="py-3 font-medium text-[#0F172A]">{p.teamName}</td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-[#7F45DB]/10 text-[#7F45DB] font-bold">
                        {p.explainPrompts} / 15
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200">
                        {p.codePrompts} / 25
                      </span>
                    </td>
                    <td className="py-3 text-right font-black text-[#0F172A]">
                      {p.totalTokensUsed.toLocaleString()} <span className="text-[10px] font-normal text-[#6E6E6E]">tok</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* How Multi-Account Setup Works Info Banner */}
      <div className="p-5 rounded-2xl bg-[#F0F2F8] border-2 border-[#1E1B4B] space-y-2 text-xs font-mono shadow-[2px_2px_0px_0px_#1E1B4B]">
        <div className="font-black text-[#0F172A] flex items-center gap-2 text-sm uppercase">
          <Info className="w-4 h-4 text-[#7F45DB]" /> How Multi-Account Load Balancing Works
        </div>
        <p className="text-[#6E6E6E] leading-relaxed">
          1. <strong>Multiple Accounts in `.env`</strong>: Provide all 15 Groq API keys as a comma-separated list in `AI_API_KEYS=gsk_key1,gsk_key2,gsk_key3...`.
        </p>
        <p className="text-[#6E6E6E] leading-relaxed">
          2. <strong>Intelligent Auto-Failover</strong>: If an account hits Groq&apos;s Rate Limit (429 or Tokens Per Minute cap), the gateway automatically places that key on a 60-second cooldown and instantly executes the participant&apos;s request on the next available healthy key.
        </p>
        <p className="text-[#6E6E6E] leading-relaxed">
          3. <strong>Zero Disruption</strong>: Participants will never experience rate limit errors as long as at least 1 key in the rotation pool has capacity remaining.
        </p>
      </div>
    </div>
  );
}
