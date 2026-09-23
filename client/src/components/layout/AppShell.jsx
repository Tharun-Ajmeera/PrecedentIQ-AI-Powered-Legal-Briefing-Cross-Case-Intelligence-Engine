// client/src/components/layout/AppShell.jsx
import React, { useEffect, useState } from 'react';
import { Outlet, useParams, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { caseService } from '../../services/caseService';

export function AppShell() {
  const params = useParams();
  const location = useLocation();
  const match = location.pathname.match(/\/cases\/([0-9a-fA-F-]+)/);
  const caseId = params.caseId || (match ? match[1] : null);

  const [activeCase, setActiveCase] = useState(null);

  useEffect(() => {
    if (caseId) {
      caseService
        .getCase(caseId)
        .then((c) => setActiveCase(c))
        .catch(() => setActiveCase(null));
    } else {
      setActiveCase(null);
    }
  }, [caseId]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav activeCase={activeCase} />
        <main className="flex-1 overflow-y-auto bg-slate-900/30">
          <Outlet context={{ activeCase, refreshCase: () => caseId && caseService.getCase(caseId).then(setActiveCase) }} />
        </main>
      </div>
    </div>
  );
}
