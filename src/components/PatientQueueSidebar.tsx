
"use client";

import {
  User,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  Send,
  Building2,
  FileSpreadsheet,
} from "lucide-react";
import type { PatientQueueItem } from "@/types/prior-auth";

interface PatientQueueSidebarProps {
  patients: PatientQueueItem[];
  selectedPatientId: number | null;
  onSelectPatient: (patient: PatientQueueItem) => void;
  isLoading: boolean;
}

export function PatientQueueSidebar({
  patients,
  selectedPatientId,
  onSelectPatient,
  isLoading,
}: PatientQueueSidebarProps) {
  // Compute age from DOB string deterministically
  const getAge = (dob: string) => {
    try {
      const year = parseInt(dob.split("-")[0], 10);
      return isNaN(year) ? null : 2026 - year;
    } catch {
      return null;
    }
  };

  return (
    <aside className="w-full lg:w-80 shrink-0 border-r border-slate-800 bg-slate-950/60 p-4 flex flex-col gap-3">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-white tracking-wide">
            Prior-Auth Intake Queue
          </h2>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
          {patients.length} charts
        </span>
      </div>

      {/* Loading Skeleton */}
      {isLoading && patients.length === 0 && (
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2.5 animate-pulse"
            >
              <div className="h-4 bg-slate-800 rounded w-2/3" />
              <div className="h-3 bg-slate-800 rounded w-1/2" />
              <div className="h-2 bg-slate-800 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Patient Cards List */}
      <div className="flex flex-col gap-2.5 overflow-y-auto">
        {patients.map((p) => {
          const isSelected = p.id === selectedPatientId;
          const age = getAge(p.dob);
          const confidence = p.confidence_score ?? 0;
          const missingCount = p.missing_items?.length ?? 0;

          // Status Badge Logic
          let badgeColor = "bg-slate-800 text-slate-300 border-slate-700";
          let badgeText = "Pending Prep";
          let BadgeIcon = Clock;

          if (p.status === "SUBMITTED" || p.readiness_status === "APPROVED_AND_SUBMITTED") {
            badgeColor =
              "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
            badgeText = "Approved & Submitted";
            BadgeIcon = Send;
          } else if (p.status === "PENDING_PREP") {
            badgeColor = "bg-slate-900 text-slate-400 border-slate-800";
            badgeText = "Pending Overnight Prep";
            BadgeIcon = Clock;
          } else if (p.readiness_status === "READY_TO_SUBMIT") {
            badgeColor =
              "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
            badgeText = "100% Ready to Submit";
            BadgeIcon = CheckCircle2;
          } else if (p.readiness_status === "EXCEPTION_REQUIRED") {
            badgeColor =
              "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
            badgeText = "Exception Justified";
            BadgeIcon = Zap;
          } else if (p.readiness_status === "MISSING_INFO") {
            badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/30";
            badgeText = `Action: ${missingCount} Missing Lab`;
            BadgeIcon = AlertTriangle;
          }

          return (
            <button
              key={p.id}
              onClick={() => onSelectPatient(p)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 relative group ${isSelected
                ? "bg-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-500/5 ring-1 ring-emerald-500/40"
                : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700 text-slate-300"
                }`}
            >
              {/* Active Selection Indicator Bar */}
              {isSelected && (
                <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r bg-emerald-400" />
              )}

              {/* Patient Basic Info Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                      {p.patient_name}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {p.patient_id_code} {age ? `• ${age} yrs` : ""}
                    </p>
                  </div>
                </div>

                {/* Payer Pill Badge */}
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700/60 flex items-center gap-1 shrink-0">
                  <Building2 className="w-2.5 h-2.5 text-slate-400" />
                  {p.payer_name}
                </span>
              </div>

              {/* Procedure & Code */}
              <div className="mt-2.5">
                <p className="text-xs font-medium text-slate-200 line-clamp-1">
                  {p.requested_procedure}
                </p>
                <p className="text-[11px] text-slate-400">
                  CPT/HCPCS:{" "}
                  <span className="font-mono text-slate-300">
                    {p.procedure_code}
                  </span>
                </p>
              </div>

              {/* Dynamic Status Badge */}
              <div className="mt-3 flex items-center justify-between gap-2">
                <span
                  className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${badgeColor}`}
                >
                  <BadgeIcon className="w-3 h-3" />
                  {badgeText}
                </span>

                {/* Confidence percentage if prepped */}
                {p.status !== "PENDING_PREP" && (
                  <span className="text-[11px] font-mono font-medium text-slate-400">
                    {confidence}% match
                  </span>
                )}
              </div>

              {/* Mini Confidence Progress Bar */}
              {p.status !== "PENDING_PREP" && (
                <div className="mt-2 w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${p.readiness_status === "MISSING_INFO"
                      ? "bg-rose-500"
                      : p.readiness_status === "EXCEPTION_REQUIRED"
                        ? "bg-indigo-400"
                        : "bg-emerald-400"
                      }`}
                    style={{ width: `${confidence}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
