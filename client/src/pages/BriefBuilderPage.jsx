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
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to={`/cases/${caseId}`}
          className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Matter Workspace</span>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-amber-500" />
          <span>Interactive IRAC Trial Brief Builder</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Synthesize structured court briefs (Issue, Rule, Analysis, Conclusion). Every applicable rule is anchored by verifiable page-level citations from the case record.
        </p>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* Creation Mode */}
      {isCreatingNew ? (
        <form onSubmit={handleGenerateBrief} className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Trial Brief Document Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Plaintiff's Memorandum of Law in Support of Preliminary Injunction"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-sm focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Legal Issues to Brief (IRAC Modules) *
              </label>
              <button
                type="button"
                onClick={handleAddIssue}
                className="text-xs text-amber-500 hover:text-amber-400 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Issue Statement</span>
              </button>
            </div>

            {issueStatements.map((stmt, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-xs font-mono text-slate-500 mt-2.5 w-6 text-right">
                  {idx + 1}.
                </span>
                <textarea
                  rows={2}
                  required
                  value={stmt}
                  onChange={(e) => handleIssueChange(idx, e.target.value)}
                  placeholder="State the legal issue question to analyze..."
                  className="flex-1 p-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 text-sm focus:ring-2 focus:ring-amber-500"
                />
                {issueStatements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveIssue(idx)}
                    className="p-2 text-slate-500 hover:text-rose-400 mt-1"
                    title="Remove Issue"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Source Documents for Grounding (Required)
            </label>
            <div className="max-h-56 overflow-y-auto space-y-1.5 p-3 rounded-lg bg-slate-950 border border-slate-800">
              {documents.map((doc) => (
                <label
                  key={doc.id}
                  className="flex items-center gap-2.5 text-xs text-slate-300 hover:bg-slate-900 p-2 rounded cursor-pointer"
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
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="font-medium text-slate-200">{doc.title}</span>
                  <span className="text-slate-500 text-[10px] ml-auto uppercase font-mono">
                    {doc.document_type?.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-800">
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
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
            <div>
              <h2 className="text-lg font-bold text-slate-100">{brief.title}</h2>
              <div className="text-xs text-slate-400">
                Created by {brief.created_by_name || 'Counsel'}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print / Export
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
