// server/validation/schemas.js
import { z } from "zod";

export const registerSchema = z.object({
  firmName: z.string().min(2).max(255),
  fullName: z.string().min(2).max(255),
  email: z.string().email(),
  password: z.string().min(10).max(128),
  role: z.enum(["attorney", "paralegal", "compliance_officer"]),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createCaseSchema = z.object({
  title: z.string().min(2).max(500),
  matterNumber: z.string().max(100).optional().nullable(),
});

export const DOCUMENT_TYPES = [
  "case_file",
  "judicial_opinion",
  "deposition_transcript",
  "contract",
  "opposing_filing",
  "statute_regulation",
];

export const uploadDocumentSchema = z.object({
  documentType: z.enum(DOCUMENT_TYPES).optional(),
  document_type: z.enum(DOCUMENT_TYPES).optional(),
  title: z.string().min(1).max(500),
  jurisdiction: z.string().max(255).optional().nullable(),
  confidentialityTag: z.enum(["privileged", "work_product", "public_record"]).default("privileged"),
});

export const updateDocumentSchema = z.object({
  documentType: z.enum(DOCUMENT_TYPES).optional(),
  document_type: z.enum(DOCUMENT_TYPES).optional(),
  title: z.string().min(1).max(500).optional(),
  jurisdiction: z.string().max(255).optional().nullable(),
  confidentialityTag: z.enum(["privileged", "work_product", "public_record"]).optional(),
});

export const researchQuerySchema = z.object({
  query: z.string().min(5).max(2000),
  documentScope: z.array(z.string().uuid()).optional(),
  mode: z.enum(["general_research", "precedent_lookup", "cross_reference"]).default("general_research"),
});

export const vulnerabilityRequestSchema = z.object({
  opposingDocumentId: z.string().uuid(),
});

export const briefGenerateSchema = z.object({
  title: z.string().min(2).max(500),
  issueStatements: z.array(z.string().min(3)).min(1),
  includeDocumentIds: z.array(z.string().uuid()).min(1),
});

export const briefUpdateSchema = z.object({
  content: z.record(z.any()),
  status: z.enum(["draft", "finalized"]).optional(),
});

export const clauseComparisonSchema = z.object({
  documentIds: z.array(z.string().uuid()).min(2),
  subjectMatter: z.string().min(2).max(255),
});
