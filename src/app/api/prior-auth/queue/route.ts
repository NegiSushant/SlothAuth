import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export interface QueuePatientRow {
  id: number;
  patient_id_code: string;
  patient_name: string;
  dob: Date | string;
  payer_name: string;
  member_id: string;
  requested_procedure: string;
  procedure_code: string;
  diagnosis_codes: string[];
  clinical_notes: unknown;
  status: string;
  created_at: Date | string;
  packet_id: number | null;
  readiness_status: string | null;
  confidence_score: number | null;
  criteria_checklist: unknown;
  missing_items: string[] | null;
  draft_justification_letter: string | null;
  packet_updated_at: Date | string | null;
}

export async function GET() {
  try {
    const rawRows = await prisma.$queryRawUnsafe<QueuePatientRow[]>(`
      SELECT 
        pr.id,
        pr.patient_id_code,
        pr.patient_name,
        pr.dob,
        pr.payer_name,
        pr.member_id,
        pr.requested_procedure,
        pr.procedure_code,
        pr.diagnosis_codes,
        pr.clinical_notes,
        pr.status,
        pr.created_at,
        pp.id AS packet_id,
        pp.readiness_status,
        pp.confidence_score,
        pp.criteria_checklist,
        pp.missing_items,
        pp.draft_justification_letter,
        pp.updated_at AS packet_updated_at
      FROM patient_requests pr
      LEFT JOIN prepped_packets pp ON pr.id = pp.request_id
      ORDER BY pr.id ASC;
    `);

    // Safely normalize JSON fields if returned as string
    const rows = rawRows.map((row: QueuePatientRow) => ({
      ...row,
      clinical_notes:
        typeof row.clinical_notes === "string"
          ? JSON.parse(row.clinical_notes)
          : row.clinical_notes,
      criteria_checklist:
        row.criteria_checklist && typeof row.criteria_checklist === "string"
          ? JSON.parse(row.criteria_checklist)
          : row.criteria_checklist,
    }));

    // Calculate summary telemetry metrics
    const totalPatients = rows.length;
    const pendingCount = rows.filter((r: QueuePatientRow) => r.status === "PENDING_PREP").length;
    const preppedCount = rows.filter(
      (r: QueuePatientRow) => r.status === "PREPPED" || r.status === "SUBMITTED"
    ).length;
    const readyToSubmitCount = rows.filter(
      (r: QueuePatientRow) =>
        r.readiness_status === "READY_TO_SUBMIT" ||
        r.readiness_status === "EXCEPTION_REQUIRED" ||
        r.readiness_status === "APPROVED_AND_SUBMITTED"
    ).length;
    const missingInfoCount = rows.filter(
      (r: QueuePatientRow) => r.readiness_status === "MISSING_INFO"
    ).length;
    const estimatedMinutesSaved = preppedCount * 35;

    const stats = {
      totalPatients,
      pendingCount,
      preppedCount,
      readyToSubmitCount,
      missingInfoCount,
      estimatedMinutesSaved,
      telemetry: {
        inferenceEngine:
          process.env.LLM_MODEL_NAME ||
          "ai/gemma3:4B-F16 (Docker Model Runner)",
        vectorStore: "PostgreSQL pgvector (HNSW)",
        phiEgressBytes: 0,
        apiCostUsd: 0,
      },
    };

    return NextResponse.json({
      success: true,
      stats,
      patients: rows,
    });
  } catch (err: unknown) {
    console.error("GET /api/prior-auth/queue error:", err);
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to fetch prior-auth queue",
      },
      { status: 500 }
    );
  }
}
