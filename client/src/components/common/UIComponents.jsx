// client/src/components/common/Button.jsx
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
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variants = {
    primary: 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-900/20 focus:ring-amber-500',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 focus:ring-slate-500',
    outline: 'border border-amber-600/50 hover:border-amber-500 text-amber-400 hover:bg-amber-500/10 focus:ring-amber-500',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/30 focus:ring-rose-500',
    ghost: 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 focus:ring-slate-500',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
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
export function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-slate-400 gap-3">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-amber-500`} />
      {text && <span className="text-sm font-medium tracking-wide">{text}</span>}
    </div>
  );
}

// client/src/components/common/ErrorBanner.jsx
export function ErrorBanner({ message, details, onDismiss }) {
  if (!message) return null;

  return (
    <div className="p-4 mb-4 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-200 text-sm flex items-start justify-between">
      <div>
        <div className="font-semibold text-rose-300 flex items-center gap-2">
          <span>Error</span>
        </div>
        <p className="mt-1 text-rose-200/90">{message}</p>
        {details && Array.isArray(details) && details.length > 0 && (
          <ul className="mt-2 list-disc list-inside space-y-1 text-xs text-rose-300/80">
            {details.map((d, i) => (
              <li key={i}>{d.field ? `${d.field}: ` : ''}{d.message}</li>
            ))}
          </ul>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-rose-400 hover:text-rose-200 font-bold ml-4 text-base leading-none"
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
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-slate-800 bg-slate-900/40">
      {Icon && (
        <div className="p-3 mb-4 rounded-xl bg-slate-800/80 text-amber-500 border border-slate-700/60 shadow-inner">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
      {description && <p className="mt-1.5 text-sm text-slate-400 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
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
          className="fixed inset-0 transition-opacity bg-slate-950/80 backdrop-blur-sm"
          onClick={onClose}
        />
        <div
          className={`inline-block w-full ${maxWidth} my-8 overflow-hidden text-left align-middle transition-all transform bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-10`}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
            <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 text-xl font-bold p-1 rounded hover:bg-slate-800 transition-colors"
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
