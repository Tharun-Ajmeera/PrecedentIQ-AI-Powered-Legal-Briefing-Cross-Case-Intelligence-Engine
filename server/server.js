// server/server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDb } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authenticate } from './middleware/auth.js';
import { enforceFirmScope } from './middleware/firmScope.js';

import authRoutes from './routes/authRoutes.js';
import caseRoutes from './routes/caseRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import researchRoutes from './routes/researchRoutes.js';
import vulnerabilityRoutes from './routes/vulnerabilityRoutes.js';
import briefRoutes from './routes/briefRoutes.js';
import clauseRoutes from './routes/clauseRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import { seedDemoData } from './controllers/seedController.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// 1. Security Headers & CORS
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin === CLIENT_ORIGIN || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        callback(null, true);
      } else {
        callback(new Error('CORS request blocked by PrecedentIQ Security Policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// 2. Parsers
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'PrecedentIQ Legal Intelligence Engine',
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV || 'development',
  });
});

// 4. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/cases/:caseId/documents', documentRoutes);
app.use('/api/cases/:caseId/research', researchRoutes);
app.use('/api/cases/:caseId/vulnerability', vulnerabilityRoutes);
app.use('/api/cases/:caseId/briefs', briefRoutes);
app.use('/api/cases/:caseId/clauses', clauseRoutes);
app.use('/api/cases/:caseId/audit', auditRoutes);
app.use('/api/audit', auditRoutes);

// 5. Demo Seed Endpoint
app.post('/api/seed', authenticate, enforceFirmScope, seedDemoData);

// 6. Centralized Error Handler
app.use(errorHandler);

// 7. Start server if not running in test mode
if (process.env.NODE_ENV !== 'test') {
  initDb()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`====================================================`);
        console.log(`  PrecedentIQ Legal Intelligence Engine API Server  `);
        console.log(`  Listening on port: ${PORT}                       `);
        console.log(`  CORS Whitelist:    ${CLIENT_ORIGIN}              `);
        console.log(`====================================================`);
      });
    })
    .catch((err) => {
      console.error('Fatal database initialization failure:', err);
      process.exit(1);
    });
}

export default app;
