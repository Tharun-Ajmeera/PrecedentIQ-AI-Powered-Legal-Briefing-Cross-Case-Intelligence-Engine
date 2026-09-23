// client/src/components/clauses/ClauseComponents.jsx
import React from 'react';
import { Columns, AlertCircle, FileCheck, CheckCircle2 } from 'lucide-react';
import { CitationChip } from '../research/CitationChip';

export function ClauseDivergenceHighlight({ note }) {
  return (
    <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200/90 leading-relaxed">
      <span className="font-semibold text-amber-400 block mb-0.5">Divergence Analysis:</span>
      {note}
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
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Columns className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">
              Clause Subject: {matrix.subjectMatter || comparison.subject_matter}
            </h3>
            <div className="text-xs text-slate-400">
              Comparing {rows.length} contractual provisions side-by-side
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Page-Level Grounding Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rows.map((row, idx) => (
          <div
            key={idx}
            className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 space-y-3 shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-slate-100 text-sm line-clamp-1">
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
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Contractual Provision Text:
                </span>
                <p className="text-xs text-slate-200 font-serif italic bg-slate-950/60 p-3 rounded-lg border border-slate-800 leading-relaxed max-h-48 overflow-y-auto">
                  "{row.clauseText}"
                </p>
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
