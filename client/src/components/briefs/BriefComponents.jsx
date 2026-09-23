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
  Award,
  Scroll,
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
    <div className="legal-card rounded-xl p-6 sm:p-7 space-y-5 bg-slate-900/70 border border-slate-800/90 shadow-xl relative overflow-hidden">
      {/* Decorative top gold rim */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 font-serif font-bold text-sm border border-amber-500/25 shadow-inner">
            {index + 1}
          </span>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-amber-500/80">
              IRAC Module 0{index + 1}
            </div>
            <span className="font-serif font-semibold text-slate-100 text-base">
              Court Brief Section {index + 1}
            </span>
          </div>
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
              Save Changes
            </Button>
          )}
          {!isFinalized && onDelete && (
            <button
              onClick={() => onDelete(index)}
              className="text-slate-500 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-500/10 transition-colors"
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
            <label className="block text-[11px] font-bold text-amber-400/90 uppercase tracking-widest mb-1.5 font-mono">
              I. Issue Statement / Question Presented
            </label>
            <textarea
              rows={2}
              value={formData.issueStatement}
              onChange={(e) => setFormData({ ...formData, issueStatement: e.target.value })}
              className="w-full p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-amber-400/90 uppercase tracking-widest mb-1.5 font-mono">
              II. Applicable Controlling Rule of Law
            </label>
            <textarea
              rows={3}
              value={formData.applicableRule}
              onChange={(e) => setFormData({ ...formData, applicableRule: e.target.value })}
              className="w-full p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 font-serif"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-amber-400/90 uppercase tracking-widest mb-1.5 font-mono">
              III. Application & Factual Synthesis
            </label>
            <textarea
              rows={4}
              value={formData.analysis}
              onChange={(e) => setFormData({ ...formData, analysis: e.target.value })}
              className="w-full p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-amber-400/90 uppercase tracking-widest mb-1.5 font-mono">
              IV. Conclusion / Prayer for Relief
            </label>
            <textarea
              rows={2}
              value={formData.conclusion}
              onChange={(e) => setFormData({ ...formData, conclusion: e.target.value })}
              className="w-full p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-5 legal-document-view">
          {/* Issue */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-500 block mb-1.5 font-mono">
              I. Question Presented (Issue):
            </span>
            <p className="text-slate-100 text-sm font-semibold leading-relaxed pl-3 border-l-2 border-amber-500/40">
              {section.issueStatement}
            </p>
          </div>

          {/* Rule */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/90 shadow-inner">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-500 block mb-1.5 font-mono">
              II. Governing Rule of Law & Statutory Standards:
            </span>
            <p className="text-slate-200 text-sm font-serif leading-relaxed italic pl-3 border-l-2 border-amber-500/30">
              "{section.applicableRule}"
            </p>
            {section.ruleCitations && section.ruleCitations.length > 0 && (
              <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Grounding Record:
                </span>
                {section.ruleCitations.map((cite, i) => (
                  <CitationChip key={i} citation={cite} />
                ))}
              </div>
            )}
          </div>

          {/* Analysis */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-500 block mb-1.5 font-mono">
              III. Application to Record Facts:
            </span>
            <p className="text-slate-300 text-sm leading-relaxed pl-3 border-l-2 border-slate-700">
              {section.analysis}
            </p>
          </div>

          {/* Conclusion */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-500 block mb-1.5 font-mono">
              IV. Conclusion & Relief Sought:
            </span>
            <p className="text-slate-100 text-sm font-medium pl-3 border-l-2 border-emerald-500/40">
              {section.conclusion}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function BriefVersionHistory({ brief }) {
  return (
    <div className="legal-card p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-slate-200 font-semibold">
          <Scroll className="w-4 h-4 text-amber-400" />
          <span className="font-serif">Revision Archive:</span>
          <span className="px-2 py-0.5 rounded font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20">
            v{brief.version}.0
          </span>
        </div>
        <span className="text-slate-700">•</span>
        <span className="font-mono text-slate-400">
          Last modified: {new Date(brief.updated_at || brief.created_at).toLocaleString()}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`px-3 py-1 rounded-full font-mono font-bold uppercase tracking-wider text-[10px] border shadow-sm ${
            brief.status === 'finalized'
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-emerald-950/30'
              : 'bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-amber-950/30'
          }`}
        >
          {brief.status === 'finalized' ? '✓ Locked for Court Filing' : 'Draft In Progress'}
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
      <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-xs font-semibold shadow-inner font-mono">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Certified & Filing-Ready</span>
      </div>
    );
  }

  if (!isAttorney) {
    return (
      <div className="text-xs text-slate-400 italic font-serif flex items-center gap-1.5" title="Only partner/counsel attorneys may certify briefs">
        <Lock className="w-3.5 h-3.5 text-slate-500" />
        <span>Counsel signature required to certify</span>
      </div>
    );
  }

  return (
    <Button
      variant="primary"
      size="sm"
      loading={loading}
      icon={Award}
      onClick={() => {
        if (confirm('Finalize and lock this trial brief outline for filing? Only authorized attorneys can certify briefs.')) {
          onFinalize();
        }
      }}
    >
      Certify Brief (Counsel Sign-Off)
    </Button>
  );
}
