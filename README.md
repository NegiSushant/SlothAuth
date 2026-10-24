# 🦥 SlothAuth — Autonomous Overnight Prior-Authorization Prep Agent

> **Built for the Hacktoberfest 2026 Open-Source AI Challenge (Week 3: "Slow and Steady / Rewarding Laziness")**  
> *Turning 35 minutes of tedious morning EHR chart-hunting into a 30-second coffee-break sign-off.*

---

<p align="center">
  <img src="https://img.shields.io/badge/Next.js%2016-App%20Router-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/LangGraph.js-1.5+-FF6F00?style=for-the-badge&logo=langchain&logoColor=white" alt="LangGraph.js" />
  <img src="https://img.shields.io/badge/Gemma-Docker%20Model%20Runner-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemma" />
  <img src="https://img.shields.io/badge/PostgreSQL-pgvector%20HNSW-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/PHI%20Egress-0%20Bytes%20(HIPAA%20Safe)-10B981?style=for-the-badge&logo=securityscorecard&logoColor=white" alt="PHI Egress" />
</p>

---

## 1. Executive Summary & Elevator Pitch

In modern clinical practice, physicians and care coordinators complete approximately **39 prior authorization (PA) requests every week**—devoting over **13 hours of administrative overhead** to manual paperwork. For each patient, clinicians spend **35+ minutes** toggling between electronic health record (EHR) tabs, finding historical lab dates, and cross-referencing dense, 80-page payer medical policies just to prove medical necessity for standard diagnostics and biologic therapies.

**SlothAuth** solves clinical burnout by embracing the **"Slow and Steady" philosophy of the sloth**: rather than forcing exhausted clinicians into rushed, error-prone daytime manual entry, SlothAuth runs autonomously overnight. The agent reads clinical notes, generates embeddings, performs hybrid vector similarity search against active insurer policies, verifies clinical guidelines, catches missing laboratory screenings, and pre-assembles a formal, citation-backed justification packet. When the care coordinator arrives at 9:00 AM, the work is done: they review a verified packet in **30 seconds** and click **"Approve & Sign."**

---

## 2. Why Open-Source AI Wins Here (Cloud APIs vs. Local SlothAuth Stack)

Healthcare prior authorization handles deeply sensitive **Protected Health Information (PHI)**: diagnostic codes, medication history, clinical progress notes, and genomic lab values. Sending raw clinical records to multi-tenant commercial cloud APIs exposes health systems to severe HIPAA compliance liability, recurring per-token inference charges, and network downtime risks.

| Evaluation Dimension | Closed Commercial LLM APIs (OpenAI / Anthropic) | SlothAuth Local Open-Source Stack (Gemma + Docker Model Runner + pgvector) |
| :--- | :--- | :--- |
| **PHI / HIPAA Data Privacy** | ⚠️ High Risk: Patient notes transit third-party external networks and third-party cloud infrastructure. | 🛡️ **100% On-Premise Air-Gapped:** Zero bytes of PHI egress. All inferences and embeddings execute locally via Docker Model Runner on `localhost:12434`. |
| **Overnight Batch Token Cost** | 💸 Compounding Marginal Costs: Processing 40+ extensive charts and 80-page policy PDFs each night incurs recurring token fees. | 🆓 **$0.00 Marginal Inference Cost:** Unconstrained, deterministic overnight batch workloads run on existing hardware with no API budget caps. |
| **Offline Hospital Readiness** | ❌ Vulnerable to Internet outages, rate limits, and third-party API latency spikes. | ⚡ **Fully Resilient:** Operates natively within hospital intranets, disaster-recovery enclaves, or air-gapped clinical servers. |
| **Model Weight Pinning & Audit** | ❓ Opaque: Payer denials caused by unannounced vendor model drift or weight updates cannot be audited. | 🔍 **Reproducible & Deterministic:** Pinned open-weights (`ai/gemma3:4B-F16` / `ai/gemma3:1b-q4_K_M` + `ai/mxbai-embed-large`) guarantee verifiable, reproducible clinical audits. |
| **Vector Search Control** | 🔒 Proprietary black-box vector indices with variable distance metrics. | 📐 **Full SQL Control:** Native PostgreSQL with `pgvector` HNSW index using exact cosine distance (`1 - (embedding <=> query)`). |

---

## 3. System Architecture & LangGraph Workflow

SlothAuth combines **Next.js (App Router)** for real-time clinician interaction, **LangGraph.js** for deterministic state-machine orchestration, **Docker Model Runner** for local open-weight model serving, and **PostgreSQL (`pgvector`)** for hybrid structured and semantic policy retrieval.

### High-Level System Architecture

```mermaid
flowchart TD
    subgraph Frontend["Clinician Dashboard (Next.js 16 App Router)"]
        UI["Morning Care Coordinator Dashboard (/dashboard)"]
        SSE["SSE Real-Time Execution Stepper"]
        Inspector["Split-Screen Evidence Inspector & Letter Editor"]
        Telemetry["Local Privacy & Telemetry Bar (0 Bytes PHI, $0.00 Cost)"]
    end

    subgraph API["Next.js Route Handlers (/api/prior-auth)"]
        QueueAPI["/api/prior-auth/queue (GET)"]
        PrepAPI["/api/prior-auth/prep (POST - SSE Stream / Batch)"]
        PacketAPI["/api/prior-auth/packet/[requestId] (PATCH)"]
        ResetAPI["/api/prior-auth/reset (POST)"]
    end

    subgraph LangGraph["LangGraph.js State Machine Orchestrator"]
        N1["Node 1: extractPatientContext"]
        N2["Node 2: retrievePolicyChunks"]
        N3["Node 3: auditClinicalCriteria"]
        N4["Node 4: draftJustificationAndSave"]
    end

    subgraph LocalAI["Docker Model Runner (Local Engine :12434)"]
        GemmaLLM["Gemma Open-Weight LLM (ai/gemma3)"]
        EmbedModel["Embedding Engine (ai/mxbai-embed-large)"]
    end

    subgraph Database["PostgreSQL with pgvector Extension"]
        PoliciesTable[("payer_policies\nHNSW vector(1024) index")]
        RequestsTable[("patient_requests\nJSONB clinical_notes")]
        PacketsTable[("prepped_packets\nCriteria JSONB + Letters")]
    end

    UI --> QueueAPI
    UI --> PrepAPI
    Inspector --> PacketAPI
    UI --> ResetAPI

    PrepAPI --> LangGraph
    N1 --> RequestsTable
    N2 --> EmbedModel
    N2 --> PoliciesTable
    N3 --> GemmaLLM
    N4 --> GemmaLLM
    N4 --> PacketsTable
    N4 --> RequestsTable

    PrepAPI -. "Server-Sent Events (SSE)" .-> SSE
    QueueAPI -. "Summary & Records" .-> UI
    PacketsTable -. "Prepped Details" .-> Inspector
    PoliciesTable -. "Cosine Similarity Matches" .-> Inspector
```

---

### The 4-Node LangGraph Execution Pipeline

The prior authorization workflow executes deterministically as a four-node directed state graph:

```mermaid
sequenceDiagram
    autonumber
    actor Clinician as Care Coordinator / Cron
    participant API as /api/prior-auth/prep
    participant N1 as Node 1: extractPatientContext
    participant N2 as Node 2: retrievePolicyChunks
    participant N3 as Node 3: auditClinicalCriteria
    participant N4 as Node 4: draftJustificationAndSave
    participant DB as PostgreSQL (pgvector)
    participant DMR as Docker Model Runner (:12434)

    Clinician->>API: Trigger Overnight Batch or Single Prep (stream: true)
    API->>N1: PriorAuthGraphState.invoke({ requestId })
    
    Note over N1,DB: Node 1: Clinical Chart Extraction
    N1->>DB: SELECT * FROM patient_requests WHERE id = $1
    DB-->>N1: Patient demographics, ICD-10, JSONB clinical notes
    N1->>N1: Build chronological clinical timeline string
    N1-->>API: SSE: node_complete (extractPatientContext)

    Note over N2,DMR: Node 2: Hybrid Policy Retrieval (RAG)
    API->>N2: State with formattedClinicalTimeline
    N2->>DMR: POST /embeddings (query text)
    DMR-->>N2: 1024-dimension query vector
    N2->>DB: SELECT ... FROM payer_policies WHERE payer_name = $1 AND procedure_code = $2 ORDER BY embedding <=> $3 LIMIT 5
    DB-->>N2: Top policy rule chunks + cosine similarities
    N2-->>API: SSE: node_complete (retrievePolicyChunks)

    Note over N3,DMR: Node 3: Criteria Auditing & Gap Detection
    API->>N3: State with matchedPolicyChunks & patientChart
    N3->>DMR: POST /chat/completions (Audit policy rules vs patient chart)
    DMR-->>N3: Point-by-point criteria status, verbatim evidence quotes, missing items
    N3->>N3: Determine readinessVerdict (READY_TO_SUBMIT | MISSING_INFO | EXCEPTION_REQUIRED)
    N3-->>API: SSE: node_complete (auditClinicalCriteria)

    Note over N4,DB: Node 4: Letter Drafting & Packet Upsert
    API->>N4: State with criteriaEvaluationList & missingDocumentationList
    N4->>DMR: POST /chat/completions (Draft physician clinical summary)
    DMR-->>N4: Physician impression narrative
    N4->>N4: Assemble complete Medical Necessity Justification Letter + Warning Banners
    N4->>DB: INSERT INTO prepped_packets ON CONFLICT DO UPDATE
    N4->>DB: UPDATE patient_requests SET status = 'PREPPED'
    N4-->>API: SSE: node_complete (draftJustificationAndSave)

    API-->>Clinician: SSE: patient_complete & batch_complete
```

---

## 4. Pre-Loaded Clinical Scenarios (Demo Test Cases)

The repository comes pre-seeded with three realistic clinical scenarios configured in `src/lib/seed-data.ts`. These represent the three most common prior authorization archetypes encountered in hospital workflows:

| Patient ID | Patient Name | Payer & Requested Procedure | CPT / HCPCS | Audit Verdict | Clinical Scenario Highlights |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`PT-2026-001`** | **Marcus Vance** (Age 48) | **Aetna**<br>Lumbar Spine MRI without Contrast | `CPT-72148` | `✅ READY_TO_SUBMIT`<br>*(98% Confidence)* | **100% Policy Compliant:** Documented >9 weeks of right L5 radiculopathy, positive Straight Leg Raise (35°), completed 12 supervised Physical Therapy sessions at Apex Sports & Spine, failed Naproxen trial, and normal plain lumbar spine radiographs (`CPT-72100`). Ready for instantaneous 1-click submission. |
| **`PT-2026-002`** | **Elena Rostova** (Age 50) | **UnitedHealthcare**<br>Adalimumab (Humira) 40mg/0.8mL SC | `J0135` | `⚠️ MISSING_INFO`<br>*(88% Confidence)* | **Missing Safety Lab Flagged:** Patient has severe Rheumatoid Arthritis (DAS28 5.4, 10 swollen joints), failed 16-week Methotrexate csDMARD trial, elevated CRP (3.8 mg/dL), and negative Hepatitis B screening. **The agent flags a missing mandatory QuantiFERON-TB Gold screening** required by UHC policy before biologic initiation, generating a top-level warning banner and 1-click clinician resolution workflow. |
| **`PT-2026-003`** | **David Chen** (Age 34) | **BlueCross BlueShield**<br>Infliximab (Remicade) 5mg/kg IV | `J1745` | `⚡ EXCEPTION_REQUIRED`<br>*(96% Confidence)* | **Step-Therapy Exception Automated:** Severe ileocolonic Crohn's disease refractory to steroids. Payer guidelines mandate an 8-week Azathioprine trial before biologic approval. The agent discovers that Azathioprine was halted on Day 5 due to **acute drug-induced pancreatitis (lipase 980 U/L)** and locates **low TPMT enzyme activity (4.2 U/mL)** in the chart notes, automatically generating a formal Step-Therapy Exception justification letter. |

---

## 5. Key UI Features ("Morning Care Coordinator" Dashboard)

When navigating to `/dashboard`, the clinician experiences an interface tailored specifically for high-efficiency review:

1. **"Lazy Payoff" Morning KPI Bar:**
   - **Hours & Minutes Saved:** Calculated live at 35 minutes saved per prepped packet.
   - **Autonomous Batch Progress:** Real-time counters showing total patients, pending requests, prepped packets, and missing documentation items.
   - **One-Click Batch Execution:** Trigger the overnight simulation manually or reset the database with single-click ease.
2. **Real-Time SSE LangGraph Execution Stepper:**
   - Live visual step cards for each LangGraph node:
     1. *Reading EHR Clinical Chart & Timeline*
     2. *Searching Payer Policy via PostgreSQL pgvector*
     3. *Auditing Clinical Criteria & Gaps with Local Gemma*
     4. *Drafting Medical Necessity Letter & Saving Packet*
   - Real-time animated pulse indicators, node execution timers, and live streaming console logs.
3. **Split-Screen Evidence Map vs. Editable Justification Letter:**
   - **Left Panel:** Policy criteria cards showing status (`MET`, `MISSING`, `EXCEPTION_JUSTIFIED`), verbatim clinical evidence excerpts from the EHR, and documentation source dates.
   - **Right Panel:** A full, formal Medical Necessity Justification Letter drafted in professional clinical format, fully editable in real-time with Markdown support.
4. **1-Click Missing Lab Resolution & Electronic Clinician Sign-Off:**
   - In cases with missing safety labs (e.g., Elena Rostova's TB test), the dashboard provides an inline **"Resolve & Attach Lab"** action that updates criteria in PostgreSQL, clears the warning banner, and recalculates readiness to `100% READY_TO_SUBMIT`.
   - Single-click **"Approve & Electronically Sign"** attaches the clinician's digital signature and timestamp, transitioning the packet to `APPROVED_AND_SUBMITTED`.
5. **Live Local Privacy & Zero-Cost Telemetry Footer:**
   - Persistent bottom bar confirming:
     - **Inference Engine:** `Local Docker Model Runner (Gemma)`
     - **Vector Store:** `PostgreSQL pgvector (HNSW Hybrid Search)`
     - **PHI Egress:** `0 Bytes (100% HIPAA Safe)`
     - **Cloud API Cost:** `$0.00`

---

## 6. Tech Stack Breakdown

### Frontend Layer
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Server-Side Rendering, React 19)
- **Styling:** Tailwind CSS with custom glassmorphism and slate/emerald clinical design system
- **Icons:** [Lucide React](https://lucide.dev/)
- **Streaming:** Server-Sent Events (SSE) via native `ReadableStream` and `TextEncoder`

### Agent & AI Orchestration Layer
- **State Machine:** [@langchain/langgraph](https://js.langchain.com/docs/concepts/langgraph/) (Deterministic StateGraph with structured annotation reducers)
- **Model Adapter:** [@langchain/openai](https://js.langchain.com/docs/integrations/chat/openai/) (OpenAI-compatible client targeting local Docker Model Runner)
- **Schema Validation:** [Zod](https://zod.dev/) for robust LLM JSON schema enforcement and error recovery

### Local AI Runtime (On-Premise / Air-Gapped)
- **Runtime:** **Docker Desktop — Docker Model Runner** (listening on TCP port `12434`)
- **LLM Models:** `ai/gemma3:4B-F16` or `ai/gemma3:1b-q4_K_M`
- **Embedding Model:** `ai/mxbai-embed-large` (1024-dimensional embeddings)

### Database & Vector Search Layer
- **Database Engine:** PostgreSQL 16 via official `pgvector/pgvector:pg16` Docker container
- **Vector Index:** HNSW index (`embedding vector_cosine_ops`) for sub-millisecond semantic retrieval
- **Hybrid Indexing:** Composite B-tree index on `(payer_name, procedure_code)`
- **ORM / Client:** Prisma 7 with native PostgreSQL pgvector raw query integration

---

## 7. Step-by-Step Local Setup & Installation Guide

Follow these steps to set up and run SlothAuth locally with 100% local model execution.

### Step 1: Prerequisites
- **Node.js:** v18.17+ or v20+ (or [Bun](https://bun.sh/) v1.2+)
- **Docker Desktop:** Installed and running with **Docker Model Runner** enabled.
- **Git**

---

### Step 2: Enable Docker Model Runner & Pull Open-Weight Models

Docker Model Runner provides a local OpenAI-compatible inference server running directly on port `12434`.

1. In Docker Desktop, ensure the **Model Runner** feature is active (default TCP port `12434`).
2. Open your terminal and pull the local open-weight models:

```bash
# Pull the Gemma clinical evaluation model
docker model pull ai/gemma3:4B-F16
# (or pull the lightweight quantized variant: docker model pull ai/gemma3:1b-q4_K_M)

# Pull the high-precision embedding model
docker model pull ai/mxbai-embed-large
```

3. Verify that the Docker Model Runner engine is running and responding:

```bash
curl http://localhost:12434/engines/llama.cpp/v1/models
```

You should receive a JSON response listing the downloaded models.

---

### Step 3: Start PostgreSQL with `pgvector`

SlothAuth includes a pre-configured `Docker-Compose.yml` specifying the official `pgvector/pgvector:pg16` image.

Start the database container:

```bash
docker compose -f Docker-Compose.yml up -d
```

Verify that the database container is healthy:

```bash
docker ps --filter "name=sloth-postgres"
```

---

### Step 4: Environment Configuration (`.env.local`)

Copy the provided `.env.example` file to `.env.local` (or `.env`):

```bash
cp .env.example .env.local
```

Ensure the configuration matches your local ports and preferred model tags:

```env
# Database Connection (matching Docker-Compose.yml)
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/postgres"

# Docker Model Runner (Local AI on Port 12434)
DOCKER_MODEL_BASE_URL="http://localhost:12434/engines/llama.cpp/v1"
EMBEDDING_MODEL_NAME="ai/mxbai-embed-large"
LLM_MODEL_NAME="ai/gemma3:4B-F16"

# Fallback Configuration
DMR_BASE_URL="http://localhost:12434/engines/v1"
DMR_MODEL="ai/gemma3:4B-F16"
DMR_EMD_MODEL="ai/mxbai-embed-large"
```

---

### Step 5: Install Dependencies & Seed Vector Database

1. Install project dependencies:

```bash
npm install
# or: bun install
```

2. Seed the database with the synthetic payer policies, generate 1024-dimensional embeddings via Docker Model Runner, and populate the 3 clinical test cases:

```bash
npm run db:seed
# or: bun run db:seed
```

*(This creates tables, enables the `vector` extension, generates vector embeddings for policy chunks, and loads Marcus Vance, Elena Rostova, and David Chen).*

3. *(Optional)* Run the standalone CLI verification script to test the LangGraph workflow in your terminal:

```bash
npm run agent:test
# or: bun run agent:test
```

---

### Step 6: Run the Application

Start the Next.js development server:

```bash
npm run dev
# or: bun run dev
```

Open your browser to:
👉 **[http://localhost:3000](http://localhost:3000)** (Landing Page)  
👉 **[http://localhost:3000/dashboard](http://localhost:3000/dashboard)** (Morning Prior-Auth Dashboard)

---

## 8. API Reference & Database Schema Overview

### API Route Endpoints

| Method | Endpoint | Description | Request Payload | Response Summary |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/prior-auth/queue` | Returns all patient requests, their prepped packet status, criteria evaluations, and summary telemetry stats. | *None* | `{ success: true, stats: { ... }, patients: [...] }` |
| `POST` | `/api/prior-auth/prep` | Executes the LangGraph agent for a single patient or runs an overnight batch across all pending patients. Supports SSE streaming. | `{ requestId?: number, stream?: boolean }` | Single JSON result, batch array, or `text/event-stream` SSE tokens. |
| `PATCH` | `/api/prior-auth/packet/[requestId]` | Updates a prepped packet: saves letter edits, resolves flagged missing labs, or applies clinician electronic sign-off. | `{ action: "SAVE_DRAFT" \| "RESOLVE_MISSING_ITEM" \| "APPROVE_AND_SUBMIT", ... }` | `{ success: true, message: string, patient: { ... } }` |
| `POST` | `/api/prior-auth/reset` | Resets the simulation state by clearing `prepped_packets` and restoring all patients to `PENDING_PREP`. | *None* | `{ success: true, message: string, count: number }` |

---

### PostgreSQL Database Schema

```sql
-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Payer Policies Table (Vectorized Clinical Rules & Guidelines)
CREATE TABLE IF NOT EXISTS payer_policies (
    id SERIAL PRIMARY KEY,
    payer_name VARCHAR(100) NOT NULL,
    procedure_code VARCHAR(50) NOT NULL,
    policy_number VARCHAR(50) NOT NULL,
    policy_title TEXT NOT NULL,
    section_name VARCHAR(150) NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(1024) NOT NULL
);

-- HNSW Cosine Index for Fast Similarity Search
CREATE INDEX IF NOT EXISTS idx_payer_policies_embedding 
    ON payer_policies USING hnsw (embedding vector_cosine_ops);

-- Composite Index for Hybrid Payer + Procedure Filtering
CREATE INDEX IF NOT EXISTS idx_payer_policies_hybrid 
    ON payer_policies (payer_name, procedure_code);

-- 3. Patient Requests Table (Intake Records & Structured Clinical Notes)
CREATE TABLE IF NOT EXISTS patient_requests (
    id SERIAL PRIMARY KEY,
    patient_id_code VARCHAR(50) UNIQUE NOT NULL,
    patient_name VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    payer_name VARCHAR(100) NOT NULL,
    member_id VARCHAR(50) NOT NULL,
    requested_procedure VARCHAR(200) NOT NULL,
    procedure_code VARCHAR(50) NOT NULL,
    diagnosis_codes TEXT[] NOT NULL,
    clinical_notes JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING_PREP' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Prepped Packets Table (Autonomous Review Output & Letters)
CREATE TABLE IF NOT EXISTS prepped_packets (
    id SERIAL PRIMARY KEY,
    request_id INTEGER UNIQUE REFERENCES patient_requests(id) ON DELETE CASCADE,
    readiness_status VARCHAR(50) NOT NULL,
    confidence_score INTEGER NOT NULL,
    criteria_checklist JSONB NOT NULL,
    missing_items TEXT[] NOT NULL,
    draft_justification_letter TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 9. Project Directory Structure

```
sloth-auth/
├── Docker-Compose.yml                 # PostgreSQL 16 + pgvector container definition
├── README.md                          # Comprehensive project documentation
├── package.json                       # Dependencies, scripts (db:seed, agent:test)
├── prisma7.config.ts                  # Prisma configuration
├── tsconfig.json                      # TypeScript configuration
├── next.config.ts                     # Next.js configuration
├── .env.example                       # Environment template for local AI & DB
├── prisma/
│   └── schema.prisma                  # Prisma ORM schema definition
├── scripts/
│   ├── seed.ts                        # Vector seeding script (DMR embeddings + Postgres)
│   ├── test-agent.ts                  # CLI LangGraph workflow verification runner
│   ├── test-api.ts                    # REST & SSE endpoint integration tester
│   └── test-e2e.ts                    # End-to-end simulation runner
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── auth/                  # Clinician authentication endpoints
    │   │   └── prior-auth/
    │   │       ├── packet/[requestId] # PATCH: Letter edit, lab resolve, sign-off
    │   │       ├── prep/              # POST: LangGraph runner (JSON + SSE stream)
    │   │       ├── queue/             # GET: Patient queue & telemetry stats
    │   │       └── reset/             # POST: Simulation reset to PENDING_PREP
    │   ├── dashboard/
    │   │   └── page.tsx               # Morning Care Coordinator Dashboard
    │   ├── signin/page.tsx            # Clinician login portal
    │   ├── signup/page.tsx            # Clinician registration portal
    │   ├── layout.tsx                 # Root layout with AuthProvider & metadata
    │   └── page.tsx                   # Product landing page & hackathon showcase
    ├── components/
    │   ├── AgentExecutionStepper.tsx  # Real-time SSE 4-node pipeline stepper
    │   ├── PacketInspector.tsx        # Split-screen criteria checklist & letter editor
    │   ├── PatientQueueSidebar.tsx    # Patient roster list with status badges
    │   ├── TelemetryFooter.tsx        # Fixed footer showing 0 bytes PHI & $0 cost
    │   ├── TopControlBar.tsx          # "Lazy Payoff" KPI bar & batch trigger buttons
    │   ├── auth/                      # Authentication card components
    │   └── landing/                   # Hero, FeatureGrid, Workflow, FAQ sections
    ├── lib/
    │   ├── agent/
    │   │   ├── models.ts              # Docker Model Runner Gemma & Embeddings config
    │   │   ├── nodes.ts               # 4 LangGraph nodes (extract, retrieve, audit, draft)
    │   │   ├── priorAuthGraph.ts      # LangGraph workflow definition & batch runner
    │   │   └── state.ts               # LangGraph State annotation definitions
    │   ├── auth/                      # Session and token utilities
    │   ├── prisma.ts                  # Prisma database client instance
    │   ├── schema.sql                 # Reference SQL DDL with pgvector indexes
    │   ├── seed-data.ts               # Synthetic policies & 3 patient clinical charts
    │   └── utils.ts                   # Class merging & UI utilities
    └── types/
        └── prior-auth.ts              # TypeScript interfaces for prior-auth domain
```

---

## 10. Hacktoberfest 2026 Submission Note

**Category:** *Week 3: Slow and Steady / Rewarding Laziness*  
**Built with:** Open-Weight Gemma, Docker Model Runner, LangGraph.js, Next.js 16, PostgreSQL + pgvector  
**Mission:** Eliminating administrative healthcare burnout by letting local open-source AI do the tedious overnight legwork, returning thousands of hours back to direct patient care.
