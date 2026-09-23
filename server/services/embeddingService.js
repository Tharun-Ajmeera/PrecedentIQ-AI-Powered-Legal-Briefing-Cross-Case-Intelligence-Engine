// server/services/embeddingService.js
import { embedText } from './geminiClient.js';

/**
 * Generate embedding vector for text
 * @param {string} text - Raw text to embed
 * @returns {Promise<string>} String representation formatted for pgvector insertion '[0.1, 0.2, ...]'
 */
export async function generateEmbedding(text) {
  const cleanText = (text || '').trim();
  if (!cleanText) {
    throw new Error('Cannot embed empty text content.');
  }

  const values = await embedText(cleanText);
  return `[${values.join(',')}]`;
}

/**
 * Format raw number array as pgvector string
 * @param {number[]} values
 * @returns {string}
 */
export function formatVector(values) {
  return `[${values.join(',')}]`;
}
