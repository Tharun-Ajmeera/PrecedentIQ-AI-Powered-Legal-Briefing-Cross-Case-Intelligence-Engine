// client/src/components/dashboard/CaseComponents.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Folder, FileText, Scale, Calendar, ArrowRight, Trash2 } from 'lucide-react';
import { Button, StatusBadge } from '../common/Button';
import { Modal } from '../common/Modal';
import { ErrorBanner } from '../common/ErrorBanner';
import { caseService } from '../../services/caseService';
import { useAuth } from '../../hooks/useAuth';

export function CaseCard({ legalCase, onDelete }) {
  const { user } = useAuth();

  return (
    <div className="group rounded-xl legal-card p-5 flex flex-col justify-between hover:border-[#2D3D5E] transition-all">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0B1220] border border-[#1D2A40] flex items-center justify-center text-amber-500 flex-shrink-0">
            <Scale className="w-4 h-4 stroke-[1.8]" />
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={legalCase.status || 'active'} label={legalCase.status || 'Active'} />
            {user?.role === 'attorney' && onDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (confirm(`Are you sure you want to delete case "${legalCase.title}"? This cannot be undone.`)) {
                    onDelete(legalCase.id);
                  }
                }}
                className="text-[#64748B] hover:text-rose-400 p-1 rounded hover:bg-[#060B16] transition-colors cursor-pointer"
                title="Delete Matter"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <Link to={`/cases/${legalCase.id}`} className="block mt-3.5 group-hover:text-amber-400 transition-colors">
          <h3 className="font-serif text-base font-bold text-[#F8FAFC] line-clamp-2 leading-snug">
            {legalCase.title}
          </h3>
        </Link>

        {legalCase.matter_number && (
          <div className="mt-1 text-[11px] font-mono text-[#94A3B8]">
            Docket: <span className="text-amber-400/90">{legalCase.matter_number}</span>
          </div>
        )}

        {legalCase.description && (
          <p className="mt-2 text-xs text-[#94A3B8] line-clamp-2 leading-relaxed">
            {legalCase.description}
          </p>
        )}

        <div className="mt-3.5 pt-3 border-t border-[#1D2A40] grid grid-cols-2 gap-2 text-xs text-[#94A3B8]">
          <div className="flex items-center gap-1.5 bg-[#0B1220] px-2.5 py-1.5 rounded border border-[#1D2A40]">
            <Folder className="w-3.5 h-3.5 text-[#64748B]" />
            <span className="font-mono text-[11px]">{legalCase.document_count || 0} Docs</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#0B1220] px-2.5 py-1.5 rounded border border-[#1D2A40]">
            <FileText className="w-3.5 h-3.5 text-[#64748B]" />
            <span className="font-mono text-[11px]">{legalCase.brief_count || 0} Briefs</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#1D2A40] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] font-mono">
          <Calendar className="w-3 h-3 text-[#64748B]" />
          <span>{new Date(legalCase.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>

        <Link
          to={`/cases/${legalCase.id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
        >
          <span>Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export function CaseListTable({ cases, onDelete }) {
  const { user } = useAuth();

  return (
    <div className="overflow-x-auto rounded-xl border border-[#1D2A40] bg-[#0F1728]">
      <table className="w-full text-left text-xs text-[#F8FAFC]">
        <thead className="bg-[#0B1220] text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] border-b border-[#1D2A40]">
          <tr>
            <th className="py-3 px-4 font-semibold">Matter Name</th>
            <th className="py-3 px-4 font-semibold">Matter Number</th>
            <th className="py-3 px-4 font-semibold">Status</th>
            <th className="py-3 px-4 font-semibold">Documents</th>
            <th className="py-3 px-4 font-semibold">Briefs</th>
            <th className="py-3 px-4 font-semibold">Filing Date</th>
            <th className="py-3 px-4 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1D2A40]">
          {cases.map((c) => (
            <tr key={c.id} className="hover:bg-[#121B2D] transition-colors">
              <td className="py-3 px-4 font-serif font-bold text-sm text-[#F8FAFC]">
                <Link to={`/cases/${c.id}`} className="hover:text-amber-400 transition-colors">
                  {c.title}
                </Link>
              </td>
              <td className="py-3 px-4 font-mono text-xs text-amber-400/90">
                {c.matter_number || '—'}
              </td>
              <td className="py-3 px-4">
                <StatusBadge status={c.status || 'active'} label={c.status || 'Active'} />
              </td>
              <td className="py-3 px-4 text-[#94A3B8] font-mono">{c.document_count || 0}</td>
              <td className="py-3 px-4 text-[#94A3B8] font-mono">{c.brief_count || 0}</td>
              <td className="py-3 px-4 text-[#64748B] font-mono text-[11px]">
                {new Date(c.created_at).toLocaleDateString()}
              </td>
              <td className="py-3 px-4 text-right space-x-2">
                <Link
                  to={`/cases/${c.id}`}
                  className="text-xs font-medium text-amber-400 hover:text-amber-300"
                >
                  Workspace
                </Link>
                {user?.role === 'attorney' && onDelete && (
                  <button
                    onClick={() => {
                      if (confirm(`Delete case "${c.title}"?`)) onDelete(c.id);
                    }}
                    className="text-xs text-[#64748B] hover:text-rose-400 ml-2"
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
          <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5 font-mono">
            Matter / Case Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Acme Corp v. Global Industries"
            className="w-full px-3 py-2 bg-[#060B16] border border-[#1D2A40] rounded-lg text-[#F8FAFC] placeholder-[#64748B] text-sm focus:outline-none focus:border-amber-500 font-serif"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1.5 font-mono">
            Internal Matter / Docket Number (Optional)
          </label>
          <input
            type="text"
            value={matterNumber}
            onChange={(e) => setMatterNumber(e.target.value)}
            placeholder="e.g. MAT-2026-4402"
            className="w-full px-3 py-2 bg-[#060B16] border border-[#1D2A40] rounded-lg text-[#F8FAFC] placeholder-[#64748B] text-sm focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1D2A40]">
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
