import { Annotation } from "@langchain/langgraph";

export interface CriterionEvaluation {
  criterion: string;
  met: boolean;
  status: "MET" | "MISSING" | "EXCEPTION_JUSTIFIED";
  evidence_quote: string;
  source_date?: string;
}

export interface MatchedPolicyChunk {
  id: number;
  policy_number: string;
  policy_title: string;
  section_name: string;
  chunk_text: string;
  similarity: number;
}

export type ReadinessVerdict =
  | "READY_TO_SUBMIT"
  | "MISSING_INFO"
  | "EXCEPTION_REQUIRED";

/**
 * Prior-Authorization Prep Agent Graph State
 */
export const PriorAuthGraphState = Annotation.Root({
  requestId: Annotation<number>(),
  patientChart: Annotation<any>(),
  formattedClinicalTimeline: Annotation<string>(),
  matchedPolicyChunks: Annotation<MatchedPolicyChunk[]>(),
  criteriaEvaluationList: Annotation<CriterionEvaluation[]>(),
  missingDocumentationList: Annotation<string[]>(),
  readinessVerdict: Annotation<ReadinessVerdict>(),
  confidenceScore: Annotation<number>(),
  draftedLetter: Annotation<string>(),
  preppedPacketId: Annotation<number | null>(),
  executionLogs: Annotation<string[]>({
    reducer: (a, b) => a.concat(b),
    default: () => [],
  }),
});

export type PriorAuthStateType = typeof PriorAuthGraphState.State;
export type PriorAuthUpdateType = typeof PriorAuthGraphState.Update;
