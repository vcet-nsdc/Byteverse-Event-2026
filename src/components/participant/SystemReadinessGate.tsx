"use client";

import React, { useState } from "react";
import { ShieldCheck, MonitorCheck, FileText, AlertTriangle, CheckSquare, Square, XCircle, ArrowRight } from "lucide-react";

interface SystemReadinessGateProps {
  roundName: string;
  sequence: number;
  durationMin: number;
  onComplete: () => void;
}

const COMMON_BG_APPS = [
  { name: "Discord / Slack / Teams", category: "Communication", desc: "Close desktop client and web tabs" },
  { name: "WhatsApp / Telegram / Web Chat", category: "Social Messaging", desc: "Turn off background sync & tabs" },
  { name: "VS Code / IDEs / Local Editors", category: "Coding Tools", desc: "Close unauthorized local code editors" },
  { name: "OBS / Screen Recorders / Share Tools", category: "Screen Capture", desc: "Terminate background capture utilities" },
  { name: "AnyDesk / TeamViewer / Remote Access", category: "Remote Software", desc: "Shut down remote desktop services" },
];

export default function SystemReadinessGate({
  roundName,
  sequence,
  durationMin,
  onComplete,
}: SystemReadinessGateProps) {
  const [appsClosedChecked, setAppsClosedChecked] = useState(false);
  const [monitoringAgreed, setMonitoringAgreed] = useState(false);
  const [disqualificationAgreed, setDisqualificationAgreed] = useState(false);
  const [singleDisplayAgreed, setSingleDisplayAgreed] = useState(false);
  const [activating, setActivating] = useState(false);

  const allPassed =
    appsClosedChecked &&
    monitoringAgreed &&
    disqualificationAgreed &&
    singleDisplayAgreed;

  const handleComplete = async () => {
    if (!allPassed) return;
    setActivating(true);
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {
      // ignore
    }
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-[#1E1B4B] bg-[#7F45DB]/10 text-[#4A2293] text-xs font-mono font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#1E1B4B]">
            <span className="w-2 h-2 rounded-full bg-[#7F45DB] animate-pulse" />
            Round {sequence} · Workstation Security & Integrity Check
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] uppercase tracking-tight font-display">
            System Readiness & Agreement
          </h1>
          <p className="text-[#6E6E6E] text-xs sm:text-sm font-medium">
            Review background requirements and acknowledge competition rules before proceeding.
          </p>
        </div>

        {/* Round Summary Card */}
        <div className="bg-white p-5 rounded-2xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-[11px] font-mono text-[#6E6E6E] uppercase font-bold">Upcoming Challenge</div>
            <div className="text-lg font-bold text-[#0F172A] font-display">{roundName}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-mono text-[#6E6E6E] uppercase font-bold">Allocated Time</div>
            <div className="text-base font-mono font-black text-[#7F45DB]">⏱ {durationMin} Minutes</div>
          </div>
        </div>

        {/* Step 1: Background Apps Termination Checklist */}
        <div className="bg-white p-6 rounded-2xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#1E1B4B]/10 pb-3">
            <div className="flex items-center gap-2">
              <MonitorCheck className="w-5 h-5 text-[#7F45DB]" />
              <h2 className="text-sm font-black text-[#0F172A] uppercase font-mono tracking-wider">
                Step 1: Terminate Prohibited Background Applications
              </h2>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-400 uppercase">
              Action Required
            </span>
          </div>

          <p className="text-xs text-[#6E6E6E] leading-relaxed">
            To prevent automatic flagging by the anti-cheat shield, please ensure all background processes and secondary windows are completely closed:
          </p>

          {/* List of common apps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {COMMON_BG_APPS.map((app) => (
              <div
                key={app.name}
                className="p-3 bg-[#F8F9FD] rounded-xl border border-[#1E1B4B]/20 text-xs space-y-0.5"
              >
                <div className="font-bold text-[#0F172A] flex items-center justify-between">
                  <span>{app.name}</span>
                  <span className="text-[10px] font-mono text-[#7F45DB] font-semibold">{app.category}</span>
                </div>
                <div className="text-[11px] text-[#6E6E6E]">{app.desc}</div>
              </div>
            ))}
          </div>

          {/* Primary Checkbox 1 */}
          <label className="flex items-start gap-3 p-3.5 rounded-xl border-2 border-[#1E1B4B] bg-[#F8F9FD] hover:bg-[#F0F2F8] cursor-pointer transition-all mt-3 shadow-[2px_2px_0px_0px_#1E1B4B]">
            <input
              type="checkbox"
              checked={appsClosedChecked}
              onChange={(e) => setAppsClosedChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[#1E1B4B] accent-[#7F45DB] cursor-pointer"
            />
            <div className="text-xs space-y-0.5">
              <div className="font-bold text-[#0F172A]">
                I confirm all background applications, secondary tabs, and communication tools are closed
              </div>
              <p className="text-[11px] text-[#6E6E6E] leading-relaxed">
                I have terminated Discord, WhatsApp, Telegram, local IDEs, external AI assistants, and background recording software.
              </p>
            </div>
          </label>
        </div>

        {/* Step 2: Integrity Agreements & Rules */}
        <div className="bg-white p-6 rounded-2xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] space-y-4">
          <div className="flex items-center gap-2 border-b-2 border-[#1E1B4B]/10 pb-3">
            <FileText className="w-5 h-5 text-[#7F45DB]" />
            <h2 className="text-sm font-black text-[#0F172A] uppercase font-mono tracking-wider">
              Step 2: Participant Code of Conduct & Agreements
            </h2>
          </div>

          <div className="space-y-3">
            {/* Agreement 1 */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl border-2 border-[#1E1B4B] bg-[#F8F9FD] hover:bg-[#F0F2F8] cursor-pointer transition-all shadow-[2px_2px_0px_0px_#1E1B4B]">
              <input
                type="checkbox"
                checked={singleDisplayAgreed}
                onChange={(e) => setSingleDisplayAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#1E1B4B] accent-[#7F45DB] cursor-pointer"
              />
              <div className="text-xs space-y-0.5">
                <div className="font-bold text-[#0F172A]">Single Display & Fullscreen Policy</div>
                <p className="text-[11px] text-[#6E6E6E] leading-relaxed">
                  I will remain on a single active display screen. Exiting fullscreen or switching windows during an active round deducts a heart (3 strikes); depleting all 3 hearts triggers immediate contest disqualification.
                </p>
              </div>
            </label>

            {/* Agreement 2 */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl border-2 border-[#1E1B4B] bg-[#F8F9FD] hover:bg-[#F0F2F8] cursor-pointer transition-all shadow-[2px_2px_0px_0px_#1E1B4B]">
              <input
                type="checkbox"
                checked={monitoringAgreed}
                onChange={(e) => setMonitoringAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#1E1B4B] accent-[#7F45DB] cursor-pointer"
              />
              <div className="text-xs space-y-0.5">
                <div className="font-bold text-[#0F172A]">Activity Monitoring Consent</div>
                <p className="text-[11px] text-[#6E6E6E] leading-relaxed">
                  I consent to the event logging of code execution, AI assistance quotas, submission timestamps, and workstation session events for competition integrity.
                </p>
              </div>
            </label>

            {/* Agreement 3 */}
            <label className="flex items-start gap-3 p-3.5 rounded-xl border-2 border-[#1E1B4B] bg-amber-50 hover:bg-amber-100/60 cursor-pointer transition-all shadow-[2px_2px_0px_0px_#D97706]">
              <input
                type="checkbox"
                checked={disqualificationAgreed}
                onChange={(e) => setDisqualificationAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#1E1B4B] accent-[#7F45DB] cursor-pointer"
              />
              <div className="text-xs space-y-0.5">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                  <span>Zero-Tolerance Disqualification Policy</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Unauthorized external assistance, cross-team collaboration, or secondary device usage will result in immediate disqualification of my entire team without appeal.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Action CTA */}
        <div className="pt-2 text-center space-y-3">
          <button
            onClick={handleComplete}
            disabled={!allPassed || activating}
            className="w-full py-4 text-sm font-mono font-black uppercase tracking-wider bg-[#7F45DB] hover:bg-[#6D35C7] text-white rounded-xl border-2 border-[#1E1B4B] shadow-[4px_4px_0px_0px_#1E1B4B] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1E1B4B] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{activating ? "Registering Agreement..." : "I Acknowledge & Complete Readiness Check"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          {!allPassed && (
            <p className="text-[11px] font-mono text-[#6E6E6E]">
              Please check all 4 required security and integrity items above to continue.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
