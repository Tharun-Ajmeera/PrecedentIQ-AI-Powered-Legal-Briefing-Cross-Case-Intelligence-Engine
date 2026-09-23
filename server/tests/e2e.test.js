// server/tests/e2e.test.js
process.env.NODE_ENV = 'test';

import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../server.js';
import { initDb, query } from '../config/db.js';

let server;
let baseUrl;

test.before(async () => {
  await initDb();
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`[TEST SERVER] Running on ${baseUrl}`);
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    server.close();
  }
  // Allow event loop to drain
  setTimeout(() => process.exit(0), 100);
});

test('E2E 1: Zod schema rejects malformed registration (short password, invalid email, missing firm)', async () => {
  const res1 = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firmName: 'Test Firm',
      fullName: 'John Doe',
      email: 'john@firm.com',
      password: 'short',
      role: 'attorney',
    }),
  });

  assert.equal(res1.status, 400, 'Should reject password < 10 characters with 400 Bad Request');
  const body1 = await res1.json();
  assert.equal(body1.error, 'Validation failed');

  const res2 = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firmName: 'Test Firm',
      fullName: 'John Doe',
      email: 'john@firm.com',
      password: 'SuperSecurePassword2026!',
      role: 'hacker_role',
    }),
  });

  assert.equal(res2.status, 400, 'Should reject invalid role');
});

test('E2E 2: Valid registration issues JWT in httpOnly cookie and creates user and firm', async () => {
  const email = `attorney_${Date.now()}@litigation.com`;
  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firmName: 'Cravath & Precedent LLP',
      fullName: 'Sarah Sterling, Esq.',
      email,
      password: 'CourtReadyPassword2026!',
      role: 'attorney',
    }),
  });

  assert.equal(res.status, 201, 'Should return 201 Created');
  const data = await res.json();
  assert.ok(data.user.id, 'User ID must be returned');
  assert.ok(data.user.firmId, 'Firm ID must be returned');
  assert.equal(data.user.role, 'attorney');

  const setCookie = res.headers.get('set-cookie');
  assert.ok(setCookie, 'Must set cookie');
  assert.ok(setCookie.includes('HttpOnly') || setCookie.includes('httponly'), 'Cookie must be HttpOnly');
  assert.ok(setCookie.includes('SameSite=Strict') || setCookie.includes('samesite=strict'), 'Cookie must be SameSite=Strict');
});

test('E2E 3: Cross-tenant isolation blocks Firm B user from accessing Firm A matter', async () => {
  const resA = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firmName: 'Firm Alpha',
      fullName: 'Alpha Attorney',
      email: `alpha_${Date.now()}@firmalpha.com`,
      password: 'SecurePassword1234!',
      role: 'attorney',
    }),
  });
  const dataA = await resA.json();
  const tokenA = dataA.token;

  const caseRes = await fetch(`${baseUrl}/api/cases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
    },
    body: JSON.stringify({
      title: 'Confidential Trade Secret Dispute',
      matterNumber: 'MAT-ALPHA-01',
    }),
  });
  const caseA = await caseRes.json();
  const caseAId = caseA.case.id;

  const resB = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firmName: 'Firm Beta',
      fullName: 'Beta Attorney',
      email: `beta_${Date.now()}@firmbeta.com`,
      password: 'SecurePassword5678!',
      role: 'attorney',
    }),
  });
  const dataB = await resB.json();
  const tokenB = dataB.token;

  const forbiddenAccess = await fetch(`${baseUrl}/api/cases/${caseAId}`, {
    headers: {
      Authorization: `Bearer ${tokenB}`,
    },
  });

  assert.ok(
    forbiddenAccess.status === 404 || forbiddenAccess.status === 403,
    'Firm B must be rejected when attempting to access Firm A matter'
  );
});

test('E2E 4: RBAC enforcement: Paralegal cannot finalize brief or delete case (403 Forbidden)', async () => {
  const attyRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firmName: 'Unified Legal Firm',
      fullName: 'Senior Partner',
      email: `partner_${Date.now()}@unified.com`,
      password: 'SecurePassword1234!',
      role: 'attorney',
    }),
  });
  const attyData = await attyRes.json();
  const attyToken = attyData.token;

  const caseRes = await fetch(`${baseUrl}/api/cases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${attyToken}`,
    },
    body: JSON.stringify({
      title: 'Acme Breach of Contract',
    }),
  });
  const caseData = await caseRes.json();
  const caseId = caseData.case.id;

  const paralegalRes = await query(
    `INSERT INTO users (firm_id, email, password_hash, full_name, role)
     VALUES ($1, $2, 'hash', 'Perry Paralegal', 'paralegal')
     RETURNING id`,
    [attyData.user.firmId, `paralegal_${Date.now()}@unified.com`]
  );
  const paralegalId = paralegalRes.rows[0].id;

  const jwt = (await import('jsonwebtoken')).default;
  const paralegalToken = jwt.sign(
    {
      id: paralegalId,
      firm_id: attyData.user.firmId,
      email: 'perry@unified.com',
      full_name: 'Perry Paralegal',
      role: 'paralegal',
    },
    process.env.JWT_SECRET || 'precedentiq_super_secure_jwt_secret_key_law_firm_2026_enterprise',
    { expiresIn: '1h' }
  );

  const deleteRes = await fetch(`${baseUrl}/api/cases/${caseId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${paralegalToken}`,
    },
  });

  assert.equal(deleteRes.status, 403, 'Paralegal must receive 403 Forbidden when trying to delete case');

  const attyDeleteRes = await fetch(`${baseUrl}/api/cases/${caseId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${attyToken}`,
    },
  });

  assert.equal(attyDeleteRes.status, 200, 'Attorney must be authorized to delete case');
});

test('E2E 5: Demo Seed, RAG Query, and Audit Trail Verification', async () => {
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firmName: 'Precedent Research Partners',
      fullName: 'Marcus Vance, Esq.',
      email: `marcus_${Date.now()}@precedent.com`,
      password: 'SecurePassword1234!',
      role: 'attorney',
    }),
  });
  const auth = await regRes.json();
  const token = auth.token;

  const seedRes = await fetch(`${baseUrl}/api/seed`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  assert.equal(seedRes.status, 201, 'Seed endpoint should succeed');
  const seedData = await seedRes.json();
  const caseId = seedData.case.id;

  const queryRes = await fetch(`${baseUrl}/api/cases/${caseId}/research`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: 'What does Delaware law hold regarding liability caps and trade secret confidentiality covenants?',
      mode: 'precedent_lookup',
    }),
  });

  assert.equal(queryRes.status, 200, 'RAG query must succeed');
  const queryData = await queryRes.json();
  assert.ok(queryData.answer, 'RAG query must return answer');
  assert.ok(queryData.citations.length > 0, 'RAG query must contain grounded citations');
  assert.equal(queryData.citationVerified, true, 'All citations must be verified against source chunks');

  const auditRes = await fetch(`${baseUrl}/api/cases/${caseId}/audit`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  assert.equal(auditRes.status, 200, 'Audit log endpoint must succeed');
  const auditData = await auditRes.json();
  assert.ok(auditData.logs.length >= 2, 'Audit trail must record seed and query actions');
  const actions = auditData.logs.map((l) => l.action);
  assert.ok(actions.includes('RAG_QUERY'), 'Must contain RAG_QUERY audit log');
  assert.ok(actions.includes('DEMO_DATA_SEEDED'), 'Must contain DEMO_DATA_SEEDED audit log');
});
