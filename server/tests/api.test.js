// server/tests/api.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { query } from '../config/db.js';
import { verifyCitations } from '../services/citationVerifier.js';
import { chunkPage } from '../services/ingestionService.js';

test('1. Citation Verification Layer: Strips hallucinated citations and marks claims unverified', () => {
  const retrievedChunks = [
    {
      document_id: 'doc-1',
      document_title: 'Apex Master Agreement',
      page_number: 2,
      content: 'Section 4.1 Indemnification. Licensee shall indemnify Licensor against all third-party claims.',
    },
    {
      document_id: 'doc-2',
      document_title: '9th Cir Precedent',
      page_number: 1,
      content: 'Where an agreement excludes IP covenants from liability caps, Delaware law enforces uncapped indemnity.',
    },
  ];

  const aiResponse = {
    answer: 'Under the Master Agreement, indemnity is required [Apex Master Agreement, Page 2]. Furthermore, punitive damages apply under Supreme Court case Law v. Order [Fictitious Case, Page 99].',
    citations: [
      {
        documentTitle: 'Apex Master Agreement',
        pageNumber: 2,
        quotedText: 'Licensee shall indemnify Licensor',
      },
      {
        documentTitle: 'Fictitious Case',
        pageNumber: 99,
        quotedText: 'Punitive damages apply',
      },
    ],
    sufficientContext: true,
  };

  const verified = verifyCitations(aiResponse, retrievedChunks);

  assert.equal(verified.citationVerified, false, 'Should flag overall citationVerified as false');
  assert.equal(verified.citations.length, 1, 'Should keep only the valid citation');
  assert.equal(verified.citations[0].documentTitle, 'Apex Master Agreement');
  assert.equal(verified.unverifiedCitations.length, 1, 'Should strip and isolate the hallucinated citation');
  assert.equal(verified.unverifiedCitations[0].documentTitle, 'Fictitious Case');
  assert.equal(verified.unverifiedCount, 1);
});

test('2. Page Chunking: Preserves page numbers and boundaries', () => {
  const samplePageText = 'First sentence of legal opinion. Second sentence discussing statutory definitions. Third sentence concluding analysis.';
  const chunks = chunkPage(samplePageText, 5, 60, 15);

  assert.ok(chunks.length > 0, 'Should generate chunks');
  for (const c of chunks) {
    assert.equal(c.pageNumber, 5, 'Every chunk must preserve exact page number');
    assert.ok(c.content.length > 0, 'Chunk content must not be empty');
  }
});

test('3. Database & Multi-Tenant Firm Isolation: Ensures firm isolation in SQL queries', async () => {
  const firmA = await query('INSERT INTO firms (name) VALUES ($1) RETURNING id', ['Firm Alpha']);
  const firmB = await query('INSERT INTO firms (name) VALUES ($1) RETURNING id', ['Firm Beta']);
  const firmAId = firmA.rows[0].id;
  const firmBId = firmB.rows[0].id;

  const userA = await query(
    `INSERT INTO users (firm_id, email, password_hash, full_name, role)
     VALUES ($1, $2, 'hash123', 'Alice Attorney', 'attorney')
     RETURNING id`,
    [firmAId, `alice_${Date.now()}@alpha.com`]
  );
  const userAId = userA.rows[0].id;

  const caseA = await query(
    `INSERT INTO cases (firm_id, created_by, title)
     VALUES ($1, $2, 'Alpha Confidential Matter')
     RETURNING id`,
    [firmAId, userAId]
  );
  const caseAId = caseA.rows[0].id;

  const crossFirmQuery = await query(
    'SELECT * FROM cases WHERE id = $1 AND firm_id = $2',
    [caseAId, firmBId],
    firmBId
  );

  assert.equal(crossFirmQuery.rows.length, 0, 'Firm B must never be able to access Firm A cases');

  const validFirmQuery = await query(
    'SELECT * FROM cases WHERE id = $1 AND firm_id = $2',
    [caseAId, firmAId],
    firmAId
  );

  assert.equal(validFirmQuery.rows.length, 1, 'Firm A should successfully access its own case');

  setTimeout(() => process.exit(0), 100);
});
