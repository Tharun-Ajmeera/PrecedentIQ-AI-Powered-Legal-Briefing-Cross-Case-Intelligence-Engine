// client/src/pages/ClauseMatrixPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { clauseService } from '../services/clauseService';
import { documentService } from '../services/documentService';
import { ClauseMatrixTable } from '../components/clauses/ClauseMatrixTable';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorBanner } from '../components/common/ErrorBanner';
import {
  Columns,
  ChevronLeft,
  Sparkles,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';

export function ClauseMatrixPage() {
  const { caseId } = useParams();
  const [documents, setDocuments] = useState([]);
  const [comparisons, setComparisons] = useState([]);
  const [selectedComparison, setSelectedComparison] = useState(null);

  // Form State
  const [subjectMatter, setSubjectMatter] = useState(
    'Indemnification, Limitation of Liability & Reverse Engineering Covenants'
  );
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [showAllTypes, setShowAllTypes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docs, comps] = await Promise.all([
        documentService.listDocuments(caseId),
        clauseService.listComparisons(caseId),
      ]);
      setDocuments(docs);
      setComparisons(comps);
      if (comps.length > 0) {
        setSelectedComparison(comps[0]);
      }

      // Default select the first 2 contract documents if available
      const contracts = docs.filter((d) => d.document_type === 'contract');
      if (contracts.length >= 2) {
        setSelectedDocIds([contracts[0].id, contracts[1].id]);
      } else if (docs.length >= 2) {
        setSelectedDocIds([docs[0].id, docs[1].id]);
      }
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load clause matrix');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [caseId]);

  const toggleDocSelection = (id) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (selectedDocIds.length < 2) {
      setError('Please select at least 2 agreements to compare.');
      return;
    }

    if (!subjectMatter.trim()) {
      setError('Please specify the clause subject matter to compare.');
      return;
    }

    setError(null);
    setGenerating(true);

    try {
      const comparison = await clauseService.generateComparison(caseId, {
        documentIds: selectedDocIds,
        subjectMatter: subjectMatter.trim(),
      });
      setComparisons((prev) => [comparison, ...prev]);
      setSelectedComparison(comparison);
    } catch (err) {
      setError(err.message || 'Clause comparison generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to={`/cases/${caseId}`}
          className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Matter Workspace</span>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
          <Columns className="w-6 h-6 text-amber-500" />
          <span>Dynamic Clause Comparison Matrix</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Extract and evaluate identical subject matter across multiple agreements side-by-side. Highlights subtle divergences in liability caps, indemnity obligations, and carve-outs.
        </p>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* Comparison Generation Form */}
      <form onSubmit={handleGenerate} className="p-6 rounded-2xl legal-card space-y-5">
        <div>
          <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Subject Matter to Extract & Compare *
          </label>
          <input
            type="text"
            required
            value={subjectMatter}
            onChange={(e) => setSubjectMatter(e.target.value)}
            placeholder="e.g. Indemnification, Intellectual Property Carve-outs, Force Majeure"
            className="w-full px-3.5 py-2.5 bg-[#0B1220] border border-[#1D2A40] rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all font-sans"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
              Select Contracts / Agreements to Compare (Minimum 2) *
            </label>
            {documents.length > documents.filter((d) => d.document_type === 'contract').length && (
              <button
                type="button"
                onClick={() => setShowAllTypes(!showAllTypes)}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium transition-colors cursor-pointer"
              >
                {showAllTypes
                  ? `Showing All (${documents.length}) — Show Only Contracts (${documents.filter((d) => d.document_type === 'contract').length})`
                  : `Filtered to Contracts (${documents.filter((d) => d.document_type === 'contract').length}) — Show All (${documents.length})`}
              </button>
            )}
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1 p-3 rounded-xl bg-[#0B1220] border border-[#1D2A40]">
            {(showAllTypes || documents.filter((d) => d.document_type === 'contract').length === 0
              ? documents
              : documents.filter((d) => d.document_type === 'contract')
            ).map((doc) => (
              <label
                key={doc.id}
                className="flex items-center gap-2.5 text-xs text-slate-300 hover:bg-[#121B2D] p-2 rounded-lg cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedDocIds.includes(doc.id)}
                  onChange={() => toggleDocSelection(doc.id)}
                  className="rounded border-[#1D2A40] text-amber-500 focus:ring-amber-500 bg-[#060B16]"
                />
                <FileCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="font-medium text-slate-200">{doc.title}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono ml-auto ${
                  doc.document_type === 'contract'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {doc.document_type || 'case_file'}
                </span>
              </label>
            ))}
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-1.5">
            {selectedDocIds.length} document{selectedDocIds.length !== 1 ? 's' : ''} selected
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#1D2A40]">
          <Button
            type="submit"
            variant="primary"
            loading={generating}
            icon={Sparkles}
            disabled={selectedDocIds.length < 2}
          >
            Synthesize Side-by-Side Matrix
          </Button>
        </div>
      </form>

      {/* Comparison History Selector */}
      {comparisons.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider mr-1">Matrix History:</span>
          {comparisons.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedComparison(c)}
              className={`px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap cursor-pointer text-xs ${
                selectedComparison?.id === c.id
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-semibold'
                  : 'bg-[#0B1220] border-[#1D2A40] text-slate-400 hover:text-slate-200'
              }`}
            >
              {c.subject_matter} ({new Date(c.created_at).toLocaleDateString()})
            </button>
          ))}
        </div>
      )}

      {/* Matrix Display Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving comparison matrix..." />
      ) : selectedComparison ? (
        <ClauseMatrixTable comparison={selectedComparison} />
      ) : (
        <EmptyState
          icon={Columns}
          title="No Clause Matrices Generated"
          description="Select 2 or more contracts above to generate an AI-powered side-by-side comparative matrix with divergence highlighting."
        />
      )}
    </div>
  );
}
