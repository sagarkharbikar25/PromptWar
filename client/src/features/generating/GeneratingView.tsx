import React from 'react';
import { motion } from 'motion/react';
import { ScrambleText } from '../../components/ui/ScrambleText';
import { Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

interface GeneratingViewProps {
  currentStep: number;
  message: string;
  progress: number;
}

const STEPS = [
  'Analyzing event brief, city tier & ceremony rules',
  'Executing deterministic budget engine with 5% buffer',
  'Constructing chronological T-minus milestones',
  'Curating vendor pipeline & tailored must-ask questions',
  'Finalizing personalized celebration concepts & ideas'
];

export const GeneratingView: React.FC<GeneratingViewProps> = ({
  currentStep,
  message,
  progress
}) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 max-w-xl mx-auto text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative mb-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-cyan/15 border border-cyan/40 flex items-center justify-center text-cyan">
          <Sparkles className="w-8 h-8 text-cyan" />
        </div>
      </motion.div>

      <h2 className="text-3xl font-display uppercase tracking-tight text-powder mb-2">
        Assembling Your Celebration Plan
      </h2>

      <p className="text-powder/60 text-sm mb-8">
        Our multi-tier planning engine is synthesizing budget, milestones, and vendor checklists.
      </p>

      {/* Progress Line */}
      <div className="w-full bg-steel h-2 rounded-full overflow-hidden mb-6 border border-powder/20">
        <motion.div
          className="h-full bg-cyan"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Steps Ticker */}
      <div className="w-full text-left space-y-3 bg-surface border border-powder/20 p-6 rounded-2xl">
        {STEPS.map((stepText, idx) => {
          const stepNum = idx + 1;
          const isDone = currentStep > stepNum;
          const isActive = currentStep === stepNum;

          return (
            <div
              key={stepNum}
              className={`flex items-center gap-3 text-xs font-bold transition-all duration-200 ${
                isDone
                  ? 'text-emerald-400 opacity-80'
                  : isActive
                  ? 'text-cyan font-bold'
                  : 'text-powder/30'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : isActive ? (
                <Loader2 className="w-4 h-4 text-cyan animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-powder/20 flex items-center justify-center text-[10px] shrink-0 font-bold">
                  {stepNum}
                </div>
              )}

              <div className="truncate">
                {isActive ? (
                  <ScrambleText text={message || stepText} duration={500} />
                ) : (
                  <span>{stepText}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-[11px] font-bold uppercase tracking-widest text-powder/40 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan" />
        Planning Engine Running
      </div>
    </div>
  );
};

