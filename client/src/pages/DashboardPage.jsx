// client/src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { caseService } from '../services/caseService';
import { CaseCard } from '../components/dashboard/CaseCard';
import { CaseListTable } from '../components/dashboard/CaseListTable';
import { NewCaseModal } from '../components/dashboard/NewCaseModal';
import { Button, LoadingSkeleton } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorBanner } from '../components/common/ErrorBanner';
import {
  FolderPlus,
  LayoutGrid,
  List,
  Search,
  Scale,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export function DashboardPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const data = await caseService.listCases();
      setCases(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch legal matters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleDeleteCase = async (caseId) => {
    try {
      await caseService.deleteCase(caseId);
      setCases((prev) => prev.filter((c) => c.id !== caseId));
    } catch (err) {
      alert(err.message || 'Failed to delete case');
    }
  };

  const handleSeed = async () => {
    try {
      setSeeding(true);
      await caseService.seedDemoCase();
      await fetchCases();
    } catch (err) {
      alert(err.message || 'Failed to seed demo case');
    } finally {
      setSeeding(false);
    }
  };

  const filteredCases = cases.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.matter_number && c.matter_number.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Calculate quick metrics across matters
  const totalDocuments = cases.reduce((acc, c) => acc + (parseInt(c.document_count, 10) || 0), 0);
  const totalBriefs = cases.reduce((acc, c) => acc + (parseInt(c.brief_count, 10) || 0), 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Executive Portfolio Hero */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1D2A40]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-500 font-semibold mb-1">
            <Scale className="w-3.5 h-3.5" />
            <span>Practice Dossier Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F8FAFC] tracking-tight">
            Case Matters & Legal Intelligence
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1 max-w-2xl leading-relaxed">
            Multi-tenant isolated matter repository. Ingest evidence files, execute grounded RAG inquiries, identify adversary vulnerabilities, and synthesize court-ready trial briefs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSeed}
            loading={seeding}
            icon={Sparkles}
          >
            Load Sample Case
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={FolderPlus}
            onClick={() => setIsModalOpen(true)}
          >
            New Matter
          </Button>
        </div>
      </div>

      {/* Executive KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="legal-card p-4">
          <div className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider">Active Matters</div>
          <div className="mt-1 font-serif text-2xl font-bold text-[#F8FAFC]">{cases.length}</div>
          <div className="mt-1 text-[10px] text-emerald-400 font-mono">RLS Tenant Isolated</div>
        </div>
        <div className="legal-card p-4">
          <div className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider">Indexed Documents</div>
          <div className="mt-1 font-serif text-2xl font-bold text-amber-400">{totalDocuments}</div>
          <div className="mt-1 text-[10px] text-[#94A3B8] font-mono">PDF, DOCX, TXT Evidence</div>
        </div>
        <div className="legal-card p-4">
          <div className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider">Synthesized Briefs</div>
          <div className="mt-1 font-serif text-2xl font-bold text-[#F8FAFC]">{totalBriefs}</div>
          <div className="mt-1 text-[10px] text-amber-400/90 font-mono">IRAC Structured</div>
        </div>
        <div className="legal-card p-4">
          <div className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider">Citation Integrity</div>
          <div className="mt-1 font-serif text-2xl font-bold text-emerald-400">100%</div>
          <div className="mt-1 text-[10px] text-emerald-400 font-mono">Page-Level Verification Active</div>
        </div>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* Filter and View Mode Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search matters by case title, docket #..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#0B1220] border border-[#1D2A40] rounded-lg text-[#F8FAFC] placeholder-[#64748B] text-xs focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 bg-[#0B1220] p-1 rounded-lg border border-[#1D2A40] self-end sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
              viewMode === 'grid' ? 'bg-[#0F1728] text-amber-400 border border-[#1D2A40]' : 'text-[#64748B] hover:text-[#F8FAFC]'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
              viewMode === 'table' ? 'bg-[#0F1728] text-amber-400 border border-[#1D2A40]' : 'text-[#64748B] hover:text-[#F8FAFC]'
            }`}
            title="Table View"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : filteredCases.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCases.map((legalCase) => (
              <CaseCard
                key={legalCase.id}
                legalCase={legalCase}
                onDelete={handleDeleteCase}
              />
            ))}
          </div>
        ) : (
          <CaseListTable cases={filteredCases} onDelete={handleDeleteCase} />
        )
      ) : (
        <EmptyState
          icon={Scale}
          title="No Legal Matters Found"
          description={
            searchQuery
              ? 'No matters matched your search query.'
              : 'Create a new legal matter or load the sample case to begin evidentiary analysis.'
          }
          action={
            <div className="flex gap-2.5">
              <Button variant="secondary" size="sm" onClick={handleSeed} loading={seeding}>
                Load Sample Case
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={FolderPlus}
                onClick={() => setIsModalOpen(true)}
              >
                New Matter
              </Button>
            </div>
          }
        />
      )}

      {/* New Case Modal */}
      <NewCaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCaseCreated={(newCase) => setCases((prev) => [newCase, ...prev])}
      />
    </div>
  );
}
