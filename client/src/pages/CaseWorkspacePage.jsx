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
      {/* Executive Matter Dossier Hero */}
      <div className="p-6 rounded-2xl legal-card space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/35">
                {currentCase.status || 'Active'} Litigation Matter
              </span>
              {currentCase.matter_number && (
                <span className="text-xs font-mono text-amber-400/90 bg-[#070B14] px-2 py-0.5 rounded border border-[#1E2B45]">
                  Docket #{currentCase.matter_number}
                </span>
              )}
              {currentCase.jurisdiction && (
                <span className="text-xs font-medium text-slate-300 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700">
                  {currentCase.jurisdiction}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-100 tracking-tight">
              {currentCase.title}
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
              <span>Counsel: <strong className="text-slate-300">{currentCase.created_by_name || 'Partner / Attorney'}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {new Date(currentCase.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
              Ingest Evidence Files
            </Button>
          </div>
        </div>

        {/* Quick Intelligence Tool Bar */}
        <div className="pt-4 border-t border-[#1E2B45] grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to={`/cases/${caseId}/research`}
            className="p-3.5 rounded-xl bg-[#070B14]/80 border border-[#1E2B45] hover:border-amber-500/50 hover:bg-[#0D1527] transition-all flex items-center gap-3 group shadow-sm"
          >
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/25 group-hover:scale-105 group-hover:border-amber-400/50 transition-all">
              <Search className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-amber-300">
                Precedent RAG
              </div>
              <div className="text-[10px] text-slate-400">Fact cross-examination</div>
            </div>
          </Link>

          <Link
            to={`/cases/${caseId}/vulnerability`}
            className="p-3.5 rounded-xl bg-[#070B14]/80 border border-[#1E2B45] hover:border-rose-500/50 hover:bg-[#0D1527] transition-all flex items-center gap-3 group shadow-sm"
          >
            <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/25 group-hover:scale-105 group-hover:border-rose-400/50 transition-all">
              <ShieldAlert className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-rose-300">
                Vulnerabilities
              </div>
              <div className="text-[10px] text-slate-400">
                {reports.length} Opposing analysis
              </div>
            </div>
          </Link>

          <Link
            to={`/cases/${caseId}/brief/new`}
            className="p-3.5 rounded-xl bg-[#070B14]/80 border border-[#1E2B45] hover:border-blue-500/50 hover:bg-[#0D1527] transition-all flex items-center gap-3 group shadow-sm"
          >
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/25 group-hover:scale-105 group-hover:border-blue-400/50 transition-all">
              <FileText className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-300">
                Trial Briefs
              </div>
              <div className="text-[10px] text-slate-400">
                {briefs.length} IRAC outlines
              </div>
            </div>
          </Link>

          <Link
            to={`/cases/${caseId}/clauses`}
            className="p-3.5 rounded-xl bg-[#070B14]/80 border border-[#1E2B45] hover:border-emerald-500/50 hover:bg-[#0D1527] transition-all flex items-center gap-3 group shadow-sm"
          >
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 group-hover:scale-105 group-hover:border-emerald-400/50 transition-all">
              <Columns className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300">
                Clause Matrix
              </div>
              <div className="text-[10px] text-slate-400">Compare agreements</div>
            </div>
          </Link>
        </div>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* Case Documents Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-bold text-slate-100 tracking-tight">
              Verified Case Record ({documents.length} Evidence Documents)
            </h2>
            <p className="text-xs text-slate-400">
              Chunked by exact page boundaries with SHA-256 integrity and 768-dim embeddings for zero-hallucination citations.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={UploadCloud}
            onClick={() => navigate(`/cases/${caseId}/upload`)}
          >
            Ingest More Evidence
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
        <div className="p-6 rounded-xl legal-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              <h3 className="font-serif font-bold text-slate-100 text-base">Synthesized Trial Briefs</h3>
            </div>
            <Link
              to={`/cases/${caseId}/brief/new`}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300"
            >
              + Draft New IRAC Brief
            </Link>
          </div>

          {briefs.length > 0 ? (
            <div className="space-y-2.5">
              {briefs.map((b) => (
                <Link
                  key={b.id}
                  to={`/cases/${caseId}/brief/${b.id}`}
                  className="p-3.5 rounded-lg bg-[#070B14]/80 border border-[#1E2B45] hover:border-amber-500/40 flex items-center justify-between transition-all group"
                >
                  <div>
                    <div className="font-serif font-semibold text-slate-200 text-sm group-hover:text-amber-300 transition-colors">{b.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      v{b.version} • Updated {new Date(b.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      b.status === 'finalized'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/35'
                    }`}
                  >
                    {b.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic py-2">
              No briefs generated yet. Use the IRAC Brief Builder to synthesize an argument grounded in your case record.
            </p>
          )}
        </div>

        {/* Vulnerability Reports Box */}
        <div className="p-6 rounded-xl legal-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h3 className="font-serif font-bold text-slate-100 text-base">Adversary Vulnerability Audits</h3>
            </div>
            <Link
              to={`/cases/${caseId}/vulnerability`}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300"
            >
              Run Audit &rarr;
            </Link>
          </div>

          {reports.length > 0 ? (
            <div className="space-y-2.5">
              {reports.slice(0, 4).map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-lg bg-[#070B14]/80 border border-[#1E2B45] flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-slate-200 text-xs truncate max-w-xs">{r.target_document_title || 'Opposing Filing'}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Analyzed {new Date(r.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-800/40">
                    {(r.findings || []).length} Vulnerabilities
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic py-2">
              No vulnerability reports generated yet. Run the detector against opposing motions to find misapplied precedents and factual contradictions.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
