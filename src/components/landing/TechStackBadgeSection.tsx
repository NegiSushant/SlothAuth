"use client";

import React from "react";
import { Terminal, Shield, Sparkles } from "lucide-react";

export function TechStackBadgeSection() {
  const stackItems = [
    {
      name: "LangGraph",
      role: "Deterministic StateGraph Execution Engine",
      badge: "Agent Orchestration",
    },
    {
      name: "Next.js 16",
      role: "React 19 App Router & Streaming Architecture",
      badge: "Modern Web",
    },
    {
      name: "PostgreSQL pgvector",
      role: "HNSW Cosine Vector Indexing for Payer Policies",
      badge: "Vector DB",
    },
    {
      name: "Gemma 3 via Ollama",
      role: "Local Inference with 0 Bytes PHI Cloud Egress",
      badge: "HIPAA Compliant",
    },
    {
      name: "Prisma 7",
      role: "Type-safe Clinical Data & Packet Persistence",
      badge: "ORM & Schema",
    },
    {
      name: "Tailwind CSS v4",
      role: "High-contrast Clinical Dark-Mode Interface",
      badge: "Aesthetics",
    },
  ];

  return (
    <section className="py-16 bg-slate-950 relative border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Powered by Cutting-Edge Open-Weights &amp; Agentic Technologies
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {stackItems.map((tech, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 text-center hover:border-emerald-500/30 hover:bg-slate-900/80 transition-all group"
            >
              <span className="text-[10px] font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                {tech.badge}
              </span>
              <p className="font-bold text-sm text-white mt-2 group-hover:text-emerald-300 transition-colors">
                {tech.name}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                {tech.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
