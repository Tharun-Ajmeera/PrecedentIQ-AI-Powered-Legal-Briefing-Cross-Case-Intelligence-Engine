// client/src/components/research/ResearchComponents.jsx
import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronDown,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

export function CitationReference({ citation }) {
  const [showPreview, setShowPreview] = useState(false);
  const isVerified = citation.verified !== false;

  return (
    <>
      <span
        onClick={() => setShowPreview(true)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 mx-1 rounded text-xs font-mono font-medium cursor-pointer transition-all border ${
          isVerified
            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-400'
            : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
        }`}
        title={isVerified ? 'Verified Grounded Citation' : 'Citation unverified against indexed corpus'}
      >
        {isVerified ? (
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        ) : (
          <AlertTriangle className="w-3 h-3 text-rose-400" />
        )}
        <span>
          [{citation.documentTitle}, Page {citation.pageNumber}]
        </span>
      </span>

      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Citation Grounding Verification Details"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1D2A40]">
            <div>
              <div className="text-sm font-semibold text-slate-100">{citation.documentTitle}</div>
              <div className="text-xs text-slate-400 font-mono">Page {citation.pageNumber}</div>
            </div>
            <span
              className={`text-xs px-2.5 py-0.5 rounded font-mono font-semibold border ${
                isVerified
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              }`}
            >
              {isVerified ? '✓ Grounding Verified' : 'Unverified Citation'}
            </span>
          </div>

          {citation.quotedText && (
            <div className="source-evidence-block space-y-1.5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Source Document Record Excerpt:
              </div>
              <blockquote className="legal-quote text-sm text-slate-200">
                "{citation.quotedText}"
              </blockquote>
            </div>
          )}

          {citation.sourceSnippet && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Indexed Corpus Chunk:
              </div>
              <div className="p-3 rounded-lg bg-[#070B14] border border-[#1D2A40] text-xs font-mono text-slate-300 max-h-48 overflow-y-auto leading-relaxed">
                {citation.sourceSnippet}
              </div>
            </div>
          )}

          {!isVerified && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              <div className="font-semibold flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Citation Grounding Alert</span>
              </div>
              This citation could not be cross-validated against the retrieved corpus chunk set with sufficient similarity confidence. It has been excluded from the verified authorities index.
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

// Re-export CitationChip as alias for CitationReference
export const CitationChip = CitationReference;

export function UnverifiedClaimWarning({ unverifiedCount }) {
  if (!unverifiedCount || unverifiedCount === 0) return null;

  return (
    <div className="p-3 mb-4 rounded-lg bg-amber-950/30 border border-amber-600/40 text-amber-200 text-xs flex items-start gap-2.5">
      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold text-amber-300">
          Citation Verification Alert: {unverifiedCount} unverified citation(s) flagged.
        </span>
        <p className="mt-0.5 text-amber-200/80">
          The server-side verification layer rejected citations that did not strictly match retrieved source chunks. Review flagged citations before citing in court pleadings.
        </p>
      </div>
    </div>
  );
}

export function GroundedAnswerCard({ queryResult }) {
  const [showChunks, setShowChunks] = useState(false);

  // Render answer text with parsed interactive citation chips
  const renderFormattedAnswer = (text, citations = []) => {
    if (!text) return null;

    // Pattern matching [Document Title, Page N]
    const citationRegex = /\[([^,]+),\s*Page\s*(\d+)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = citationRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const docTitle = match[1].trim();
      const pageNum = parseInt(match[2], 10);
      const matchedCite = citations.find(
        (c) =>
          c.documentTitle.toLowerCase() === docTitle.toLowerCase() &&
          Number(c.pageNumber) === pageNum
      ) || { documentTitle: docTitle, pageNumber: pageNum, verified: false };

      parts.push(
        <CitationChip
          key={`${docTitle}-${pageNum}-${match.index}`}
          citation={matchedCite}
        />
      );

      lastIndex = citationRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div className="p-6 rounded-2xl legal-card space-y-4">
      {/* Verification Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-[#1D2A40]">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
            Grounded Precedent Record
          </span>
          <span
            className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
              queryResult.citationVerified
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}
          >
            {queryResult.citationVerified ? '✓ All Citations Grounded' : '⚠ Unverified Claims Flagged'}
          </span>
        </div>

        {queryResult.createdAt && (
          <span className="text-xs text-slate-500 font-mono">
            {new Date(queryResult.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      <UnverifiedClaimWarning unverifiedCount={queryResult.unverifiedCitations?.length || 0} />

      {/* AI Analysis Body in amber-tinted intelligence panel */}
      <div className="ai-analysis-block">
        <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400/90 mb-2 font-semibold">
          AI Legal Synthesis & Citation Grounding
        </div>
        <div className="text-slate-100 text-sm leading-relaxed whitespace-pre-wrap font-sans">
          {renderFormattedAnswer(queryResult.answer, [
            ...(queryResult.citations || []),
            ...(queryResult.unverifiedCitations || []),
          ])}
        </div>
      </div>

      {/* Verified Citations Shelf */}
      {queryResult.citations && queryResult.citations.length > 0 && (
        <div className="pt-3 border-t border-[#1D2A40]">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Verified Source Authorities ({queryResult.citations.length}):
          </div>
          <div className="flex flex-wrap gap-2">
            {queryResult.citations.map((cite, i) => (
              <CitationReference key={i} citation={cite} />
            ))}
          </div>
        </div>
      )}

      {/* Grounding Source Chunks Drawer */}
      {queryResult.retrievedChunks && queryResult.retrievedChunks.length > 0 && (
        <div className="pt-3 border-t border-[#1D2A40]">
          <button
            onClick={() => setShowChunks(!showChunks)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 transition-colors cursor-pointer font-mono"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>
              {showChunks ? 'Hide' : 'Inspect'} {queryResult.retrievedChunks.length} Retrieved Corpus Chunks
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${showChunks ? 'rotate-180' : ''}`}
            />
          </button>

          {showChunks && (
            <div className="mt-3 space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {queryResult.retrievedChunks.map((chunk, idx) => (
                <div
                  key={idx}
                  className="source-evidence-block space-y-1.5"
                >
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                    <span className="font-semibold text-slate-200">
                      {chunk.documentTitle} • Page {chunk.pageNumber}
                    </span>
                    {chunk.distance !== undefined && (
                      <span className="text-[10px] text-amber-400 font-mono">
                        dist: {Number(chunk.distance).toFixed(4)}
                      </span>
                    )}
                  </div>
                  <blockquote className="legal-quote text-xs text-slate-200">
                    "{chunk.content}"
                  </blockquote>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function QueryInputBar({ onSearch, loading, documents = [] }) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('general_research');
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [showScopePicker, setShowScopePicker] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || query.length < 5) return;

    onSearch({
      query: query.trim(),
      mode,
      documentScope: selectedDocs.length > 0 ? selectedDocs : undefined,
    });
  };

  const toggleDocSelection = (docId) => {
    setSelectedDocs((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const samplePrompts = [
    'Analyze breach of express warranty claims in the agreements',
    'What are the strict product liability precedents cited?',
    'Identify conflicting deposition statements regarding equipment inspection',
  ];

  return (
    <div className="space-y-3">
      {/* Quick Inquiries */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider flex-shrink-0">
          Suggested Inquiries:
        </span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setQuery(p)}
            className="flex-shrink-0 px-2.5 py-1 rounded-full bg-[#0D1527] hover:bg-amber-500/10 border border-[#1E2B45] hover:border-amber-500/40 text-slate-300 hover:text-amber-300 text-[11px] transition-colors cursor-pointer truncate max-w-xs"
          >
            "{p}"
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="legal-card p-4 rounded-2xl space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-amber-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              minLength={5}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Inquire across case record with page-level citation verification..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#0B1220] border border-[#1D2A40] rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all font-sans"
            />
          </div>

          <Button type="submit" variant="primary" loading={loading} icon={Sparkles}>
            Query Record
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2 border-t border-[#1D2A40]">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-[11px]">Research Mode:</span>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-[#0B1220] border border-[#1D2A40] text-amber-400 text-xs font-medium focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="general_research">General Precedent Research</option>
              <option value="precedent_lookup">Precedent Holding Lookup</option>
              <option value="cross_reference">Cross-Document Witness/Fact Cross-Ref</option>
            </select>
          </div>

          {documents.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowScopePicker(!showScopePicker)}
                className="px-2.5 py-1 rounded-lg bg-[#0B1220] border border-[#1D2A40] text-slate-300 hover:text-amber-400 text-xs flex items-center gap-1.5 cursor-pointer font-mono"
              >
                <span>
                  Corpus Scope: {selectedDocs.length === 0 ? 'All Documents' : `${selectedDocs.length} Selected`}
                </span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showScopePicker && (
                <div className="absolute right-0 bottom-8 w-72 p-3.5 rounded-xl bg-[#0B1220] border border-[#1D2A40] shadow-2xl z-30 space-y-2">
                  <div className="text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider pb-1.5 border-b border-[#1D2A40]">
                    Select Grounding Scope:
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {documents.map((doc) => (
                      <label
                        key={doc.id}
                        className="flex items-center gap-2 text-xs text-slate-300 hover:bg-[#121B2D] p-1.5 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedDocs.includes(doc.id)}
                          onChange={() => toggleDocSelection(doc.id)}
                          className="rounded border-[#1D2A40] text-amber-500 focus:ring-amber-500 bg-[#060B16]"
                        />
                        <span className="truncate">{doc.title}</span>
                      </label>
                    ))}
                  </div>
                  {selectedDocs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedDocs([])}
                      className="text-[11px] text-amber-400 hover:underline w-full text-right cursor-pointer"
                    >
                      Reset to Entire Matter Corpus
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export function ResearchChatWindow({ queries, onNewQuery, loading, documents }) {
  return (
    <div className="space-y-6">
      <QueryInputBar onSearch={onNewQuery} loading={loading} documents={documents} />

      {queries && queries.length > 0 ? (
        <div className="space-y-6">
          {queries.map((q) => (
            <div key={q.id} className="space-y-3">
              <div className="flex items-start gap-3 pl-2">
                <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-400 font-mono font-bold text-xs mt-0.5 border border-amber-500/20">
                  Q
                </div>
                <div>
                  <div className="font-serif font-semibold text-slate-100 text-sm">{q.query_text || q.query}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Mode: {q.mode?.replace('_', ' ')} • Asked by {q.asked_by_name || 'Counsel'}
                  </div>
                </div>
              </div>

              <GroundedAnswerCard
                queryResult={{
                  id: q.id,
                  answer: q.ai_response || q.answer,
                  citations: typeof q.citations === 'string' ? JSON.parse(q.citations) : q.citations,
                  unverifiedCitations: q.unverifiedCitations || [],
                  citationVerified: q.citation_verified !== false,
                  retrievedChunks: q.retrievedChunks || [],
                  createdAt: q.created_at || q.createdAt,
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="p-10 text-center text-slate-400 bg-[#0B1220] rounded-xl border border-dashed border-[#1D2A40]">
          <BookOpen className="w-8 h-8 mx-auto text-amber-500/60 mb-2" />
          <h4 className="font-medium text-slate-200 text-sm">No Research Inquiries Yet</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Inquire across agreements, precedents, or testimony. Every generated insight is linked to exact page citations.
          </p>
        </div>
      )}
    </div>
  );
}
