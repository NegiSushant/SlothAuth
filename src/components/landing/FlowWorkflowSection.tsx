"use client";

import React, { useState } from "react";
import {
  FileText,
  Database,
  Cpu,
  FileCheck,
  Send,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Terminal,
} from "lucide-react";

interface WorkflowStep {
  id: number;
  nodeName: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  description: string;
  inputData: string;
  outputData: string;
  verificationRule: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 1,
    nodeName: "extractPatientContext",
    title: "EHR Clinical Chart Ingestion",
    subtitle: "Parses structured history, conservative care, & diagnostics",
    icon: FileText,
    tag: "LangGraph Node 1",
    description:
      "Ingests raw EHR patient charts containing chief complaints, physical therapy logs, NSAID medication trials, imaging modality reports, and ICD-10 diagnosis codes.",
    inputData: `// PatientRequest Record
{
  "patient_name": "Eleanor Vance",
  "requested_procedure": "Total Knee Arthroplasty (CPT 27447)",
  "payer": "Humana Medicare Advantage",
  "diagnosis": ["M17.11 - Primary Osteoarthritis"],
  "clinical_notes": {
    "pt_completed": true,
    "pt_duration_weeks": 8,
    "nsaid_trials": ["Meloxicam 15mg QD - 12 wks"]
  }
}`,
    outputData: `// Extracted Clinical Context
{
  "patientContextSummary": "64yo female with severe right knee OA (Kellgren-Lawrence Grade IV), completed 8 weeks physical therapy with persistent severe functional pain, failed 12-week Meloxicam trial.",
  "procedureCode": "27447",
  "payerName": "Humana"
}`,
    verificationRule: "Normalizes CPT/ICD codes and prepares deterministic state context.",
  },
  {
    id: 2,
    nodeName: "retrievePolicyChunks",
    title: "pgvector Policy Retrieval",
    subtitle: "HNSW cosine vector search against payer guidelines",
    icon: Database,
    tag: "LangGraph Node 2",
    description:
      "Executes a hybrid pgvector query combining payer name and CPT code filters with 1024-dimensional embedding cosine similarity to locate exact clinical policy sections.",
    inputData: `// SQL pgvector Vector Search
SELECT chunk_text, policy_number, section_name,
       1 - (embedding <=> $embedding) AS similarity
FROM payer_policies
WHERE payer_name = 'Humana' 
  AND procedure_code = '27447'
ORDER BY similarity DESC LIMIT 3;`,
    outputData: `// Retrieved Policy Chunk
{
  "policy_number": "HUM-MSK-2025-04",
  "policy_title": "Total Knee Arthroplasty Clinical Criteria",
  "section": "Conservative Therapy & Radiographic Indicators",
  "chunk_text": "Requires: 1. Kellgren-Lawrence Grade III/IV OA. 2. Min 6 weeks supervised PT. 3. Trial of >=1 NSAID or documented contraindication."
}`,
    verificationRule: "Payer medical guidelines indexed locally in PostgreSQL with zero external cloud API lookups.",
  },
  {
    id: 3,
    nodeName: "auditClinicalCriteria",
    title: "Deterministic Criteria Audit",
    subtitle: "Strict rule validation: conservative care, labs, & contraindications",
    icon: Cpu,
    tag: "LangGraph Node 3",
    description:
      "Audits patient notes against retrieved policy clauses. Flags criteria as MET, MISSING, or EXCEPTION_JUSTIFIED with direct timestamped evidence quotes.",
    inputData: `// Audit Inputs
- Extracted Patient Clinical History
- Humana Policy Requirements (Grade III/IV, 6w PT, NSAID)`,
    outputData: `// Criteria Checklist Evaluation
[
  {
    "criterion": "Kellgren-Lawrence Grade III/IV joint space narrowing",
    "met": true,
    "status": "MET",
    "evidence_quote": "AP and lateral radiographs demonstrate severe medial joint space narrowing (Grade IV)."
  },
  {
    "criterion": "Minimum 6 weeks conservative physical therapy",
    "met": true,
    "status": "MET",
    "evidence_quote": "Patient completed 8 weeks supervised PT (16 sessions) at Peak Rehab with minimal relief."
  }
]`,
    verificationRule: "Zero hallucination: every criterion requires direct clinical evidence citations.",
  },
  {
    id: 4,
    nodeName: "draftJustificationAndSave",
    title: "Medical Necessity Packet Synthesis",
    subtitle: "Drafts formal appeal letter, calculates score, & persists packet",
    icon: FileCheck,
    tag: "LangGraph Node 4",
    description:
      "Synthesizes a CMS-compliant Medical Necessity Justification Letter citing peer-reviewed evidence and chart notes, calculates confidence score, and assigns readiness status.",
    inputData: `// Packet Generation Inputs
- Patient Demographics & Identifiers
- Full Criteria Checklist & Missing Items
- Provider & Payer Meta`,
    outputData: `// Persisted PreppedPacket
{
  "readiness_status": "READY_TO_SUBMIT",
  "confidence_score": 96,
  "missing_items": [],
  "draft_justification_letter": "RE: PRIOR AUTHORIZATION REQUEST FOR TOTAL KNEE ARTHROPLASTY... Eleanor Vance meets all Humana Criteria under HUM-MSK-2025-04..."
}`,
    verificationRule: "Verdict calculated deterministically based on met vs required criteria count.",
  },
  {
    id: 5,
    nodeName: "clinicianSubmission",
    title: "1-Click Clinician Review & Telemetry",
    subtitle: "Attending doctor reviews, signs electronically, and submits",
    icon: Send,
    tag: "Human-In-The-Loop",
    description:
      "When the clinician logs in at 8:00 AM, all overnight charts are pre-sorted. With 1-click, the doctor signs electronically and submits, saving 45+ minutes per case.",
    inputData: `// Clinician Action
Action: APPROVE_AND_SUBMIT
Signer: Dr. Sarah Chen, MD (Chief Medical Officer)
Verification: Cryptographic Audit Stamp`,
    outputData: `// Submission Status
{
  "status": "APPROVED_AND_SUBMITTED",
  "phiEgressBytes": 0,
  "timeSaved": "45 mins",
  "apiCost": "$0.00 (On-Premises Local Inference)"
}`,
    verificationRule: "Full human clinician control: doctors maintain final medical sign-off authority.",
  },
];

export function FlowWorkflowSection() {
  const [activeStep, setActiveStep] = useState<number>(1);
  const current = WORKFLOW_STEPS.find((s) => s.id === activeStep) || WORKFLOW_STEPS[0];

  return (
    <section id="workflow" className="py-24 bg-slate-950 relative border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <span>Deterministic Agentic Pipeline</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How SlothAuth Works: End-to-End Workflow
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            A stateful LangGraph agent that transforms unorganized EHR notes into fully audited, citation-backed prior-authorization packets overnight.
          </p>
        </div>

        {/* 5-Step Visual Stepper Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
          {WORKFLOW_STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = step.id === activeStep;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(step.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                  isActive
                    ? "bg-emerald-950/40 border-emerald-500/80 shadow-lg shadow-emerald-950/50"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />
                )}
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      isActive
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-800 text-slate-400 group-hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-500">
                    0{step.id}
                  </span>
                </div>
                <p className="text-xs font-bold text-white truncate">{step.title}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{step.tag}</p>
              </button>
            );
          })}
        </div>

        {/* Interactive Deep-Dive Split Card */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left: Explanation & Verification Rule */}
            <div className="w-full lg:w-5/12 space-y-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {current.tag}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Node: {current.nodeName}()
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">{current.title}</h3>
                <p className="text-sm text-emerald-400/90 font-medium mt-1">
                  {current.subtitle}
                </p>
                <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                  {current.description}
                </p>
              </div>

              {/* Verification Rule Callout */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Clinical Governance &amp; Determinism</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {current.verificationRule}
                </p>
              </div>

              {/* Navigation stepper buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={activeStep === 1}
                  onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous Node
                </button>
                <button
                  type="button"
                  disabled={activeStep === WORKFLOW_STEPS.length}
                  onClick={() =>
                    setActiveStep(Math.min(WORKFLOW_STEPS.length, activeStep + 1))
                  }
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                >
                  <span>Next Node</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right: Code & Payload Terminal */}
            <div className="w-full lg:w-7/12 space-y-4">
              {/* Input Terminal */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-mono font-medium text-slate-300">
                      Step Input Data
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">JSON / SQL</span>
                </div>
                <pre className="p-4 text-xs font-mono text-emerald-300/90 overflow-x-auto max-h-48 leading-relaxed">
                  <code>{current.inputData}</code>
                </pre>
              </div>

              {/* Output Terminal */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-teal-400" />
                    <span className="text-xs font-mono font-medium text-slate-300">
                      Node Execution Output State
                    </span>
                  </div>
                  <span className="text-[10px] text-teal-400 font-mono">StateGraph Payload</span>
                </div>
                <pre className="p-4 text-xs font-mono text-cyan-300/90 overflow-x-auto max-h-56 leading-relaxed">
                  <code>{current.outputData}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
