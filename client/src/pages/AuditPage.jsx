// client/src/pages/AuditPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { auditService } from '../services/auditService';
import { AuditLogTable } from '../components/audit/AuditLogTable';
import { AuditFilterBar } from '../components/audit/AuditFilterBar';
import { RoleGuard } from '../components/layout/RoleGuard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { History, ChevronLeft, ShieldCheck, Lock } from 'lucide-react';

export function AuditPage() {
  const { caseId } = useParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let data;
      if (caseId) {
        data = await auditService.getCaseAuditLogs(caseId, actionFilter);
      } else {
        data = await auditService.getFirmAuditLogs({ action: actionFilter || undefined });
      }
      setLogs(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to retrieve audit trail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [caseId, actionFilter]);

  const uniqueActions = [
    'USER_REGISTERED',
    'USER_LOGIN',
    'CASE_CREATED',
    'DOCUMENT_UPLOADED',
    'DOCUMENT_INGESTED',
    'RAG_QUERY',
    'VULNERABILITY_DETECTOR_RUN',
    'BRIEF_SYNTHESIZED',
    'BRIEF_UPDATED',
    'BRIEF_FINALIZED',
    'CLAUSE_COMPARISON_GENERATED',
    'DEMO_DATA_SEEDED',
  ];

  return (
    <RoleGuard allowedRoles={['attorney', 'compliance_officer']}>
      <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-7">
        <div className="flex items-center justify-between">
          {caseId ? (
            <Link
              to={`/cases/${caseId}`}
              className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors font-mono uppercase tracking-wider"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Matter Workspace</span>
            </Link>
          ) : (
            <Link
              to="/dashboard"
              className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors font-mono uppercase tracking-wider"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Master Docket</span>
            </Link>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Append-Only Forensic Ledger</span>
          </div>
        </div>

        <div>
          <div className="text-amber-500 font-mono text-xs uppercase tracking-widest mb-1">
            Institutional Governance & Chain of Custody
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <History className="w-7 h-7 text-amber-500" />
            <span>Forensic Audit Ledger</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1.5 leading-relaxed max-w-3xl">
            Cryptographically timestamped audit trail of all evidentiary uploads, vector indexing jobs, partner IRAC brief certifications, and AI legal queries.
          </p>
        </div>

        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        {/* Action Filters */}
        <AuditFilterBar
          actions={uniqueActions}
          selectedAction={actionFilter}
          onSelectAction={setActionFilter}
        />

        {/* Audit Table */}
        {loading ? (
          <LoadingSpinner text="Retrieving cryptographic audit trail..." />
        ) : (
          <AuditLogTable logs={logs} />
        )}
      </div>
    </RoleGuard>
  );
}
