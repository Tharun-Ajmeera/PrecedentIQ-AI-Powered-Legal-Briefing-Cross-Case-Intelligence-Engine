# PrecedentIQ — AI-Powered Legal Briefing & Cross-Case Intelligence Engine

[![Live Backend](https://img.shields.io/badge/Render-Backend%20Live-10B981?logo=render&logoColor=white)](https://precedentiq-ai-powered-legal-briefing.onrender.com)
[![Frontend](https://img.shields.io/badge/Vercel-Frontend%20Active-000000?logo=vercel&logoColor=white)](https://github.com/Tharun-Ajmeera/PrecedentIQ-AI-Powered-Legal-Briefing-Cross-Case-Intelligence-Engine)
[![Test Suite](https://img.shields.io/badge/Tests-8%2F8%20Passing%20(100%25)-amber?logo=node.js&logoColor=white)](https://github.com/Tharun-Ajmeera/PrecedentIQ-AI-Powered-Legal-Briefing-Cross-Case-Intelligence-Engine)
[![Security](https://img.shields.io/badge/Architecture-RLS%20Multi--Tenant-blue?logo=postgresql&logoColor=white)](https://github.com/Tharun-Ajmeera/PrecedentIQ-AI-Powered-Legal-Briefing-Cross-Case-Intelligence-Engine)

> **PrecedentIQ** is an enterprise-grade, zero-hallucination legal intelligence and litigation preparation workstation. Engineered specifically for litigators, senior partners, judicial clerks, and compliance officers, PrecedentIQ eliminates the existential risk of generative AI hallucinations in court filings through strict vector grounding, algorithmic citation verification, adversarial vulnerability discovery, and cryptographic chain-of-custody tracking.

---

## 🏛️ Executive Summary & The Problem It Solves

### The Crisis of Generative AI in the Legal Profession
In high-stakes litigation, an AI hallucination is fatal. Under Federal Rule of Civil Procedure 11 and state bar ethics rules, attorneys face sanctions, disbarment, and malpractice liability for citing fictitious judicial precedents or mischaracterizing contractual records (*e.g., the infamous Mata v. Avianca sanctions*).

Generic AI chatbots fail in legal workflows because:
1. **Unanchored Text Generation:** They invent plausible-sounding citations and precedents.
2. **Lack of Evidentiary Lineage:** They cannot point to the exact page, paragraph, or Bates stamp where a rule or fact originates.
3. **Data Leakage & Commingling:** Traditional consumer LLMs cannot guarantee multi-tenant firm isolation or client-attorney privilege.

### The PrecedentIQ Solution
PrecedentIQ establishes a **Zero-Hallucination Legal Intelligence Architecture**:
* **100% Citation Grounding Guarantee:** Every asserted rule of law and factual claim is programmatically anchored to an indexed case chunk.
* **Server-Side Citation Verification Layer:** If an LLM attempts to output an ungrounded citation, PrecedentIQ’s validator intercepts it, strips it, and flags it as unverified before counsel ever sees it.
* **Adversarial Vulnerability Scanner:** Automatically cross-examines opposing counsel's claims against your internal depositions and contracts to surface factual contradictions.
* **Cross-Agreement Clause Matrix:** Pinpoints material liability deltas and divergent terms across complex transactional documents.
* **Formal IRAC Brief Builder:** Structures court briefs under the industry standard **Issue, Rule, Analysis, Conclusion** format with attorney certification locks.
* **Bank-Grade Tenant Isolation:** Row-Level Security (RLS) ensures that Firm A’s evidentiary record is physically inaccessible to Firm B.

---

## 🧠 Deep-Dive: How the Core Intelligence Engines Work

```
                                  EVIDENTIARY INGESTION PIPELINE
[PDF / DOCX / TXT] ──> [Page Boundary Parser] ──> [Semantic Chunker (800-token / 15% overlap)] ──> [768-dim Embedder] ──> [PostgreSQL + pgvector]
                                                                                                                                  │
                                                                                                                                  ▼
                                      GROUNDED LEGAL REASONING ENGINE                                                      [Cosine Similarity]
[Litigation Query] ───────────────> [Vector Semantic Search] ────────────────────────────────────────────────────────────> [Top-K Evidentiary Chunks]
                                                                                                                                  │
                                                                                                                                  ▼
                                      ZERO-HALLUCINATION VERIFICATION PIPELINE                                              [Gemini 2.5 Flash]
[Verified Answer + Chips] <──────── [Server-Side Citation Validator] <──────── [Structured JSON Synthesis] <────────────── (Temp 0.1 + Strict Schema)
```

---

### 1. Zero-Hallucination Grounded RAG Research Engine

The RAG engine is the core factual bedrock of PrecedentIQ. It operates in 6 sequential stages:

```
Stage 1: Ingestion & Page-Boundary Parsing
   • Documents are ingested via Multer (memory storage for privacy).
   • pdf-parse, mammoth (DOCX), and text engines extract text while strictly preserving physical page boundaries.
   • Every page boundary is cataloged (e.g., Page 1, Page 2, Page N) so that citations can resolve to exact page numbers.

Stage 2: Semantic Chunking with Contextual Overlap
   • Text is partitioned into 800-token semantic chunks with a 15% sliding window overlap (120 tokens).
   • Overlap ensures contractual conditions (e.g., "Provided, however...") are never severed from their parent clauses.
   • Each chunk is tagged with immutable metadata: { document_id, firm_id, case_id, page_number, chunk_index }.

Stage 3: High-Dimensional Vector Embedding
   • Embeddings are generated using Google's text-embedding-004 model (768 dimensions).
   • In offline / test environments, a deterministic 768-dim fallback ensures testing continuity without external dependencies.

Stage 4: Hybrid pgvector Cosine Retrieval
   • When counsel submits an inquiry, the query is vectorized and compared against all chunks belonging strictly to the active case_id and firm_id.
   • Cosine similarity search: 1 - (chunk_embedding <=> query_embedding) with an operational relevance threshold (> 0.65).
   • Top-K relevant chunks (K=6) are fetched with their full evidentiary context.

Stage 5: Low-Temperature Structured JSON Synthesis
   • The retrieved chunks and query are passed to Gemini 2.5 Flash configured at Temperature 0.1 (minimizing creativity, maximizing factual adherence).
   • The model is bound by a strict JSON Schema requiring:
     - answer: Formal judicial narrative.
     - citations: An array of [{ documentTitle, pageNumber, quotedSnippet }].

Stage 6: Server-Side Citation Verification Validator (The Circuit Breaker)
   • Before the response is sent to the client, a deterministic validator inspects every citation:
   • The validator checks whether the referenced documentTitle and pageNumber exist in the retrieved Top-K chunks.
   • It verifies that the quotedSnippet matches the actual text in that chunk via fuzzy n-gram alignment.
   • If a citation cannot be verified, it is flagged as UNVERIFIED or stripped. The system guarantees zero fabricated citations.
```

---

### 2. Adversarial Opposing Argument Vulnerability Detector

The Vulnerability Detector functions as a **digital second-chair litigator** that tears apart opposing counsel's court filings.

```
How It Operates:
1. Document Targeting: Counsel selects an ingested opposing brief, motion to dismiss, or summary judgment filing (e.g., "Meridian Opposition Brief").
2. Assertion Extraction: Gemini 2.5 parses the adversary's filing and extracts their key factual allegations, statutory interpretations, and procedural defenses.
3. Cross-Examination Vector Sweep:
   • For each adversary assertion, the engine automatically vectorizes the claim and queries the firm's internal verified documents (depositions, confidential email exhibits, master agreements).
   • It specifically searches for contradictory statements, broken timelines, or breached notice provisions.
4. Contradiction & Weakness Scoring:
   • If an adversary asserts: "Meridian provided full written notice of defect within 30 days pursuant to Section 12.1",
   • The engine cross-examines this against CTO John Vance's Deposition (Page 44) where he admits: "We never sent a formal notice letter because of email server outages."
   • The system tags this as a "DIRECT FACTUAL CONTRADICTION", assigns a High Severity rating, calculates an evidentiary confidence score (e.g., 94%), and outputs the exact Bates/page reference for counsel to use during depositions or oral arguments.
```

---

### 3. Cross-Agreement Clause Comparison Matrix

Transactional lawyers and litigation partners frequently deal with multiple contract iterations, amended statements of work, and competing master service agreements.

```
How It Operates:
1. Multi-Contract Selection: Counsel selects 2 or more contracts within the matter workspace.
2. Standardized Legal Taxonomy: The engine extracts provisions categorized under standard commercial law classifications:
   • Limitation of Liability & Consequential Damages
   • Indemnification & Defense Obligations
   • Governing Law & Exclusive Jurisdiction
   • IP Assignment & Work-Made-For-Hire
   • Non-Solicitation & Restrictive Covenants
   • Termination for Cause & Cure Periods
3. Divergence Highlighting & Risk Delta:
   • The engine aligns clauses side-by-side.
   • It computes the semantic delta and highlights material discrepancies (e.g., Agreement A has a $5M mutual liability cap, while Agreement B contains an uncapped indemnity clause).
   • Counsel instantly sees where liability shifted across contract generations.
```

---

### 4. Interactive IRAC Trial Brief Builder Studio

PrecedentIQ structures legal briefs under the gold-standard appellate court methodology: **IRAC (Issue, Rule, Analysis, Conclusion)**.

```
Structure of Each Brief Module:
   I. Issue Statement: The precise question of law presented (e.g., "Whether Defendant's failure to provide cure notice within 10 days bars summary judgment under California Commercial Code § 2607.").
  II. Applicable Rule: The governing statutory standard or binding precedent, accompanied by verified page-level citations.
 III. Application / Analysis: Synthesizes the rule against the specific evidentiary record of the case.
  IV. Conclusion / Prayer: The specific judicial remedy or ruling requested from the court.

Attorney Sign-Off & Certification:
• Draft Mode: Paralegals and attorneys can collaborate, reorder issues, and edit section content.
• Attorney Certification Lock: Enforces firm compliance. Only users with the 'attorney' role can execute the final "Certify Brief" action. Once certified, the brief is assigned an immutable version hash, locked against modifications, and marked filing-ready.
```

---

### 5. Multi-Tenancy, RBAC & Forensic Chain of Custody

```
Tenant Isolation (Row-Level Security):
• Every database table (cases, documents, document_chunks, briefs, audit_logs) contains a firm_id foreign key.
• PostgreSQL Row Level Security (RLS) is active: even if an application bug omitted a WHERE clause, the database kernel strictly blocks cross-tenant data access.
• Authentication utilizes JSON Web Tokens (JWT) signed with HMAC-SHA256, delivered via httpOnly, SameSite=Strict cookies with bearer token support.

Role-Based Access Control (RBAC):
• Attorney: Full authority to create cases, ingest evidence, run AI research, certify trial briefs, and delete records.
• Paralegal: Full authority to upload documents, run research queries, draft briefs, and review clause matrices. Blocked (403 Forbidden) from certifying briefs or deleting records.
• Compliance Officer: Read-only access to matters and full administrative access to the Forensic Audit Ledger.

Forensic Audit Trail:
• Every operation (USER_LOGIN, DOCUMENT_UPLOADED, RAG_QUERY, BRIEF_FINALIZED) writes an append-only cryptographic log entry containing: timestamp, user ID, user role, client IP, action type, and JSON metadata payload.
```

---

## 💻 Complete Technology Stack

| Layer | Technology | Key Details |
|---|---|---|
| **Frontend UI** | **React 18, Vite 6, Tailwind CSS** | Executive legal aesthetic: Obsidian (`#070B14`), antique gold (`#D97706`), Playfair Display serif, Inter, and JetBrains Mono. |
| **Backend API** | **Node.js (ESM), Express.js** | RESTful modular architecture, Helmet security headers, Express Rate Limiting, Multer memory storage. |
| **Database & Vectors** | **PostgreSQL 16 + pgvector** | Vector similarity index (`vector(768)`), RLS security policies, integrated PGlite fallback for turnkey local dev. |
| **Generative AI** | **Google Gemini 2.5 Flash** | Low temperature (0.1) structured JSON output, citation verification circuit breaker. |
| **Embedding Engine** | **Google text-embedding-004** | 768-dimensional dense vector embeddings with semantic overlap chunking. |
| **Document Parsers** | **pdf-parse, mammoth** | Page-boundary-aware PDF text extraction, DOCX parsing, and raw text ingest. |
| **Validation & Auth** | **Zod, bcryptjs, jsonwebtoken** | Runtime request schema validation, 12-round bcrypt hashing, httpOnly cookie sessions. |

---

## 🚀 Quick Start & How to Run Locally

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v20 & v24)
- **npm** v9+

### 2. Clone Repository & Install Dependencies
```bash
git clone https://github.com/Tharun-Ajmeera/PrecedentIQ-AI-Powered-Legal-Briefing-Cross-Case-Intelligence-Engine.git
cd PrecedentIQ-AI-Powered-Legal-Briefing-Cross-Case-Intelligence-Engine

# Install workspace root, server, and client dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `server` directory:
```bash
cp server/.env.example server/.env
```
Populate `server/.env` with:
```env
PORT=5000
JWT_SECRET=precedentiq_ultra_secure_judicial_jwt_secret_2026_production
CLIENT_ORIGIN=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
```
> **Note:** If `GEMINI_API_KEY` is not provided, PrecedentIQ automatically activates its built-in local deterministic embedding and simulation engine, allowing judges and developers to test all features and run unit tests without an API key!

### 4. Run Automated Test Suite
Verify that all system tests pass:
```bash
npm test
```
*Executes 8 end-to-end integration tests verifying Zod validation, RLS tenant isolation, RBAC 403 enforcement, citation verification, and RAG retrieval.*

### 5. Launch the Application
```bash
# Terminal 1: Start Backend Server (port 5000)
cd server && node server.js

# Terminal 2: Start Frontend Client (port 5173)
cd client && npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🎯 How Judges Can Test the Live Application

### Option A: Use the Pre-Seeded Demo Case (Fastest)
1. Navigate to `/register` and create an attorney account:
   * **Email:** `counsel@firm.com`
   * **Password:** `CourtReadyPassword2026!` (min 10 characters)
   * **Role:** `Attorney`
2. Once on the Dashboard, click the **"⚡ Load Demo Matter"** button in the top navigation.
3. This instantly instantiates the verified litigation matter **Apex Technology v. Meridian Global**, containing:
   * 📄 *Document 1: Master Software License & Development Agreement (2022)*
   * 📄 *Document 2: Meridian Amended Services Agreement (2023)*
   * 📄 *Document 3: 9th Circuit Binding Precedent - Apex v. CyberSys (2024)*
   * 📄 *Document 4: Meridian Motion for Summary Judgment & Opposition Brief (2025)*
   * 📄 *Document 5: Deposition Transcript - CTO John Vance (2025)*
4. Explore the engines:
   * **Research Studio:** Click suggested litigation queries like *"What cure notice requirements were violated under Section 12.1?"* Inspect the citation chips and verification drawer.
   * **Vulnerability Scanner:** Select *Meridian Motion for Summary Judgment* as the target filing. Watch the engine expose Vance's contradictory deposition testimony.
   * **Clause Matrix:** Select both contracts and view the side-by-side comparison of liability caps and indemnification terms.
   * **Brief Builder:** Synthesize an IRAC brief, edit arguments, and click *Certify Brief* with attorney credentials.
   * **Forensic Audit:** Inspect the immutable cryptographic chain of custody.

### Option B: Upload Your Own Evidentiary Documents
Sample litigation documents are included directly in the root of this repository:
* `Sample_Case_Document_1_Contract.txt`
* `Sample_Case_Document_2_Deposition.txt`

1. Create a new legal matter from the Dashboard.
2. Ingest these files using the **Document Ingestion** dropzone. Tag Document 1 as `Contract` and Document 2 as `Deposition`.
3. Watch the system chunk, vectorize, and index the evidence in real time!

---

## 🛡️ Security & Enterprise Compliance Verification

| Requirement | Implementation in PrecedentIQ | Test Verification |
|---|---|---|
| **Multi-Tenancy** | PostgreSQL RLS + strict `firm_id` scoping | `test/precedentiq.test.js` Test #3 confirms Firm B receives `404/403` when attempting to access Firm A's case. |
| **RBAC Enforcement** | Middleware role checking on mutating endpoints | `test/precedentiq.test.js` Test #4 verifies paralegals receive `403 Forbidden` on brief certification. |
| **Citation Integrity** | Server-side Citation Verification Validator | Test #5 confirms that hallucinated citations are programmatically stripped. |
| **Input Hardening** | Zod schemas reject malformed passwords, SQL vectors, or invalid roles | Test #1 confirms rejection of weak credentials and injection attempts. |
| **Chain of Custody** | Append-only forensic audit table | Test #5 confirms audit entries are written with user ID and cryptographic timestamps. |

---

## 🌐 Live Production Deployments

* **Live Backend API (Render):** [https://precedentiq-ai-powered-legal-briefing.onrender.com](https://precedentiq-ai-powered-legal-briefing.onrender.com)
  * *Health Check Endpoint:* `GET https://precedentiq-ai-powered-legal-briefing.onrender.com/health` (Returns `status: "healthy"`)
* **GitHub Repository:** [https://github.com/Tharun-Ajmeera/PrecedentIQ-AI-Powered-Legal-Briefing-Cross-Case-Intelligence-Engine](https://github.com/Tharun-Ajmeera/PrecedentIQ-AI-Powered-Legal-Briefing-Cross-Case-Intelligence-Engine)

---

*PrecedentIQ — Engineered to empower elite litigators with the precision, security, and verification required by the justice system.*
