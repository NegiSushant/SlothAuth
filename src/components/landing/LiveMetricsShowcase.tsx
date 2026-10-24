"use client";

import React, { useState } from "react";
import { Calculator, DollarSign, Clock, Users, ArrowUpRight } from "lucide-react";

export function LiveMetricsShowcase() {
  const [monthlyRequests, setMonthlyRequests] = useState<number>(150);

  // Calculations:
  // Each request takes 45 mins manually vs 1 min with SlothAuth -> 44 mins saved
  const hoursSavedPerMonth = Math.round((monthlyRequests * 44) / 60);
  // Average administrative cost per request is ~$85 manual vs ~$5 with SlothAuth -> $80 saved
  const dollarsSavedPerMonth = monthlyRequests * 80;
  // Doctor full workdays recovered (assuming 8h day)
  const doctorDaysRecovered = Math.round((hoursSavedPerMonth / 8) * 10) / 10;

  return (
    <section id="calculator" className="py-24 bg-slate-900/30 relative border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Left: Input controls */}
            <div className="w-full lg:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <Calculator className="w-3.5 h-3.5" />
                <span>Interactive Hospital ROI Calculator</span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Estimate Your Hospital&apos;s Time &amp; Cost Savings
                </h3>
                <p className="text-sm text-slate-400 mt-2">
                  See how much physician burnout and overhead SlothAuth eliminates across your clinical department every single month.
                </p>
              </div>

              {/* Slider */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Monthly Prior-Auth Requests:</span>
                  <span className="text-emerald-400 font-bold font-mono text-base">
                    {monthlyRequests} requests / mo
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="10"
                  value={monthlyRequests}
                  onChange={(e) => setMonthlyRequests(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>Small Clinic (20)</span>
                  <span>Community Hospital (250)</span>
                  <span>Health Network (1000+)</span>
                </div>
              </div>
            </div>

            {/* Right: Calculated KPI Cards */}
            <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Metric 1 */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between text-emerald-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Clinical Hours Saved
                  </span>
                  <Clock className="w-4 h-4" />
                </div>
                <p className="text-3xl font-extrabold text-white">
                  {hoursSavedPerMonth.toLocaleString()} hrs
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  ≈ {doctorDaysRecovered} full physician workdays saved
                </p>
              </div>

              {/* Metric 2 */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between text-teal-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Overhead Conserved
                  </span>
                  <DollarSign className="w-4 h-4" />
                </div>
                <p className="text-3xl font-extrabold text-emerald-400">
                  ${dollarsSavedPerMonth.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400 mt-1">per month in administrative waste</p>
              </div>

              {/* Metric 3 */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between text-cyan-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Time to Approval
                  </span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <p className="text-3xl font-extrabold text-white">&lt; 24 hrs</p>
                <p className="text-xs text-slate-400 mt-1">down from standard 10–14 business days</p>
              </div>

              {/* Metric 4 */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between text-emerald-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Cloud API Costs
                  </span>
                  <Users className="w-4 h-4" />
                </div>
                <p className="text-3xl font-extrabold text-white">$0.00</p>
                <p className="text-xs text-slate-400 mt-1">local Gemma inference on hospital hardware</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
