"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { TopControlBar } from "@/components/TopControlBar";
import {
  AgentExecutionStepper,
  type StepperState,
} from "@/components/AgentExecutionStepper";
import { PatientQueueSidebar } from "@/components/PatientQueueSidebar";
import { PacketInspector } from "@/components/PacketInspector";
import { TelemetryFooter } from "@/components/TelemetryFooter";
import type {
  PatientQueueItem,
  QueueStats,
  StreamEvent,
} from "@/types/prior-auth";
import { CheckCircle2, AlertCircle, Info, X, Loader2 } from "lucide-react";

interface ToastNotification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export default function PriorAuthDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [patients, setPatients] = useState<PatientQueueItem[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Agent Stepper execution state
  const [stepperState, setStepperState] = useState<StepperState>({
    isRunning: false,
    activeStep: 0,
    logs: [],
  });

  // Client protection check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/signin?redirect=/dashboard");
    }
  }, [user, authLoading, router]);

  // Add toast helper
  const addToast = (type: "success" | "error" | "info", message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ---------------------------------------------------------------------------
  // Fetch Queue & Stats from GET /api/prior-auth/queue
  // ---------------------------------------------------------------------------
  const fetchQueue = useCallback(async (preserveSelection = true) => {
    try {
      const res = await fetch("/api/prior-auth/queue", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.success) {
        setPatients(data.patients);
        setStats(data.stats);

        setSelectedPatientId((curr) => {
          if (preserveSelection && curr) {
            const exists = data.patients.some((p: PatientQueueItem) => p.id === curr);
            if (exists) return curr;
          }
          return data.patients[0]?.id ?? null;
        });
      }
    } catch (err: unknown) {
      console.error("Failed to fetch prior-auth queue:", err);
      addToast(
        "error",
        err instanceof Error ? err.message : "Failed to load prior-auth queue"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchQueue(false);
    }
  }, [user, fetchQueue]);

  // Currently active patient
  const selectedPatient =
    patients.find((p) => p.id === selectedPatientId) ?? patients[0] ?? null;

  // SSE Streaming Runner (Handles both batch & single patient)
  const runAgentWithStreaming = async (requestId?: number) => {
    setStepperState({
      isRunning: true,
      activeStep: 1,
      logs: [
        requestId
          ? `[Stream Init] Triggering LangGraph agent for Request #${requestId}...`
          : "[Stream Init] Launching Overnight SlothAuth Batch Engine...",
      ],
      currentPatientName: requestId ? selectedPatient?.patient_name : undefined,
      currentProcedure: requestId
        ? selectedPatient?.requested_procedure
        : undefined,
    });

    try {
      const response = await fetch("/api/prior-auth/prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, stream: true }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Prep stream failed (HTTP ${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event: StreamEvent = JSON.parse(line.replace("data: ", ""));

              if (event.type === "patient_start") {
                setStepperState((prev) => ({
                  ...prev,
                  currentPatientName: event.patientName,
                  currentProcedure: event.requestedProcedure,
                  logs: [
                    ...prev.logs,
                    `[Patient Start] #${event.requestId}: ${event.patientName} (${event.requestedProcedure})`,
                  ],
                }));
                if (event.requestId) {
                  setSelectedPatientId(event.requestId);
                }
              } else if (event.type === "node_active") {
                setStepperState((prev) => ({
                  ...prev,
                  activeStep: event.step || prev.activeStep,
                  logs: [
                    ...prev.logs,
                    `[Active Step ${event.step}] ${event.stepLabel}`,
                  ],
                }));
              } else if (event.type === "node_complete") {
                setStepperState((prev) => ({
                  ...prev,
                  logs: [
                    ...prev.logs,
                    ...(event.logs || []),
                    `✔ Step ${event.step} (${event.stepLabel}) completed`,
                  ],
                }));
              } else if (event.type === "patient_complete") {
                setStepperState((prev) => ({
                  ...prev,
                  lastCompletedVerdict: event.readinessVerdict,
                  lastCompletedConfidence: event.confidenceScore,
                  logs: [
                    ...prev.logs,
                    `🎉 Packet #${event.packetId} complete: Verdict = ${event.readinessVerdict} (${event.confidenceScore}% confidence)`,
                  ],
                }));
                await fetchQueue(true);
              } else if (event.type === "batch_complete") {
                setStepperState((prev) => ({
                  ...prev,
                  isRunning: false,
                  activeStep: 4,
                  logs: [
                    ...prev.logs,
                    `✨ Batch prep successfully completed for ${event.totalProcessed} patients!`,
                  ],
                }));
                addToast(
                  "success",
                  `Overnight batch finished! ${event.totalProcessed} packets prepped.`
                );
                await fetchQueue(true);
              } else if (event.type === "error") {
                setStepperState((prev) => ({
                  ...prev,
                  isRunning: false,
                  logs: [...prev.logs, `❌ Error: ${event.error}`],
                }));
                addToast("error", event.error || "Streaming error occurred");
              }
            } catch {
              // Partial line in chunk
            }
          }
        }
      }
    } catch (err: unknown) {
      console.error("Streaming error:", err);
      setStepperState((prev) => ({
        ...prev,
        isRunning: false,
        logs: [
          ...prev.logs,
          `❌ Execution halted: ${err instanceof Error ? err.message : "Network/Agent Error"
          }`,
        ],
      }));
      addToast(
        "error",
        err instanceof Error ? err.message : "Agent execution failed"
      );
    } finally {
      setStepperState((prev) => ({ ...prev, isRunning: false }));
      await fetchQueue(true);
    }
  };

  // Action Handlers
  const handleRunOvernightPrep = () => {
    runAgentWithStreaming();
  };

  const handlePrepSelectedPatient = () => {
    if (selectedPatientId) {
      runAgentWithStreaming(selectedPatientId);
    }
  };

  const handleResetDemo = async () => {
    try {
      const res = await fetch("/api/prior-auth/reset", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        addToast("info", data.message || "Simulation database reset.");
        setStepperState({
          isRunning: false,
          activeStep: 0,
          logs: ["[System Reset] All prepped packets cleared. Status reset to PENDING_PREP."],
        });
        await fetchQueue(false);
      } else {
        throw new Error(data.error || "Reset failed");
      }
    } catch (err: unknown) {
      addToast(
        "error",
        err instanceof Error ? err.message : "Failed to reset demo"
      );
    }
  };

  const handleSaveDraft = async (patientId: number, draftLetter: string) => {
    try {
      const res = await fetch(`/api/prior-auth/packet/${patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SAVE_DRAFT",
          draftJustificationLetter: draftLetter,
        }),
      });
      const data = await res.json();
      if (data.success) {
        addToast("success", "Draft justification letter saved.");
        await fetchQueue(true);
      } else {
        throw new Error(data.error || "Save draft failed");
      }
    } catch (err: unknown) {
      addToast(
        "error",
        err instanceof Error ? err.message : "Failed to save draft"
      );
    }
  };

  const handleResolveMissingItem = async (
    patientId: number,
    missingItem: string
  ) => {
    try {
      const res = await fetch(`/api/prior-auth/packet/${patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESOLVE_MISSING_ITEM",
          resolvedMissingItem: missingItem,
        }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(
          "success",
          "Documentation verified! Requirement resolved and packet upgraded to READY."
        );
        await fetchQueue(true);
      } else {
        throw new Error(data.error || "Failed to resolve missing item");
      }
    } catch (err: unknown) {
      addToast(
        "error",
        err instanceof Error ? err.message : "Failed to resolve item"
      );
    }
  };

  const handleApproveAndSubmit = async (
    patientId: number,
    clinicianSignerName: string
  ) => {
    try {
      const res = await fetch(`/api/prior-auth/packet/${patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "APPROVE_AND_SUBMIT",
          clinicianSignerName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(
          "success",
          `Packet electronically signed by ${clinicianSignerName} and submitted!`
        );
        await fetchQueue(true);
      } else {
        throw new Error(data.error || "Failed to sign and submit packet");
      }
    } catch (err: unknown) {
      addToast(
        "error",
        err instanceof Error ? err.message : "Failed to approve packet"
      );
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <div className="flex items-center gap-2 text-2xl font-bold text-white">
          <span>🦥</span> Sloth<span className="text-emerald-400">Auth</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Verifying HIPAA clinical session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-16 selection:bg-emerald-500 selection:text-slate-950">
      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-xl text-xs backdrop-blur-md transition-all animate-in slide-in-from-top-2 ${t.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
              : t.type === "error"
                ? "bg-rose-950/90 border-rose-500/50 text-rose-200"
                : "bg-slate-900/90 border-slate-700 text-slate-200"
              }`}
          >
            <div className="flex items-center gap-2">
              {t.type === "success" && (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              {t.type === "error" && (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              {t.type === "info" && (
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
              )}
              <span className="font-medium leading-tight">{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* 1. Top Summary & Control Bar Header */}
      <TopControlBar
        stats={stats}
        isRunning={stepperState.isRunning}
        selectedPatientName={selectedPatient?.patient_name}
        onRunOvernightPrep={handleRunOvernightPrep}
        onPrepSelectedPatient={handlePrepSelectedPatient}
        onResetDemo={handleResetDemo}
      />

      {/* 2. Live Agent Execution Stepper */}
      <AgentExecutionStepper stepperState={stepperState} />

      {/* 3. Main Dashboard Workspace (Sidebar + Split Inspector) */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Patient Queue Sidebar */}
        <PatientQueueSidebar
          patients={patients}
          selectedPatientId={selectedPatientId}
          onSelectPatient={(p) => setSelectedPatientId(p.id)}
          isLoading={isLoading}
        />

        {/* Right Main Split Inspector Workspace */}
        <PacketInspector
          key={selectedPatient?.id ?? "none"}
          patient={selectedPatient}
          onPrepPatient={(id) => runAgentWithStreaming(id)}
          onSaveDraft={handleSaveDraft}
          onResolveMissingItem={handleResolveMissingItem}
          onApproveAndSubmit={handleApproveAndSubmit}
          isPrepping={stepperState.isRunning}
        />
      </main>

      {/* 4. Local Privacy & Zero-Cost Telemetry Footer */}
      <TelemetryFooter telemetry={stats?.telemetry} />
    </div>
  );
}
