// server/controllers/seedController.js
import { query } from '../config/db.js';
import { generateEmbedding } from '../services/embeddingService.js';
import { chunkPage } from '../services/ingestionService.js';
import { logAudit } from '../services/auditService.js';

export async function seedDemoData(req, res, next) {
  try {
    const firmId = req.firmId;
    const userId = req.user.id;

    // Check if demo case already exists for this firm
    const existing = await query(
      "SELECT id FROM cases WHERE firm_id = $1 AND title = 'Apex Technology v. Meridian Global'",
      [firmId],
      firmId
    );

    if (existing.rows.length > 0) {
      return res.json({
        message: 'Demo case already exists.',
        caseId: existing.rows[0].id,
      });
    }

    // 1. Create Case
    const caseRes = await query(
      `INSERT INTO cases (firm_id, created_by, title, matter_number, status)
       VALUES ($1, $2, $3, $4, 'active')
       RETURNING *`,
      [firmId, userId, 'Apex Technology v. Meridian Global', 'MAT-2026-0891'],
      firmId
    );
    const demoCase = caseRes.rows[0];

    // 2. Define Sample Legal Documents
    const sampleDocs = [
      {
        title: 'Master Software License & Development Agreement (2022)',
        document_type: 'contract',
        jurisdiction: 'Delaware Chancery Court',
        confidentiality_tag: 'privileged',
        page_count: 3,
        pages: [
          {
            pageNumber: 1,
            text: `MASTER SOFTWARE LICENSE AND INTELLECTUAL PROPERTY DEVELOPMENT AGREEMENT
This Master Agreement is entered into by and between Apex Technology Corp. ("Licensor") and Meridian Global Solutions LLC ("Licensee").
Section 1.1 Grant of License. Licensor grants Licensee a non-exclusive, non-transferable, revocable license to utilize the Proprietary Core Engine exclusively for internal processing.
Section 1.2 Reverse Engineering Prohibition. Licensee covenants and agrees that it shall not, and shall not permit any employee or contractor to, decompile, disassemble, reverse engineer, or create derivative works from the Core Engine.
Section 1.3 Confidentiality. All proprietary source code, architectural schemas, and trade secrets disclosed by Licensor constitute strictly Confidential Information. Licensee must protect such information with the highest degree of reasonable care.`
          },
          {
            pageNumber: 2,
            text: `Section 4.1 Indemnification. Licensee shall indemnify, defend, and hold harmless Licensor and its officers, directors, and affiliates against any and all third-party claims, liabilities, losses, damages, and costs (including reasonable attorneys' fees) arising out of or resulting from Licensee's breach of Section 1.2 (Reverse Engineering) or Section 1.3 (Confidentiality).
Section 4.2 Limitation of Liability. Except for breaches of Section 1.2 or Section 1.3, neither party's aggregate monetary liability under this Agreement shall exceed the total fees paid by Licensee to Licensor during the twelve (12) months preceding the claim. Breaches of Confidentiality and IP covenants are expressly uncapped.`
          },
          {
            pageNumber: 3,
            text: `Section 7.1 Governing Law and Dispute Resolution. This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without giving effect to conflicts of laws principles.
Section 7.2 Injunctive Relief. The parties acknowledge that any breach of Section 1.2 or Section 1.3 will cause irreparable injury for which monetary damages alone would be inadequate, and Licensor shall be entitled to seek immediate injunctive relief without the necessity of posting a bond.`
          }
        ]
      },
      {
        title: 'Meridian Amended Services Agreement (2023)',
        document_type: 'contract',
        jurisdiction: 'Delaware Chancery Court',
        confidentiality_tag: 'work_product',
        page_count: 2,
        pages: [
          {
            pageNumber: 1,
            text: `AMENDED SERVICES AND LICENSING ADDENDUM (2023)
Between Apex Technology Corp. and Meridian Global Solutions LLC.
Section 2.1 Scope of Permitted Modifications. Licensee may configure user-facing APIs provided that no modification or decompilation of the proprietary binary Core Engine occurs.
Section 4.1 Mutual Indemnification. Each party agrees to defend the other against third-party claims arising from gross negligence or willful misconduct.`
          },
          {
            pageNumber: 2,
            text: `Section 4.2 Capped Liability. Under no circumstances shall either party's aggregate liability under this Addendum exceed $500,000, and consequential damages are waived by both parties regardless of the underlying cause of action.
Section 6.1 Notice Provisions. Any claim of default requires sixty (60) days written cure notice sent via certified courier prior to commencement of litigation.`
          }
        ]
      },
      {
        title: '9th Circuit Binding Precedent - Apex v. CyberSys (2024)',
        document_type: 'judicial_opinion',
        jurisdiction: '9th Cir. Court of Appeals',
        confidentiality_tag: 'public_record',
        page_count: 2,
        pages: [
          {
            pageNumber: 1,
            text: `UNITED STATES COURT OF APPEALS FOR THE NINTH CIRCUIT
Apex Technology Corp. v. CyberSys International Inc., No. 23-15982 (9th Cir. 2024).
HOLDING: Where a commercial software licensing agreement expressly excludes intellectual property covenants and trade secret confidentiality from a contractual limitation of liability cap, Delaware law enforces the uncapped indemnity clause as written.
The court held: "Sophisticated corporate parties who negotiate unambiguous carve-outs from liability caps for trade secret misappropriation are bound by those terms. The district court erred in limiting damages to the 12-month trailing fee amount."`
          },
          {
            pageNumber: 2,
            text: `RULE OF LAW: Under Delaware and federal trade secret precedent, the existence of an irreparable injury clause in a non-disclosure or license covenant creates a strong presumption of immediate irreparable harm upon a prima facie showing of reverse engineering.
Furthermore, general waiver of consequential damages does not supersede an express uncapped indemnification provision covering intentional breaches of confidentiality covenants.`
          }
        ]
      },
      {
        title: 'Meridian Motion for Summary Judgment & Opposition Brief (2025)',
        document_type: 'opposing_filing',
        jurisdiction: 'Delaware Chancery Court',
        confidentiality_tag: 'privileged',
        page_count: 2,
        pages: [
          {
            pageNumber: 1,
            text: `IN THE COURT OF CHANCERY OF THE STATE OF DELAWARE
Meridian Global Solutions LLC's Motion for Summary Judgment.
Opposing Argument 1: Meridian asserts that all claims for monetary relief asserted by Apex are strictly capped at $500,000 pursuant to Section 4.2 of the 2023 Amended Services Agreement, which supercedes all prior agreements and completely eliminates uncapped liabilities for all causes of action including trade secrets.
Opposing Argument 2: Meridian argues that Apex waived any entitlement to injunctive relief by failing to provide sixty (60) days written notice prior to filing suit as allegedly required by Section 6.1 of the 2023 Addendum.`
          },
          {
            pageNumber: 2,
            text: `Opposing Argument 3: Meridian contends that reverse engineering is legally permissible as a matter of public policy under federal patent preemption doctrines, and that Section 1.2 of the 2022 Master Agreement is unenforceable as an unreasonable restraint on trade.
Meridian asserts that Apex's trade secret claims must be dismissed because Apex cannot establish irreparable injury without showing direct consumer market substitution.`
          }
        ]
      },
      {
        title: 'Deposition Transcript - CTO John Vance (2025)',
        document_type: 'deposition_transcript',
        jurisdiction: 'Delaware Chancery Court',
        confidentiality_tag: 'privileged',
        page_count: 2,
        pages: [
          {
            pageNumber: 1,
            text: `VIDEOTAPED DEPOSITION OF JOHN VANCE - CHIEF TECHNOLOGY OFFICER OF MERIDIAN GLOBAL
Q. Mr. Vance, did Meridian engineers inspect the binary code of the Apex Core Engine in October 2024?
A. Yes. Our engineering team decompiled several binary dynamic link libraries in our sandbox environment to understand how the data compression algorithms functioned.
Q. Were you aware that Section 1.2 of the 2022 Master Agreement strictly prohibited decompilation?
A. We believed the 2023 Addendum gave us flexibility to configure APIs.`
          },
          {
            pageNumber: 2,
            text: `Q. Did Meridian use the decompiled data compression routines in its own competing product line, Meridian Engine Pro?
A. We incorporated certain structural routines from the Core Engine into our production build in January 2025.
Q. Did anyone at Meridian obtain written consent from Apex before doing that?
A. No, we did not ask for written consent.`
          }
        ]
      }
    ];

    for (const docData of sampleDocs) {
      const docRes = await query(
        `INSERT INTO documents (case_id, firm_id, uploaded_by, title, document_type, jurisdiction, confidentiality_tag, file_path, page_count, ingestion_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'completed')
         RETURNING *`,
        [
          demoCase.id,
          firmId,
          userId,
          docData.title,
          docData.document_type,
          docData.jurisdiction,
          docData.confidentiality_tag,
          `virtual://${docData.title.replace(/\s+/g, '_')}`,
          docData.page_count,
        ],
        firmId
      );

      const doc = docRes.rows[0];

      let chunkIdx = 0;
      for (const page of docData.pages) {
        const pageChunks = chunkPage(page.text, page.pageNumber, 600, 100);
        for (const chunk of pageChunks) {
          const embStr = await generateEmbedding(chunk.content);
          await query(
            `INSERT INTO document_chunks (document_id, case_id, firm_id, page_number, chunk_index, content, embedding)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [doc.id, demoCase.id, firmId, chunk.pageNumber, chunkIdx++, chunk.content, embStr],
            firmId
          );
        }
      }
    }

    await logAudit({
      firmId,
      caseId: demoCase.id,
      userId,
      action: 'DEMO_DATA_SEEDED',
      metadata: { caseTitle: demoCase.title, documentsCreated: sampleDocs.length },
    });

    res.status(201).json({
      message: 'Demo case with 5 comprehensive legal documents seeded and indexed successfully.',
      case: demoCase,
    });
  } catch (err) {
    next(err);
  }
}
