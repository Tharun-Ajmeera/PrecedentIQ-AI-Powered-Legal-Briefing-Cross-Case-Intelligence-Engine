// client/src/components/layout/TopNav.jsx
import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Sparkles, ChevronRight, Folder } from 'lucide-react';
import { Button } from '../common/Button';
import { caseService } from '../../services/caseService';

export function TopNav({ activeCase }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [seeding, setSeeding] = useState(false);

  const handleSeedDemo = async () => {
    try {
      setSeeding(true);
      const res = await caseService.seedDemoCase();
      if (res.case?.id) {
        navigate(`/cases/${res.case.id}`);
      } else if (res.caseId) {
        navigate(`/cases/${res.caseId}`);
      }
    } catch (err) {
      alert(err.message || 'Failed to seed demo matter');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <header className="h-16 px-6 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md flex items-center justify-between flex-shrink-0 z-20">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link to="/dashboard" className="hover:text-slate-200 transition-colors flex items-center gap-1.5 font-medium">
          <Folder className="w-4 h-4 text-amber-500" />
          <span>Matters</span>
        </Link>

        {activeCase && (
          <>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <span className="text-slate-200 font-semibold truncate max-w-md">
              {activeCase.title}
            </span>
            {activeCase.matter_number && (
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                {activeCase.matter_number}
              </span>
            )}
          </>
        )}
      </div>

      {/* Right status & quick actions */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Citation Verification Active</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSeedDemo}
          loading={seeding}
          icon={Sparkles}
        >
          Load Demo Matter
        </Button>
      </div>
    </header>
  );
}
