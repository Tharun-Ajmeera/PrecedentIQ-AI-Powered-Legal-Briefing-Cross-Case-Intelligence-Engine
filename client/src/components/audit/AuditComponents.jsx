// client/src/components/audit/AuditComponents.jsx
import React, { useState } from 'react';
import { History, ShieldCheck, Filter, User, Calendar, Tag, ShieldAlert } from 'lucide-react';

export function AuditFilterBar({ actions = [], selectedAction, onSelectAction }) {
  return (
    <div className="legal-card flex flex-wrap items-center gap-2 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/90 text-xs shadow-lg">
      <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px] uppercase tracking-wider mr-2">
        <Filter className="w-3.5 h-3.5 text-amber-500" />
        <span>Filter Operation:</span>
      </div>

      <button
        onClick={() => onSelectAction('')}
        className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-medium transition-all ${
          !selectedAction
            ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-950/40'
            : 'bg-slate-950/80 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
        }`}
      >
        ALL OPERATIONS
      </button>

      {actions.map((act) => (
        <button
          key={act}
          onClick={() => onSelectAction(act)}
          className={`px-3 py-1.5 rounded-lg font-mono text-[11px] transition-all uppercase ${
            selectedAction === act
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-950/40'
              : 'bg-slate-950/80 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          {act.replace(/_/g, ' ')}
        </button>
      ))}
    </div>
  );
}

export function AuditLogTable({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="legal-card p-12 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
        <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <p className="font-serif text-slate-300 font-medium">No audit entries found</p>
        <p className="text-xs text-slate-500 mt-1 font-mono">No compliance audit records recorded for this filter criteria.</p>
      </div>
    );
  }

  const formatActionColor = (action) => {
    if (action.includes('FINALIZED') || action.includes('SUCCESS')) {
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
    if (action.includes('DELETE')) {
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    }
    if (action.includes('QUERY') || action.includes('RESEARCH')) {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
    return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
  };

  return (
    <div className="legal-card overflow-x-auto rounded-2xl border border-slate-800/90 bg-slate-900/70 shadow-2xl relative">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-950/80 text-[11px] font-mono uppercase tracking-widest text-slate-400 border-b border-slate-800/90">
          <tr>
            <th className="py-3.5 px-4">Cryptographic Timestamp</th>
            <th className="py-3.5 px-4">Authorized Operator</th>
            <th className="py-3.5 px-4">Operation Event</th>
            <th className="py-3.5 px-4">Matter / Target</th>
            <th className="py-3.5 px-4">Payload Hash / Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-normal text-xs">
          {logs.map((log) => {
            const meta = typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata;
            return (
              <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap text-[11px]">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-serif font-semibold text-slate-200">{log.user_name || 'System Execution'}</div>
                  <div className="text-[10px] text-amber-500/80 font-mono uppercase">{log.user_role}</div>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span
                    className={`inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${formatActionColor(
                      log.action
                    )}`}
                  >
                    {log.action?.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-300 font-serif">
                  {log.case_title || meta?.caseTitle || 'Firm Wide System'}
                </td>
                <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 max-w-xs truncate">
                  {JSON.stringify(meta)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
