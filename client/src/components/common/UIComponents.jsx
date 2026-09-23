// client/src/components/common/UIComponents.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  icon: Icon,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer select-none';

  const variants = {
    primary: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold shadow-sm',
    secondary: 'bg-[#0F1728] hover:bg-[#121B2D] text-[#F8FAFC] border border-[#1D2A40] hover:border-[#2D3D5E]',
    outline: 'border border-amber-500/40 hover:border-amber-400 text-amber-400 hover:bg-amber-500/10',
    danger: 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 border border-rose-800/80',
    ghost: 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0F1728]',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 font-sans',
    md: 'text-xs sm:text-sm px-3.5 py-2 gap-2 font-sans',
    lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5 font-sans',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      ) : null}
      {children}
    </button>
  );
}

// Loading Skeleton Components
export function LoadingSkeleton({ type = 'card', count = 1, className = '' }) {
  const items = Array.from({ length: count });

  if (type === 'row') {
    return (
      <div className={`space-y-2 ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="h-11 rounded-lg skeleton-shimmer border border-[#1D2A40]/60" />
        ))}
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="h-4 rounded skeleton-shimmer" style={{ width: `${80 - i * 15}%` }} />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {items.map((_, i) => (
        <div key={i} className="h-40 rounded-xl skeleton-shimmer border border-[#1D2A40]" />
      ))}
    </div>
  );
}

export function LoadingSpinner({ size = 'md', text = 'Retrieving evidence records...' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-[#94A3B8] gap-3">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-amber-500`} />
      {text && <span className="text-xs font-mono text-[#94A3B8] tracking-wider">{text}</span>}
    </div>
  );
}

export function StatusBadge({ status, label }) {
  const configs = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    indexed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    verified: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    privileged: 'bg-[#0B1220] text-slate-300 border-[#1D2A40]',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  const style = configs[status?.toLowerCase()] || configs.privileged;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider border ${style}`}>
      {label || status}
    </span>
  );
}

export function ErrorBanner({ message, details, onDismiss }) {
  if (!message) return null;

  return (
    <div className="p-3.5 mb-4 rounded-lg bg-rose-950/30 border border-rose-900/60 text-rose-200 text-xs flex items-start justify-between">
      <div>
        <div className="font-semibold text-rose-300 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
          <span>Notice / System Alert</span>
        </div>
        <p className="mt-1 text-rose-200/90 text-xs leading-relaxed">{message}</p>
        {details && Array.isArray(details) && details.length > 0 && (
          <ul className="mt-2 list-disc list-inside space-y-1 text-[11px] text-rose-300/80 font-mono">
            {details.map((d, i) => (
              <li key={i}>{d.field ? `${d.field}: ` : ''}{d.message}</li>
            ))}
          </ul>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-rose-400 hover:text-rose-200 font-bold ml-4 text-base leading-none p-1 rounded hover:bg-rose-900/40"
        >
          &times;
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-10 sm:p-14 text-center rounded-xl border border-dashed border-[#1D2A40] bg-[#0F1728]/40">
      {Icon && (
        <div className="p-3 mb-3.5 rounded-xl bg-[#0B1220] text-amber-500 border border-[#1D2A40]">
          <Icon className="w-6 h-6 stroke-[1.8]" />
        </div>
      )}
      <h3 className="text-base font-serif font-bold text-[#F8FAFC]">{title}</h3>
      {description && <p className="mt-1.5 text-xs text-[#94A3B8] max-w-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-xl' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-black/75 backdrop-blur-sm"
          onClick={onClose}
        />
        <div
          className={`inline-block w-full ${maxWidth} my-8 overflow-hidden text-left align-middle transition-all transform bg-[#0F1728] border border-[#1D2A40] rounded-xl shadow-2xl z-10`}
        >
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1D2A40] bg-[#0B1220]">
            <h3 className="text-sm font-serif font-bold text-[#F8FAFC]">{title}</h3>
            <button
              onClick={onClose}
              className="text-[#94A3B8] hover:text-[#F8FAFC] text-lg font-bold p-1 rounded hover:bg-[#060B16] transition-colors"
            >
              &times;
            </button>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
