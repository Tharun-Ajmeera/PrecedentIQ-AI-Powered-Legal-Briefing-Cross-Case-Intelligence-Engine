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
  X,
} from 'lucide-react';

export function Sidebar({ mobileOpen = false, onCloseMobile }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const params = useParams();

  // Detect caseId either from useParams or from pathname /cases/:caseId
  const match = location.pathname.match(/\/cases\/([0-9a-fA-F-]+)/);
  const activeCaseId = params.caseId || (match ? match[1] : null);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'attorney':
        return 'Attorney / Partner';
      case 'compliance_officer':
        return 'Compliance Officer';
      case 'paralegal':
        return 'Paralegal';
      default:
        return role || 'Legal Counsel';
    }
  };

  const navItemClass = ({ isActive }) =>
    `relative flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium tracking-normal transition-colors select-none ${
      isActive
        ? 'bg-amber-500/10 text-amber-400 font-semibold before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:bg-amber-500 before:rounded-r'
        : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0F1728]'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      <div className="p-4 space-y-4 overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F1728] border border-[#1D2A40] flex items-center justify-center text-amber-500">
              <Scale className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <div className="font-serif font-bold text-[#F8FAFC] tracking-tight text-sm flex items-center gap-1">
                <span>Precedent</span>
                <span className="text-amber-500 font-sans font-bold">IQ</span>
              </div>
              <div className="text-[10px] text-[#64748B] font-mono tracking-wider uppercase">
                Legal Intelligence
              </div>
            </div>
          </div>

          {/* Close button for mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-md text-[#94A3B8] hover:text-white hover:bg-[#0F1728]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tenant Firm Workspace Card */}
        <div className="px-3 py-2 rounded-lg bg-[#0B1220] border border-[#1D2A40] flex items-center gap-2.5">
          <Building className="w-4 h-4 text-amber-500/80 flex-shrink-0" />
          <div className="truncate min-w-0">
            <div className="text-xs font-medium text-[#F8FAFC] truncate">
              {user?.firmName || 'Practice Workspace'}
            </div>
            <div className="text-[10px] text-[#64748B] flex items-center gap-1 font-mono">
              <Shield className="w-2.5 h-2.5 text-emerald-400" />
              <span>RLS Tenant Isolation</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-[#1D2A40]" />

        {/* Navigation Sections */}
        <nav className="space-y-4">
          {/* Master Practice Overview */}
          <div className="space-y-1">
            <NavLink to="/dashboard" className={navItemClass}>
              <FolderOpen className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>Practice Portfolio</span>
            </NavLink>
          </div>

          {/* Active Case Matters Navigation */}
          {activeCaseId && (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#64748B] flex items-center justify-between">
                <span>Case Matters</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </div>

              <NavLink to={`/cases/${activeCaseId}`} end className={navItemClass}>
                <Scale className="w-4 h-4 flex-shrink-0" />
                <span>Overview & Documents</span>
              </NavLink>

              <NavLink to={`/cases/${activeCaseId}/upload`} className={navItemClass}>
                <UploadCloud className="w-4 h-4 flex-shrink-0" />
                <span>Ingest Documents</span>
              </NavLink>

              <NavLink to={`/cases/${activeCaseId}/research`} className={navItemClass}>
                <Search className="w-4 h-4 flex-shrink-0" />
                <span>Precedent RAG</span>
              </NavLink>

              <NavLink to={`/cases/${activeCaseId}/vulnerability`} className={navItemClass}>
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>Vulnerability Detector</span>
              </NavLink>

              <NavLink to={`/cases/${activeCaseId}/brief/new`} className={navItemClass}>
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span>IRAC Brief Builder</span>
              </NavLink>

              <NavLink to={`/cases/${activeCaseId}/clauses`} className={navItemClass}>
                <Columns className="w-4 h-4 flex-shrink-0" />
                <span>Clause Matrix</span>
              </NavLink>

              {(user?.role === 'attorney' || user?.role === 'compliance_officer') && (
                <NavLink to={`/cases/${activeCaseId}/audit`} className={navItemClass}>
                  <History className="w-4 h-4 flex-shrink-0" />
                  <span>Audit Trail</span>
                </NavLink>
              )}
            </div>
          )}

          <div className="h-px bg-[#1D2A40]" />

          {/* Governance Section */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#64748B]">
              Governance
            </div>

            <NavLink to="/settings" className={navItemClass}>
              <Settings className="w-4 h-4 flex-shrink-0" />
              <span>Firm Settings & RBAC</span>
            </NavLink>
          </div>
        </nav>
      </div>

      {/* User Session Footer */}
      <div className="p-3 border-t border-[#1D2A40] bg-[#0B1220] space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="truncate min-w-0 pr-2">
            <div className="text-xs font-medium text-[#F8FAFC] truncate">{user?.fullName}</div>
            <div className="text-[10px] text-[#64748B] truncate font-mono">{user?.email}</div>
          </div>
          <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-[#0F1728] border border-[#1D2A40] text-amber-400 flex-shrink-0">
            {getRoleBadge(user?.role)}
          </span>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0F1728] border border-transparent hover:border-[#1D2A40] transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-[#060B16] border-r border-[#1D2A40] flex-col select-none">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative w-64 max-w-[80vw] bg-[#060B16] border-r border-[#1D2A40] flex flex-col z-50 shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

