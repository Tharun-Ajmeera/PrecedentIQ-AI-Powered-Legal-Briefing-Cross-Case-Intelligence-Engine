// client/src/components/documents/DocumentComponents.jsx
import React, { useState } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Scale,
  BookOpen,
  FileSpreadsheet,
  Users,
  Shield,
  Download,
  Trash2,
} from 'lucide-react';
import { Button } from '../common/Button';
import { ErrorBanner } from '../common/ErrorBanner';
import { documentService } from '../../services/documentService';
import { useAuth } from '../../hooks/useAuth';

export function DocumentTypeBadge({ type }) {
  const configs = {
    case_file: { label: 'Case File', color: 'bg-slate-800 text-slate-300 border-slate-700', icon: FileText },
    judicial_opinion: { label: 'Judicial Opinion', color: 'bg-amber-950/60 text-amber-400 border-amber-800/60', icon: Scale },
    deposition_transcript: { label: 'Deposition', color: 'bg-purple-950/60 text-purple-400 border-purple-800/60', icon: Users },
    contract: { label: 'Contract / Agreement', color: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60', icon: FileCheck },
    opposing_filing: { label: 'Opposing Filing', color: 'bg-rose-950/60 text-rose-400 border-rose-800/60', icon: Shield },
    statute_regulation: { label: 'Statute / Reg', color: 'bg-blue-950/60 text-blue-400 border-blue-800/60', icon: BookOpen },
  };

  const config = configs[type] || configs.case_file;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </span>
  );
}

export function IngestionStatusIndicator({ status, chunkCount }) {
  switch (status) {
    case 'completed':
      return (
        <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium" title="Indexed with embeddings">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Indexed ({chunkCount || 0} chunks)</span>
        </div>
      );
    case 'processing':
      return (
        <div className="flex items-center gap-1 text-amber-400 text-xs font-medium animate-pulse">
          <Clock className="w-3.5 h-3.5 animate-spin" />
          <span>Extracting text & vectors...</span>
        </div>
      );
    case 'failed':
      return (
        <div className="flex items-center gap-1 text-rose-400 text-xs font-medium">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Ingestion Failed</span>
        </div>
      );
    default:
      return (
        <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>Pending</span>
        </div>
      );
  }
}

export function DocumentUploadForm({ caseId, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('case_file');
  const [jurisdiction, setJurisdiction] = useState('');
  const [confidentialityTag, setConfidentialityTag] = useState('privileged');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
      if (!title) {
        // Strip extension for default title
        const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
        setTitle(baseName);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a document to upload (PDF, DOCX, or TXT).');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('documentType', documentType);
      formData.append('document_type', documentType);
      if (jurisdiction) formData.append('jurisdiction', jurisdiction);
      formData.append('confidentialityTag', confidentialityTag);

      const result = await documentService.uploadDocument(caseId, formData);
      setFile(null);
      setTitle('');
      setJurisdiction('');
      const fileInput = document.getElementById('file-upload-input');
      if (fileInput) fileInput.value = '';
      if (onUploadSuccess) onUploadSuccess(result.document);
    } catch (err) {
      setError(err.message || 'Document upload and indexing failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="legal-card p-6 rounded-2xl space-y-5">
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* Luxury Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
        }}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-amber-500 bg-amber-500/10'
            : file
            ? 'border-emerald-500/60 bg-emerald-950/20'
            : 'border-[#1E2B45] hover:border-amber-500/50 bg-[#070B14]/70 hover:bg-[#0D1527]'
        }`}
        onClick={() => document.getElementById('file-upload-input').click()}
      >
        <input
          id="file-upload-input"
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files[0])}
        />
        <UploadCloud className="w-10 h-10 mx-auto text-amber-500 mb-2 stroke-[1.8]" />
        {file ? (
          <div>
            <div className="font-serif font-bold text-slate-100 text-base">{file.name}</div>
            <div className="text-xs text-emerald-400 font-mono mt-1">
              {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for ingestion & vector indexing
            </div>
          </div>
        ) : (
          <div>
            <div className="text-sm font-semibold text-slate-200">
              Select or drag and drop legal evidence document
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Supports court PDF, Word DOCX, and TXT files (Max 50MB)
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
            Document Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Master Services Agreement (2023)"
            className="w-full px-3.5 py-2 bg-[#0D1527] border border-[#1E2B45] rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/60 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
            Document Category *
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full px-3.5 py-2 bg-[#0D1527] border border-[#1E2B45] rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/60 transition-all cursor-pointer"
          >
            <option value="case_file">📁 Case File (General Materials)</option>
            <option value="judicial_opinion">⚖️ Judicial Opinion (Precedent)</option>
            <option value="deposition_transcript">👥 Deposition Transcript (Testimony)</option>
            <option value="contract">📜 Contract / Commercial Agreement</option>
            <option value="opposing_filing">🛡️ Opposing Filing (Adversary Motion/Brief)</option>
            <option value="statute_regulation">📖 Statute / Regulatory Code</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
            Jurisdiction / Venue (Optional)
          </label>
          <input
            type="text"
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
            placeholder="e.g. Delaware Chancery Court, 9th Cir."
            className="w-full px-3.5 py-2 bg-[#0D1527] border border-[#1E2B45] rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/60 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
            Confidentiality Designation
          </label>
          <select
            value={confidentialityTag}
            onChange={(e) => setConfidentialityTag(e.target.value)}
            className="w-full px-3.5 py-2 bg-[#0D1527] border border-[#1E2B45] rounded-lg text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/60 transition-all cursor-pointer"
          >
            <option value="privileged">Attorney-Client Privileged</option>
            <option value="work_product">Attorney Work Product</option>
            <option value="public_record">Public Record / Judicial Docket</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-3 border-t border-[#1E2B45]">
        <Button type="submit" variant="primary" loading={uploading} icon={UploadCloud}>
          Upload & Index for RAG
        </Button>
      </div>
    </form>
  );
}

export function DocumentList({ documents, onDelete, onUpdate, caseId }) {
  const { user } = useAuth();

  if (!documents || documents.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-[#070B14]/60 rounded-xl border border-dashed border-[#1E2B45]">
        No legal documents have been ingested into this matter yet.
      </div>
    );
  }

  const handleTypeChange = async (doc, newType) => {
    try {
      await documentService.updateDocument(caseId || doc.case_id, doc.id, { documentType: newType });
      if (onUpdate) {
        onUpdate({ ...doc, document_type: newType });
      }
    } catch (err) {
      alert('Failed to update category: ' + (err.message || 'Error'));
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-[#1E2B45] bg-[#0D1527]/90 shadow-lg">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-[#070B14] text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 border-b border-[#1E2B45]">
          <tr>
            <th className="py-3.5 px-4">Title</th>
            <th className="py-3.5 px-4">Category</th>
            <th className="py-3.5 px-4">Jurisdiction</th>
            <th className="py-3.5 px-4">Designation</th>
            <th className="py-3.5 px-4">Pages</th>
            <th className="py-3.5 px-4">Ingestion Status</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1E2B45]/80">
          {documents.map((doc) => (
            <tr key={doc.id} className="hover:bg-[#131C31]/60 transition-colors">
              <td className="py-3.5 px-4 font-serif font-medium text-slate-100 flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-amber-500/80 flex-shrink-0" />
                <span className="truncate max-w-xs">{doc.title}</span>
              </td>
              <td className="py-3 px-4">
                <select
                  value={doc.document_type || 'case_file'}
                  onChange={(e) => handleTypeChange(doc, e.target.value)}
                  className="bg-[#070B14] border border-[#1E2B45] rounded-lg px-2.5 py-1 text-xs text-amber-400/90 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer hover:border-amber-500/50 transition-colors"
                  title="Click to change document category"
                >
                  <option value="case_file">📁 Case File (General)</option>
                  <option value="judicial_opinion">⚖️ Judicial Opinion</option>
                  <option value="deposition_transcript">👥 Deposition</option>
                  <option value="contract">📜 Contract / Agreement</option>
                  <option value="opposing_filing">🛡️ Opposing Filing</option>
                  <option value="statute_regulation">📖 Statute / Regulation</option>
                </select>
              </td>
              <td className="py-3 px-4 text-xs text-slate-400">
                {doc.jurisdiction || '—'}
              </td>
              <td className="py-3 px-4 text-[11px] font-mono uppercase text-slate-400">
                <span className="px-2 py-0.5 rounded bg-[#070B14] border border-[#1E2B45] text-slate-300">
                  {doc.confidentiality_tag?.replace('_', ' ')}
                </span>
              </td>
              <td className="py-3 px-4 text-xs text-slate-300 font-mono">
                {doc.page_count} pg{doc.page_count !== 1 ? 's' : ''}
              </td>
              <td className="py-3 px-4">
                <IngestionStatusIndicator
                  status={doc.ingestion_status}
                  chunkCount={doc.chunk_count}
                />
              </td>
              <td className="py-3 px-4 text-right space-x-2">
                {user?.role === 'attorney' && onDelete && (
                  <button
                    onClick={() => {
                      if (confirm(`Delete document "${doc.title}"?`)) onDelete(doc.id);
                    }}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
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
