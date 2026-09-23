// client/src/pages/SettingsPage.jsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Building, ShieldCheck, UserCheck, Key, Database, Lock, Scale } from 'lucide-react';

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100 tracking-tight flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-amber-500" />
          <span>Firm Administration & RBAC Protocol</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-3xl">
          Review tenant data isolation boundaries, current authenticated counsel session, role-based access permissions, and cryptographic RLS safeguards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Firm Profile Card */}
        <div className="legal-card p-6 rounded-2xl space-y-5">
          <div className="flex items-center gap-3 pb-3.5 border-b border-[#1D2A40]">
            <Building className="w-5 h-5 text-amber-500" />
            <h2 className="font-serif font-semibold text-slate-100 text-base">Tenant Firm Entity</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-400 uppercase tracking-wider block font-mono text-[10px] mb-1">
                Firm Organization
              </span>
              <div className="text-base font-serif font-semibold text-slate-100">{user?.firmName}</div>
            </div>

            <div>
              <span className="text-slate-400 uppercase tracking-wider block font-mono text-[10px] mb-1">
                Tenant Firm ID (UUID)
              </span>
              <div className="font-mono text-slate-400 bg-[#0B1220] p-2.5 rounded-lg border border-[#1D2A40] text-[11px] select-all">
                {user?.firmId}
              </div>
            </div>

            <div>
              <span className="text-slate-400 uppercase tracking-wider block font-mono text-[10px] mb-1">
                Data Isolation Layer
              </span>
              <div className="text-emerald-400 font-mono text-xs flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>PostgreSQL Row Level Security (RLS) Enforced</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current User Profile Card */}
        <div className="legal-card p-6 rounded-2xl space-y-5">
          <div className="flex items-center gap-3 pb-3.5 border-b border-[#1D2A40]">
            <UserCheck className="w-5 h-5 text-amber-500" />
            <h2 className="font-serif font-semibold text-slate-100 text-base">Active Session Profile</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-400 uppercase tracking-wider block font-mono text-[10px] mb-1">
                Counsel / User Full Name
              </span>
              <div className="text-base font-serif font-semibold text-slate-100">{user?.fullName}</div>
            </div>

            <div>
              <span className="text-slate-400 uppercase tracking-wider block font-mono text-[10px] mb-1">
                Authenticated Corporate Email
              </span>
              <div className="text-xs font-mono text-slate-300 bg-[#0B1220] p-2.5 rounded-lg border border-[#1D2A40]">
                {user?.email}
              </div>
            </div>

            <div>
              <span className="text-slate-400 uppercase tracking-wider block font-mono text-[10px] mb-1">
                Assigned Role Authority
              </span>
              <span className="inline-block px-2.5 py-1 rounded text-xs font-mono font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RBAC Privileges Matrix */}
      <div className="legal-card p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-3 pb-3.5 border-b border-[#1D2A40]">
          <Lock className="w-5 h-5 text-amber-500" />
          <h2 className="font-serif font-semibold text-slate-100 text-base">Role-Based Access Control (RBAC) Authority Matrix</h2>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#1D2A40]">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B1220] text-slate-400 uppercase tracking-wider font-mono text-[11px] border-b border-[#1D2A40]">
              <tr>
                <th className="py-3 px-4">System Operation Permission</th>
                <th className="py-3 px-4 text-center">Attorney</th>
                <th className="py-3 px-4 text-center">Paralegal</th>
                <th className="py-3 px-4 text-center">Compliance Officer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2A40] font-sans">
              <tr>
                <td className="py-3 px-4 font-medium text-slate-200">Matter & Document Upload / Vector Ingestion</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold font-mono text-sm">✓</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold font-mono text-sm">✓</td>
                <td className="py-3 px-4 text-center text-slate-600 font-mono">—</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-200">RAG Semantic Research & Evidence Cross-Examination</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold font-mono text-sm">✓</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold font-mono text-sm">✓</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold font-mono text-sm">✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-200">Adversarial Vulnerability Detector & Clause Matrix</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold font-mono text-sm">✓</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold font-mono text-sm">✓</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold font-mono text-sm">✓</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-slate-200">Trial Brief Synthesis & Draft Section Editing</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold font-mono text-sm">✓</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold font-mono text-sm">✓</td>
                <td className="py-3 px-4 text-center text-slate-600 font-mono">—</td>
              </tr>
              <tr className="bg-amber-500/5">
                <td className="py-3 px-4 font-medium text-amber-300">Finalize & Certify Court Trial Briefs</td>
                <td className="py-3 px-4 text-center text-amber-400 font-bold font-mono text-xs">✓ (Exclusive)</td>
                <td className="py-3 px-4 text-center text-rose-500 font-bold font-mono text-xs">✕ (403)</td>
                <td className="py-3 px-4 text-center text-rose-500 font-bold font-mono text-xs">✕ (403)</td>
              </tr>
              <tr className="bg-amber-500/5">
                <td className="py-3 px-4 font-medium text-amber-300">Delete Matters or Certified Evidentiary Documents</td>
                <td className="py-3 px-4 text-center text-amber-400 font-bold font-mono text-xs">✓ (Exclusive)</td>
                <td className="py-3 px-4 text-center text-rose-500 font-bold font-mono text-xs">✕ (403)</td>
                <td className="py-3 px-4 text-center text-rose-500 font-bold font-mono text-xs">✕ (403)</td>
              </tr>
              <tr className="bg-blue-500/5">
                <td className="py-3 px-4 font-medium text-blue-300">Inspect Forensic Audit Log & Chain of Custody</td>
                <td className="py-3 px-4 text-center text-blue-400 font-bold font-mono text-xs">✓</td>
                <td className="py-3 px-4 text-center text-rose-500 font-bold font-mono text-xs">✕ (403)</td>
                <td className="py-3 px-4 text-center text-blue-400 font-bold font-mono text-xs">✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
