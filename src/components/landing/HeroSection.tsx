"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  Lock,
  GitBranch,
  CheckCircle2,
} from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#10b981 1px, transparent 1px), linear-gradient(to right, #10b981 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Hackathon Spotlight Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-8 shadow-xl shadow-emerald-950/40 backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Autonomous AI Agents Hackathon 2025</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">Healthcare Track</span>
        </div>

        {/* Hero Main Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.12]">
          The Prior-Authorization Agent That Works{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            While Clinicians Sleep
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Overnight autonomous chart auditing, payer policy retrieval, and medical necessity packet assembly powered by a deterministic 4-node LangGraph pipeline on local Gemma 3.
          <strong className="text-emerald-400 font-semibold block sm:inline sm:ml-1">
            Zero cloud PHI egress. 100% HIPAA compliant.
          </strong>
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signin"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>Launch Clinical Console</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#workflow"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-semibold text-sm text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 transition-all flex items-center justify-center gap-2 shadow-lg hover:text-white"
          >
            <GitBranch className="w-4 h-4 text-emerald-400" />
            <span>Explore 5-Stage Agent Flow</span>
          </a>
        </div>

        {/* 4 Impact Metric Cards */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
          {/* Card 1 */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Time Saved</span>
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">45+ min</p>
            <p className="text-xs text-slate-400 mt-1">per prior-authorization packet prepared</p>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between text-teal-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Privacy Egress</span>
              <Lock className="w-4 h-4" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">0 Bytes</p>
            <p className="text-xs text-slate-400 mt-1">no patient PHI ever touches public cloud</p>
          </div>

          {/* Card 3 */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between text-cyan-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Architecture</span>
              <GitBranch className="w-4 h-4" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">4 Nodes</p>
            <p className="text-xs text-slate-400 mt-1">deterministic LangGraph state machine</p>
          </div>

          {/* Card 4 */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between text-emerald-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Approval Rate</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">94%+</p>
            <p className="text-xs text-slate-400 mt-1">first-pass clinical criterion adherence</p>
          </div>
        </div>
      </div>
    </section>
  );
}
