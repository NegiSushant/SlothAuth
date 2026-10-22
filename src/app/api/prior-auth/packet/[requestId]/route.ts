import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { QueuePatientRow } from "../../queue/route";


export interface CriterionItem {
  criterion: string;
  met: boolean;
  status: "MET" | "MISSING" | "EXCEPTION_JUSTIFIED" | string;
  evidence_quote: string;
  source_date?: string;
}

export interface PacketUpdatePayload {
  action?: "SAVE_DRAFT" | "RESOLVE_MISSING_ITEM" | "APPROVE_AND_SUBMIT";
  draftJustificationLetter?: string;
  resolvedMissingItem?: string;
  criteriaChecklist?: CriterionItem[];
  clinicianSignerName?: string;
}

interface PreppedPacketRow {
  id: number;
  request_id: number;
  readiness_status: string;
  confidence_score: number;
  criteria_checklist: unknown;
  missing_items: string[];
  draft_justification_letter: string;
  updated_at: Date | string;
  patient_status?: string;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const resolvedParams = await params;
    const requestId = parseInt(resolvedParams.requestId, 10);

    if (isNaN(requestId)) {
      return NextResponse.json(
        { success: false, error: "Invalid requestId parameter" },
        { status: 400 }
      );
    }

    const body: PacketUpdatePayload = await req.json();
    const { action } = body;

    // Fetch existing packet and patient record using safe parameterized query
    const packetCheck = await prisma.$queryRawUnsafe<PreppedPacketRow[]>(
      `SELECT pp.*, pr.status AS patient_status 
       FROM prepped_packets pp
       JOIN patient_requests pr ON pr.id = pp.request_id
       WHERE pp.request_id = $1`,
      requestId
    );

    if (!packetCheck || packetCheck.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Prepped packet for Request ID #${requestId} does not exist. Run prep agent first.`,
        },
        { status: 404 }
      );
    }

    const currentPacket = packetCheck[0];

    // Safely normalize JSON/array fields if needed
    let criteriaChecklist: CriterionItem[] =
      typeof currentPacket.criteria_checklist === "string"
        ? JSON.parse(currentPacket.criteria_checklist)
        : (currentPacket.criteria_checklist as CriterionItem[]) || [];

    let missingItems: string[] = Array.isArray(currentPacket.missing_items)
      ? [...currentPacket.missing_items]
      : [];

    let draftLetter: string =
      body.draftJustificationLetter ??
      currentPacket.draft_justification_letter ??
      "";
    let readinessStatus: string = currentPacket.readiness_status;
    let confidenceScore: number = currentPacket.confidence_score;

    // ========================================================================
    // Action 1: SAVE_DRAFT
    // ========================================================================
    if (action === "SAVE_DRAFT") {
      if (body.draftJustificationLetter !== undefined) {
        draftLetter = body.draftJustificationLetter;
      }
      if (body.criteriaChecklist !== undefined) {
        criteriaChecklist = body.criteriaChecklist;
      }

      await prisma.$executeRawUnsafe(
        `UPDATE prepped_packets 
         SET draft_justification_letter = $1,
             criteria_checklist = $2::jsonb,
             updated_at = NOW()
         WHERE request_id = $3`,
        draftLetter,
        JSON.stringify(criteriaChecklist),
        requestId
      );
    }

    // ========================================================================
    // Action 2: RESOLVE_MISSING_ITEM
    // ========================================================================
    else if (action === "RESOLVE_MISSING_ITEM") {
      const resolvedItem = body.resolvedMissingItem?.trim();

      if (resolvedItem) {
        missingItems = missingItems.filter(
          (item: string) =>
            item.trim().toLowerCase() !== resolvedItem.toLowerCase()
        );
      } else {
        // If no specific item passed, resolve all missing items
        missingItems = [];
      }

      // Update criteria checklist to mark matching missing criterion as MET
      if (body.criteriaChecklist && Array.isArray(body.criteriaChecklist)) {
        criteriaChecklist = body.criteriaChecklist;
      } else if (Array.isArray(criteriaChecklist)) {
        criteriaChecklist = criteriaChecklist.map((c: CriterionItem) => {
          const isTarget =
            c.status === "MISSING" &&
            (!resolvedItem ||
              c.criterion?.toLowerCase().includes(resolvedItem.toLowerCase()) ||
              resolvedItem.toLowerCase().includes(c.criterion?.toLowerCase()));

          if (isTarget) {
            return {
              ...c,
              met: true,
              status: "MET",
              evidence_quote: "Verified & attached by clinician during review",
            };
          }
          return c;
        });
      }

      // If missing_items is now empty, automatically upgrade status and strip warning banner
      if (missingItems.length === 0) {
        readinessStatus = "READY_TO_SUBMIT";
        confidenceScore = 100;

        // Strip warning banner from top of draft justification letter
        draftLetter = draftLetter
          .replace(
            /(?:^|\n)(?:> )?⚠️\s*(?:\*\*)?\[?CLINICIAN ACTION REQUIRED[\s\S]*?(?:---\s*\n*|# PRIOR AUTHORIZATION)/i,
            "# PRIOR AUTHORIZATION"
          )
          .trim();
      }

      await prisma.$executeRawUnsafe(
        `UPDATE prepped_packets 
         SET missing_items = $1,
             criteria_checklist = $2::jsonb,
             readiness_status = $3,
             confidence_score = $4,
             draft_justification_letter = $5,
             updated_at = NOW()
         WHERE request_id = $6`,
        missingItems,
        JSON.stringify(criteriaChecklist),
        readinessStatus,
        confidenceScore,
        draftLetter,
        requestId
      );
    }

    // ========================================================================
    // Action 3: APPROVE_AND_SUBMIT
    // ========================================================================
    else if (action === "APPROVE_AND_SUBMIT") {
      const signer = body.clinicianSignerName || "Dr. Sarah Jenkins, MD";
      const signoffBlock = `\n\n---\n✔ ELECTRONICALLY SIGNED & APPROVED BY: ${signer} on ${new Date().toISOString()}`;

      if (!draftLetter.includes("ELECTRONICALLY SIGNED & APPROVED BY:")) {
        draftLetter = draftLetter + signoffBlock;
      }

      readinessStatus = "APPROVED_AND_SUBMITTED";

      // Atomic update of prepped_packets and patient_requests
      await prisma.$transaction([
        prisma.$executeRawUnsafe(
          `UPDATE prepped_packets 
           SET readiness_status = $1,
               draft_justification_letter = $2,
               updated_at = NOW()
           WHERE request_id = $3`,
          readinessStatus,
          draftLetter,
          requestId
        ),
        prisma.$executeRawUnsafe(
          `UPDATE patient_requests 
           SET status = 'SUBMITTED' 
           WHERE id = $1`,
          requestId
        ),
      ]);
    }

    // Default fallback: direct updates
    else {
      if (body.draftJustificationLetter !== undefined) {
        draftLetter = body.draftJustificationLetter;
      }
      if (body.criteriaChecklist !== undefined) {
        criteriaChecklist = body.criteriaChecklist;
      }

      await prisma.$executeRawUnsafe(
        `UPDATE prepped_packets 
         SET draft_justification_letter = $1,
             criteria_checklist = $2::jsonb,
             updated_at = NOW()
         WHERE request_id = $3`,
        draftLetter,
        JSON.stringify(criteriaChecklist),
        requestId
      );
    }

    // Fetch and return the updated patient + packet record
    const updatedRows = await prisma.$queryRawUnsafe<QueuePatientRow[]>(
      `SELECT 
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
      WHERE pr.id = $1`,
      requestId
    );

    const updatedRow = updatedRows[0];
    const patient = {
      ...updatedRow,
      clinical_notes:
        typeof updatedRow.clinical_notes === "string"
          ? JSON.parse(updatedRow.clinical_notes)
          : updatedRow.clinical_notes,
      criteria_checklist:
        updatedRow.criteria_checklist &&
        typeof updatedRow.criteria_checklist === "string"
          ? JSON.parse(updatedRow.criteria_checklist)
          : updatedRow.criteria_checklist,
    };

    return NextResponse.json({
      success: true,
      message: `Packet #${requestId} updated successfully (${action || "UPDATE"}).`,
      patient,
    });
  } catch (err: unknown) {
    console.error("PATCH /api/prior-auth/packet/[requestId] error:", err);
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to update prior-auth packet",
      },
      { status: 500 }
    );
  }
}
