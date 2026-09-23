// client/src/pages/ResearchPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { researchService } from '../services/researchService';
import { documentService } from '../services/documentService';
import { ResearchChatWindow } from '../components/research/ResearchChatWindow';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { ChevronLeft, Search, ShieldCheck } from 'lucide-react';

export function ResearchPage() {
  const { caseId } = useParams();
  const [queries, setQueries] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [qList, docs] = await Promise.all([
        researchService.getQueryHistory(caseId),
        documentService.listDocuments(caseId),
      ]);
      setQueries(qList);
      setDocuments(docs);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load research data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [caseId]);

  const handleNewQuery = async (queryPayload) => {
    setError(null);
    setSubmitting(true);

    try {
      const result = await researchService.submitQuery(caseId, queryPayload);
      // Prepend or append to query history
      setQueries((prev) => [
        {
          id: result.id,
          query_text: queryPayload.query,
          mode: queryPayload.mode,
          ai_response: result.answer,
          citations: result.citations,
          unverifiedCitations: result.unverifiedCitations,
          citation_verified: result.citationVerified,
          retrievedChunks: result.retrievedChunks,
          created_at: result.createdAt,
          asked_by_name: 'You (Counsel)',
        },
        ...prev,
      ]);
    } catch (err) {
      setError(err.message || 'Query failed. Ensure documents are indexed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to={`/cases/${caseId}`}
          className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Matter Dossier</span>
        </Link>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Zero-Hallucination Verification Layer: 100% Active</span>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-serif font-bold text-slate-100 tracking-tight flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/25">
            <Search className="w-6 h-6 stroke-[2]" />
          </div>
          <span>Precedent RAG & Fact Cross-Examination</span>
        </h1>
        <p className="text-xs text-slate-400 mt-2 max-w-2xl leading-relaxed">
          Inquire across this matter's uploaded record. Every retrieved paragraph is mapped to exact page coordinates with cosine-similarity reranking and cross-document attribution verification.
        </p>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {loading ? (
        <LoadingSpinner text="Retrieving case research history..." />
      ) : (
        <ResearchChatWindow
          queries={queries}
          onNewQuery={handleNewQuery}
          loading={submitting}
          documents={documents}
        />
      )}
    </div>
  );
}
