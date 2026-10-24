import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  priorAuthWorkflow,
  runPriorAuthAgentForPatient,
  runOvernightSlothBatch,
} from "@/lib/agent/priorAuthGraph";


interface StepMeta {
  step: number;
  label: string;
}

const NODE_METADATA: Record<string, StepMeta> = {
  extractPatientContext: {
    step: 1,
    label: "Reading EHR Clinical Chart & Timeline",
  },
  retrievePolicyChunks: {
    step: 2,
    label: "Searching Payer Policy via PostgreSQL pgvector",
  },
  auditClinicalCriteria: {
    step: 3,
    label: "Auditing Clinical Criteria & Gaps with Local Gemma",
  },
  draftJustificationAndSave: {
    step: 4,
    label: "Drafting Medical Necessity Letter & Saving Packet",
  },
};

const NODE_SEQUENCE = [
  "extractPatientContext",
  "retrievePolicyChunks",
  "auditClinicalCriteria",
  "draftJustificationAndSave",
];

export async function POST(req: NextRequest) {
  try {
    let body: { requestId?: number; stream?: boolean } = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is acceptable for full batch run
    }

    const { requestId, stream = false } = body;

    // Resolve target patient(s)
    let targetPatients: Array<{
      id: number;
      patient_name: string;
      patient_id_code: string;
      requested_procedure: string;
      procedure_code: string;
    }> = [];

    if (requestId && !isNaN(Number(requestId))) {
      const p = await prisma.patientRequest.findUnique({
        where: { id: Number(requestId) },
        select: {
          id: true,
          patient_name: true,
          patient_id_code: true,
          requested_procedure: true,
          procedure_code: true,
        },
      });

      if (!p) {
        return NextResponse.json(
          {
            success: false,
            error: `PatientRequest with ID ${requestId} not found`,
          },
          { status: 404 }
        );
      }
      targetPatients = [p];
    } else {
      // Query patients with PENDING_PREP status
      targetPatients = await prisma.patientRequest.findMany({
        where: { status: "PENDING_PREP" },
        select: {
          id: true,
          patient_name: true,
          patient_id_code: true,
          requested_procedure: true,
          procedure_code: true,
        },
        orderBy: { id: "asc" },
      });

      // If all are already prepped, allow re-running across all patients
      if (targetPatients.length === 0) {
        targetPatients = await prisma.patientRequest.findMany({
          select: {
            id: true,
            patient_name: true,
            patient_id_code: true,
            requested_procedure: true,
            procedure_code: true,
          },
          orderBy: { id: "asc" },
        });
      }
    }

    if (targetPatients.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No patient requests available in database. Please seed the database first.",
        },
        { status: 400 }
      );
    }

    // Mode A: Server-Sent Events (SSE) Streaming
    if (stream) {
      const encoder = new TextEncoder();

      const customReadable = new ReadableStream({
        async start(controller) {
          const sendEvent = (eventData: object) => {
            const message = `data: ${JSON.stringify(eventData)}\n\n`;
            controller.enqueue(encoder.encode(message));
          };

          try {
            sendEvent({
              type: "batch_start",
              totalPatients: targetPatients.length,
              patients: targetPatients,
            });

            for (let i = 0; i < targetPatients.length; i++) {
              const patient = targetPatients[i];

              sendEvent({
                type: "patient_start",
                patientIndex: i + 1,
                totalPatients: targetPatients.length,
                requestId: patient.id,
                patientIdCode: patient.patient_id_code,
                patientName: patient.patient_name,
                requestedProcedure: patient.requested_procedure,
                procedureCode: patient.procedure_code,
              });

              // Emit initial node_active for Step 1
              const firstNode = NODE_SEQUENCE[0];
              const firstMeta = NODE_METADATA[firstNode];
              sendEvent({
                type: "node_active",
                requestId: patient.id,
                nodeName: firstNode,
                step: firstMeta.step,
                stepLabel: firstMeta.label,
              });

              // Execute LangGraph with streamed node updates
              const eventStream = await priorAuthWorkflow.stream(
                {
                  requestId: patient.id,
                  executionLogs: [
                    `[Workflow Init] Starting streaming prep for ${patient.patient_name}`,
                  ],
                },
                { streamMode: "updates" }
              );

              let lastState: Record<string, unknown> = {};

              for await (const update of eventStream) {
                // 'update' is keyed by node name e.g. { extractPatientContext: { ... } }
                const nodeName = Object.keys(update)[0];
                const nodeData = (update as Record<string, Record<string, unknown>>)[
                  nodeName
                ];
                const meta = NODE_METADATA[nodeName] || {
                  step: 0,
                  label: nodeName,
                };

                lastState = { ...lastState, ...(nodeData || {}) };

                sendEvent({
                  type: "node_complete",
                  requestId: patient.id,
                  nodeName,
                  step: meta.step,
                  stepLabel: meta.label,
                  logs: nodeData?.executionLogs || [],
                  readinessVerdict: nodeData?.readinessVerdict,
                  confidenceScore: nodeData?.confidenceScore,
                  preppedPacketId: nodeData?.preppedPacketId,
                });

                // Trigger node_active for next step in sequence
                const currentIndex = NODE_SEQUENCE.indexOf(nodeName);
                if (
                  currentIndex !== -1 &&
                  currentIndex + 1 < NODE_SEQUENCE.length
                ) {
                  const nextNode = NODE_SEQUENCE[currentIndex + 1];
                  const nextMeta = NODE_METADATA[nextNode];
                  sendEvent({
                    type: "node_active",
                    requestId: patient.id,
                    nodeName: nextNode,
                    step: nextMeta.step,
                    stepLabel: nextMeta.label,
                  });
                }
              }

              const criteriaList = Array.isArray(lastState.criteriaEvaluationList)
                ? (lastState.criteriaEvaluationList as unknown[])
                : [];
              const missingList = Array.isArray(lastState.missingDocumentationList)
                ? (lastState.missingDocumentationList as string[])
                : [];

              sendEvent({
                type: "patient_complete",
                requestId: patient.id,
                patientName: patient.patient_name,
                readinessVerdict:
                  (lastState.readinessVerdict as string) || "READY_TO_SUBMIT",
                confidenceScore:
                  typeof lastState.confidenceScore === "number"
                    ? lastState.confidenceScore
                    : 95,
                packetId:
                  (lastState.preppedPacketId as number | null | undefined) ||
                  null,
                missingItems: missingList,
                criteriaCount: criteriaList.length,
              });
            }

            sendEvent({
              type: "batch_complete",
              totalProcessed: targetPatients.length,
            });
          } catch (err: unknown) {
            console.error("SSE stream error:", err);
            sendEvent({
              type: "error",
              error:
                err instanceof Error
                  ? err.message
                  : "Error during agent streaming execution",
            });
          } finally {
            controller.close();
          }
        },
      });

      return new Response(customReadable, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    // Mode B: Standard JSON Response
    if (requestId) {
      const result = await runPriorAuthAgentForPatient(Number(requestId));
      return NextResponse.json({
        success: true,
        mode: "single",
        result: {
          requestId: result.requestId,
          patientName: result.patientChart?.patient_name,
          readinessVerdict: result.readinessVerdict,
          confidenceScore: result.confidenceScore,
          preppedPacketId: result.preppedPacketId,
          criteriaChecklist: result.criteriaEvaluationList,
          missingDocumentationList: result.missingDocumentationList,
          draftedLetter: result.draftedLetter,
          executionLogs: result.executionLogs,
        },
      });
    } else {
      const results = await runOvernightSlothBatch();
      return NextResponse.json({
        success: true,
        mode: "batch",
        results,
      });
    }
  } catch (err: unknown) {
    console.error("POST /api/prior-auth/prep error:", err);
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Prior authorization prep failed",
      },
      { status: 500 }
    );
  }
}
