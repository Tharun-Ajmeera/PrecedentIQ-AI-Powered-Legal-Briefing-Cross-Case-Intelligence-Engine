// server/services/ragService.js
import { query } from '../config/db.js';
import { generateEmbedding } from './embeddingService.js';
import { generateGrounded } from './geminiClient.js';
import { verifyCitations } from './citationVerifier.js';
import { logAudit } from './auditService.js';

export const SYSTEM_PROMPT = `You are PrecedentIQ's Legal Research Engine, an AI assistant embedded in a professional legal
research platform used by licensed attorneys and paralegals.

NON-NEGOTIABLE RULES:
1. You must NEVER state a legal holding, rule, statute, case citation, or factual claim unless it
   appears verbatim or in clear paraphrase within the CONTEXT provided to you in this prompt.
2. Every substantive claim you make MUST be immediately followed by a citation in the exact format
   [Document Title, Page N], where Document Title and Page N are taken directly from the CONTEXT
   chunks provided — never invented, never estimated, never generalized from training knowledge.
3. If the CONTEXT does not contain sufficient information to answer the question, you MUST respond
   that the uploaded corpus does not contain sufficient information, and you MUST NOT fill the gap
   with outside legal knowledge, even if you are confident it is correct.
4. You are not a substitute for licensed legal judgment. Frame all analysis as research assistance,
   not legal advice or a final legal conclusion.
5. When identifying contradictions or vulnerabilities, quote the conflicting language from each
   source with its citation before stating your analysis.
6. Output must strictly conform to the JSON schema provided in this request. Do not include any
   text outside the schema's fields.
7. If asked to speculate, predict case outcomes, or state anything not grounded in the CONTEXT,
   decline within the schema's designated field and explain that grounded information was
   unavailable.`;

export const RESEARCH_SCHEMA = {
  type: "object",
  properties: {
    answer: { type: "string" },
    citations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          documentTitle: { type: "string" },
          pageNumber: { type: "integer" },
          quotedText: { type: "string" },
        },
        required: ["documentTitle", "pageNumber", "quotedText"],
      },
    },
    sufficientContext: { type: "boolean" },
  },
  required: ["answer", "citations", "sufficientContext"],
};

/**
 * Execute a RAG research query over a case's documents
 */
export async function executeRagQuery({
  caseId,
  firmId,
  userId,
  queryText,
  documentScope = null,
  mode = 'general_research',
}) {
  // 1. Generate query embedding
  const queryVector = await generateEmbedding(queryText);

  // 2. Perform vector similarity search scoped to caseId and firmId
  let sql = `
    SELECT c.id, c.document_id, c.page_number, c.chunk_index, c.content,
           d.title as document_title, d.document_type,
           (c.embedding <=> $1) as distance
    FROM document_chunks c
    JOIN documents d ON d.id = c.document_id
    WHERE c.case_id = $2 AND c.firm_id = $3
  `;
  const params = [queryVector, caseId, firmId];

  if (Array.isArray(documentScope) && documentScope.length > 0) {
    sql += ` AND c.document_id = ANY($4)`;
    params.push(documentScope);
  }

  sql += ` ORDER BY distance ASC LIMIT 8`;

  const chunkResult = await query(sql, params, firmId);
  const retrievedChunks = chunkResult.rows;

  if (retrievedChunks.length === 0) {
    const insufficientAnswer = {
      answer: "No relevant documents found in the current case corpus to address this inquiry.",
      citations: [],
      sufficientContext: false,
      citationVerified: true,
      retrievedChunks: [],
    };

    await query(
      `INSERT INTO research_queries (case_id, firm_id, asked_by, query_text, mode, ai_response, citations, citation_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [caseId, firmId, userId, queryText, mode, insufficientAnswer.answer, '[]', true],
      firmId
    );

    return insufficientAnswer;
  }

  // 3. Build User Prompt template with exact chunk formatting
  const formattedContext = retrievedChunks
    .map((c) => `--- \n[${c.document_title}, Page ${c.page_number}]\n${c.content}`)
    .join('\n\n');

  const userPrompt = `CASE CONTEXT (retrieved chunks, ranked by relevance):
${formattedContext}

USER QUESTION:
${queryText}

Answer strictly using the CONTEXT above. Cite every claim in format [Document Title, Page N].`;

  // 4. Call Grounded AI Model
  const rawAiResponse = await generateGrounded({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    jsonSchema: RESEARCH_SCHEMA,
  });

  // 5. Run Mandatory Citation Verification Layer
  const verifiedResult = verifyCitations(rawAiResponse, retrievedChunks);

  // 6. Record query and citations in research_queries table
  const queryRecordResult = await query(
    `INSERT INTO research_queries (case_id, firm_id, asked_by, query_text, mode, ai_response, citations, citation_verified)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, created_at`,
    [
      caseId,
      firmId,
      userId,
      queryText,
      mode,
      verifiedResult.answer,
      JSON.stringify(verifiedResult.citations),
      verifiedResult.citationVerified,
    ],
    firmId
  );

  // 7. Append-only audit logging
  await logAudit({
    firmId,
    caseId,
    userId,
    action: 'RAG_QUERY',
    metadata: {
      queryId: queryRecordResult.rows[0].id,
      queryLength: queryText.length,
      chunksRetrieved: retrievedChunks.length,
      citationsVerifiedCount: verifiedResult.citations.length,
      unverifiedCount: verifiedResult.unverifiedCount,
      sufficientContext: verifiedResult.sufficientContext,
    },
  });

  return {
    id: queryRecordResult.rows[0].id,
    answer: verifiedResult.answer,
    citations: verifiedResult.citations,
    unverifiedCitations: verifiedResult.unverifiedCitations,
    sufficientContext: verifiedResult.sufficientContext,
    citationVerified: verifiedResult.citationVerified,
    retrievedChunks: retrievedChunks.map((c) => ({
      documentId: c.document_id,
      documentTitle: c.document_title,
      pageNumber: c.page_number,
      content: c.content,
      distance: c.distance,
    })),
    createdAt: queryRecordResult.rows[0].created_at,
  };
}
