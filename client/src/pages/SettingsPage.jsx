// client/src/pages/SettingsPage.jsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Building, ShieldCheck, UserCheck, Key, Database, Lock, Scale } from 'lucide-react';

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-amber-500" />
          <span>Firm Settings & RBAC Governance</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review tenant isolation policies, active firm profile, user role privileges, and cryptographic compliance safeguards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Firm Profile Card */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <Building className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-slate-100 text-sm">Tenant Firm Entity</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 uppercase tracking-wider block font-semibold mb-0.5">
                Firm Organization Name
              </span>
              <div className="text-sm font-medium text-slate-200">{user?.firmName}</div>
            </div>

            <div>
              <span className="text-slate-500 uppercase tracking-wider block font-semibold mb-0.5">
                Tenant Firm ID (UUID)
              </span>
              <div className="font-mono text-slate-400 bg-slate-950 p-2 rounded border border-slate-800">
                {user?.firmId}
              </div>
            </div>

            <div>
              <span className="text-slate-500 uppercase tracking-wider block font-semibold mb-0.5">
                Data Isolation Layer
              </span>
              <div className="text-emerald-400 font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>PostgreSQL Row Level Security (RLS) Enforced</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current User Profile Card */}
        <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <UserCheck className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-slate-100 text-sm">Active Session Profile</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 uppercase tracking-wider block font-semibold mb-0.5">
                User Full Name
              </span>
              <div className="text-sm font-medium text-slate-200">{user?.fullName}</div>
            </div>

            <div>
              <span className="text-slate-500 uppercase tracking-wider block font-semibold mb-0.5">
                Email Address
              </span>
              <div className="text-sm text-slate-300">{user?.email}</div>
            </div>

            <div>
              <span className="text-slate-500 uppercase tracking-wider block font-semibold mb-0.5">
                Assigned Role
              </span>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RBAC Privileges Matrix */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <Lock className="w-5 h-5 text-amber-500" />
          <h2 className="font-semibold text-slate-100 text-sm">Role-Based Access Control (RBAC) Matrix</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">System Permission</th>
                <th className="py-2.5 px-3 text-center">Attorney</th>
                <th className="py-2.5 px-3 text-center">Paralegal</th>
                <th className="py-2.5 px-3 text-center">Compliance Officer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-200">Matter & Document Upload / Ingestion</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-slate-500">—</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-200">RAG Research & Fact Cross-Examination</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">✓</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-200">Vulnerability Detector & Clause Matrix</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">✓</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium text-slate-200">Trial Brief Synthesis & Draft Editing</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-slate-500">—</td>
              </tr>
              <tr className="bg-amber-950/20">
                <td className="py-2.5 px-3 font-semibold text-amber-300">Finalize & Lock Court Trial Briefs</td>
                <td className="py-2.5 px-3 text-center text-amber-400 font-bold">✓ (Exclusive)</td>
                <td className="py-2.5 px-3 text-center text-rose-500 font-bold">✕ (403)</td>
                <td className="py-2.5 px-3 text-center text-rose-500 font-bold">✕ (403)</td>
              </tr>
              <tr className="bg-amber-950/20">
                <td className="py-2.5 px-3 font-semibold text-amber-300">Delete Matters or Documents</td>
                <td className="py-2.5 px-3 text-center text-amber-400 font-bold">✓ (Exclusive)</td>
                <td className="py-2.5 px-3 text-center text-rose-500 font-bold">✕ (403)</td>
                <td className="py-2.5 px-3 text-center text-rose-500 font-bold">✕ (403)</td>
              </tr>
              <tr className="bg-blue-950/20">
                <td className="py-2.5 px-3 font-semibold text-blue-300">View Compliance Audit Log & Chain of Custody</td>
                <td className="py-2.5 px-3 text-center text-blue-400 font-bold">✓</td>
                <td className="py-2.5 px-3 text-center text-rose-500 font-bold">✕ (403)</td>
                <td className="py-2.5 px-3 text-center text-blue-400 font-bold">✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
