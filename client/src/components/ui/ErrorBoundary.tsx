import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[JASHN ErrorBoundary caught an error]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg text-powder flex flex-col justify-between p-6 sm:p-12">
          {/* Header */}
          <div className="flex justify-between items-center text-[11px] font-bold tracking-widest text-powder/40 uppercase">
            <span>00 / RECOVERY</span>
            <span>SYSTEM EXCEPTION</span>
          </div>

          {/* Slab Error Content */}
          <div className="max-w-3xl my-auto py-12">
            <div className="text-cyan font-slab text-6xl sm:text-8xl tracking-tightest leading-none mb-4">
              HALTED.
            </div>

            <h2 className="text-2xl sm:text-4xl font-slab uppercase tracking-tight text-powder mb-6">
              SOMETHING INTERRUPTED THE CELEBRATION PLAN.
            </h2>

            <p className="text-sm sm:text-base text-powder/70 mb-8 max-w-xl font-medium leading-relaxed">
              An unexpected condition occurred while updating your plan. Your core data is safe.
              {this.state.error?.message && (
                <span className="block mt-2 font-mono text-xs text-rose-300 bg-steel p-3 rounded-xl border border-powder/15">
                  {this.state.error.message}
                </span>
              )}
            </p>

            <div className="flex gap-4">
              <Button variant="cyan" size="lg" onClick={this.handleReset}>
                RESTART OVERVIEW ›
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center text-[11px] font-bold tracking-widest text-powder/40 uppercase pt-6 border-t border-powder/10">
            <span>2026 | JASHN RECOVERY</span>
            <span>SAFE RESTORE</span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

