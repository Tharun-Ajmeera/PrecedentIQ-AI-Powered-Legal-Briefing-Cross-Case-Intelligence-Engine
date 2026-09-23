// client/src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Scale,
  FolderOpen,
  UploadCloud,
  Search,
  ShieldAlert,
  FileText,
  Columns,
  History,
  Settings,
  LogOut,
  Building,
  Shield,
  Sparkles,
} from 'lucide-react';

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const params = useParams();

  // Detect caseId either from useParams or from pathname /cases/:caseId
  const match = location.pathname.match(/\/cases\/([0-9a-fA-F-]+)/);
  const activeCaseId = params.caseId || (match ? match[1] : null);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'attorney':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-950/20';
      case 'compliance_officer':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40';
      case 'paralegal':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const navItemClass = ({ isActive }) =>
    `relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-all ${
      isActive
        ? 'bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/25 shadow-sm shadow-amber-950/20 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-amber-500 before:rounded-r'
        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/70 border border-transparent'
    }`;

  return (
    <aside className="w-64 flex-shrink-0 bg-[#070B14] border-r border-[#1E2B45] flex flex-col justify-between select-none">
      <div className="p-4 space-y-5">
        {/* Brand Logo & Executive Crest */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 flex items-center justify-center text-slate-950 shadow-md shadow-amber-900/30 border border-amber-400/40">
            <Scale className="w-5 h-5 text-slate-950 stroke-[2.2]" />
          </div>
          <div>
            <div className="font-serif font-bold text-slate-100 tracking-tight text-base flex items-center gap-1">
              <span>Precedent</span>
              <span className="text-amber-500 italic">IQ</span>
            </div>
            <div className="text-[9px] text-amber-400/80 tracking-widest uppercase font-semibold font-mono">
              Legal Intelligence Engine
            </div>
          </div>
        </div>

        {/* Firm Identity & Security Badge */}
        <div className="px-3.5 py-2.5 rounded-lg bg-[#0D1527] border border-[#1E2B45] flex items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-2.5 truncate min-w-0">
            <Building className="w-4 h-4 text-amber-500/80 flex-shrink-0" />
            <div className="truncate">
              <div className="text-xs font-semibold text-slate-200 truncate">
                {user?.firmName || 'Law Practice Workspace'}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 text-emerald-400" />
                <span>Isolated Multi-Tenant RLS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          <NavLink to="/dashboard" className={navItemClass}>
            <FolderOpen className="w-4 h-4 text-amber-500/80" />
            <span>Active Matters</span>
          </NavLink>

          {/* Matter Specific Tools */}
          {activeCaseId && (
            <div className="pt-3 pb-1 space-y-1">
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Matter Dossier</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              </div>

              <NavLink to={`/cases/${activeCaseId}`} end className={navItemClass}>
                <Scale className="w-4 h-4" />
                <span>Matter Workspace</span>
              </NavLink>

              <NavLink to={`/cases/${activeCaseId}/upload`} className={navItemClass}>
                <UploadCloud className="w-4 h-4" />
                <span>Ingest Documents</span>
              </NavLink>

              <NavLink to={`/cases/${activeCaseId}/research`} className={navItemClass}>
                <Search className="w-4 h-4" />
                <span>Precedent RAG Chat</span>
              </NavLink>

              <NavLink to={`/cases/${activeCaseId}/vulnerability`} className={navItemClass}>
                <ShieldAlert className="w-4 h-4" />
                <span>Vulnerability Detector</span>
              </NavLink>

              <NavLink to={`/cases/${activeCaseId}/brief/new`} className={navItemClass}>
                <FileText className="w-4 h-4" />
                <span>Trial Brief Builder</span>
              </NavLink>

              <NavLink to={`/cases/${activeCaseId}/clauses`} className={navItemClass}>
                <Columns className="w-4 h-4" />
                <span>Clause Matrix</span>
              </NavLink>

              {(user?.role === 'attorney' || user?.role === 'compliance_officer') && (
                <NavLink to={`/cases/${activeCaseId}/audit`} className={navItemClass}>
                  <History className="w-4 h-4" />
                  <span>Matter Audit Trail</span>
                </NavLink>
              )}
            </div>
          )}

          <div className="pt-3 pb-1 space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Practice Administration
            </div>

            <NavLink to="/settings" className={navItemClass}>
              <Settings className="w-4 h-4" />
              <span>Firm Settings & RBAC</span>
            </NavLink>
          </div>
        </nav>
      </div>

      {/* Executive User Session Footer */}
      <div className="p-3.5 border-t border-[#1E2B45] bg-[#070B14] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="truncate pr-2">
            <div className="text-xs font-semibold text-slate-200 truncate">{user?.fullName}</div>
            <div className="text-[10px] text-slate-400 truncate font-mono">{user?.email}</div>
          </div>
          <span
            className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getRoleBadgeColor(
              user?.role
            )}`}
          >
            {user?.role?.replace('_', ' ')}
          </span>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 border border-slate-800/80 hover:border-rose-900/50 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

