import React from 'react';
import { motion } from 'motion/react';

interface LoadingScreenProps {
  label?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  label = 'SYNCHRONIZING CELEBRATION PLAN...'
}) => {
  return (
    <div className="min-h-[60vh] flex flex-col justify-between p-6 sm:p-12">
      <div className="flex justify-between items-center text-[11px] font-bold tracking-widest text-powder/40 uppercase">
        <span>00 / LOADING</span>
        <span>STANDBY</span>
      </div>

      <div className="max-w-3xl my-auto py-12">
        <div className="overflow-hidden mb-4">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-7xl font-slab text-cyan tracking-tightest leading-none select-none"
          >
            LOADING.
          </motion.div>
        </div>

        <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-powder/70 mb-8">
          {label}
        </p>

        {/* Minimal flat horizontal progress bar */}
        <div className="w-full max-w-md h-1.5 bg-steel rounded-full overflow-hidden border border-powder/20">
          <motion.div
            className="h-full bg-cyan"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center text-[11px] font-bold tracking-widest text-powder/40 uppercase pt-6 border-t border-powder/10">
        <span>2026 | JASHN</span>
        <span>IN PROGRESS</span>
      </div>
    </div>
  );
};

