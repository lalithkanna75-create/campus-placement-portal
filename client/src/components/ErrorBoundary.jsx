import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

/**
 * Root React Error Boundary Component
 * Catches unhandled runtime exceptions and renders a graceful recovery UI.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary Caught Exception]:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 text-slate-900 font-sans">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 mb-5 shadow-xs">
              <AlertTriangle size={28} />
            </div>

            <h2 className="font-heading text-xl font-extrabold text-slate-900">
              Something went wrong
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-2 leading-relaxed">
              An unexpected render error occurred in the application view. You can reload the portal or reset the local session.
            </p>

            {this.state.error && (
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-left">
                <code className="text-[11px] font-mono text-rose-700 block truncate">
                  {this.state.error.toString()}
                </code>
              </div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/25 hover:from-indigo-700 hover:to-indigo-800 cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <Home size={14} />
                <span>Reset State</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
