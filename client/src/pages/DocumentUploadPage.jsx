// client/src/pages/DocumentUploadPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { documentService } from '../services/documentService';
import { DocumentUploadForm } from '../components/documents/DocumentUploadForm';
import { DocumentList } from '../components/documents/DocumentList';
import { ChevronLeft, UploadCloud, ShieldCheck } from 'lucide-react';

export function DocumentUploadPage() {
  const { caseId } = useParams();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const docs = await documentService.listDocuments(caseId);
      setDocuments(docs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [caseId]);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Link
          to={`/cases/${caseId}`}
          className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Matter Workspace</span>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-serif font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
          <UploadCloud className="w-6 h-6 text-amber-500" />
          <span>Document Ingestion & Vector Indexing</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Upload court filings, precedents, agreements, and witness transcripts. Our ingestion pipeline preserves exact page boundaries and generates 768-dim embeddings for evidence-grounded retrieval and page-level citation verification.
        </p>
      </div>

      {/* Upload Form */}
      <DocumentUploadForm
        caseId={caseId}
        onUploadSuccess={() => {
          fetchDocs();
        }}
      />

      {/* Recently Uploaded Documents */}
      <div className="space-y-3 pt-4">
        <h2 className="text-base font-semibold text-slate-100">
          Indexed Documents in this Matter ({documents.length})
        </h2>
        <DocumentList
          documents={documents}
          caseId={caseId}
          onUpdate={(updated) => {
            setDocuments((prev) => prev.map((d) => (d.id === updated.id ? { ...d, ...updated } : d)));
          }}
          onDelete={(docId) => setDocuments((prev) => prev.filter((d) => d.id !== docId))}
        />
      </div>
    </div>
  );
}
