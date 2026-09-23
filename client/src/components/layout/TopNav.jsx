// client/src/components/layout/TopNav.jsx
import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Sparkles, ChevronRight, Folder, Menu } from 'lucide-react';
import { caseService } from '../../services/caseService';

export function TopNav({ activeCase, onToggleMobileMenu }) {
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
    <header className="h-14 px-4 sm:px-6 border-b border-[#1D2A40] bg-[#060B16] flex items-center justify-between flex-shrink-0 z-20">
      {/* Breadcrumb Trail & Mobile Toggle */}
      <div className="flex items-center gap-2 text-xs text-[#94A3B8] min-w-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 rounded text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0F1728] mr-1"
            title="Toggle Menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <Link
          to="/dashboard"
          className="hover:text-amber-400 transition-colors flex items-center gap-1.5 font-medium flex-shrink-0"
        >
          <Folder className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">Practice Portfolio</span>
          <span className="sm:hidden">Portfolio</span>
        </Link>

        {activeCase && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-[#64748B] flex-shrink-0" />
            <div className="flex items-center gap-2 truncate min-w-0">
              <span className="font-serif text-[#F8FAFC] font-semibold text-xs sm:text-sm truncate">
                {activeCase.title}
              </span>
              {activeCase.matter_number && (
                <span className="hidden md:inline-block font-mono text-[10px] bg-[#0B1220] text-amber-400 px-2 py-0.5 rounded border border-[#1D2A40] flex-shrink-0">
                  {activeCase.matter_number}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Verification Status & Global Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0B1220] border border-[#1D2A40] text-xs font-mono text-[#94A3B8]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
          <span className="text-[11px] text-slate-300">Evidence Traceability Active</span>
        </div>

        <button
          onClick={handleSeedDemo}
          disabled={seeding}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 transition-colors cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{seeding ? 'Seeding...' : 'Load Sample Case'}</span>
        </button>
      </div>
    </header>
  );
}

