// client/src/components/layout/TopNav.jsx
import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Sparkles, ChevronRight, Folder, Scale } from 'lucide-react';
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
    <header className="h-16 px-6 border-b border-[#1E2B45] bg-[#070B14]/80 backdrop-blur-md flex items-center justify-between flex-shrink-0 z-20">
      {/* Executive Breadcrumb Trail */}
      <div className="flex items-center gap-2.5 text-xs text-slate-400">
        <Link to="/dashboard" className="hover:text-amber-400 transition-colors flex items-center gap-1.5 font-medium tracking-wide">
          <Folder className="w-3.5 h-3.5 text-amber-500" />
          <span>Practice Portfolio</span>
        </Link>

        {activeCase && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <div className="flex items-center gap-2 max-w-xl truncate">
              <span className="font-serif text-slate-100 font-semibold text-sm truncate tracking-tight">
                {activeCase.title}
              </span>
              {activeCase.matter_number && (
                <span className="font-mono text-[10px] bg-[#0D1527] text-amber-400/90 px-2 py-0.5 rounded border border-amber-500/25 tracking-wider">
                  {activeCase.matter_number}
                </span>
              )}
              {activeCase.jurisdiction && (
                <span className="text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  {activeCase.jurisdiction}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Security Status & Global Actions */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs font-medium shadow-sm shadow-emerald-950/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono text-[11px] tracking-tight">Zero-Hallucination Engine: ACTIVE</span>
        </div>

        <button
          onClick={handleSeedDemo}
          disabled={seeding}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 shadow-sm shadow-amber-950/30 transition-all cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{seeding ? 'Seeding...' : 'Load Sample Case'}</span>
        </button>
      </div>
    </header>
  );
}

