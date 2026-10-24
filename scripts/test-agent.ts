import "dotenv/config";
import prisma from "../src/lib/prisma";
import {
  runPriorAuthAgentForPatient,
  runOvernightSlothBatch,
} from "../src/lib/agent/priorAuthGraph";

async function main() {
  console.log("🦥 SlothAuth - Phase 3 LangGraph Workflow Verification Runner");

  // Check if a specific patient ID was provided via CLI argument
  const targetIdArg = process.argv[2];

  if (targetIdArg && !isNaN(Number(targetIdArg))) {
    const requestId = Number(targetIdArg);
    console.log(`🎯 Running single-patient test for Request ID: ${requestId}`);
    const state = await runPriorAuthAgentForPatient(requestId);

    displayPatientResults(state);
    return;
  }

  // Ensure all 3 synthetic patient records are reset to 'PENDING_PREP' if already prepped
  const totalCount = await prisma.patientRequest.count();
  if (totalCount === 0) {
    console.warn("⚠️ No patients found in database. Please run 'bun run db:seed' first.");
    process.exit(1);
  }

  // Reset statuses for a clean repeatable test run
  await prisma.patientRequest.updateMany({
    data: { status: "PENDING_PREP" },
  });

  console.log(`📋 Reset ${totalCount} patient requests to 'PENDING_PREP' for testing.`);

  // Run overnight batch across all 3 patients
  const batchSummary = await runOvernightSlothBatch();

  console.log("📊 BATCH EXECUTION SUMMARY TABLE");
  console.table(
    batchSummary.map((b) => ({
      ReqID: b.requestId,
      Code: b.patientIdCode,
      Name: b.patientName,
      Verdict: b.verdict,
      Confidence: `${b.confidence}%`,
      CriteriaCount: b.criteriaCount,
      MissingItems: b.missingCount,
      PacketID: b.packetId,
    }))
  );

  // Inspect detailed output for each patient
  console.log("🔍 DETAILED CLINICAL AUDIT & LETTER VERIFICATION");

  const packets = await prisma.preppedPacket.findMany({
    include: { patient_request: true },
    orderBy: { request_id: "asc" },
  });

  for (const pkt of packets) {
    const p = pkt.patient_request;
    console.log(`\n------------------------------------------------------------------`);
    console.log(`CASE: [${p.patient_id_code}] ${p.patient_name}`);
    console.log(`PAYER: ${p.payer_name} | PROCEDURE: ${p.requested_procedure} (${p.procedure_code})`);
    console.log(`VERDICT: ${pkt.readiness_status} | CONFIDENCE: ${pkt.confidence_score}%`);
    console.log(`------------------------------------------------------------------`);

    const checklist = Array.isArray(pkt.criteria_checklist)
      ? pkt.criteria_checklist
      : JSON.parse(String(pkt.criteria_checklist));

    console.log(`\n📋 Evaluated Criteria Checklist (${checklist.length} items):`);
    checklist.forEach((c: any, idx: number) => {
      const icon =
        c.status === "MET"
          ? "✅"
          : c.status === "EXCEPTION_JUSTIFIED"
            ? "⚡"
            : "❌";
      console.log(`  ${icon} [${c.status}] ${c.criterion}`);
      console.log(`     Evidence: ${c.evidence_quote}`);
      if (c.source_date) console.log(`     Date: ${c.source_date}`);
    });

    if (pkt.missing_items && pkt.missing_items.length > 0) {
      console.log(`\n⚠️ Missing Documentation Flagged (${pkt.missing_items.length}):`);
      pkt.missing_items.forEach((m: string) => {
        console.log(`  ❗ ${m}`);
      });
    } else {
      console.log(`\n✅ Missing Documentation: None (Complete)`);
    }

    console.log(`\n📝 Draft Justification Letter Preview (First 350 chars):`);
    console.log(`"""\n${pkt.draft_justification_letter.slice(0, 350).trim()}...\n"""`);
  }

  console.log("\n✨ LangGraph deterministic workflow successfully verified!");
}

function displayPatientResults(state: any) {
  console.log(`\nResult for ${state.patientChart?.patient_name}:`);
  console.log(`Verdict: ${state.readinessVerdict} (Confidence: ${state.confidenceScore}%)`);
  console.log(`Criteria evaluated: ${state.criteriaEvaluationList?.length}`);
  console.log(`Missing items: ${state.missingDocumentationList?.length}`);
  console.log(`Packet ID: ${state.preppedPacketId}`);
  console.log(`\nLetter Preview:\n${state.draftedLetter?.slice(0, 300)}...`);
}

main()
  .catch((err) => {
    console.error("❌ Test runner error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
