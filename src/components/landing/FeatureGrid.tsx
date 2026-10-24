"use client";

import React from "react";
import {
  ShieldCheck,
  Database,
  Cpu,
  Activity,
  FileCheck2,
  Lock,
  Layers,
  Sparkles,
} from "lucide-react";

export function FeatureGrid() {
  const features = [
    {
      icon: Lock,
      title: "100% Zero-Cloud PHI Egress",
      description:
        "Engineered for strict HIPAA compliance. All inference is powered by local Gemma 3 models via Ollama. Patient data never leaves your hospital perimeter.",
      accent: "from-emerald-500 to-teal-600",
    },
    {
      icon: Database,
      title: "pgvector HNSW Cosine Search",
      description:
        "Sub-millisecond hybrid vector retrieval matches complex payer policies (Humana, UnitedHealthcare, BCBS) against patient diagnoses and CPT codes.",
      accent: "from-teal-500 to-cyan-600",
    },
    {
      icon: Cpu,
      title: "Deterministic LangGraph StateGraph",
      description:
        "A 4-node deterministic pipeline replacing unreliable single-prompt LLMs with rigorous sequential state transitions and verifiable clinical safeguards.",
      accent: "from-cyan-500 to-blue-600",
    },
    {
      icon: Activity,
      title: "Real-Time SSE Streaming Telemetry",
      description:
        "Inspect the agent's live reasoning step-by-step. Live Server-Sent Events stream node transitions, execution logs, and token benchmarks into the browser.",
      accent: "from-emerald-400 to-green-600",
    },
    {
      icon: Sparkles,
      title: "Automated Exception Justification",
      description:
        "Detects clinical contraindications (e.g., severe NSAID gastric ulcers or advanced renal disease) and automatically builds exception appeals citing payer guidelines.",
      accent: "from-teal-400 to-emerald-600",
    },
    {
      icon: FileCheck2,
      title: "Audit-Ready Clinical Citations",
      description:
        "Eliminates hallucination by attaching exact EHR dates, dosages, and imaging quote excerpts to every evaluation point in the final packet.",
      accent: "from-cyan-400 to-teal-600",
    },
  ];

  return (
    <section id="features" className="py-24 bg-slate-950 relative border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Technical Capabilities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered for Production Healthcare Systems
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            Built from the ground up to satisfy clinical chiefs of medicine, hospital compliance officers, and IT security teams.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-sm hover:border-emerald-500/40 hover:bg-slate-900/90 transition-all group shadow-lg"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.accent} flex items-center justify-center text-white mb-5 shadow-lg shadow-emerald-950/40 group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
