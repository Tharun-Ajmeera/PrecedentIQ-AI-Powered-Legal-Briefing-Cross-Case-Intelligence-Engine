import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PrecedentIQ Client Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 p-6 text-slate-100">
          <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900 border border-rose-900/50 shadow-2xl text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-rose-950 text-rose-400 border border-rose-800 mb-2">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">Application Error</h2>
            <p className="text-xs text-slate-400">
              An unexpected error occurred while rendering the workspace.
            </p>
            {this.state.error && (
              <pre className="text-[11px] text-left p-3 rounded-lg bg-slate-950 text-rose-300 font-mono overflow-auto max-h-32 border border-slate-800">
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs tracking-wide transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Workspace</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
