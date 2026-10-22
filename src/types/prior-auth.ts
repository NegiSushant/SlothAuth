export interface CriterionItem {
  criterion: string;
  met: boolean;
  status: "MET" | "MISSING" | "EXCEPTION_JUSTIFIED" | string;
  evidence_quote: string;
  source_date?: string;
}

export interface ClinicalNotes {
  chief_complaint?: string;
  history_of_present_illness?: string;
  medications_tried?: Array<{
    medication: string;
    dosage?: string;
    start_date?: string;
    end_date?: string;
    duration_weeks?: number;
    outcome?: string;
    adverse_reaction?: string;
  }>;
  physical_therapy_history?: {
    completed?: boolean;
    facility?: string;
    start_date?: string;
    end_date?: string;
    total_sessions?: number;
    frequency?: string;
    supervised_by?: string;
    clinical_outcome?: string;
  };
  lab_results?: Array<{
    test_name: string;
    date: string;
    result: string;
    reference_range?: string;
  }>;
  imaging_history?: Array<{
    modality: string;
    date: string;
    findings: string;
  }>;
  [key: string]: unknown;
}

export interface PatientQueueItem {
  id: number;
  patient_id_code: string;
  patient_name: string;
  dob: string;
  payer_name: string;
  member_id: string;
  requested_procedure: string;
  procedure_code: string;
  diagnosis_codes: string[];
  clinical_notes: ClinicalNotes;
  status: "PENDING_PREP" | "PREPPED" | "SUBMITTED" | string;
  created_at: string;
  packet_id: number | null;
  readiness_status:
    | "READY_TO_SUBMIT"
    | "EXCEPTION_REQUIRED"
    | "MISSING_INFO"
    | "APPROVED_AND_SUBMITTED"
    | null
    | string;
  confidence_score: number | null;
  criteria_checklist: CriterionItem[] | null;
  missing_items: string[] | null;
  draft_justification_letter: string | null;
  packet_updated_at: string | null;
}

export interface QueueTelemetry {
  inferenceEngine: string;
  vectorStore: string;
  phiEgressBytes: number;
  apiCostUsd: number;
}

export interface QueueStats {
  totalPatients: number;
  pendingCount: number;
  preppedCount: number;
  readyToSubmitCount: number;
  missingInfoCount: number;
  estimatedMinutesSaved: number;
  telemetry: QueueTelemetry;
}

export interface StreamEvent {
  type:
    | "batch_start"
    | "patient_start"
    | "node_active"
    | "node_complete"
    | "patient_complete"
    | "batch_complete"
    | "error";
  requestId?: number;
  patientName?: string;
  requestedProcedure?: string;
  procedureCode?: string;
  patientIndex?: number;
  totalPatients?: number;
  nodeName?: string;
  step?: number;
  stepLabel?: string;
  logs?: string[];
  readinessVerdict?: string;
  confidenceScore?: number;
  preppedPacketId?: number | null;
  packetId?: number | null;
  missingItems?: string[];
  criteriaCount?: number;
  totalProcessed?: number;
  error?: string;
}
