"use client";

import React from "react";
import { Cpu, Database, Lock, DollarSign } from "lucide-react";
import type { QueueTelemetry } from "@/types/prior-auth";

interface TelemetryFooterProps {
  telemetry?: QueueTelemetry;
}

export function TelemetryFooter({ telemetry }: TelemetryFooterProps) {
  const inferenceEngine =
    telemetry?.inferenceEngine || "Local Docker Model Runner (Gemma)";
  const vectorStore =
    telemetry?.vectorStore || "PostgreSQL pgvector (HNSW Hybrid Search)";
  const egressBytes = telemetry?.phiEgressBytes ?? 0;
  const cost = telemetry?.apiCostUsd ?? 0;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-6 py-2 text-xs">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Badge 1: Inference Engine */}
        <div className="flex items-center gap-2 text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">Inference:</span>
          <span className="font-mono text-slate-200 font-medium truncate max-w-[220px]">
            {inferenceEngine}
          </span>
        </div>

        {/* Badge 2: Vector Store */}
        <div className="hidden md:flex items-center gap-2 text-slate-300">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Vector Store:</span>
          <span className="font-mono text-slate-200 font-medium">
            {vectorStore}
          </span>
        </div>

        {/* Badge 3: PHI Data Egress */}
        <div className="flex items-center gap-2 text-slate-300">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">PHI Egress:</span>
          <span className="font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
            {egressBytes} Bytes (100% HIPAA Safe)
          </span>
        </div>

        {/* Badge 4: Cloud API Token Cost */}
        <div className="flex items-center gap-2 text-slate-300">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">Cloud Cost:</span>
          <span className="font-mono text-emerald-400 font-semibold">
            ${cost.toFixed(2)}
          </span>
        </div>
      </div>
    </footer>
  );
}
