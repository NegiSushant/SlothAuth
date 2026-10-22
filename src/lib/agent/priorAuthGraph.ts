import { StateGraph, START, END } from "@langchain/langgraph";
import { PriorAuthGraphState, PriorAuthStateType } from "./state";
import {
  extractPatientContext,
  retrievePolicyChunks,
  auditClinicalCriteria,
  draftJustificationAndSave,
} from "./nodes";
import prisma from "../prisma";

// Build the deterministic 4-node LangGraph workflow
const workflow = new StateGraph(PriorAuthGraphState)
  .addNode("extractPatientContext", extractPatientContext)
  .addNode("retrievePolicyChunks", retrievePolicyChunks)
  .addNode("auditClinicalCriteria", auditClinicalCriteria)
  .addNode("draftJustificationAndSave", draftJustificationAndSave)
  .addEdge(START, "extractPatientContext")
  .addEdge("extractPatientContext", "retrievePolicyChunks")
  .addEdge("retrievePolicyChunks", "auditClinicalCriteria")
  .addEdge("auditClinicalCriteria", "draftJustificationAndSave")
  .addEdge("draftJustificationAndSave", END);

export const priorAuthWorkflow = workflow.compile();

/**
 * Executes the complete Prior-Authorization preparation workflow for a single patient request.
 * @param requestId The ID of the row in patient_requests
 */
export async function runPriorAuthAgentForPatient(
  requestId: number
): Promise<PriorAuthStateType> {
  const finalState = await priorAuthWorkflow.invoke({
    requestId,
    executionLogs: [`[Workflow Start] Initiating Prior-Auth evaluation for Request #${requestId}`],
  });

  return finalState as PriorAuthStateType;
}

/**
 * Queries all patient requests with status 'PENDING_PREP' and executes the prior auth
 * agent sequentially for each request (simulating overnight batch processing).
 */
export async function runOvernightSlothBatch() {
  const pendingRequests = await prisma.patientRequest.findMany({
    where: { status: "PENDING_PREP" },
    orderBy: { id: "asc" },
  });

  console.log(`\n🦥 SlothAuth Batch Engine: Processing ${pendingRequests.length} pending patient requests...`);

  const results: Array<{
    requestId: number;
    patientIdCode: string;
    patientName: string;
    verdict: string;
    confidence: number;
    packetId: number | null;
    logs: string[];
    criteriaCount: number;
    missingCount: number;
  }> = [];

  for (let i = 0; i < pendingRequests.length; i++) {
    const req = pendingRequests[i];
    console.log(`\n------------------------------------------------------------------`);
    console.log(`[Batch ${i + 1}/${pendingRequests.length}] Processing ${req.patient_name} (${req.patient_id_code})...`);

    const finalState = await runPriorAuthAgentForPatient(req.id);

    results.push({
      requestId: req.id,
      patientIdCode: req.patient_id_code,
      patientName: req.patient_name,
      verdict: finalState.readinessVerdict,
      confidence: finalState.confidenceScore,
      packetId: finalState.preppedPacketId,
      logs: finalState.executionLogs,
      criteriaCount: finalState.criteriaEvaluationList?.length || 0,
      missingCount: finalState.missingDocumentationList?.length || 0,
    });

    console.log(`  Verdict: ${finalState.readinessVerdict} (Confidence: ${finalState.confidenceScore}%)`);
    console.log(`  Packet #${finalState.preppedPacketId} created in database.`);
  }

  return results;
}
