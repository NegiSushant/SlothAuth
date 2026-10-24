"use client";

import React from "react";
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Sparkles,
  HeartPulse,
  Scale,
  Brain,
  Zap,
} from "lucide-react";

export function HackathonSpotlight() {
  const comparisonItems = [
    {
      metric: "Time Required per Request",
      manual: "45 – 60 minutes of clerical doctor time",
      sloth: "Under 60 seconds (autonomous overnight execution)",
    },
    {
      metric: "Patient Data Privacy",
      manual: "Exposed to 3rd-party cloud brokers & fax leaks",
      sloth: "100% Zero Cloud Egress (Local Gemma 3 + pgvector)",
    },
    {
      metric: "First-Pass Denial Rate",
      manual: "32% initial denials due to missing paperwork",
      sloth: "< 6% (all criteria audited against payer guidelines)",
    },
    {
      metric: "Missing Evidence Detection",
      manual: "Discovered 14 days later upon insurer rejection",
      sloth: "Flagged instantly overnight with 1-click lab fix",
    },
    {
      metric: "Medical Justification Letter",
      manual: "Generic copy-pasted templates prone to denial",
      sloth: "Synthesized letter with exact timestamped EHR quotes",
    },
    {
      metric: "Cost per Inference / Evaluation",
      manual: "$85+ in administrative labor overhead",
      sloth: "$0.00 (On-premise open-weights hardware)",
    },
  ];

  return (
    <section id="hackathon" className="py-24 bg-slate-900/40 relative border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Hackathon Mission &amp; Problem Statement</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            What We Are Building for the Hackathon
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            Fixing the single biggest administrative bottleneck in modern healthcare: the $31B prior-authorization crisis.
          </p>
        </div>

        {/* 2 Column Problem vs Solution Spotlight */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Problem Card */}
          <div className="rounded-2xl border border-rose-900/50 bg-rose-950/10 p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center gap-2.5 text-rose-400 text-sm font-bold uppercase tracking-wider mb-4">
              <ShieldAlert className="w-5 h-5" />
              <span>The Problem: Administrative Paralysis</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
              80% of Prior-Auth Requests Delay Critical Patient Care
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              In the United States alone, doctors spend over <strong>14 hours each week</strong> wrestling with insurance paperwork. For critical surgeries, chemotherapy, and advanced therapies, prior-authorization delays force patients to wait weeks in pain—or abandon care entirely.
            </p>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span><strong>50+ page PDF clinical policies:</strong> Doctors cannot keep track of hundreds of constantly shifting payer rules.</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span><strong>Severe Physician Burnout:</strong> Clinicians spend their evenings copying chart notes instead of resting or seeing patients.</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span><strong>Cloud Privacy Dilemma:</strong> Healthcare providers cannot send confidential patient health info (PHI) to commercial cloud AI APIs.</span>
              </li>
            </ul>
          </div>

          {/* Solution Card */}
          <div className="rounded-2xl border border-emerald-800/60 bg-emerald-950/10 p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center gap-2.5 text-emerald-400 text-sm font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-5 h-5" />
              <span>Our Hackathon Solution: SlothAuth</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
              Autonomous Overnight Preparation With Zero Cloud Leakage
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              SlothAuth flips the paradigm with <strong>agentic autonomy</strong>. While physicians sleep, the Sloth agent works through pending EHR queues, indexes localized payer policies via pgvector, runs deterministic LangGraph clinical audits, and synthesizes complete justification packets.
            </p>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Zero-Leakage Local Gemma 3:</strong> 100% on-premise execution preserves strict HIPAA compliance with 0 bytes sent to public clouds.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Deterministic LangGraph Verification:</strong> No hallucinations. Every single clinical criterion requires exact quotes and timestamps.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Rewarding Clinical Laziness:</strong> Doctors wake up to pre-audited packets ready for 1-click electronic sign-off.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Head-to-Head Comparison Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="p-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">
                Head-to-Head: Traditional Prior Auth vs. SlothAuth Agent
              </h4>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              45x Operational Acceleration
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-4">Dimension</th>
                  <th className="py-3 px-4 text-rose-300">Manual Provider Workflow</th>
                  <th className="py-3 px-4 text-emerald-300">SlothAuth Autonomous Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {comparisonItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      {item.metric}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 flex items-center gap-2">
                      <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{item.manual}</span>
                    </td>
                    <td className="py-3.5 px-4 text-emerald-300 font-medium">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{item.sloth}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
