// client/src/components/dashboard/CaseComponents.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Folder, FileText, Scale, Calendar, ArrowRight, Trash2 } from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { ErrorBanner } from '../common/ErrorBanner';
import { caseService } from '../../services/caseService';
import { useAuth } from '../../hooks/useAuth';

export function CaseCard({ legalCase, onDelete }) {
  const { user } = useAuth();

  return (
    <div className="group relative rounded-xl legal-card p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/25 group-hover:scale-105 group-hover:border-amber-400/50 transition-all shadow-sm shadow-amber-950/20">
            <Scale className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-sm ${
                legalCase.status === 'active'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {legalCase.status || 'Active'}
            </span>
            {user?.role === 'attorney' && onDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (confirm(`Are you sure you want to delete case "${legalCase.title}"? This cannot be undone.`)) {
                    onDelete(legalCase.id);
                  }
                }}
                className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-rose-950/30 transition-colors cursor-pointer"
                title="Delete Matter"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <h3 className="mt-4 font-serif text-lg font-bold text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-2 tracking-tight">
          {legalCase.title}
        </h3>

        {legalCase.matter_number && (
          <div className="mt-1 text-xs font-mono text-amber-400/80 tracking-wide">
            Docket #{legalCase.matter_number}
          </div>
        )}

        {legalCase.description && (
          <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {legalCase.description}
          </p>
        )}

        <div className="mt-4 pt-3.5 border-t border-[#1E2B45] grid grid-cols-2 gap-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 bg-[#070B14]/60 px-2.5 py-1.5 rounded border border-[#1E2B45]">
            <Folder className="w-3.5 h-3.5 text-amber-500/80" />
            <span className="font-mono text-xs">{legalCase.document_count || 0} Docs</span>
          </div>
          <div className="flex items-center gap-2 bg-[#070B14]/60 px-2.5 py-1.5 rounded border border-[#1E2B45]">
            <FileText className="w-3.5 h-3.5 text-amber-500/80" />
            <span className="font-mono text-xs">{legalCase.brief_count || 0} Briefs</span>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3.5 border-t border-[#1E2B45] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{new Date(legalCase.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>

        <Link
          to={`/cases/${legalCase.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 group-hover:text-amber-300 group-hover:translate-x-1 transition-all"
        >
          <span>Enter Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export function CaseListTable({ cases, onDelete }) {
  const { user } = useAuth();

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-900/90 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
          <tr>
            <th className="py-3.5 px-4">Matter Name</th>
            <th className="py-3.5 px-4">Matter Number</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4">Documents</th>
            <th className="py-3.5 px-4">Briefs</th>
            <th className="py-3.5 px-4">Created Date</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80 font-normal">
          {cases.map((c) => (
            <tr key={c.id} className="hover:bg-slate-850/50 transition-colors">
              <td className="py-3 px-4 font-medium text-slate-100">
                <Link to={`/cases/${c.id}`} className="hover:text-amber-400 transition-colors">
                  {c.title}
                </Link>
              </td>
              <td className="py-3 px-4 font-mono text-xs text-slate-400">
                {c.matter_number || '—'}
              </td>
              <td className="py-3 px-4">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    c.status === 'active'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-700/50 text-slate-400 border-slate-600'
                  }`}
                >
                  {c.status}
                </span>
              </td>
              <td className="py-3 px-4 text-slate-400">{c.document_count || 0}</td>
              <td className="py-3 px-4 text-slate-400">{c.brief_count || 0}</td>
              <td className="py-3 px-4 text-slate-500 text-xs">
                {new Date(c.created_at).toLocaleDateString()}
              </td>
              <td className="py-3 px-4 text-right space-x-2">
                <Link
                  to={`/cases/${c.id}`}
                  className="text-xs font-semibold text-amber-500 hover:text-amber-400"
                >
                  Open
                </Link>
                {user?.role === 'attorney' && onDelete && (
                  <button
                    onClick={() => {
                      if (confirm(`Delete case "${c.title}"?`)) onDelete(c.id);
                    }}
                    className="text-xs text-rose-500 hover:text-rose-400 ml-2"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function NewCaseModal({ isOpen, onClose, onCaseCreated }) {
  const [title, setTitle] = useState('');
  const [matterNumber, setMatterNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const created = await caseService.createCase({
        title,
        matterNumber: matterNumber || undefined,
      });
      setTitle('');
      setMatterNumber('');
      onCaseCreated(created);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Open New Legal Matter">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Matter / Case Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Acme Corp v. Global Industries"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Internal Matter Number (Optional)
          </label>
          <input
            type="text"
            value={matterNumber}
            onChange={(e) => setMatterNumber(e.target.value)}
            placeholder="e.g. MAT-2026-4402"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            Create Matter
          </Button>
        </div>
      </form>
    </Modal>
  );
}
