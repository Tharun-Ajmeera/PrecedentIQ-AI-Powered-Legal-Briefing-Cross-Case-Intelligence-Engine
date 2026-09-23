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
  UserCheck,
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
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'compliance_officer':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'paralegal':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
    }`;

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between select-none">
      <div className="p-4 space-y-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-950/40">
            <Scale className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
              <span>Precedent</span>
              <span className="text-amber-500">IQ</span>
            </div>
            <div className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">
              Legal Briefing Engine
            </div>
          </div>
        </div>

        {/* Firm Identity */}
        <div className="px-3 py-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60 flex items-center gap-2.5">
          <Building className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <div className="truncate">
            <div className="text-xs font-semibold text-slate-200 truncate">
              {user?.firmName || 'Law Firm Workspace'}
            </div>
            <div className="text-[10px] text-slate-500 truncate">Tenant Scoped</div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1">
          <NavLink to="/dashboard" className={navItemClass}>
            <FolderOpen className="w-4 h-4 text-amber-500/80" />
            <span>Case Matters</span>
          </NavLink>

          {/* Case-specific links when inside an active case */}
          {activeCaseId && (
            <div className="pt-3 pb-1 space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Active Matter Workspace
              </div>

              <NavLink to={`/cases/${activeCaseId}`} end className={navItemClass}>
                <Scale className="w-4 h-4" />
                <span>Overview & Docs</span>
              </NavLink>

              <NavLink to={`/cases/${activeCaseId}/upload`} className={navItemClass}>
                <UploadCloud className="w-4 h-4" />
                <span>Ingest Documents</span>
              </NavLink>

              <NavLink to={`/cases/${activeCaseId}/research`} className={navItemClass}>
                <Search className="w-4 h-4" />
                <span>RAG Research Chat</span>
              </NavLink>

              <NavLink to={`/cases/${activeCaseId}/vulnerability`} className={navItemClass}>
                <ShieldAlert className="w-4 h-4" />
                <span>Vulnerability Detector</span>
              </NavLink>

              <NavLink to={`/cases/${activeCaseId}/brief/new`} className={navItemClass}>
                <FileText className="w-4 h-4" />
                <span>IRAC Brief Builder</span>
              </NavLink>

              <NavLink to={`/cases/${activeCaseId}/clauses`} className={navItemClass}>
                <Columns className="w-4 h-4" />
                <span>Clause Matrix</span>
              </NavLink>

              {(user?.role === 'attorney' || user?.role === 'compliance_officer') && (
                <NavLink to={`/cases/${activeCaseId}/audit`} className={navItemClass}>
                  <History className="w-4 h-4" />
                  <span>Audit Trail</span>
                </NavLink>
              )}
            </div>
          )}

          <div className="pt-3 pb-1 space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Governance
            </div>

            <NavLink to="/settings" className={navItemClass}>
              <Settings className="w-4 h-4" />
              <span>Firm Settings & RBAC</span>
            </NavLink>
          </div>
        </nav>
      </div>

      {/* User Session Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="truncate pr-2">
            <div className="text-xs font-semibold text-slate-200 truncate">{user?.fullName}</div>
            <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
          </div>
          <span
            className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getRoleBadgeColor(
              user?.role
            )}`}
          >
            {user?.role?.replace('_', ' ')}
          </span>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-900/50 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
