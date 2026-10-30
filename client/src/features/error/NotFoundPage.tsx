import React from 'react';
import { motion } from 'motion/react';
import { Button } from '../../components/ui/Button';

interface NotFoundPageProps {
  onGoHome: () => void;
  onTryDemo: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onGoHome, onTryDemo }) => {
  return (
    <div className="min-h-[75vh] flex flex-col justify-between px-6 sm:px-12 py-16">
      <div className="flex justify-between items-center text-[11px] font-bold tracking-widest text-powder/40 uppercase">
        <span>404 / NOT FOUND</span>
        <span>LOCATION UNMAPPED</span>
      </div>

      <div className="max-w-4xl my-auto py-8">
        <div className="overflow-hidden mb-2">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-7xl sm:text-9xl font-slab text-cyan tracking-tightest leading-none select-none"
          >
            404.
          </motion.div>
        </div>

        <h2 className="text-3xl sm:text-5xl font-slab uppercase tracking-tight text-powder mb-6">
          CELEBRATION NOT FOUND.
        </h2>

        <p className="text-sm sm:text-base text-powder/70 max-w-lg mb-10 font-medium leading-relaxed">
          The event brief or dashboard link you requested does not exist or has expired. You can initialize a new plan or inspect our demo.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="cyan" size="lg" onClick={onGoHome}>
            START OVERVIEW ›
          </Button>
          <Button variant="outline-dark" size="lg" onClick={onTryDemo}>
            TRY NAGPUR DEMO ›
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center text-[11px] font-bold tracking-widest text-powder/40 uppercase pt-6 border-t border-powder/10">
        <span>2026 | JASHN</span>
        <span>INDEX RESOLUTION</span>
      </div>
    </div>
  );
};

