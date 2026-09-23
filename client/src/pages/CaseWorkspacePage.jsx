// client/src/pages/CaseWorkspacePage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { caseService } from '../services/caseService';
import { documentService } from '../services/documentService';
import { briefService } from '../services/briefService';
import { vulnerabilityService } from '../services/vulnerabilityService';
import { DocumentList } from '../components/documents/DocumentList';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBanner } from '../components/common/ErrorBanner';
import {
  UploadCloud,
  Search,
  ShieldAlert,
  FileText,
  Columns,
  History,
  Scale,
  Calendar,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export function CaseWorkspacePage() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [currentCase, setCurrentCase] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [briefs, setBriefs] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCaseData = async () => {
    try {
      setLoading(true);
      const [c, docs, bList, rList] = await Promise.all([
        caseService.getCase(caseId),
        documentService.listDocuments(caseId),
        briefService.listBriefs(caseId),
        vulnerabilityService.listReports(caseId),
      ]);
      setCurrentCase(c);
      setDocuments(docs);
      setBriefs(bList);
      setReports(rList);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load case workspace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCaseData();
  }, [caseId]);

  const handleDeleteDocument = async (docId) => {
    try {
      await documentService.deleteDocument(caseId, docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      alert(err.message || 'Failed to delete document');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Opening matter dossier..." />;
  }

  if (!currentCase) {
    return (
      <div className="p-8 text-center text-slate-400">
        Matter not found or access unauthorized.
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Workspace Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900/60 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                {currentCase.status} Matter
              </span>
              {currentCase.matter_number && (
                <span className="text-xs font-mono text-slate-400">
                  #{currentCase.matter_number}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              {currentCase.title}
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
              <span>Opened by {currentCase.created_by_name || 'Counsel'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {new Date(currentCase.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="primary"
              size="sm"
              icon={UploadCloud}
              onClick={() => navigate(`/cases/${caseId}/upload`)}
            >
              Ingest Document
            </Button>
          </div>
        </div>

        {/* Quick Intelligence Tool Bar */}
        <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to={`/cases/${caseId}/research`}
            className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900 transition-all flex items-center gap-3 group"
          >
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-105 transition-transform">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-amber-400">
                RAG Research
              </div>
              <div className="text-[10px] text-slate-500">Cross-examine facts</div>
            </div>
          </Link>

          <Link
            to={`/cases/${caseId}/vulnerability`}
            className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-rose-500/40 hover:bg-slate-900 transition-all flex items-center gap-3 group"
          >
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-rose-400">
                Vulnerabilities
              </div>
              <div className="text-[10px] text-slate-500">
                {reports.length} Opposing reports
              </div>
            </div>
          </Link>

          <Link
            to={`/cases/${caseId}/brief/new`}
            className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-900 transition-all flex items-center gap-3 group"
          >
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-400">
                Trial Briefs
              </div>
              <div className="text-[10px] text-slate-500">
                {briefs.length} IRAC outlines
              </div>
            </div>
          </Link>

          <Link
            to={`/cases/${caseId}/clauses`}
            className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900 transition-all flex items-center gap-3 group"
          >
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
              <Columns className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400">
                Clause Matrix
              </div>
              <div className="text-[10px] text-slate-500">Compare agreements</div>
            </div>
          </Link>
        </div>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* Case Documents Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              Verified Case Record ({documents.length})
            </h2>
            <p className="text-xs text-slate-400">
              Extracted page-by-page and indexed for zero-hallucination RAG vector retrieval
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={UploadCloud}
            onClick={() => navigate(`/cases/${caseId}/upload`)}
          >
            Upload More
          </Button>
        </div>

        <DocumentList
          documents={documents}
          onDelete={handleDeleteDocument}
          onUpdate={(updated) => {
            setDocuments((prev) => prev.map((d) => (d.id === updated.id ? { ...d, ...updated } : d)));
          }}
          caseId={caseId}
        />
      </div>

      {/* Trial Briefs & Opposing Vulnerability Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trial Briefs Box */}
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold text-slate-100 text-sm">Trial Brief Outlines</h3>
            </div>
            <Link
              to={`/cases/${caseId}/brief/new`}
              className="text-xs font-semibold text-amber-500 hover:text-amber-400"
            >
              + Create IRAC Brief
            </Link>
          </div>

          {briefs.length > 0 ? (
            <div className="space-y-2.5">
              {briefs.map((b) => (
                <Link
                  key={b.id}
                  to={`/cases/${caseId}/brief/${b.id}`}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 flex items-center justify-between transition-all"
                >
                  <div>
                    <div className="font-semibold text-slate-200 text-xs">{b.title}</div>
                    <div className="text-[10px] text-slate-400">
                      v{b.version} • {new Date(b.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      b.status === 'finalized'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {b.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500 text-center py-6">
              No trial briefs generated for this matter yet.
            </div>
          )}
        </div>

        {/* Vulnerability Reports Box */}
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <h3 className="font-semibold text-slate-100 text-sm">Vulnerability Reports</h3>
            </div>
            <Link
              to={`/cases/${caseId}/vulnerability`}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300"
            >
              Run Detector
            </Link>
          </div>

          {reports.length > 0 ? (
            <div className="space-y-2.5">
              {reports.map((r) => {
                const findings = typeof r.findings === 'string' ? JSON.parse(r.findings) : r.findings;
                const count = findings?.vulnerabilities?.length || 0;
                return (
                  <Link
                    key={r.id}
                    to={`/cases/${caseId}/vulnerability`}
                    className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-rose-500/40 flex items-center justify-between transition-all"
                  >
                    <div>
                      <div className="font-semibold text-slate-200 text-xs">
                        Adversary: {r.opposing_document_title || 'Opposing Filing'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(r.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-950/40 border border-rose-900/60 px-2 py-0.5 rounded-full">
                      {count} Vulnerabilit{count !== 1 ? 'ies' : 'y'}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-slate-500 text-center py-6">
              No vulnerability reports run yet. Upload an opposing brief to run detection.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
