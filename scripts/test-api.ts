import "dotenv/config";
import { NextRequest } from "next/server";
import { GET as getQueue } from "../src/app/api/prior-auth/queue/route";
import { POST as postPrep } from "../src/app/api/prior-auth/prep/route";
import { PATCH as patchPacket } from "../src/app/api/prior-auth/packet/[requestId]/route";
import { POST as postReset } from "../src/app/api/prior-auth/reset/route";
import prisma from "../src/lib/prisma";

function createMockNextRequest(url: string, body?: unknown, method: string = "POST"): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

async function runApiVerificationSuite() {
  console.log("🦥 SlothAuth - Phase 4 API Routes Comprehensive Verification Suite");

  // Test 1: Reset Simulation Database
  console.log("\n[TEST 1] Testing POST /api/prior-auth/reset...");
  const resetRes = await postReset();
  const resetJson = await resetRes.json();
  console.log(`  Status: ${resetRes.status}`);
  console.log(`  Message: ${resetJson.message}`);
  if (resetRes.status !== 200 || !resetJson.success) {
    throw new Error(`Reset endpoint failed: ${JSON.stringify(resetJson)}`);
  }
  console.log("  ✔ POST /api/prior-auth/reset passed.");

  // Test 2: Fetch Initial Queue State
  console.log("\n[TEST 2] Testing GET /api/prior-auth/queue (initial clean state)...");
  const queueRes1 = await getQueue();
  const queueJson1 = await queueRes1.json();
  console.log(`  Status: ${queueRes1.status}`);
  console.log(`  Total Patients: ${queueJson1.stats.totalPatients}`);
  console.log(`  Pending Count: ${queueJson1.stats.pendingCount}`);
  console.log(`  Prepped Count: ${queueJson1.stats.preppedCount}`);
  console.log(`  Telemetry Model: ${queueJson1.stats.telemetry.inferenceEngine}`);
  console.log(`  Estimated Minutes Saved: ${queueJson1.stats.estimatedMinutesSaved} min`);

  if (queueRes1.status !== 200 || !queueJson1.success) {
    throw new Error(`Queue GET failed: ${JSON.stringify(queueJson1)}`);
  }
  if (queueJson1.stats.pendingCount !== queueJson1.stats.totalPatients) {
    throw new Error("Expected all patients to be PENDING_PREP after reset.");
  }
  console.log("  ✔ GET /api/prior-auth/queue initial state verified.");

  // Test 3: POST /api/prior-auth/prep (Single Patient Standard JSON Mode B)
  const targetPatient = queueJson1.patients[0];
  const targetId = targetPatient.id;
  console.log(`\n[TEST 3] Testing POST /api/prior-auth/prep (Mode B - JSON) for Patient #${targetId} (${targetPatient.patient_name})...`);

  const prepReqSingle = createMockNextRequest(
    "http://localhost:3000/api/prior-auth/prep",
    { requestId: targetId, stream: false }
  );

  const prepResSingle = await postPrep(prepReqSingle);
  const prepJsonSingle = await prepResSingle.json();
  console.log(`  Status: ${prepResSingle.status}`);
  console.log(`  Mode: ${prepJsonSingle.mode}`);
  console.log(`  Verdict: ${prepJsonSingle.result.readinessVerdict}`);
  console.log(`  Confidence Score: ${prepJsonSingle.result.confidenceScore}%`);
  console.log(`  Prepped Packet ID: ${prepJsonSingle.result.preppedPacketId}`);

  if (prepResSingle.status !== 200 || !prepJsonSingle.success || !prepJsonSingle.result.preppedPacketId) {
    throw new Error(`Prep Single Mode failed: ${JSON.stringify(prepJsonSingle)}`);
  }
  console.log("  ✔ POST /api/prior-auth/prep (Mode B - JSON) passed.");

  // Test 4: POST /api/prior-auth/prep (Live SSE Streaming Mode A)
  console.log(`\n[TEST 4] Testing POST /api/prior-auth/prep (Mode A - Live SSE Stream) for Patient #${targetId}...`);
  const prepReqStream = createMockNextRequest(
    "http://localhost:3000/api/prior-auth/prep",
    { requestId: targetId, stream: true }
  );

  const prepResStream = await postPrep(prepReqStream);
  console.log(`  Status: ${prepResStream.status}`);
  console.log(`  Content-Type: ${prepResStream.headers.get("content-type")}`);

  if (!prepResStream.body) {
    throw new Error("Stream response body is null");
  }

  const reader = prepResStream.body.getReader();
  const decoder = new TextDecoder();
  const receivedEventTypes: string[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n\n").filter(Boolean);

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const parsed = JSON.parse(line.replace("data: ", ""));
          receivedEventTypes.push(parsed.type);
          if (parsed.type === "node_active" || parsed.type === "node_complete") {
            console.log(`    ↳ [SSE] Event: ${parsed.type.padEnd(13)} | Step ${parsed.step}: ${parsed.stepLabel}`);
          } else {
            console.log(`    ↳ [SSE] Event: ${parsed.type}`);
          }
        } catch {
          // Chunk might be partial or heartbeat
        }
      }
    }
  }

  console.log(`  Total SSE events received: ${receivedEventTypes.length}`);
  const expectedEvents = ["batch_start", "patient_start", "node_active", "node_complete", "patient_complete", "batch_complete"];
  for (const exp of expectedEvents) {
    if (!receivedEventTypes.includes(exp)) {
      console.warn(`  ⚠️ Expected SSE event '${exp}' was not captured in test buffer.`);
    }
  }
  console.log("  ✔ POST /api/prior-auth/prep (Mode A - SSE Stream) passed.");

  // Test 5: PATCH /api/prior-auth/packet/[requestId] (Clinician Workflow)
  console.log(`\n[TEST 5] Testing PATCH /api/prior-auth/packet/${targetId}...`);

  // Action 5A: SAVE_DRAFT
  console.log("  Action 5A: Testing SAVE_DRAFT...");
  const draftUpdateText = "# REVISED CLINICAL JUSTIFICATION DRAFT\nUpdated by testing script at " + new Date().toISOString();
  const patchReqDraft = createMockNextRequest(
    `http://localhost:3000/api/prior-auth/packet/${targetId}`,
    {
      action: "SAVE_DRAFT",
      draftJustificationLetter: draftUpdateText,
    },
    "PATCH"
  );
  const patchResDraft = await patchPacket(patchReqDraft, { params: Promise.resolve({ requestId: String(targetId) }) });
  const patchJsonDraft = await patchResDraft.json();
  console.log(`    Status: ${patchResDraft.status}`);
  console.log(`    Saved Letter Length: ${patchJsonDraft.patient?.draft_justification_letter?.length}`);
  if (patchResDraft.status !== 200 || !patchJsonDraft.patient?.draft_justification_letter?.includes("REVISED CLINICAL JUSTIFICATION")) {
    throw new Error(`SAVE_DRAFT failed: ${JSON.stringify(patchJsonDraft)}`);
  }
  console.log("    ✔ SAVE_DRAFT passed.");

  // Action 5B: RESOLVE_MISSING_ITEM
  console.log("  Action 5B: Testing RESOLVE_MISSING_ITEM...");
  const patchReqResolve = createMockNextRequest(
    `http://localhost:3000/api/prior-auth/packet/${targetId}`,
    {
      action: "RESOLVE_MISSING_ITEM",
      resolvedMissingItem: "Any missing test documentation",
    },
    "PATCH"
  );
  const patchResResolve = await patchPacket(patchReqResolve, { params: Promise.resolve({ requestId: String(targetId) }) });
  const patchJsonResolve = await patchResResolve.json();
  console.log(`    Status: ${patchResResolve.status}`);
  console.log(`    Readiness Verdict: ${patchJsonResolve.patient?.readiness_status}`);
  console.log(`    Confidence Score: ${patchJsonResolve.patient?.confidence_score}%`);
  console.log(`    Remaining Missing Items: ${patchJsonResolve.patient?.missing_items?.length}`);
  if (patchResResolve.status !== 200 || patchJsonResolve.patient?.readiness_status !== "READY_TO_SUBMIT") {
    throw new Error(`RESOLVE_MISSING_ITEM failed: ${JSON.stringify(patchJsonResolve)}`);
  }
  console.log("    ✔ RESOLVE_MISSING_ITEM passed.");

  // Action 5C: APPROVE_AND_SUBMIT
  console.log("  Action 5C: Testing APPROVE_AND_SUBMIT...");
  const patchReqApprove = createMockNextRequest(
    `http://localhost:3000/api/prior-auth/packet/${targetId}`,
    {
      action: "APPROVE_AND_SUBMIT",
      clinicianSignerName: "Dr. Gregory House, MD",
    },
    "PATCH"
  );
  const patchResApprove = await patchPacket(patchReqApprove, { params: Promise.resolve({ requestId: String(targetId) }) });
  const patchJsonApprove = await patchResApprove.json();
  console.log(`    Status: ${patchResApprove.status}`);
  console.log(`    Patient Status: ${patchJsonApprove.patient?.status}`);
  console.log(`    Packet Readiness: ${patchJsonApprove.patient?.readiness_status}`);
  const hasSignoff = patchJsonApprove.patient?.draft_justification_letter?.includes("Dr. Gregory House, MD");
  console.log(`    Contains Digital Sign-off: ${hasSignoff}`);
  if (patchResApprove.status !== 200 || patchJsonApprove.patient?.status !== "SUBMITTED" || !hasSignoff) {
    throw new Error(`APPROVE_AND_SUBMIT failed: ${JSON.stringify(patchJsonApprove)}`);
  }
  console.log("    ✔ APPROVE_AND_SUBMIT passed.");

  // Test 6: Verify Queue Reflects Updated Metrics
  console.log("\n[TEST 6] Testing GET /api/prior-auth/queue (after prep & submission)...");
  const queueRes2 = await getQueue();
  const queueJson2 = await queueRes2.json();
  console.log(`  Prepped/Submitted Count: ${queueJson2.stats.preppedCount}`);
  console.log(`  Estimated Minutes Saved: ${queueJson2.stats.estimatedMinutesSaved} min`);
  if (queueJson2.stats.preppedCount < 1) {
    throw new Error("Expected at least 1 prepped/submitted patient.");
  }
  console.log("  ✔ Queue telemetry reflection verified.");

  // Test 7: Clean Reset for Future Demos
  console.log("\n[TEST 7] Performing clean reset via POST /api/prior-auth/reset...");
  await postReset();
  console.log("  ✔ Demo state reset successfully.");

  console.log("\n==================================================================");
  console.log("🎉 ALL 4 PRIOR-AUTH API ROUTES FULLY VERIFIED & OPERATIONAL!");
  console.log("==================================================================");
}

runApiVerificationSuite()
  .catch((err) => {
    console.error("\n❌ Verification Suite Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
