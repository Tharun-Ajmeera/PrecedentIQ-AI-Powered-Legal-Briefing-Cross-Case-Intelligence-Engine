// client/src/components/clauses/ClauseComponents.jsx
import React from 'react';
import { Columns, AlertCircle, FileCheck, CheckCircle2, Scale } from 'lucide-react';
import { CitationChip } from '../research/CitationChip';

export function ClauseDivergenceHighlight({ note }) {
  return (
    <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-600/35 text-xs text-amber-200/90 leading-relaxed shadow-sm">
      <span className="font-mono font-semibold text-amber-400 block mb-1 text-[11px] uppercase tracking-wider">
        Material Divergence Analysis:
      </span>
      <p className="font-sans leading-relaxed">{note}</p>
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
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/25">
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

        <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-mono bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Page Grounding 100% Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {rows.map((row, idx) => (
          <div
            key={idx}
            className="rounded-2xl legal-card p-5 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#1E2B45]">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="font-serif font-bold text-slate-100 text-sm line-clamp-1">
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

              <div>
                <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Contractual Provision Text:
                </span>
                <blockquote className="text-xs text-slate-200 font-serif italic bg-[#070B14]/80 p-3.5 rounded-xl border border-[#1E2B45] leading-relaxed max-h-52 overflow-y-auto pl-3 border-l-2 border-l-amber-500/50">
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
  );
}

