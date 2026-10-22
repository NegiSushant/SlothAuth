"use client";

import React, { useState } from "react";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Copy,
  Check,
  Save,
  Send,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Activity,
  PlusCircle,
  FileCode,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import type { PatientQueueItem, CriterionItem } from "@/types/prior-auth";

interface PacketInspectorProps {
  patient: PatientQueueItem | null;
  onPrepPatient: (patientId: number) => void;
  onSaveDraft: (patientId: number, draftLetter: string) => Promise<void>;
  onResolveMissingItem: (
    patientId: number,
    missingItem: string
  ) => Promise<void>;
  onApproveAndSubmit: (
    patientId: number,
    signerName: string
  ) => Promise<void>;
  isPrepping: boolean;
}

export function PacketInspector({
  patient,
  onPrepPatient,
  onSaveDraft,
  onResolveMissingItem,
  onApproveAndSubmit,
  isPrepping,
}: PacketInspectorProps) {
  const [editableLetter, setEditableLetter] = useState(
    patient?.draft_justification_letter || ""
  );
  const [signerName, setSignerName] = useState(
    "Dr. Sarah Jenkins, MD — Attending Physician"
  );
  const [isCopied, setIsCopied] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResolving, setIsResolving] = useState<string | null>(null);


  if (!patient) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
        <Stethoscope className="w-12 h-12 text-slate-600 mb-3" />
        <h3 className="text-base font-semibold text-slate-300">
          No Patient Chart Selected
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Select a patient from the left queue to view and audit their prior-auth packet.
        </p>
      </div>
    );
  }

  const isPending = patient.status === "PENDING_PREP";
  const isSubmitted =
    patient.status === "SUBMITTED" ||
    patient.readiness_status === "APPROVED_AND_SUBMITTED";
  const missingItems = patient.missing_items || [];
  const criteria = (patient.criteria_checklist as CriterionItem[]) || [];

  // Copy letter to clipboard
  const handleCopy = async () => {
    if (!editableLetter) return;
    await navigator.clipboard.writeText(editableLetter);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Save manual edits
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await onSaveDraft(patient.id, editableLetter);
    } finally {
      setIsSaving(false);
    }
  };

  // Resolve missing lab
  const handleResolve = async (item: string) => {
    setIsResolving(item);
    try {
      await onResolveMissingItem(patient.id, item);
    } finally {
      setIsResolving(null);
    }
  };

  // Approve & Submit
  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApproveAndSubmit(patient.id, signerName);
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount = editableLetter
    ? editableLetter.trim().split(/\s+/).length
    : 0;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      {/* Top Patient Demographics Banner */}
      <div className="bg-slate-900/80 border-b border-slate-800 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-white">
                {patient.patient_name}
              </h2>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {patient.patient_id_code}
              </span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Member ID: {patient.member_id}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
              <span>
                DOB:{" "}
                <strong className="text-slate-200">
                  {typeof patient.dob === "string"
                    ? patient.dob.split("T")[0]
                    : String(patient.dob)}
                </strong>
              </span>
              <span>•</span>
              <span>
                Payer:{" "}
                <strong className="text-slate-200">
                  {patient.payer_name}
                </strong>
              </span>
              <span>•</span>
              <span>
                Requested:{" "}
                <strong className="text-emerald-400">
                  {patient.requested_procedure}
                </strong>{" "}
                ({patient.procedure_code})
              </span>
              <span>•</span>
              <span>
                ICD-10:{" "}
                <strong className="text-slate-200 font-mono">
                  {patient.diagnosis_codes?.join(", ")}
                </strong>
              </span>
            </div>
          </div>

          {/* Inspect Raw EHR Chart Button */}
          <button
            onClick={() => setShowChartModal(!showChartModal)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors shrink-0"
          >
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {showChartModal ? "Hide EHR Chart" : "Inspect Raw EHR Chart"}
            </span>
            {showChartModal ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Accordion / Drawer: Raw EHR Chart Inspection */}
        {showChartModal && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 max-h-60 overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
              <span className="font-semibold text-emerald-400">
                Ground Truth Clinical Chart Payload (JSONB)
              </span>
              <span className="text-[10px] text-slate-400">
                Extracted from PostgreSQL patient_requests table
              </span>
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed">
              {JSON.stringify(patient.clinical_notes, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Main Content Area: Split View or Unprepped Empty State */}
      {isPending ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-3xl mb-4 shadow-lg shadow-emerald-500/10">
            🦥
          </div>
          <h3 className="text-lg font-bold text-white">
            Prior-Auth Packet Not Yet Prepped
          </h3>
          <p className="text-sm text-slate-400 max-w-md mt-1.5">
            This patient chart is currently in{" "}
            <code className="text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
              PENDING_PREP
            </code>{" "}
            status. Let SlothAuth scan the EHR timeline, match {patient.payer_name} clinical policies, and synthesize the justification letter.
          </p>
          <button
            onClick={() => onPrepPatient(patient.id)}
            disabled={isPrepping}
            className="mt-6 flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-60 transition-all"
          >
            {isPrepping ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Prepping Chart with Local Gemma...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current" />
                <span>Run Local Gemma Agent on This Patient Now</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* 2-Column Split View: Evidence Map on Left, Draft Letter Workspace on Right */
        <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 divide-y xl:divide-y-0 xl:divide-x divide-slate-800">
          {/* ============================================================= */}
          {/* LEFT PANEL: Payer Policy vs. Chart Evidence Map (col-span-6) */}
          {/* ============================================================= */}
          <div className="xl:col-span-6 p-5 flex flex-col gap-4 overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Payer Policy vs. Chart Evidence Map
                </h3>
              </div>
              <span className="text-xs font-medium text-slate-400">
                {criteria.length} Criteria Evaluated
              </span>
            </div>

            {/* Missing Documentation Alert Box (Scenario 2 specific) */}
            {missingItems.length > 0 && (
              <div className="rounded-xl bg-rose-950/30 border border-rose-500/40 p-4 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    Clinician Action Required Before Submission ({missingItems.length} Gap)
                  </span>
                </div>
                <p className="text-xs text-rose-300/90 leading-relaxed">
                  SlothAuth detected missing clinical documentation mandated by{" "}
                  {patient.payer_name} policy. Resolving this now prevents a 14-day delay and denial.
                </p>

                <div className="space-y-2 pt-1">
                  {missingItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-rose-950/60 border border-rose-800/60"
                    >
                      <div className="text-xs font-medium text-slate-200">
                        • {item}
                      </div>
                      <button
                        onClick={() => handleResolve(item)}
                        disabled={isResolving === item}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all shrink-0 active:scale-95 disabled:opacity-50"
                      >
                        {isResolving === item ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-emerald-950 border-t-transparent rounded-full animate-spin" />
                            <span>Attaching...</span>
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>+ Order Lab / Attach Verified Result</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evaluated Criteria Cards List */}
            <div className="space-y-3">
              {criteria.map((c, idx) => {
                const isException = c.status === "EXCEPTION_JUSTIFIED";
                const isMissing = c.status === "MISSING" || !c.met;

                return (
                  <div
                    key={idx}
                    className={`rounded-xl border p-4 transition-all ${
                      isMissing
                        ? "bg-rose-950/10 border-rose-500/30 text-rose-200"
                        : isException
                        ? "bg-indigo-950/20 border-indigo-500/40 text-indigo-200"
                        : "bg-slate-900/60 border-slate-800/80 text-slate-200"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-400 font-mono">
                          #{idx + 1}
                        </span>
                        <h4 className="text-xs font-semibold text-white">
                          {c.criterion}
                        </h4>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 flex items-center gap-1 ${
                          isMissing
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                            : isException
                            ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        }`}
                      >
                        {isMissing ? (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            Missing in EHR
                          </>
                        ) : isException ? (
                          <>
                            <Zap className="w-3 h-3 text-indigo-400" />
                            Step-Therapy Exception
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Criteria Met
                          </>
                        )}
                      </span>
                    </div>

                    {/* Extracted Chart Evidence Quote Citation Block */}
                    <div className="mt-3 pl-3 border-l-2 border-emerald-500/50 bg-slate-950/50 p-2.5 rounded-r-lg">
                      <p className="text-xs text-slate-300 italic leading-relaxed">
                        &ldquo;{c.evidence_quote}&rdquo;
                      </p>
                      {c.source_date && (
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">
                          Documentation Source: {c.source_date}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ============================================================= */}
          {/* RIGHT PANEL: Draft Medical Necessity Packet Workspace (col-span-6) */}
          {/* ============================================================= */}
          <div className="xl:col-span-6 p-5 flex flex-col gap-4 bg-slate-950/40 overflow-y-auto">
            {/* Workspace Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Draft Medical Necessity Packet
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  ({wordCount} words)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Save Draft Edits Button */}
                <button
                  onClick={handleSaveDraft}
                  disabled={isSaving || isSubmitted}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-850 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isSaving ? "Saving..." : "Save Draft"}</span>
                </button>

                {/* Copy Packet Button */}
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-850 rounded-lg transition-colors"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Packet</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Editable Letter Document Textarea */}
            <div className="flex-1 min-h-[340px] flex flex-col">
              <textarea
                value={editableLetter}
                onChange={(e) => setEditableLetter(e.target.value)}
                disabled={isSubmitted}
                placeholder="Prior authorization justification letter will appear here..."
                className="w-full flex-1 p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs leading-relaxed text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 resize-y min-h-[360px] shadow-inner"
              />
            </div>

            {/* Clinician Sign-Off Footer Bar */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Clinician Sign-Off &amp; Electronic Submission
                </span>
                {isSubmitted && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Submitted
                  </span>
                )}
              </div>

              {isSubmitted ? (
                <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-cyan-400" />
                  <span>
                    This packet has been electronically signed and queued for direct EDI payer submission.
                  </span>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Attending Clinician / Reviewer:
                    </label>
                    <input
                      type="text"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    onClick={handleApprove}
                    disabled={
                      isSubmitting ||
                      missingItems.length > 0 ||
                      !editableLetter
                    }
                    title={
                      missingItems.length > 0
                        ? "Resolve all missing documentation before signing"
                        : "Approve, sign, and submit packet"
                    }
                    className="sm:self-end flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 rounded-lg shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 fill-current" />
                        <span>Approve &amp; Sign Packet</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
