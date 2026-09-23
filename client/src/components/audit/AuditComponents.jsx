// client/src/components/audit/AuditComponents.jsx
import React, { useState } from 'react';
import { History, ShieldCheck, Filter, User, Calendar, Tag } from 'lucide-react';

export function AuditFilterBar({ actions = [], selectedAction, onSelectAction }) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
      <div className="flex items-center gap-1.5 text-slate-400 font-semibold mr-2">
        <Filter className="w-3.5 h-3.5 text-amber-500" />
        <span>Filter Action:</span>
      </div>

      <button
        onClick={() => onSelectAction('')}
        className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
          !selectedAction
            ? 'bg-amber-500 text-slate-950 font-semibold'
            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
        }`}
      >
        All Actions
      </button>

      {actions.map((act) => (
        <button
          key={act}
          onClick={() => onSelectAction(act)}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
            selectedAction === act
              ? 'bg-amber-500 text-slate-950 font-semibold'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
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
      <div className="p-8 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
        No compliance audit records found for this scope.
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
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow-xl">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-900/90 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
          <tr>
            <th className="py-3 px-4">Timestamp</th>
            <th className="py-3 px-4">User</th>
            <th className="py-3 px-4">Action</th>
            <th className="py-3 px-4">Matter / Target</th>
            <th className="py-3 px-4">Metadata Payload</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/80 font-normal text-xs">
          {logs.map((log) => {
            const meta = typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata;
            return (
              <tr key={log.id} className="hover:bg-slate-850/50 transition-colors">
                <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-200">{log.user_name || 'System'}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{log.user_role}</div>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span
                    className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${formatActionColor(
                      log.action
                    )}`}
                  >
                    {log.action?.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-300">
                  {log.case_title || meta?.caseTitle || '—'}
                </td>
                <td className="py-3 px-4 font-mono text-[11px] text-slate-400 max-w-xs truncate">
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
