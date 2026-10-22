-- ==============================================================================
-- SlothAuth Database Schema
-- Autonomous Prior-Authorization Prep Agent
-- PostgreSQL with pgvector & HNSW Cosine Indexing
-- ==============================================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Drop existing tables in reverse dependency order for clean, repeatable migrations
DROP TABLE IF EXISTS prepped_packets CASCADE;
DROP TABLE IF EXISTS patient_requests CASCADE;
DROP TABLE IF EXISTS payer_policies CASCADE;

-- 3. Payer Policies Table (Vectorized Clinical Rules & Guidelines for RAG)
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

-- HNSW Index for fast cosine similarity vector search
CREATE INDEX IF NOT EXISTS idx_payer_policies_embedding 
    ON payer_policies USING hnsw (embedding vector_cosine_ops);

-- Composite B-tree Index for hybrid filtering by payer and procedure code
CREATE INDEX IF NOT EXISTS idx_payer_policies_hybrid 
    ON payer_policies (payer_name, procedure_code);

-- 4. Patient Requests Table (Prior-Authorization Intake & Structured Clinical Charts)
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

-- Index for querying requests by status and patient identifier
CREATE INDEX IF NOT EXISTS idx_patient_requests_status 
    ON patient_requests (status);
CREATE INDEX IF NOT EXISTS idx_patient_requests_payer 
    ON patient_requests (payer_name, procedure_code);

-- 5. Prepped Packets Table (Autonomous Output, Evidence Checklist, & Justification Letters)
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

-- Index for foreign key lookups
CREATE INDEX IF NOT EXISTS idx_prepped_packets_request_id 
    ON prepped_packets (request_id);
