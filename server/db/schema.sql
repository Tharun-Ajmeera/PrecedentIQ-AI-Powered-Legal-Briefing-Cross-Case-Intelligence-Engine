-- PrecedentIQ Database Schema
-- Production SQL for PostgreSQL with pgvector and Row Level Security (RLS)

CREATE EXTENSION IF NOT EXISTS vector;

-- Firms (tenants)
CREATE TABLE IF NOT EXISTS firms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('attorney', 'paralegal', 'compliance_officer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cases (Matters)
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    title VARCHAR(500) NOT NULL,
    matter_number VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    title VARCHAR(500) NOT NULL,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN
        ('case_file','judicial_opinion','deposition_transcript','contract','opposing_filing','statute_regulation')),
    jurisdiction VARCHAR(255),
    confidentiality_tag VARCHAR(50) NOT NULL DEFAULT 'privileged'
        CHECK (confidentiality_tag IN ('privileged','work_product','public_record')),
    file_path TEXT NOT NULL,
    page_count INT NOT NULL DEFAULT 0,
    ingestion_status VARCHAR(50) NOT NULL DEFAULT 'pending'
        CHECK (ingestion_status IN ('pending','processing','completed','failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Document chunks + embeddings (RAG core table)
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    page_number INT NOT NULL,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(768) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Research queries + AI responses (with citation audit)
CREATE TABLE IF NOT EXISTS research_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    asked_by UUID NOT NULL REFERENCES users(id),
    query_text TEXT NOT NULL,
    mode VARCHAR(50) NOT NULL DEFAULT 'general_research',
    ai_response TEXT NOT NULL,
    citations JSONB NOT NULL DEFAULT '[]',
    citation_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vulnerability reports
CREATE TABLE IF NOT EXISTS vulnerability_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    opposing_document_id UUID NOT NULL REFERENCES documents(id),
    generated_by UUID NOT NULL REFERENCES users(id),
    findings JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trial briefs
CREATE TABLE IF NOT EXISTS trial_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    title VARCHAR(500) NOT NULL,
    content JSONB NOT NULL, -- structured IRAC sections
    version INT NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','finalized')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Clause comparison matrices
CREATE TABLE IF NOT EXISTS clause_comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    generated_by UUID NOT NULL REFERENCES users(id),
    document_ids UUID[] NOT NULL,
    subject_matter VARCHAR(255) NOT NULL,
    matrix JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit log (Append-only)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_case ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_chunks_case ON document_chunks(case_id);
CREATE INDEX IF NOT EXISTS idx_research_case ON research_queries(case_id);
CREATE INDEX IF NOT EXISTS idx_audit_firm ON audit_logs(firm_id);
CREATE INDEX IF NOT EXISTS idx_vulnerability_case ON vulnerability_reports(case_id);
CREATE INDEX IF NOT EXISTS idx_trial_briefs_case ON trial_briefs(case_id);
CREATE INDEX IF NOT EXISTS idx_clause_comparisons_case ON clause_comparisons(case_id);
