// client/src/components/clauses/ClauseComponents.jsx
import React from 'react';
import { Columns, AlertCircle, FileCheck, CheckCircle2, Scale } from 'lucide-react';
import { CitationChip } from '../research/CitationChip';

export function ClauseDivergenceHighlight({ note }) {
  return (
    <div className="ai-analysis-block space-y-1.5">
      <div className="flex items-center justify-between text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-400/90">
        <span>Material Divergence Analysis</span>
        <span className="text-[10px] text-slate-400 font-normal">Comparative AI Synthesis</span>
      </div>
      <p className="text-xs text-slate-200 leading-relaxed font-sans">{note}</p>
    </div>
  );
}

export function ClauseMatrixTable({ comparison }) {
  if (!comparison || !comparison.matrix) return null;

  const matrix = typeof comparison.matrix === 'string'
    ? JSON.parse(comparison.matrix)
    : comparison.matrix;

  const rows = matrix.rows || [];

  return (
    <div className="space-y-5">
      <div className="p-5 rounded-2xl legal-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/25 flex-shrink-0">
            <Columns className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-slate-100 text-base">
              Provision Subject: {matrix.subjectMatter || comparison.subject_matter}
            </h3>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              Comparing {rows.length} contractual provisions side-by-side
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-[#0B1220] px-3 py-1 rounded border border-emerald-500/30 self-start sm:self-auto">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Page-Level Grounding Verified</span>
        </div>
      </div>

      {/* Controlled side-by-side comparison workspace with contained horizontal scrolling on small screens */}
      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 min-w-0 md:min-w-[640px]">
          {rows.map((row, idx) => (
            <div
              key={idx}
              className="rounded-2xl legal-card p-5 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#1D2A40]">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="font-serif font-bold text-slate-100 text-sm truncate">
                      {row.documentTitle}
                    </span>
                  </div>
                  <CitationChip
                    citation={{
                      documentTitle: row.documentTitle,
                      pageNumber: row.pageNumber,
                      verified: row.citationVerified !== false,
                    }}
                  />
                </div>

                <div className="source-evidence-block space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                    <span>Contractual Provision Text:</span>
                    <span className="text-[10px] text-slate-500 font-mono">Page {row.pageNumber || '—'}</span>
                  </div>
                  <blockquote className="legal-quote text-xs text-slate-200 max-h-56 overflow-y-auto leading-relaxed">
                    "{row.clauseText}"
                  </blockquote>
                </div>
              </div>

              <div className="pt-2">
                <ClauseDivergenceHighlight note={row.divergenceNote} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

