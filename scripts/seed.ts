import "dotenv/config";
import prisma from "../src/lib/prisma";
import { PAYER_POLICIES, SYNTHETIC_PATIENTS } from "../src/lib/seed-data";

/**
 * Resolves candidate URLs for the Docker Model Runner embeddings endpoint.
 */
function getEmbeddingEndpoints(): string[] {
  const configuredBase =
    process.env.DOCKER_MODEL_BASE_URL ||
    process.env.DMR_BASE_URL_EMD ||
    process.env.DMR_BASE_URL ||
    "http://localhost:12434/engines/llama.cpp/v1";

  const cleanBase = configuredBase.replace(/\/+$/, "");
  const candidates: string[] = [];

  if (cleanBase.endsWith("/embeddings")) {
    candidates.push(cleanBase);
  } else {
    candidates.push(`${cleanBase}/embeddings`);
  }

  // Common DMR fallback endpoints
  candidates.push("http://localhost:12434/engines/v1/embeddings");
  candidates.push("http://localhost:12434/engines/llama.cpp/v1/embeddings");

  // Deduplicate candidates
  return Array.from(new Set(candidates));
}

let activeEndpoint: string | null = null;
const modelName =
  process.env.EMBEDDING_MODEL_NAME ||
  process.env.DMR_EMD_MODEL ||
  "ai/mxbai-embed-large";

/**
 * Generates an embedding vector using the local Docker Model Runner.
 */
export async function generateLocalEmbedding(text: string): Promise<number[]> {
  const endpoints = activeEndpoint ? [activeEndpoint] : getEmbeddingEndpoints();
  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelName,
          input: text,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `DMR Embeddings HTTP ${response.status} at ${endpoint}: ${errorText}`
        );
      }

      const data = (await response.json()) as {
        data?: Array<{ embedding: number[] }>;
      };

      if (!data.data || !data.data[0] || !Array.isArray(data.data[0].embedding)) {
        throw new Error(
          `Unexpected response structure from ${endpoint}: ${JSON.stringify(data)}`
        );
      }

      activeEndpoint = endpoint;
      return data.data[0].embedding;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (activeEndpoint) break;
    }
  }

  throw new Error(
    `Failed to generate embedding from Docker Model Runner.\nTried endpoints: ${endpoints.join(
      ", "
    )}\nModel: "${modelName}"\nRoot cause: ${lastError?.message || "Unknown error"}\n\n` +
      `Please ensure Docker Desktop / Docker Model Runner is running at localhost:12434 and ` +
      `the model "${modelName}" is pulled (e.g., 'docker model run ${modelName}').`
  );
}

/**
 * Initializes the database schema dynamically based on the detected embedding dimension
 * using the connection from src/lib/prisma.ts.
 */
async function initializeSchema(vectorDim: number) {
  console.log(`\n📦 Initializing PostgreSQL schema via Prisma connection (vector dimension: ${vectorDim})...`);

  // 1. Enable pgvector
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);

  // 2. Drop existing tables for fresh seed in reverse dependency order
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS prepped_packets CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS patient_requests CASCADE;`);
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS payer_policies CASCADE;`);

  // 3. Create payer_policies table with dynamic vector dimension matching the local model
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS payer_policies (
      id SERIAL PRIMARY KEY,
      payer_name VARCHAR(100) NOT NULL,
      procedure_code VARCHAR(50) NOT NULL,
      policy_number VARCHAR(50) NOT NULL,
      policy_title TEXT NOT NULL,
      section_name VARCHAR(150) NOT NULL,
      chunk_text TEXT NOT NULL,
      embedding vector(${vectorDim}) NOT NULL
    );
  `);

  // 4. Create HNSW and hybrid index
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_payer_policies_embedding 
      ON payer_policies USING hnsw (embedding vector_cosine_ops);
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_payer_policies_hybrid 
      ON payer_policies (payer_name, procedure_code);
  `);

  // 5. Create patient_requests table
  await prisma.$executeRawUnsafe(`
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
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_patient_requests_status ON patient_requests (status);
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_patient_requests_payer ON patient_requests (payer_name, procedure_code);
  `);

  // 6. Create prepped_packets table
  await prisma.$executeRawUnsafe(`
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
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_prepped_packets_request_id ON prepped_packets (request_id);
  `);

  console.log("✅ Schema, pgvector extension, and HNSW indexes created successfully.");
}

/**
 * Main seed execution routine.
 */
async function main() {
  console.log("==================================================================");
  console.log("🦥 SlothAuth - Phase 2 Database Seeding & Local Vector Generation");
  console.log("==================================================================");

  // Test database connection using Prisma
  try {
    const res = await prisma.$queryRawUnsafe<Array<{ current_database: string }>>(
      "SELECT current_database();"
    );
    console.log(
      `🔌 Connected to PostgreSQL Database via Prisma: "${res[0]?.current_database || 'postgres'}"`
    );
  } catch (err: unknown) {
    console.error("❌ Failed to connect to PostgreSQL via Prisma:", err);
    process.exit(1);
  }

  // Probe Docker Model Runner
  console.log(`🔍 Probing local Docker Model Runner with model "${modelName}"...`);
  let vectorDim = 1024;
  try {
    const probeVector = await generateLocalEmbedding(
      "SlothAuth Autonomous Prior-Authorization Clinical Probe"
    );
    vectorDim = probeVector.length;
    console.log(
      `🎯 Local embedding model online at ${activeEndpoint}! Detected dimension: ${vectorDim}`
    );
  } catch (err: unknown) {
    console.error("\n❌ Embedding probe failed:", err instanceof Error ? err.message : err);
    console.warn(
      "\n⚠️ Using default vector dimension: 1024. Please ensure Docker Model Runner is running."
    );
    process.exit(1);
  }

  // Initialize schema
  await initializeSchema(vectorDim);

  // Seed Payer Policies with embeddings
  console.log(
    `\n📚 Vectorizing and inserting ${PAYER_POLICIES.length} Payer Policy chunks...`
  );

  const policySummary: Array<{
    ID: number;
    Payer: string;
    Code: string;
    Policy: string;
    Section: string;
    EmbeddingDim: number;
  }> = [];

  for (let i = 0; i < PAYER_POLICIES.length; i++) {
    const p = PAYER_POLICIES[i];
    const embedding = await generateLocalEmbedding(
      `${p.policy_title} - ${p.section_name}: ${p.chunk_text}`
    );
    const vectorString = `[${embedding.join(",")}]`;

    const insertedRows = await prisma.$queryRawUnsafe<Array<{ id: number }>>(
      `INSERT INTO payer_policies (
        payer_name, procedure_code, policy_number, policy_title, section_name, chunk_text, embedding
      ) VALUES ($1, $2, $3, $4, $5, $6, $7::vector) RETURNING id`,
      p.payer_name,
      p.procedure_code,
      p.policy_number,
      p.policy_title,
      p.section_name,
      p.chunk_text,
      vectorString
    );

    const insertedId = insertedRows[0]?.id || i + 1;
    policySummary.push({
      ID: insertedId,
      Payer: p.payer_name,
      Code: p.procedure_code,
      Policy: p.policy_number,
      Section: p.section_name.split(":")[0],
      EmbeddingDim: embedding.length,
    });
    process.stdout.write(`  [${i + 1}/${PAYER_POLICIES.length}] Indexed ${p.policy_number} (${p.payer_name})\r`);
  }
  console.log(`\n✅ Vectorized all ${PAYER_POLICIES.length} policy chunks.`);

  // Seed Synthetic Patient Charts using Prisma Client Models
  console.log(`\n🏥 Inserting ${SYNTHETIC_PATIENTS.length} Synthetic Patient Charts via Prisma Client...`);
  const patientSummary: Array<{
    ID: number;
    Code: string;
    Name: string;
    Payer: string;
    Procedure: string;
    ExpectedOutcome: string;
    Status: string;
  }> = [];

  const scenarioDescriptions: Record<string, string> = {
    "PT-2026-001": "100% Ready (All criteria met with exact dates)",
    "PT-2026-002": "Missing Lab (Needs QuantiFERON-TB Gold)",
    "PT-2026-003": "Step Exception (Pancreatitis & TPMT Deficient)",
  };

  for (const patient of SYNTHETIC_PATIENTS) {
    const createdPatient = await prisma.patientRequest.create({
      data: {
        patient_id_code: patient.patient_id_code,
        patient_name: patient.patient_name,
        dob: new Date(patient.dob),
        payer_name: patient.payer_name,
        member_id: patient.member_id,
        requested_procedure: patient.requested_procedure,
        procedure_code: patient.procedure_code,
        diagnosis_codes: patient.diagnosis_codes,
        clinical_notes: patient.clinical_notes as unknown as object,
        status: patient.status || "PENDING_PREP",
      },
    });

    patientSummary.push({
      ID: createdPatient.id,
      Code: createdPatient.patient_id_code,
      Name: createdPatient.patient_name,
      Payer: createdPatient.payer_name,
      Procedure: createdPatient.procedure_code,
      ExpectedOutcome: scenarioDescriptions[createdPatient.patient_id_code] || "Pending",
      Status: createdPatient.status,
    });
  }

  // Display Seed Summaries
  console.log("\n==================================================================");
  console.log("📊 SEEDED PAYER POLICIES (VECTORIZED VIA DOCKER MODEL RUNNER)");
  console.log("==================================================================");
  console.table(policySummary);

  console.log("\n==================================================================");
  console.log("📋 QUEUED PATIENT REQUESTS (FOR AUTONOMOUS OVERNIGHT PREP)");
  console.log("==================================================================");
  console.table(patientSummary);

  console.log("\n✨ Database successfully seeded and ready for autonomous preparation!");
}

main()
  .catch((err) => {
    console.error("❌ Fatal seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
