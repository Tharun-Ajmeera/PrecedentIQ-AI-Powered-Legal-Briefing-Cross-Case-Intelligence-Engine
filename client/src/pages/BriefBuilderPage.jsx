// client/src/pages/BriefBuilderPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { briefService } from '../services/briefService';
import { documentService } from '../services/documentService';
import { IracSectionEditor } from '../components/briefs/IracSectionEditor';
import { BriefVersionHistory } from '../components/briefs/BriefVersionHistory';
import { FinalizeBriefButton } from '../components/briefs/FinalizeBriefButton';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBanner } from '../components/common/ErrorBanner';
import {
  FileText,
  ChevronLeft,
  Plus,
  Trash2,
  Sparkles,
  Printer,
  Save,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export function BriefBuilderPage() {
  const { caseId, briefId } = useParams();
  const navigate = useNavigate();

  const isCreatingNew = !briefId || briefId === 'new';

  const [brief, setBrief] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(!isCreatingNew);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState(null);

  // New Brief Form State
  const [title, setTitle] = useState('');
  const [issueStatements, setIssueStatements] = useState([
    'Whether the verified record establishes non-compliance with mandatory notice and performance terms under the governing legal standard.',
  ]);
  const [selectedDocIds, setSelectedDocIds] = useState([]);

  useEffect(() => {
    documentService.listDocuments(caseId).then((docs) => {
      setDocuments(docs);
      if (isCreatingNew) {
        setSelectedDocIds(docs.map((d) => d.id));
      }
    });

    if (!isCreatingNew) {
      setLoading(true);
      briefService
        .getBrief(caseId, briefId)
        .then((b) => {
          setBrief(b);
          setError(null);
        })
        .catch((err) => setError(err.message || 'Failed to load brief'))
        .finally(() => setLoading(false));
    }
  }, [caseId, briefId, isCreatingNew]);

  const handleAddIssue = () => {
    setIssueStatements([...issueStatements, '']);
  };

  const handleRemoveIssue = (index) => {
    if (issueStatements.length <= 1) return;
    setIssueStatements(issueStatements.filter((_, i) => i !== index));
  };

  const handleIssueChange = (index, value) => {
    const updated = [...issueStatements];
    updated[index] = value;
    setIssueStatements(updated);
  };

  const handleGenerateBrief = async (e) => {
    e.preventDefault();
    setError(null);

    const validIssues = issueStatements.filter((s) => s.trim().length > 0);
    if (validIssues.length === 0) {
      setError('Please provide at least one issue statement.');
      return;
    }

    if (selectedDocIds.length === 0) {
      setError('Please select at least one source document to ground the brief.');
      return;
    }

    setGenerating(true);

    try {
      const generated = await briefService.generateBrief(caseId, {
        title: title || 'Trial Brief Outline',
        issueStatements: validIssues,
        includeDocumentIds: selectedDocIds,
      });

      navigate(`/cases/${caseId}/brief/${generated.id}`);
    } catch (err) {
      setError(err.message || 'Failed to synthesize brief');
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateSection = async (sectionIndex, updatedSection) => {
    if (!brief) return;

    const currentContent = typeof brief.content === 'string'
      ? JSON.parse(brief.content)
      : brief.content;

    const updatedSections = [...(currentContent.sections || [])];
    updatedSections[sectionIndex] = updatedSection;

    const newContent = { ...currentContent, sections: updatedSections };

    setSaving(true);
    try {
      const updatedBrief = await briefService.updateBrief(caseId, brief.id, {
        content: newContent,
      });
      setBrief(updatedBrief);
    } catch (err) {
      alert(err.message || 'Failed to save section update');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (sectionIndex) => {
    if (!confirm('Delete this IRAC section from the brief?')) return;

    const currentContent = typeof brief.content === 'string'
      ? JSON.parse(brief.content)
      : brief.content;

    const updatedSections = currentContent.sections.filter((_, i) => i !== sectionIndex);
    const newContent = { ...currentContent, sections: updatedSections };

    setSaving(true);
    try {
      const updatedBrief = await briefService.updateBrief(caseId, brief.id, {
        content: newContent,
      });
      setBrief(updatedBrief);
    } catch (err) {
      alert(err.message || 'Failed to delete section');
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async () => {
    setFinalizing(true);
    try {
      const finalized = await briefService.finalizeBrief(caseId, brief.id);
      setBrief(finalized);
    } catch (err) {
      alert(err.message || 'Finalization failed');
    } finally {
      setFinalizing(false);
    }
  };

  const parsedContent = brief
    ? typeof brief.content === 'string'
      ? JSON.parse(brief.content)
      : brief.content
    : null;

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto space-y-7">
      <div className="flex items-center justify-between">
        <Link
          to={`/cases/${caseId}`}
          className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors font-mono uppercase tracking-wider"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Return to Matter Workspace</span>
        </Link>
      </div>

      <div>
        <div className="text-amber-500 font-mono text-xs uppercase tracking-widest mb-1">
          Appellate & Trial Briefing Studio
        </div>
        <h1 className="text-3xl font-serif font-bold text-slate-100 tracking-tight flex items-center gap-3">
          <FileText className="w-7 h-7 text-amber-500" />
          <span>Interactive IRAC Trial Brief Builder</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1.5 leading-relaxed font-sans max-w-3xl">
          Synthesize structured court briefs structured strictly under the IRAC legal methodology (Issue, Rule, Analysis, Conclusion). Every asserted rule is anchored by verifiable page-level citations from the certified case record.
        </p>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* Creation Mode */}
      {isCreatingNew ? (
        <form onSubmit={handleGenerateBrief} className="legal-card p-7 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800/90 space-y-7 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2 font-mono">
              Trial Brief Document Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Plaintiff's Memorandum of Law in Support of Preliminary Injunction"
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 font-serif"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">
                Legal Issues to Brief (IRAC Modules) *
              </label>
              <button
                type="button"
                onClick={handleAddIssue}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all font-mono"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Issue Statement</span>
              </button>
            </div>

            {issueStatements.map((stmt, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="text-xs font-serif font-bold text-amber-400/80 mt-3 w-6 text-right">
                  {idx + 1}.
                </span>
                <textarea
                  rows={2}
                  required
                  value={stmt}
                  onChange={(e) => handleIssueChange(idx, e.target.value)}
                  placeholder="State the legal issue question to analyze..."
                  className="flex-1 p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                />
                {issueStatements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveIssue(idx)}
                    className="p-2.5 text-slate-500 hover:text-rose-400 mt-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                    title="Remove Issue"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2.5 font-mono">
              Select Source Documents for Grounding (Required)
            </label>
            <div className="max-h-60 overflow-y-auto space-y-2 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
              {documents.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 font-mono">
                  No documents found in this matter record. Please ingest documents first.
                </div>
              ) : (
                documents.map((doc) => (
                  <label
                    key={doc.id}
                    className="flex items-center gap-3 text-xs text-slate-300 hover:bg-slate-900/80 p-2.5 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-800"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDocIds.includes(doc.id)}
                      onChange={() =>
                        setSelectedDocIds((prev) =>
                          prev.includes(doc.id)
                            ? prev.filter((id) => id !== doc.id)
                            : [...prev, doc.id]
                        )
                      }
                      className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-900"
                    />
                    <span className="font-serif font-medium text-slate-200">{doc.title}</span>
                    <span className="text-amber-500/80 text-[10px] ml-auto uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                      {doc.document_type?.replace('_', ' ')}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800/80">
            <Button type="submit" variant="primary" loading={generating} icon={Sparkles}>
              Synthesize IRAC Brief
            </Button>
          </div>
        </form>
      ) : loading ? (
        <LoadingSpinner text="Retrieving brief document..." />
      ) : brief ? (
        <div className="space-y-6">
          {/* Brief Toolbar */}
          <div className="legal-card flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-xl">
            <div>
              <div className="text-[10px] font-mono text-amber-500/90 uppercase tracking-widest mb-1">
                Court Brief Document
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-100">{brief.title}</h2>
              <div className="text-xs text-slate-400 mt-1 font-mono">
                Drafted by Counsel: <span className="text-slate-200">{brief.created_by_name || 'Counsel'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print / Export Brief
              </Button>

              <FinalizeBriefButton
                brief={brief}
                onFinalize={handleFinalize}
                loading={finalizing}
              />
            </div>
          </div>

          <BriefVersionHistory brief={brief} />

          {/* IRAC Sections List */}
          <div className="space-y-6">
            {parsedContent?.sections?.map((section, idx) => (
              <IracSectionEditor
                key={idx}
                section={section}
                index={idx}
                isFinalized={brief.status === 'finalized'}
                onUpdate={handleUpdateSection}
                onDelete={handleDeleteSection}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
