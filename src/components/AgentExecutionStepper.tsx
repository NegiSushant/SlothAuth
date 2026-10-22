"use client";

import React, { useState } from "react";
import {
  FileText,
  Search,
  Cpu,
  FileCheck2,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Terminal,
} from "lucide-react";

export interface StepperState {
  isRunning: boolean;
  activeStep: number; // 1 to 4 (0 if not running or idle)
  currentPatientName?: string;
  currentProcedure?: string;
  logs: string[];
  lastCompletedVerdict?: string;
  lastCompletedConfidence?: number;
}

interface AgentExecutionStepperProps {
  stepperState: StepperState;
}

const STEPS = [
  {
    step: 1,
    name: "extractPatientContext",
    title: "1. EHR Chart Extraction",
    description: "Parsing EHR Timeline & History",
    icon: FileText,
  },
  {
    step: 2,
    name: "retrievePolicyChunks",
    title: "2. Vector Policy Retrieval",
    description: "Searching Payer Rules via pgvector",
    icon: Search,
  },
  {
    step: 3,
    name: "auditClinicalCriteria",
    title: "3. Gemma Clinical Audit",
    description: "Auditing Gaps & Exceptions",
    icon: Cpu,
  },
  {
    step: 4,
    name: "draftJustificationAndSave",
    title: "4. Packet Synthesis & DB",
    description: "Drafting Medical Necessity Letter",
    icon: FileCheck2,
  },
];

export function AgentExecutionStepper({
  stepperState,
}: AgentExecutionStepperProps) {
  const [logsExpanded, setLogsExpanded] = useState(false);
  const { isRunning, activeStep, currentPatientName, currentProcedure, logs } =
    stepperState;

  // Don't render anything if completely idle and no logs
  if (!isRunning && logs.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-3 transition-all duration-300">
      <div className="flex flex-col gap-3">
        {/* Active Patient Status & Logs Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isRunning ? (
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  LangGraph Workflow Active
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  • Prepping:{" "}
                  <strong className="text-white">
                    {currentPatientName || "Next Patient"}
                  </strong>{" "}
                  {currentProcedure && `(${currentProcedure})`}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-slate-300">
                  Last Prep Execution Complete
                </span>
                {stepperState.lastCompletedVerdict && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Verdict: {stepperState.lastCompletedVerdict} (
                    {stepperState.lastCompletedConfidence}% Match)
                  </span>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => setLogsExpanded(!logsExpanded)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors bg-slate-950 px-2.5 py-1 rounded border border-slate-800"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live Logs ({logs.length})</span>
            {logsExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* 4-Step Visual Stepper Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isCurrent = isRunning && activeStep === s.step;
            const isCompleted =
              (!isRunning && activeStep >= s.step) ||
              (isRunning && activeStep > s.step);

            return (
              <div
                key={s.step}
                className={`relative flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                  isCurrent
                    ? "bg-emerald-950/40 border-emerald-500/60 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                    : isCompleted
                    ? "bg-slate-950/60 border-slate-800 text-slate-300"
                    : "bg-slate-950/30 border-slate-800/50 text-slate-500"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-xs shrink-0 ${
                    isCurrent
                      ? "bg-emerald-500 text-slate-950 animate-pulse"
                      : isCompleted
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {isCurrent ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <p
                    className={`text-xs font-semibold truncate ${
                      isCurrent
                        ? "text-emerald-300"
                        : isCompleted
                        ? "text-slate-200"
                        : "text-slate-400"
                    }`}
                  >
                    {s.title}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {s.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Collapsible Execution Logs Drawer */}
        {logsExpanded && (
          <div className="mt-1 rounded-lg bg-slate-950 border border-slate-800 p-3 font-mono text-xs max-h-48 overflow-y-auto space-y-1">
            <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800/80 mb-1 text-[11px]">
              <span>LangGraph Execution Stream Logs</span>
              <span className="text-[10px] text-emerald-400">Deterministic RAG</span>
            </div>
            {logs.length === 0 ? (
              <p className="text-slate-400 italic">No logs recorded yet.</p>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-slate-300 text-[11px] leading-relaxed"
                >
                  <span className="text-slate-400 select-none">
                    [{String(index + 1).padStart(2, "0")}]
                  </span>
                  <span
                    className={
                      log.includes("Verdict")
                        ? "text-emerald-300 font-semibold"
                        : log.includes("Error")
                        ? "text-rose-400"
                        : "text-slate-300"
                    }
                  >
                    {log}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
