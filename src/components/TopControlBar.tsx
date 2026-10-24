"use client";

import React from "react";
import {
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Play,
  ShieldCheck,
  Zap,
} from "lucide-react";
import type { QueueStats } from "@/types/prior-auth";
import { UserMenu } from "./auth/UserMenu";

interface TopControlBarProps {
  stats: QueueStats | null;
  isRunning: boolean;
  selectedPatientName?: string;
  onRunOvernightPrep: () => void;
  onPrepSelectedPatient: () => void;
  onResetDemo: () => void;
}

export function TopControlBar({
  stats,
  isRunning,
  selectedPatientName,
  onRunOvernightPrep,
  onPrepSelectedPatient,
  onResetDemo,
}: TopControlBarProps) {
  // Format minutes into clean human-readable hours and minutes
  const formatMinutes = (mins: number) => {
    if (mins <= 0) return "0 mins";
    const hours = Math.floor(mins / 60);
    const remaining = mins % 60;
    if (hours === 0) return `${remaining} mins`;
    if (remaining === 0) return `${hours} hr${hours > 1 ? "s" : ""}`;
    return `${hours} hr ${remaining} mins`;
  };

  const totalPatients = stats?.totalPatients ?? 3;
  const preppedCount = stats?.preppedCount ?? 0;
  const minutesSaved = stats?.estimatedMinutesSaved ?? 0;
  const readyCount = stats?.readyToSubmitCount ?? 0;
  const missingCount = stats?.missingInfoCount ?? 0;

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4 sticky top-0 z-30">
      {/* Brand & Main Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg shadow-emerald-500/20 text-2xl">
            🦥
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                SlothAuth
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  v1.0 Local Agent
                </span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                100% Local PHI • Gemma + pgvector
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Autonomous Overnight Prior-Authorization Prep Agent •{" "}
              <span className="text-emerald-400/90 font-medium">
                Slow &amp; Steady — Rewarding Clinical Laziness
              </span>
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Back to Project Overview */}
          <a
            href="/"
            title="View Project Flow & Hackathon Overview"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 hover:text-white border border-slate-800 hover:border-slate-700 rounded-lg transition-all shadow-sm active:scale-95"
          >
            <span>Overview & Flow</span>
          </a>

          {/* Reset simulation button */}
          <button
            onClick={onResetDemo}
            disabled={isRunning}
            title="Reset all packets back to PENDING_PREP for live demonstration"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 hover:text-white border border-slate-800 hover:border-slate-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Demo</span>
          </button>

          {/* Prep selected patient */}
          <button
            onClick={onPrepSelectedPatient}
            disabled={isRunning || !selectedPatientName}
            title={
              selectedPatientName
                ? `Run prior-auth agent for ${selectedPatientName}`
                : "Select a patient first"
            }
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/60 hover:border-cyan-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Prep Selected</span>
          </button>

          {/* Primary CTA: Run Overnight Batch Prep */}
          <button
            onClick={onRunOvernightPrep}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 rounded-lg transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isRunning ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Prepping Live via LangGraph...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>Run Overnight Sloth Prep</span>
              </>
            )}
          </button>

          {/* User profile & sign out menu */}
          <div className="pl-1 border-l border-slate-800">
            <UserMenu />
          </div>
        </div>
      </div>

      {/* "Lazy Payoff" KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-800/60">
        {/* Card 1: Prepped Overnight */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Prepped Overnight
            </p>
            <p className="text-lg font-bold text-white mt-0.5">
              {preppedCount}{" "}
              <span className="text-xs font-normal text-slate-400">
                / {totalPatients} charts
              </span>
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Play className="w-4 h-4 fill-current" />
          </div>
        </div>

        {/* Card 2: Clinician Time Saved */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Clinician Time Saved
            </p>
            <p className="text-lg font-bold text-emerald-400 mt-0.5">
              {formatMinutes(minutesSaved)}
            </p>
            <p className="text-[10px] text-slate-400">@ 35 mins / chart</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Card 3: Ready for 1-Click Sign-Off */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Ready for Sign-Off
            </p>
            <p className="text-lg font-bold text-white mt-0.5">
              {readyCount}{" "}
              <span className="text-xs font-normal text-slate-400">
                packets
              </span>
            </p>
            <p className="text-[10px] text-emerald-400/90 font-medium">
              Audit passed 100%
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* Card 4: Gaps Caught Before Denial */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Gaps Caught Early
            </p>
            <p className="text-lg font-bold text-amber-400 mt-0.5">
              {missingCount}{" "}
              <span className="text-xs font-normal text-slate-400">
                need review
              </span>
            </p>
            <p className="text-[10px] text-slate-400">Prevented peer-to-peer</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
