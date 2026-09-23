// server/services/citationVerifier.js

/**
 * Server-side Citation Verification Layer
 * Mandatory post-processing step that validates every citation emitted by the model
 * actually exists in the retrieved chunk set.
 *
 * Any citation that does not match a retrieved chunk's document title/id and page number
 * is stripped from the verified list, and the response is flagged with unverified warnings.
 *
 * @param {Object} aiResponse - The parsed JSON object from Gemini
 * @param {Array} retrievedChunks - Array of chunks retrieved for the request
 * @returns {Object} Verified response with verified citations and flagged claims
 */
export function verifyCitations(aiResponse, retrievedChunks = []) {
  // Build a multi-chunk lookup map of valid (documentTitle, pageNumber) pairs
  const pageChunkMap = new Map();

  for (const chunk of retrievedChunks) {
    const titleKey = (chunk.document_title || chunk.documentTitle || '').trim().toLowerCase();
    const pageNum = Number(chunk.page_number || chunk.pageNumber);
    const key = `${titleKey}:::${pageNum}`;
    if (!pageChunkMap.has(key)) {
      pageChunkMap.set(key, []);
    }
    pageChunkMap.get(key).push({
      documentId: chunk.document_id || chunk.documentId,
      documentTitle: chunk.document_title || chunk.documentTitle,
      pageNumber: pageNum,
      content: chunk.content,
    });
  }

  // Helper to find textual grounding across retrieved chunks
  const findGroundedChunk = (textSnippet) => {
    if (!textSnippet || retrievedChunks.length === 0) return null;
    const clean = textSnippet.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const words = clean.split(/\s+/).filter((w) => w.length >= 4);
    if (words.length === 0) return null;

    let bestMatch = null;
    let highestHits = 0;

    for (const chunk of retrievedChunks) {
      const content = (chunk.content || '').toLowerCase();
      let hits = 0;
      for (const w of words) {
        if (content.includes(w)) hits++;
      }
      if (hits > highestHits) {
        highestHits = hits;
        bestMatch = chunk;
      }
    }

    if (highestHits >= 3 && (highestHits / words.length) >= 0.3) {
      return bestMatch;
    }
    return null;
  };

  const verifiedCitations = [];
  const unverifiedCitations = [];

  // 1. If response has top-level "citations" array (RAG query)
  if (Array.isArray(aiResponse.citations)) {
    for (const cite of aiResponse.citations) {
      const citeTitle = (cite.documentTitle || '').trim().toLowerCase();
      const citePage = Number(cite.pageNumber);
      const matchKey = `${citeTitle}:::${citePage}`;

      if (pageChunkMap.has(matchKey)) {
        const sourceChunks = pageChunkMap.get(matchKey);
        const primaryChunk = sourceChunks[0];
        verifiedCitations.push({
          ...cite,
          documentId: primaryChunk.documentId,
          verified: true,
          sourceSnippet: primaryChunk.content.substring(0, 200),
        });
      } else {
        unverifiedCitations.push({
          ...cite,
          verified: false,
          reason: 'Citation does not match any retrieved source chunk page or document title',
        });
      }
    }
  }

  // 2. If response has "vulnerabilities" array (Vulnerability Detector)
  let verifiedVulnerabilities = undefined;
  if (Array.isArray(aiResponse.vulnerabilities)) {
    verifiedVulnerabilities = aiResponse.vulnerabilities.map((vuln) => {
      const oppTitle = (vuln.opposingCitation?.documentTitle || '').trim().toLowerCase();
      const oppPage = Number(vuln.opposingCitation?.pageNumber);
      const oppKey = `${oppTitle}:::${oppPage}`;

      const counterTitle = (vuln.counterCitation?.documentTitle || '').trim().toLowerCase();
      const counterPage = Number(vuln.counterCitation?.pageNumber);
      const counterKey = `${counterTitle}:::${counterPage}`;

      let oppValid = pageChunkMap.has(oppKey);
      let counterValid = pageChunkMap.has(counterKey);

      // Deep grounding check: verify if counterEvidence text actually matches the cited chunk
      const groundedChunk = findGroundedChunk(vuln.counterEvidence);
      let attributionMismatch = false;

      if (groundedChunk) {
        const groundedDocTitle = (groundedChunk.document_title || groundedChunk.documentTitle || '').trim().toLowerCase();
        // If the text actually belongs to a different document than cited, flag mismatch
        if (counterTitle && groundedDocTitle && counterTitle !== groundedDocTitle) {
          attributionMismatch = true;
          counterValid = false;
        }
      }

      const isFullyVerified = oppValid && counterValid && !attributionMismatch;

      if (!isFullyVerified) {
        if (!oppValid && vuln.opposingCitation) {
          unverifiedCitations.push({
            ...vuln.opposingCitation,
            context: `Opposing citation in: ${vuln.opposingClaim}`,
            verified: false,
          });
        }
        if ((!counterValid || attributionMismatch) && vuln.counterCitation) {
          unverifiedCitations.push({
            ...vuln.counterCitation,
            context: `Counter citation in: ${vuln.counterEvidence}`,
            verified: false,
            reason: attributionMismatch
              ? `Text belongs to ${groundedChunk?.document_title} rather than cited ${vuln.counterCitation.documentTitle}`
              : 'Citation does not match retrieved chunks',
          });
        }
      }

      // Attach source snippets and verified document IDs
      const counterChunks = pageChunkMap.get(counterKey);
      const counterDocId = counterChunks?.[0]?.documentId || groundedChunk?.document_id || groundedChunk?.documentId;
      const counterSnippet = counterChunks?.[0]?.content?.substring(0, 250) || groundedChunk?.content?.substring(0, 250);

      return {
        ...vuln,
        citationVerified: isFullyVerified,
        opposingCitationVerified: oppValid,
        counterCitationVerified: counterValid,
        attributionMismatch,
        counterDocumentId: counterDocId,
        counterSourceSnippet: counterSnippet,
        status: isFullyVerified ? 'verified' : 'unverified',
      };
    });
  }

  // 3. If response has "sections" array (IRAC Trial Brief)
  let verifiedSections = undefined;
  if (Array.isArray(aiResponse.sections)) {
    verifiedSections = aiResponse.sections.map((sec) => {
      const validRuleCitations = [];
      const invalidRuleCitations = [];

      if (Array.isArray(sec.ruleCitations)) {
        for (const cite of sec.ruleCitations) {
          const key = `${(cite.documentTitle || '').trim().toLowerCase()}:::${Number(cite.pageNumber)}`;
          if (validChunkMap.has(key)) {
            validRuleCitations.push({ ...cite, verified: true });
          } else {
            invalidRuleCitations.push({ ...cite, verified: false });
            unverifiedCitations.push(cite);
          }
        }
      }

      return {
        ...sec,
        ruleCitations: validRuleCitations,
        unverifiedRuleCitations: invalidRuleCitations,
        citationVerified: invalidRuleCitations.length === 0 && validRuleCitations.length > 0,
      };
    });
  }

  // 4. If response has "rows" array (Clause Comparison Matrix)
  let verifiedRows = undefined;
  if (Array.isArray(aiResponse.rows)) {
    verifiedRows = aiResponse.rows.map((row) => {
      const key = `${(row.documentTitle || '').trim().toLowerCase()}:::${Number(row.pageNumber)}`;
      const isValid = validChunkMap.has(key);
      if (!isValid) {
        unverifiedCitations.push({
          documentTitle: row.documentTitle,
          pageNumber: row.pageNumber,
          verified: false,
        });
      }
      return {
        ...row,
        citationVerified: isValid,
        status: isValid ? 'verified' : 'unverified',
      };
    });
  }

  const allVerified = unverifiedCitations.length === 0;

  return {
    ...aiResponse,
    citations: verifiedCitations,
    unverifiedCitations,
    vulnerabilities: verifiedVulnerabilities || aiResponse.vulnerabilities,
    sections: verifiedSections || aiResponse.sections,
    rows: verifiedRows || aiResponse.rows,
    citationVerified: allVerified,
    unverifiedCount: unverifiedCitations.length,
    verifiedCount: verifiedCitations.length,
  };
}
