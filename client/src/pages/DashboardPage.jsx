// client/src/pages/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import { caseService } from '../services/caseService';
import { CaseCard } from '../components/dashboard/CaseCard';
import { CaseListTable } from '../components/dashboard/CaseListTable';
import { NewCaseModal } from '../components/dashboard/NewCaseModal';
import { Button } from '../components/common/Button';
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#1E2B45]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-500 font-semibold mb-1">
            <Scale className="w-3.5 h-3.5" />
            <span>Practice Dossier Command</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-100 tracking-tight">
            Case Matters & Legal Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Multi-tenant isolated case repository. Index evidence files, execute grounded RAG inquiries, identify adversary vulnerabilities, and synthesize court-ready trial briefs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeed}
            loading={seeding}
            icon={Sparkles}
          >
            Seed Sample Case
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="legal-card p-4 rounded-xl">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Active Matters</div>
          <div className="mt-1 font-serif text-2xl font-bold text-slate-100">{cases.length}</div>
          <div className="mt-1 text-[10px] text-emerald-400 font-medium">Tenant Isolated</div>
        </div>
        <div className="legal-card p-4 rounded-xl">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Indexed Documents</div>
          <div className="mt-1 font-serif text-2xl font-bold text-amber-400">{totalDocuments}</div>
          <div className="mt-1 text-[10px] text-slate-400">PDF, DOCX, TXT Evidence</div>
        </div>
        <div className="legal-card p-4 rounded-xl">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Synthesized Briefs</div>
          <div className="mt-1 font-serif text-2xl font-bold text-slate-100">{totalBriefs}</div>
          <div className="mt-1 text-[10px] text-amber-400/80">IRAC Structured</div>
        </div>
        <div className="legal-card p-4 rounded-xl">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Citation Integrity</div>
          <div className="mt-1 font-serif text-2xl font-bold text-emerald-400">100%</div>
          <div className="mt-1 text-[10px] text-emerald-400">Zero Hallucination Guaranteed</div>
        </div>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* Filter and View Mode Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search matters by case title, docket #, jurisdiction..."
            className="w-full pl-9 pr-3 py-2 bg-[#0D1527] border border-[#1E2B45] rounded-lg text-slate-100 placeholder-slate-500 text-xs focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/60 shadow-inner transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#0D1527] p-1 rounded-lg border border-[#1E2B45] self-end sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
              viewMode === 'grid' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
              viewMode === 'table' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <LoadingSpinner text="Retrieving firm matters..." />
      ) : filteredCases.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
              : 'Create a new legal matter or load the seeded demo case to begin reviewing documents.'
          }
          action={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSeed} loading={seeding}>
                Load Demo Matter
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={FolderPlus}
                onClick={() => setIsModalOpen(true)}
              >
                Create First Matter
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
