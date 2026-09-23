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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Case Matters & Legal Dossiers
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize documents, execute grounded RAG inquiries, detect adversary vulnerabilities, and synthesize trial briefs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeed}
            loading={seeding}
            icon={Sparkles}
          >
            Seed Demo Matter
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

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {/* Filter and View Mode Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search matters by title or number..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 text-xs focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded text-xs transition-colors ${
              viewMode === 'grid' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded text-xs transition-colors ${
              viewMode === 'table' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-slate-200'
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
