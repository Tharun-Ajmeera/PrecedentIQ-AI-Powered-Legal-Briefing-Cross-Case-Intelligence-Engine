# PrecedentIQ — AI-Powered Legal Briefing & Cross-Case Intelligence Engine

PrecedentIQ is an enterprise-grade, zero-hallucination legal research, brief synthesis, and cross-case intelligence platform designed for licensed attorneys, paralegals, and compliance officers.

---

## Key Highlights & Core Capabilities

- **Strict Multi-Tenancy & Data Isolation**: Firm-level isolation enforced via PostgreSQL Row Level Security (RLS) policies and Express middleware. User session tokens are delivered via `httpOnly`, `SameSite=Strict` cookies.
- **Zero-Hallucination Retrieval-Augmented Generation (RAG)**: Answers are generated strictly from retrieved corpus chunks using `@google/genai` (`gemini-2.5-flash` with low temperature 0.1 and strict JSON schemas).
- **Mandatory Citation Verification Layer**: Server-side post-processing validates that every returned citation `[Document Title, Page N]` exists in the retrieved chunk set. Any hallucinated citation is stripped and marked `unverified`.
- **Opposing Argument Vulnerability Detector**: Cross-references adversary filings against internal precedents and agreements to expose contradictions, weak citations, and non-sequiturs.
- **Interactive IRAC Trial Brief Builder**: Court-ready trial brief outlines structured by Issue Statement → Applicable Rule → Analysis → Conclusion (IRAC). Versioned editing with Attorney-exclusive finalization.
- **Dynamic Clause Comparison Matrix**: Side-by-side comparative table analyzing liability limits, indemnification provisions, and contractual covenants across multiple agreements with divergence highlighting.
- **Append-Only Forensic Audit Trail**: Cryptographic chain-of-custody logging of all uploads, ingestion jobs, RAG queries, and brief modifications.

---

## Architecture & Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, React Router 6, Axios |
| **Backend** | Node.js (ES Modules), Express.js, JWT, bcrypt (12 rounds), Multer, Zod, Helmet, Rate Limiter |
| **Database** | PostgreSQL + `pgvector` extension (and embedded `@electric-sql/pglite` fallback with pgvector for turnkey local dev) |
| **AI / LLM** | `@google/genai` SDK (`gemini-2.5-flash`, `text-embedding-004`) |
| **Parsing** | `pdf-parse` (page boundaries), `mammoth` (DOCX), UTF-8 text parser |

---

## Quickstart & Local Development

### 1. Prerequisites
- Node.js v18+ (tested on v24)
- npm v9+

### 2. Environment Configuration
Copy `.env.example` to `server/.env`:
```bash
cp server/.env.example server/.env
```

To enable live Gemini inference, add your Gemini API Key in `server/.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(If omitted, PrecedentIQ's built-in standalone fallback engine automatically generates grounded, citation-verified responses for testing and development without crashing.)*

### 3. Running the Application
From the workspace root:

```bash
# Run unit and end-to-end integration tests
npm test

# Build client production bundle
npm run build

# Start server
npm start
```

Or run dev mode:
```bash
# Terminal 1: Backend API (port 5000)
cd server && npm run dev

# Terminal 2: Frontend Vite dev server (port 5173)
cd client && npm run dev
```

Visit **http://localhost:5173** to access the web application.

---

## Seeded Demo Legal Matter

To explore the platform immediately:
1. Register an attorney account at `/register` (e.g. `attorney@firm.com`, password `CourtReadyPassword2026!`).
2. Click **"Load Demo Matter"** in the top navigation or dashboard.
3. This seeds **Apex Technology v. Meridian Global**, pre-loaded with:
   - *Master Software License & Development Agreement (2022)*
   - *Meridian Amended Services Agreement (2023)*
   - *9th Circuit Binding Precedent - Apex v. CyberSys (2024)*
   - *Meridian Motion for Summary Judgment & Opposition Brief (2025)*
   - *Deposition Transcript - CTO John Vance (2025)*
4. Run RAG queries, test the Vulnerability Detector, synthesize IRAC briefs, and compare liability clauses side-by-side!

---

## Verification & Testing

Run all unit and end-to-end integration tests:
```bash
npm test
```

Tests cover:
- Zod schema boundary validation (min 10 char passwords, valid roles, required fields)
- `httpOnly`, `SameSite=Strict` cookie security
- Cross-tenant RLS isolation (Firm B barred from Firm A matters)
- Mandatory Citation Verification Layer (stripping fictitious citations)
- RBAC permissions (Paralegals blocked with 403 on brief finalization and deletion)
- Ingestion page-boundary preservation and vector search
- Immutable compliance audit logging
