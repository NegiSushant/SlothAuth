"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerPrompt: string;
  footerLinkText: string;
  footerLinkHref: string;
}

export function AuthCard({
  title,
  subtitle,
  children,
  footerPrompt,
  footerLinkText,
  footerLinkHref,
}: AuthCardProps) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient medical glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-600/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-teal-600/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#10b981 1px, transparent 1px), linear-gradient(to right, #10b981 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl hover:border-emerald-500/50 transition-all group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">🦥</span>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Sloth<span className="text-emerald-400">Auth</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              HIPAA Compliant
            </span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold tracking-tight text-white">{title}</h1>
          <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">{subtitle}</p>
        </div>

        {/* Card Box */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/80">
          {children}

          {/* Footer prompt */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400">
            {footerPrompt}{" "}
            <Link
              href={footerLinkHref}
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 transition-colors ml-1"
            >
              {footerLinkText}
            </Link>
          </div>
        </div>

        {/* Compliance pill */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Local Gemma 3 • Zero Cloud PHI Egress • On-Prem Verification</span>
        </div>
      </div>
    </div>
  );
}
