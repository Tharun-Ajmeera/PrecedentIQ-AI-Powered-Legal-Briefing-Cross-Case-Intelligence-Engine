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
    <div className="legal-card rounded-2xl p-6 sm:p-7 space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-[#1D2A40]">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 font-mono font-bold text-sm border border-amber-500/25">
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
              variant="secondary"
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
              className="text-slate-500 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
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
            <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              I. Question Presented (Issue Statement)
            </label>
            <textarea
              rows={2}
              value={formData.issueStatement}
              onChange={(e) => setFormData({ ...formData, issueStatement: e.target.value })}
              className="w-full p-3 bg-[#0B1220] border border-[#1D2A40] rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              II. Applicable Controlling Rule of Law
            </label>
            <textarea
              rows={3}
              value={formData.applicableRule}
              onChange={(e) => setFormData({ ...formData, applicableRule: e.target.value })}
              className="w-full p-3 bg-[#0B1220] border border-[#1D2A40] rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 font-serif"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              III. Application to Record Facts & Legal Synthesis
            </label>
            <textarea
              rows={4}
              value={formData.analysis}
              onChange={(e) => setFormData({ ...formData, analysis: e.target.value })}
              className="w-full p-3 bg-[#0B1220] border border-[#1D2A40] rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              IV. Conclusion / Prayer for Relief
            </label>
            <textarea
              rows={2}
              value={formData.conclusion}
              onChange={(e) => setFormData({ ...formData, conclusion: e.target.value })}
              className="w-full p-3 bg-[#0B1220] border border-[#1D2A40] rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 font-sans"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-5 legal-document-view">
          {/* Issue */}
          <div>
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-500 block mb-1">
              I. Question Presented (Issue):
            </span>
            <p className="text-slate-100 text-sm font-semibold leading-relaxed pl-3 border-l-2 border-amber-500/50">
              {section.issueStatement}
            </p>
          </div>

          {/* Rule */}
          <div className="p-4 rounded-xl bg-[#0B1220] border border-[#1D2A40]">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-500 block mb-1.5">
              II. Governing Rule of Law & Statutory Standards:
            </span>
            <blockquote className="legal-quote text-sm text-slate-200">
              "{section.applicableRule}"
            </blockquote>
            {section.ruleCitations && section.ruleCitations.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[#1D2A40] flex flex-wrap items-center gap-2">
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
          <div className="ai-analysis-block">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-400/90 block mb-1.5">
              III. Application to Record Facts:
            </span>
            <p className="text-slate-200 text-sm leading-relaxed font-sans">
              {section.analysis}
            </p>
          </div>

          {/* Conclusion */}
          <div>
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-400 block mb-1">
              IV. Conclusion & Relief Sought:
            </span>
            <p className="text-slate-100 text-sm font-medium pl-3 border-l-2 border-emerald-500/50">
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
    <div className="legal-card p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-slate-200 font-semibold">
          <Scroll className="w-4 h-4 text-amber-400" />
          <span className="font-serif">Revision Archive:</span>
          <span className="px-2 py-0.5 rounded font-mono text-amber-400 bg-amber-500/10 border border-amber-500/25">
            v{brief.version}.0
          </span>
        </div>
        <span className="text-slate-700 hidden sm:inline">•</span>
        <span className="font-mono text-slate-400">
          Last modified: {new Date(brief.updated_at || brief.created_at).toLocaleString()}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`px-3 py-1 rounded font-mono font-semibold uppercase tracking-wider text-[10px] border ${
            brief.status === 'finalized'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
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
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold font-mono">
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
