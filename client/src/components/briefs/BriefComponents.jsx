// client/src/components/briefs/BriefComponents.jsx
import React, { useState } from 'react';
import {
  FileText,
  Lock,
  Edit3,
  CheckCircle2,
  Save,
  Printer,
  Sparkles,
  Plus,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../common/Button';
import { CitationChip } from '../research/CitationChip';
import { useAuth } from '../../hooks/useAuth';

export function IracSectionEditor({ section, index, isFinalized, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ ...section });

  const handleSave = () => {
    onUpdate(index, formData);
    setEditing(false);
  };

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 font-bold text-xs border border-amber-500/20">
            {index + 1}
          </span>
          <span className="font-semibold text-slate-100 text-sm">
            Issue {index + 1}: IRAC Structured Outline
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!isFinalized && !editing && (
            <Button
              variant="outline"
              size="sm"
              icon={Edit3}
              onClick={() => setEditing(true)}
            >
              Edit Section
            </Button>
          )}
          {editing && (
            <Button variant="primary" size="sm" icon={Save} onClick={handleSave}>
              Apply Changes
            </Button>
          )}
          {!isFinalized && onDelete && (
            <button
              onClick={() => onDelete(index)}
              className="text-slate-500 hover:text-rose-400 p-1.5 rounded"
              title="Delete Section"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Issue Statement
            </label>
            <textarea
              rows={2}
              value={formData.issueStatement}
              onChange={(e) => setFormData({ ...formData, issueStatement: e.target.value })}
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-sm focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Applicable Legal Rule (Must contain citations)
            </label>
            <textarea
              rows={3}
              value={formData.applicableRule}
              onChange={(e) => setFormData({ ...formData, applicableRule: e.target.value })}
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-sm focus:ring-2 focus:ring-amber-500 font-serif"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Analysis / Application of Rule to Facts
            </label>
            <textarea
              rows={4}
              value={formData.analysis}
              onChange={(e) => setFormData({ ...formData, analysis: e.target.value })}
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-sm focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Conclusion / Court Prayer
            </label>
            <textarea
              rows={2}
              value={formData.conclusion}
              onChange={(e) => setFormData({ ...formData, conclusion: e.target.value })}
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-sm focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4 legal-document-view">
          {/* Issue */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block mb-1">
              I. Issue Statement:
            </span>
            <p className="text-slate-100 text-sm font-semibold">{section.issueStatement}</p>
          </div>

          {/* Rule */}
          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block mb-1">
              II. Applicable Rule of Law:
            </span>
            <p className="text-slate-200 text-sm font-serif leading-relaxed italic">
              {section.applicableRule}
            </p>
            {section.ruleCitations && section.ruleCitations.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {section.ruleCitations.map((cite, i) => (
                  <CitationChip key={i} citation={cite} />
                ))}
              </div>
            )}
          </div>

          {/* Analysis */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block mb-1">
              III. Application & Factual Analysis:
            </span>
            <p className="text-slate-200 text-sm leading-relaxed">{section.analysis}</p>
          </div>

          {/* Conclusion */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block mb-1">
              IV. Conclusion:
            </span>
            <p className="text-slate-100 text-sm font-medium">{section.conclusion}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function BriefVersionHistory({ brief }) {
  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
          <FileText className="w-4 h-4 text-amber-500" />
          <span>Version {brief.version}</span>
        </div>
        <span>•</span>
        <span>Last modified: {new Date(brief.updated_at || brief.created_at).toLocaleString()}</span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] border ${
            brief.status === 'finalized'
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
          }`}
        >
          {brief.status === 'finalized' ? 'Locked for Court Filing' : 'Draft In Progress'}
        </span>
      </div>
    </div>
  );
}

export function FinalizeBriefButton({ brief, onFinalize, loading }) {
  const { user } = useAuth();
  const isAttorney = user?.role === 'attorney';
  const isFinalized = brief.status === 'finalized';

  if (isFinalized) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-xs font-semibold">
        <Lock className="w-3.5 h-3.5" />
        <span>Brief Finalized & Certified</span>
      </div>
    );
  }

  if (!isAttorney) {
    return (
      <div className="text-xs text-slate-400 italic" title="Only attorneys may finalize briefs">
        Attorney signature required to finalize
      </div>
    );
  }

  return (
    <Button
      variant="primary"
      size="sm"
      loading={loading}
      icon={Lock}
      onClick={() => {
        if (confirm('Finalize and lock this trial brief outline for filing? Only attorneys can execute this.')) {
          onFinalize();
        }
      }}
    >
      Finalize Brief (Attorney Sign-Off)
    </Button>
  );
}
