import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brief, EventData } from '@jashn/shared';
import { LandingPage } from './features/landing/LandingPage';
import { BriefWizard } from './features/brief/BriefWizard';
import { GeneratingView } from './features/generating/GeneratingView';
import { DashboardView } from './features/dashboard/DashboardView';
import { NotFoundPage } from './features/error/NotFoundPage';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { generateEventSSE, getDemoEvent } from './lib/api';

type AppView = 'landing' | 'wizard' | 'generating' | 'dashboard' | 'notfound';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [activeEvent, setActiveEvent] = useState<EventData | null>(null);

  // SSE Generation state
  const [generatingStep, setGeneratingStep] = useState(1);
  const [generatingMessage, setGeneratingMessage] = useState('Initializing planner...');
  const [generatingProgress, setGeneratingProgress] = useState(10);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  // Handle Brief Submission -> Starts SSE Stream
  const handleBriefSubmit = (brief: Brief) => {
    setCurrentView('generating');
    setGeneratingStep(1);
    setGeneratingProgress(15);
    setGeneratingMessage('Reading celebration details...');

    generateEventSSE(
      brief,
      progress => {
        setGeneratingStep(progress.step);
        setGeneratingMessage(progress.message);
        setGeneratingProgress(progress.progress);
      },
      complete => {
        setActiveEvent(complete.event);
        setTimeout(() => {
          setCurrentView('dashboard');
        }, 300);
      },
      err => {
        console.error('SSE Error:', err);
        handleLoadDemo();
      }
    );
  };

  // Load Seeded Demo Event
  const handleLoadDemo = async () => {
    setIsLoadingDemo(true);
    try {
      const demo = await getDemoEvent();
      setActiveEvent(demo);
      setCurrentView('dashboard');
    } catch (err) {
      console.error('Failed to load demo:', err);
      setCurrentView('notfound');
    } finally {
      setIsLoadingDemo(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-bg text-powder font-sans selection:bg-cyan selection:text-bg flex flex-col justify-between">
        {/* Top Flat Nav (1px bottom rule, no shadow, no blur) */}
        <nav className="border-b border-powder/15 bg-bg sticky top-0 z-50">
          <div className="w-full px-6 sm:px-12 h-16 flex items-center justify-between">
            {/* Logo Left: Mark + Archivo Wordmark */}
            <div
              onClick={() => setCurrentView('landing')}
              className="flex items-center gap-3 cursor-pointer select-none group"
            >
              <div className="w-7 h-7 flex items-center justify-center shrink-0">
                <img
                  src="/logo.svg"
                  alt="Jashn Logo"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="font-slab text-2xl tracking-tightest text-powder group-hover:text-cyan transition-colors">
                JASHN
              </span>
            </div>

            {/* Right: Pill "Try demo" or "Back to Overview" */}
            <div className="flex items-center gap-3">
              {currentView !== 'landing' && (
                <button
                  onClick={() => setCurrentView('landing')}
                  className="text-xs font-bold uppercase tracking-wider text-powder/70 hover:text-cyan mr-3 cursor-pointer transition"
                >
                  ‹ Overview
                </button>
              )}

              <button
                onClick={handleLoadDemo}
                disabled={isLoadingDemo}
                className="rounded-full border border-powder/30 hover:border-cyan px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-powder hover:text-cyan transition cursor-pointer"
              >
                {isLoadingDemo ? 'Loading...' : 'Try Demo'}
              </button>
            </div>
          </div>
        </nav>

        {/* Main View Transition with AnimatePresence */}
        <main className="w-full flex-1">
          {isLoadingDemo ? (
            <LoadingScreen label="SYNCHRONIZING NAGPUR ROYAL WEDDING DEMO..." />
          ) : (
            <AnimatePresence mode="wait">
              {currentView === 'landing' && (
                <motion.div
                  key="landing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <LandingPage
                    onStartPlanning={() => setCurrentView('wizard')}
                    onLoadDemo={handleLoadDemo}
                    isLoadingDemo={isLoadingDemo}
                  />
                </motion.div>
              )}

              {currentView === 'wizard' && (
                <motion.div
                  key="wizard"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="max-w-4xl mx-auto py-12 px-6"
                >
                  <BriefWizard
                    onSubmit={handleBriefSubmit}
                    onCancel={() => setCurrentView('landing')}
                  />
                </motion.div>
              )}

              {currentView === 'generating' && (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="max-w-2xl mx-auto py-20 px-6"
                >
                  <GeneratingView
                    currentStep={generatingStep}
                    message={generatingMessage}
                    progress={generatingProgress}
                  />
                </motion.div>
              )}

              {currentView === 'dashboard' && activeEvent && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full"
                >
                  <DashboardView
                    initialEvent={activeEvent}
                    onNewPlan={() => setCurrentView('wizard')}
                  />
                </motion.div>
              )}

              {currentView === 'notfound' && (
                <motion.div
                  key="notfound"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <NotFoundPage
                    onGoHome={() => setCurrentView('landing')}
                    onTryDemo={handleLoadDemo}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>

        {/* Editorial Footer */}
        <footer className="border-t border-powder/15 bg-steel py-6 px-6 sm:px-12 text-[11px] font-bold uppercase tracking-widest text-powder/40 flex flex-col sm:flex-row items-center justify-between gap-2 select-none">
          <div>2026 | JASHN CELEBRATION PLANNER</div>
          <div>ALL RIGHTS RESERVED</div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};
