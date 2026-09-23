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
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#070B14] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98] select-none';

  const variants = {
    primary: 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-semibold shadow-lg shadow-amber-950/40 border border-amber-400/30 focus:ring-amber-500 tracking-wide',
    secondary: 'bg-slate-900/90 hover:bg-slate-800/90 text-slate-200 border border-slate-700/80 hover:border-slate-600 shadow-md shadow-black/20 focus:ring-slate-500',
    outline: 'border border-amber-600/40 hover:border-amber-500 text-amber-400 hover:bg-amber-500/10 focus:ring-amber-500 hover:shadow-sm hover:shadow-amber-950/20',
    danger: 'bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/60 shadow-md shadow-rose-950/40 focus:ring-rose-500',
    ghost: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 focus:ring-slate-500',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 font-mono',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2.5 font-medium',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
    </button>
  );
}

// client/src/components/common/LoadingSpinner.jsx
export function LoadingSpinner({ size = 'md', text = 'Processing verified legal analysis...' }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3.5">
      <div className="relative">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-amber-500`} />
        <div className="absolute inset-0 blur-sm bg-amber-500/20 rounded-full animate-pulse" />
      </div>
      {text && <span className="text-xs font-mono tracking-wider text-slate-400 uppercase">{text}</span>}
    </div>
  );
}

// client/src/components/common/ErrorBanner.jsx
export function ErrorBanner({ message, details, onDismiss }) {
  if (!message) return null;

  return (
    <div className="p-4 mb-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-200 text-sm flex items-start justify-between shadow-lg relative overflow-hidden">
      <div className="absolute top-0 left-0 bottom-0 w-1 bg-rose-500" />
      <div className="pl-2">
        <div className="font-semibold text-rose-300 font-mono text-xs uppercase tracking-wider flex items-center gap-2">
          <span>Notice / System Alert</span>
        </div>
        <p className="mt-1 text-rose-200 text-sm leading-relaxed">{message}</p>
        {details && Array.isArray(details) && details.length > 0 && (
          <ul className="mt-2 list-disc list-inside space-y-1 text-xs text-rose-300/80 font-mono">
            {details.map((d, i) => (
              <li key={i}>{d.field ? `${d.field}: ` : ''}{d.message}</li>
            ))}
          </ul>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-rose-400 hover:text-rose-200 font-bold ml-4 text-lg leading-none p-1 rounded hover:bg-rose-900/40 transition-colors"
        >
          &times;
        </button>
      )}
    </div>
  );
}

// client/src/components/common/EmptyState.jsx
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 sm:p-16 text-center rounded-2xl border border-dashed border-slate-800/80 bg-slate-900/30 legal-card">
      {Icon && (
        <div className="p-4 mb-4 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-xl font-serif font-bold text-slate-100">{title}</h3>
      {description && <p className="mt-2 text-sm text-slate-400 max-w-md leading-relaxed font-sans">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// client/src/components/common/Modal.jsx
export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-xl' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />
        <div
          className={`inline-block w-full ${maxWidth} my-8 overflow-hidden text-left align-middle transition-all transform bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl z-10 relative`}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-800/80 bg-slate-900/60">
            <h3 className="text-lg font-serif font-bold text-slate-100">{title}</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 text-xl font-bold p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              &times;
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
