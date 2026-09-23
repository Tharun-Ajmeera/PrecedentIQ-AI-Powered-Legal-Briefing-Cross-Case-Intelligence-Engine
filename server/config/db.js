import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { PGlite } from '@electric-sql/pglite';
import { vector } from '@electric-sql/pglite-pgvector';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

let pool = null;
let pglite = null;
let isPglite = false;

export async function getDb() {
  if (pool) return { type: 'pg', client: pool };
  if (pglite) return { type: 'pglite', client: pglite };

  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl && !databaseUrl.includes('placeholder') && !databaseUrl.includes('host:5432')) {
    try {
      pool = new pg.Pool({
        connectionString: databaseUrl,
        ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false,
      });
      // Test connection
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('Connected to PostgreSQL database via DATABASE_URL');
      return { type: 'pg', client: pool };
    } catch (err) {
      console.warn('Failed connecting to DATABASE_URL, falling back to embedded PostgreSQL (PGlite):', err.message);
      pool = null;
    }
  }

  // Fallback to embedded PGlite with pgvector support
  console.log('Initializing embedded PostgreSQL (PGlite) with pgvector...');
  const dataDir = path.join(__dirname, '..', '.pgdata');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  pglite = new PGlite(dataDir, {
    extensions: { vector },
  });
  isPglite = true;
  await pglite.waitReady;
  console.log('Embedded PostgreSQL (PGlite + pgvector) is ready');
  return { type: 'pglite', client: pglite };
}

export async function initDb() {
  const { type, client } = await getDb();
  const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  if (type === 'pg') {
    const pgClient = await client.connect();
    try {
      await pgClient.query(schemaSql);
      console.log('PostgreSQL schema initialized successfully');
    } finally {
      pgClient.release();
    }
  } else {
    // For PGlite, execute schema statements
    await client.exec(schemaSql);
    console.log('PGlite schema initialized successfully');
  }
}

/**
 * Execute query with optional firm isolation context (RLS)
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters
 * @param {string|null} firmId - Optional tenant firm ID for RLS session
 */
export async function query(text, params = [], firmId = null) {
  const { type, client } = await getDb();

  if (type === 'pg') {
    const pgClient = await client.connect();
    try {
      if (firmId) {
        // Enforce RLS session variable for this transaction
        await pgClient.query('BEGIN');
        await pgClient.query("SELECT set_config('app.current_firm_id', $1, true)", [firmId]);
        const result = await pgClient.query(text, params);
        await pgClient.query('COMMIT');
        return result;
      } else {
        return await pgClient.query(text, params);
      }
    } catch (err) {
      if (firmId) await pgClient.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      pgClient.release();
    }
  } else {
    // PGlite execution
    if (firmId) {
      try {
        await client.query("SELECT set_config('app.current_firm_id', $1, true)", [firmId]).catch(() => {});
      } catch (e) {
        // Ignored if custom config not supported in pglite config namespace
      }
    }
    const result = await client.query(text, params);
    return result;
  }
}

export default {
  getDb,
  initDb,
  query,
};
