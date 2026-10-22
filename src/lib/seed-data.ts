/**
 * SlothAuth Synthetic Healthcare Seed Data
 * Phase 2: PostgreSQL Database Schema & Synthetic Healthcare Dataset
 * 
 * Contains 3 Payer Policies (chunked for RAG vector search) and
 * 3 Patient Clinical Charts designed to test:
 * 1. Marcus Vance (PT-2026-001): 100% Ready to Submit
 * 2. Elena Rostova (PT-2026-002): Missing Mandatory Safety Lab (QuantiFERON-TB Gold)
 * 3. David Chen (PT-2026-003): Step-Therapy Exception (Azathioprine Pancreatitis & TPMT Deficiency)
 */

export interface PayerPolicyChunk {
  payer_name: string;
  procedure_code: string;
  policy_number: string;
  policy_title: string;
  section_name: string;
  chunk_text: string;
}

export interface MedicationTrial {
  medication: string;
  dosage: string;
  start_date: string;
  end_date?: string;
  duration_weeks?: number;
  outcome: string;
  adverse_reaction?: string;
}

export interface PhysicalTherapyRecord {
  completed: boolean;
  facility?: string;
  start_date?: string;
  end_date?: string;
  total_sessions?: number;
  frequency?: string;
  supervised_by?: string;
  clinical_outcome: string;
}

export interface LabResult {
  test_name: string;
  result: string;
  reference_range?: string;
  date: string;
  interpretation: string;
}

export interface ImagingStudy {
  modality: string;
  body_part: string;
  date: string;
  findings: string;
  impression: string;
}

export interface AllergyOrContraindication {
  agent: string;
  reaction_type: string;
  severity: string;
  documented_date: string;
  clinical_notes: string;
}

export interface PhysicianProgressNote {
  date: string;
  provider_name: string;
  provider_specialty: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface PatientClinicalNotes {
  chief_complaint: string;
  medications_tried: MedicationTrial[];
  physical_therapy_history: PhysicalTherapyRecord;
  lab_results: LabResult[];
  imaging_history: ImagingStudy[];
  allergies_and_contraindications: AllergyOrContraindication[];
  physician_progress_notes: PhysicianProgressNote[];
}

export interface SyntheticPatient {
  patient_id_code: string;
  patient_name: string;
  dob: string;
  payer_name: string;
  member_id: string;
  requested_procedure: string;
  procedure_code: string;
  diagnosis_codes: string[];
  clinical_notes: PatientClinicalNotes;
  status?: string;
}

// ============================================================================
// 1. Payer Policies (Chunked for RAG Embedding & Hybrid Retrieval)
// ============================================================================

export const PAYER_POLICIES: PayerPolicyChunk[] = [
  // --------------------------------------------------------------------------
  // Policy 1: Aetna - Lumbar Spine MRI without Contrast (CPB-0236)
  // --------------------------------------------------------------------------
  {
    payer_name: "Aetna",
    procedure_code: "CPT-72148",
    policy_number: "CPB-0236",
    policy_title: "Aetna Clinical Policy Bulletin 0236: Magnetic Resonance Imaging (MRI) of the Spine",
    section_name: "Section 1.1: Radiculopathy & Neurological Criteria",
    chunk_text:
      "Aetna considers magnetic resonance imaging (MRI) of the lumbar spine (CPT 72148) medically necessary when there is documented evidence of radicular pain or progressive neurological deficit persisting for at least 6 continuous weeks. Clinical examination must document at least one objective finding: positive straight leg raise test (pain radiating below the knee elicited between 30 and 70 degrees), dermatomal sensory deficit, absent or diminished deep tendon reflexes corresponding to the nerve root distribution, or localized motor weakness (e.g., extensor hallucis longus or quadriceps weakness).",
  },
  {
    payer_name: "Aetna",
    procedure_code: "CPT-72148",
    policy_number: "CPB-0236",
    policy_title: "Aetna Clinical Policy Bulletin 0236: Magnetic Resonance Imaging (MRI) of the Spine",
    section_name: "Section 1.2: Conservative Physical Therapy Requirement",
    chunk_text:
      "Approval of non-urgent Lumbar Spine MRI requires verified completion of at least 6 consecutive weeks of active, physician-supervised conservative physical therapy within the past 6 months without significant symptom resolution. Clinical records must document attendance across at least 10 to 12 sessions, active therapeutic exercises (e.g., core stabilization, lumbar stabilization, or directional preference exercises), and a formal re-evaluation by the physical therapist or ordering physician demonstrating failed conservative rehabilitation.",
  },
  {
    payer_name: "Aetna",
    procedure_code: "CPT-72148",
    policy_number: "CPB-0236",
    policy_title: "Aetna Clinical Policy Bulletin 0236: Magnetic Resonance Imaging (MRI) of the Spine",
    section_name: "Section 1.3: Pharmacological Trial & Prerequisite Plain Radiographs",
    chunk_text:
      "Medical necessity criteria for CPT 72148 require documented failure, intolerance, or medical contraindication to a minimum 4-week trial of oral prescription nonsteroidal anti-inflammatory drugs (NSAIDs) or muscle relaxants within the preceding 6 months. In addition, plain radiographs of the lumbar spine (minimum 2 views: AP and lateral) must be performed prior to the MRI request to evaluate for gross instability, spondylolisthesis, vertebral compression fractures, or structural osseous pathology.",
  },

  // --------------------------------------------------------------------------
  // Policy 2: UnitedHealthcare - Adalimumab (Humira) Injection (UHC-BIO-402)
  // --------------------------------------------------------------------------
  {
    payer_name: "UnitedHealthcare",
    procedure_code: "J0135",
    policy_number: "UHC-BIO-402",
    policy_title: "UnitedHealthcare Pharmacy Clinical Policy 402: Tumor Necrosis Factor Antagonists (Adalimumab)",
    section_name: "Section 2.1: Rheumatoid Arthritis Diagnostic & Severity Criteria",
    chunk_text:
      "UnitedHealthcare considers adalimumab (Humira, J0135) medically necessary for adult patients with moderate-to-severe active Rheumatoid Arthritis (RA) when: (1) Diagnosed by a board-certified rheumatologist; (2) Patient demonstrates active disease characterized by >=6 swollen joints and >=6 tender joints; AND (3) Laboratory documentation reveals elevated inflammatory markers, specifically C-Reactive Protein (CRP > 1.0 mg/dL) or Westergren Erythrocyte Sedimentation Rate (ESR > 28 mm/hr) within the past 90 days.",
  },
  {
    payer_name: "UnitedHealthcare",
    procedure_code: "J0135",
    policy_number: "UHC-BIO-402",
    policy_title: "UnitedHealthcare Pharmacy Clinical Policy 402: Tumor Necrosis Factor Antagonists (Adalimumab)",
    section_name: "Section 2.2: Conventional DMARD Step-Therapy Mandate",
    chunk_text:
      "Prior authorization requires documented failure, inadequate therapeutic response, or clinically documented intolerance to at least a consecutive 12-week trial of a conventional synthetic disease-modifying antirheumatic drug (csDMARD), specifically oral or subcutaneous Methotrexate dosed at >=15 mg to 25 mg weekly (unless clinically contraindicated due to pre-existing hepatic disease, cytopenia, or pregnancy). Disease activity must remain moderate-to-severe despite optimal csDMARD adherence.",
  },
  {
    payer_name: "UnitedHealthcare",
    procedure_code: "J0135",
    policy_number: "UHC-BIO-402",
    policy_title: "UnitedHealthcare Pharmacy Clinical Policy 402: Tumor Necrosis Factor Antagonists (Adalimumab)",
    section_name: "Section 2.3: Mandatory Infectious Disease Safety Screening (TB & Hepatitis B)",
    chunk_text:
      "MANDATORY PRE-INITIATION SAFETY REQUIREMENT: Due to the black-box warning for fatal reactivation of latent infections, the medical record MUST contain documented negative screening for Tuberculosis (either a negative QuantiFERON-TB Gold In-Tube interferon-gamma release assay or negative PPD tuberculin skin test) AND documented negative Hepatitis B virus screening (negative Hepatitis B surface antigen [HBsAg] and negative total core antibody [anti-HBc]) performed within the preceding 6 months. Prior authorization requests lacking documented negative TB screening MUST BE FLAGGED AS INCOMPLETE AND CANNOT BE APPROVED until testing is completed.",
  },

  // --------------------------------------------------------------------------
  // Policy 3: BlueCross BlueShield - Infliximab (Remicade) IV Infusion (BCBS-RX-819)
  // --------------------------------------------------------------------------
  {
    payer_name: "BlueCross BlueShield",
    procedure_code: "J1745",
    policy_number: "BCBS-RX-819",
    policy_title: "BlueCross BlueShield Medical Policy 819: Tumor Necrosis Factor Antagonists (Infliximab / Remicade)",
    section_name: "Section 3.1: Crohn's Disease Diagnostic Confirmation",
    chunk_text:
      "BlueCross BlueShield approves intravenous Infliximab (Remicade, J1745) for patients aged 6 years and older with moderate-to-severely active Crohn's disease. The diagnosis must be confirmed via endoscopic evaluation (colonoscopy or ileoscopy) with histologic biopsy demonstrating transmural granulomatous inflammation, cobblestone ulcerations, or severe mucosal skip lesions, supported by elevated biomarkers of intestinal inflammation (fecal calprotectin > 250 mcg/g or elevated CRP).",
  },
  {
    payer_name: "BlueCross BlueShield",
    procedure_code: "J1745",
    policy_number: "BCBS-RX-819",
    policy_title: "BlueCross BlueShield Medical Policy 819: Tumor Necrosis Factor Antagonists (Infliximab / Remicade)",
    section_name: "Section 3.2: Step-Therapy Mandate (Immunomodulators & Corticosteroids)",
    chunk_text:
      "Step-Therapy Requirement: Approval of Infliximab requires prior therapeutic failure of at least an 8-week course of an oral conventional immunomodulator (Azathioprine 2.0-2.5 mg/kg/day or 6-Mercaptopurine 1.0-1.5 mg/kg/day) AND a concurrent or antecedent systemic corticosteroid induction taper (e.g., prednisone >=40 mg/day tapered over 6-8 weeks) with persistent active Crohn's disease activity.",
  },
  {
    payer_name: "BlueCross BlueShield",
    procedure_code: "J1745",
    policy_number: "BCBS-RX-819",
    policy_title: "BlueCross BlueShield Medical Policy 819: Tumor Necrosis Factor Antagonists (Infliximab / Remicade)",
    section_name: "Section 3.3: Step-Therapy Exception Criteria & Thiopurine Contraindications",
    chunk_text:
      "STEP-THERAPY CLINICAL EXCEPTION CLAUSE: The prerequisite 8-week trial of Azathioprine or 6-Mercaptopurine is WAIVED if the patient meets any of the following documented medical exceptions: (1) Documented severe hypersensitivity reaction, acute drug-induced pancreatitis, or severe hepatotoxicity induced by thiopurines; (2) Documented genetic deficiency of Thiopurine S-methyltransferase (TPMT enzyme activity < 5.0 U/mL) or homozygous NUDT15 defect conferring high risk of life-threatening bone marrow aplasia; or (3) Severe fistulizing perianal Crohn's disease requiring rapid biologic induction to prevent sphincter injury. When an exception criterion is documented, immediate approval of Infliximab is clinically indicated.",
  },
];

// ============================================================================
// 2. Synthetic Patient Charts (3 Scenarios)
// ============================================================================

export const SYNTHETIC_PATIENTS: SyntheticPatient[] = [
  // --------------------------------------------------------------------------
  // Patient 1: Marcus Vance (PT-2026-001) - 100% Ready to Submit
  // --------------------------------------------------------------------------
  {
    patient_id_code: "PT-2026-001",
    patient_name: "Marcus Vance",
    dob: "1981-04-14",
    payer_name: "Aetna",
    member_id: "AET-99482104",
    requested_procedure: "Lumbar Spine MRI without Contrast",
    procedure_code: "CPT-72148",
    diagnosis_codes: [
      "M54.16 (Radiculopathy, lumbar region)",
      "M51.26 (Other intervertebral disc displacement, lumbar region)",
    ],
    clinical_notes: {
      chief_complaint:
        "Intractable sharp, shooting low back pain radiating down the posterior right thigh and lateral calf to the great toe for 9 weeks. Intermittent numbness and tingling in the right L5 dermatome. Pain is exacerbated by sitting and forward bending.",
      medications_tried: [
        {
          medication: "Naproxen",
          dosage: "500 mg PO BID",
          start_date: "2026-08-01",
          end_date: "2026-09-06",
          duration_weeks: 5,
          outcome:
            "Failed 5-week trial. Provided minimal relief for axial low back soreness but zero reduction in lancinating L5 radicular leg pain (VAS score remains 7/10).",
        },
        {
          medication: "Cyclobenzaprine",
          dosage: "10 mg PO QHS",
          start_date: "2026-08-01",
          end_date: "2026-08-28",
          duration_weeks: 4,
          outcome:
            "Completed 4-week trial. Relieved nocturnal lumbar muscle spasms; no effect on radiating neuropathic symptoms.",
        },
      ],
      physical_therapy_history: {
        completed: true,
        facility: "Apex Sports & Spine Physical Therapy",
        start_date: "2026-08-03",
        end_date: "2026-09-18",
        total_sessions: 12,
        frequency: "2 times weekly for 6.5 weeks",
        supervised_by: "Dr. Sarah Jenkins, PT, DPT, OCS",
        clinical_outcome:
          "Completed 12 supervised sessions focusing on core stabilization, McKenzie lumbar extension, neural glides, and pelvic tilts. Despite 100% compliance, patient exhibited persistent right L5 radiculopathy and functional limitations. Discharged with formal recommendation for advanced spinal diagnostic imaging.",
      },
      lab_results: [
        {
          test_name: "Comprehensive Metabolic Panel (CMP)",
          result: "Normal (BUN 14, Creatinine 0.9, eGFR >90, LFTs normal)",
          reference_range: "Normal Limits",
          date: "2026-08-01",
          interpretation: "Normal kidney and liver function; tolerating NSAIDs.",
        },
        {
          test_name: "Complete Blood Count (CBC)",
          result: "WBC 6.8, Hgb 15.2, Platelets 235",
          reference_range: "Normal Limits",
          date: "2026-08-01",
          interpretation: "No signs of occult infection or systemic inflammation.",
        },
      ],
      imaging_history: [
        {
          modality: "Plain Radiograph (X-Ray, AP & Lateral 3-View)",
          body_part: "Lumbar Spine",
          date: "2026-08-02",
          findings:
            "Moderate intervertebral disc space narrowing at L4-L5 and L5-S1. Mild posterior element hypertrophic changes. No spondylolisthesis, pars defect, acute vertebral compression fracture, or gross structural instability.",
          impression:
            "Degenerative disc disease at L4-L5 and L5-S1 without spondylolisthesis. Complies with prerequisite plain imaging.",
        },
      ],
      allergies_and_contraindications: [
        {
          agent: "Penicillin",
          reaction_type: "Mild urticarial rash",
          severity: "Mild",
          documented_date: "2018-05-12",
          clinical_notes: "No contraindications to MRI or NSAIDs.",
        },
      ],
      physician_progress_notes: [
        {
          date: "2026-09-22",
          provider_name: "Dr. Robert Sterling, MD",
          provider_specialty: "Orthopedic Spine Surgery",
          subjective:
            "Patient presents for follow-up evaluation of progressive right lower extremity radiculopathy persisting for over 9 weeks. Has completed full 6-week course of supervised PT (12 sessions) and 5 weeks of Naproxen without meaningful pain reduction.",
          objective:
            "Physical Exam: Right Straight Leg Raise (SLR) is strongly positive at 35 degrees reproducing sharp electric pain down the posterolateral right calf and dorsal foot. Sensory exam reveals decreased pinprick sensation along the right L5 dermatome. Motor strength: Extensor hallucis longus (EHL) 4/5 on the right, 5/5 on the left. Lumbar flexion restricted to 40 degrees by radiating pain. Lumbar X-rays from 2026-08-02 reviewed.",
          assessment:
            "Right L5 radiculopathy secondary to suspected lumbar disc herniation at L4-L5 or L5-S1. Symptoms have failed >6 weeks of supervised conservative physical therapy and oral NSAIDs. Objective neurologic deficits confirmed on exam.",
          plan:
            "Order Lumbar Spine MRI without contrast (CPT 72148) to confirm nerve root compression and surgical planning. Patient meets 100% of Aetna CPB-0236 criteria.",
        },
      ],
    },
  },

  // --------------------------------------------------------------------------
  // Patient 2: Elena Rostova (PT-2026-002) - Missing Mandatory Lab Flagged
  // --------------------------------------------------------------------------
  {
    patient_id_code: "PT-2026-002",
    patient_name: "Elena Rostova",
    dob: "1975-11-03",
    payer_name: "UnitedHealthcare",
    member_id: "UHC-81203957",
    requested_procedure: "Adalimumab (Humira) Subcutaneous Injection 40mg/0.8mL every 14 days",
    procedure_code: "J0135",
    diagnosis_codes: [
      "M05.79 (Rheumatoid arthritis with rheumatoid factor of multiple sites)",
    ],
    clinical_notes: {
      chief_complaint:
        "Persistent severe bilateral hand, wrist, and metatarsophalangeal (MTP) joint swelling, morning stiffness exceeding 2 hours, and fatigue despite 4 months of maximum-dose oral Methotrexate.",
      medications_tried: [
        {
          medication: "Methotrexate",
          dosage: "20 mg PO once weekly (with Folic Acid 1mg daily)",
          start_date: "2026-05-10",
          end_date: "2026-09-01",
          duration_weeks: 16,
          outcome:
            "Failed 16-week trial of optimized csDMARD (exceeds 12-week policy requirement). Inadequate disease suppression; ongoing severe synovitis with 10 actively swollen joints. DAS28-CRP score remains elevated at 5.4.",
        },
        {
          medication: "Meloxicam",
          dosage: "15 mg PO daily",
          start_date: "2026-04-12",
          duration_weeks: 22,
          outcome:
            "Partial dampening of morning stiffness, but insufficient control of autoimmune joint swelling.",
        },
      ],
      physical_therapy_history: {
        completed: false,
        facility: "Metro Hand Therapy Center",
        start_date: "2026-06-15",
        total_sessions: 2,
        supervised_by: "Claire Chen, OTR/L, CHT",
        clinical_outcome:
          "Custom resting wrist splints fabricated. Evaluator noted that severe active inflammatory synovitis requires biologic immunosuppression rather than aggressive manual rehabilitation.",
      },
      lab_results: [
        {
          test_name: "C-Reactive Protein (CRP)",
          result: "3.8 mg/dL",
          reference_range: "0.0 - 0.8 mg/dL",
          date: "2026-09-08",
          interpretation: "Significantly elevated acute-phase reactant confirming severe active systemic inflammation (exceeds UHC threshold > 1.0 mg/dL).",
        },
        {
          test_name: "Erythrocyte Sedimentation Rate (ESR)",
          result: "46 mm/hr",
          reference_range: "0 - 20 mm/hr",
          date: "2026-09-08",
          interpretation: "Markedly elevated inflammatory marker.",
        },
        {
          test_name: "Rheumatoid Factor (RF) IgM",
          result: "112 IU/mL",
          reference_range: "< 14 IU/mL",
          date: "2026-09-08",
          interpretation: "Strongly positive serology confirming seropositive RA.",
        },
        {
          test_name: "Anti-Cyclic Citrullinated Peptide (Anti-CCP)",
          result: "> 250 U/mL",
          reference_range: "< 20 U/mL",
          date: "2026-09-08",
          interpretation: "Strongly positive, indicative of erosive RA trajectory.",
        },
        {
          test_name: "Hepatitis B Surface Antigen (HBsAg)",
          result: "Negative / Non-reactive",
          reference_range: "Negative",
          date: "2026-09-10",
          interpretation: "Negative for active Hepatitis B surface viremia.",
        },
        {
          test_name: "Hepatitis B Core Antibody Total (anti-HBc)",
          result: "Negative / Non-reactive",
          reference_range: "Negative",
          date: "2026-09-10",
          interpretation: "Negative for prior exposure to Hepatitis B.",
        },
        // CRITICAL GAP: QuantiFERON-TB Gold or PPD skin test was NOT done.
      ],
      imaging_history: [
        {
          modality: "Radiograph (X-Ray, 3-View Bilateral Hands and Wrists)",
          body_part: "Bilateral Hands and Wrists",
          date: "2026-05-15",
          findings:
            "Diffuse periarticular osteopenia at the 2nd and 3rd MCP joints bilaterally. Moderate soft tissue swelling surrounding the PIP and MCP joints. No cortical bone erosions observed at this stage.",
          impression:
            "Active symmetric inflammatory polyarthritis consistent with Rheumatoid Arthritis without marginal erosions.",
        },
      ],
      allergies_and_contraindications: [
        {
          agent: "Sulfamethoxazole-Trimethoprim (Bactrim)",
          reaction_type: "Maculopapular rash and facial edema",
          severity: "Moderate",
          documented_date: "2021-03-14",
          clinical_notes: "Avoid sulfonamide-containing csDMARDs like Sulfasalazine.",
        },
      ],
      physician_progress_notes: [
        {
          date: "2026-09-15",
          provider_name: "Dr. Priya Patel, MD",
          provider_specialty: "Rheumatology",
          subjective:
            "49-year-old female with aggressive seropositive RA returning for treatment escalation. She has maintained excellent compliance with Methotrexate 20mg weekly for 16 consecutive weeks, but reports intolerable pain and functional impairment in both hands.",
          objective:
            "Exam reveals 10 swollen joints (bilateral MCP 2-4, bilateral PIP 3, bilateral wrists) and 14 tender joints. Moderate boggy synovitis at carpal joints. Grip strength markedly diminished bilaterally. Lab review: CRP 3.8 mg/dL, ESR 46 mm/hr, Hep B panel negative. NOTE: Patient was handed a lab requisition for QuantiFERON-TB Gold on 2026-09-10, but states she ran out of time at the outpatient lab and has not completed the blood draw yet.",
          assessment:
            "Severe active seropositive Rheumatoid Arthritis refractory to 16-week trial of conventional DMARD (Methotrexate 20mg/wk). Indicated for biologic escalation with Adalimumab (Humira) 40mg biweekly.",
          plan:
            "Submit prior authorization request to UnitedHealthcare for Adalimumab 40mg SC every 14 days (J0135). Remind patient that she MUST complete the pending QuantiFERON-TB Gold blood test immediately, as UHC policy UHC-BIO-402 strictly requires documented negative TB screening prior to biologic approval.",
        },
      ],
    },
  },

  // --------------------------------------------------------------------------
  // Patient 3: David Chen (PT-2026-003) - Step-Therapy Exception / Allergy
  // --------------------------------------------------------------------------
  {
    patient_id_code: "PT-2026-003",
    patient_name: "David Chen",
    dob: "1992-08-20",
    payer_name: "BlueCross BlueShield",
    member_id: "BCBS-62049182",
    requested_procedure: "Infliximab (Remicade) 5mg/kg IV Infusion at weeks 0, 2, 6, then every 8 weeks",
    procedure_code: "J1745",
    diagnosis_codes: [
      "K50.90 (Crohn’s disease, unspecified, without complications)",
    ],
    clinical_notes: {
      chief_complaint:
        "Severe recurrent lower quadrant crampy abdominal pain, 6 to 8 daily watery bloody stools, nocturnal defecation, and unintentional 12-lb weight loss. Severe steroid dependence with immediate flare below 20mg prednisone.",
      medications_tried: [
        {
          medication: "Prednisone",
          dosage: "40 mg PO daily taper",
          start_date: "2026-06-15",
          end_date: "2026-08-10",
          duration_weeks: 8,
          outcome:
            "Completed 8-week taper. Produced partial initial symptom remission, but severe clinical relapse occurred whenever dosage was tapered below 20 mg/day (steroid-refractory/dependent Crohn's).",
        },
        {
          medication: "Azathioprine (Imuran)",
          dosage: "150 mg PO daily (approx 2 mg/kg/day)",
          start_date: "2026-07-09",
          end_date: "2026-07-14",
          duration_weeks: 0.7,
          outcome:
            "ABRUPTLY DISCONTINUED ON DAY 5 DUE TO LIFE-THREATENING DRUG-INDUCED ACUTE PANCREATITIS AND MARKED TPMT ENZYME DEFICIENCY. Did not complete 8-week course due to severe clinical contraindication.",
          adverse_reaction:
            "Acute drug-induced pancreatitis with epigastric pain radiating to back, severe nausea, and serum lipase peaking at 980 U/L on day 5 of therapy.",
        },
      ],
      physical_therapy_history: {
        completed: false,
        clinical_outcome: "Not applicable for inflammatory bowel disease.",
      },
      lab_results: [
        {
          test_name: "Serum Lipase",
          result: "980 U/L",
          reference_range: "10 - 140 U/L",
          date: "2026-07-14",
          interpretation: "Markedly elevated (>7x upper limit of normal) confirming severe acute drug-induced pancreatitis on day 5 of Azathioprine trial.",
        },
        {
          test_name: "Serum Amylase",
          result: "420 U/L",
          reference_range: "30 - 110 U/L",
          date: "2026-07-14",
          interpretation: "Significantly elevated secondary to acute pancreatitis.",
        },
        {
          test_name: "Thiopurine S-Methyltransferase (TPMT) Enzyme Activity",
          result: "4.2 U/mL",
          reference_range: "13.8 - 25.1 U/mL",
          date: "2026-07-16",
          interpretation: "Severe TPMT deficiency (<5.0 U/mL threshold in BCBS-RX-819 Section 3.3). High risk of fatal thiopurine toxicity and myelosuppression. Absolute contraindication to all thiopurines (Azathioprine / 6-MP).",
        },
        {
          test_name: "Fecal Calprotectin",
          result: "1,240 mcg/g",
          reference_range: "< 50 mcg/g",
          date: "2026-08-25",
          interpretation: "Massively elevated gastrointestinal biomarker confirming severe active mucosal inflammation.",
        },
        {
          test_name: "QuantiFERON-TB Gold In-Tube",
          result: "Negative",
          reference_range: "Negative",
          date: "2026-08-26",
          interpretation: "Negative for latent tuberculosis infection.",
        },
        {
          test_name: "Hepatitis B Surface Antigen (HBsAg) & anti-HBc",
          result: "Negative / Non-reactive",
          reference_range: "Negative",
          date: "2026-08-26",
          interpretation: "Negative for active or past Hepatitis B infection.",
        },
      ],
      imaging_history: [
        {
          modality: "Colonoscopy with Terminal Ileoscopy & Biopsies",
          body_part: "Terminal Ileum and Colon",
          date: "2026-06-10",
          findings:
            "Severe segmented disease in terminal ileum spanning 25 cm with deep serpiginous linear ulcerations, cobblestoning, and friable mucosa. Ascending colon shows multiple aphthous ulcers with skip lesions. Histopathology confirmed non-caseating transmural granulomatous inflammation.",
          impression:
            "Severe active ileocolonic Crohn's disease confirmed by biopsy.",
        },
        {
          modality: "Abdominal Ultrasound (RUQ/Pancreas)",
          body_part: "Abdomen",
          date: "2026-07-14",
          findings:
            "Diffusely enlarged and edematous pancreatic parenchyma with peripancreatic fluid stranding. No cholelithiasis, biliary sludge, or common bile duct dilatation.",
          impression:
            "Acute interstitial pancreatitis without gallstone etiology, directly coinciding with initiation of Azathioprine.",
        },
      ],
      allergies_and_contraindications: [
        {
          agent: "Azathioprine / 6-Mercaptopurine (Thiopurines)",
          reaction_type: "Severe Drug-Induced Acute Pancreatitis & Documented TPMT Deficiency (4.2 U/mL)",
          severity: "Life-Threatening / Hospitalization Required",
          documented_date: "2026-07-14",
          clinical_notes:
            "Patient developed acute pancreatitis on day 5 of Azathioprine with lipase 980 U/L. Subsequent pharmacogenetic TPMT testing revealed severe deficiency (4.2 U/mL). Thiopurines are permanently and strictly contraindicated. Qualifies for Step-Therapy Clinical Exception under BCBS Policy 819 Section 3.3.",
        },
      ],
      physician_progress_notes: [
        {
          date: "2026-09-05",
          provider_name: "Dr. Jonathan Hayes, MD, FACG",
          provider_specialty: "Gastroenterology",
          subjective:
            "34-year-old male with severe ileocolonic Crohn's disease presenting for treatment escalation. Patient remains steroid-dependent, flaring severely as prednisone drops below 20 mg daily. Fecal calprotectin remains severely elevated at 1,240 mcg/g.",
          objective:
            "Physical exam reveals right lower quadrant tenderness without peritoneal signs. Colonoscopy from 2026-06-10 confirmed severe ileitis with non-caseating granulomas. Azathioprine was attempted on 2026-07-09 but aborted on 2026-07-14 after 5 days due to acute pancreatitis (lipase 980 U/L). Subsequent TPMT testing demonstrated profound enzyme deficiency (4.2 U/mL), representing an absolute contraindication to thiopurines. Infectious pre-screens (TB QuantiFERON and Hep B) are confirmed negative on 2026-08-26.",
          assessment:
            "Severe active Crohn's disease, steroid-dependent, with absolute medical contraindication to conventional thiopurine step-therapy due to documented drug-induced acute pancreatitis and genetic TPMT deficiency (4.2 U/mL).",
          plan:
            "Request immediate prior authorization for Infliximab (Remicade, J1745) 5mg/kg IV induction. Invoke BCBS-RX-819 Section 3.3 Step-Therapy Clinical Exception Clause based on documented thiopurine pancreatitis and TPMT deficiency.",
        },
      ],
    },
  },
];
