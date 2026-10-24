import React from "react";
import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand */}
          <div className="space-y-4 max-w-sm">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/20">
                🦥
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Sloth<span className="text-emerald-400">Auth</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Autonomous Overnight Prior-Authorization Preparation Agent. Powered by LangGraph, PostgreSQL pgvector, and local Gemma 3.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>100% On-Premise • Zero PHI Cloud Egress</span>
            </div>
          </div>

          {/* Quick Links Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
            {/* Col 1 */}
            <div className="space-y-3">
              <p className="font-bold text-white uppercase tracking-wider text-[11px]">
                Product Flow
              </p>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#workflow" className="hover:text-emerald-400 transition-colors">
                    Agent Pipeline
                  </a>
                </li>
                <li>
                  <a href="#hackathon" className="hover:text-emerald-400 transition-colors">
                    Hackathon Problem
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-emerald-400 transition-colors">
                    Key Features
                  </a>
                </li>
                <li>
                  <a href="#calculator" className="hover:text-emerald-400 transition-colors">
                    ROI Impact
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 2 */}
            <div className="space-y-3">
              <p className="font-bold text-white uppercase tracking-wider text-[11px]">
                Clinical Access
              </p>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="/signin" className="hover:text-emerald-400 transition-colors">
                    Clinician Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-emerald-400 transition-colors">
                    Register Facility
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">
                    Prior-Auth Console
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-3 col-span-2 sm:col-span-1">
              <p className="font-bold text-white uppercase tracking-wider text-[11px]">
                Hackathon 2025
              </p>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-center gap-1 text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Autonomous AI Agents</span>
                </li>
                <li>Healthcare Track</li>
                <li>Open Source &amp; HIPAA-safe</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom copyright and motto */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2025 SlothAuth. Built for healthcare providers &amp; patients everywhere.</p>
          <p className="flex items-center gap-1.5 text-slate-400">
            <span>Slow &amp; Steady — Rewarding Clinical Laziness</span>
            <span>🦥</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
