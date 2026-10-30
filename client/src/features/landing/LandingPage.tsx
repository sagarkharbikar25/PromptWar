import React from 'react';
import { motion } from 'motion/react';
import { Chip } from '../../components/ui/Chip';
import { Button } from '../../components/ui/Button';
import { CountUp } from '../../components/ui/CountUp';

interface LandingPageProps {
  onStartPlanning: () => void;
  onLoadDemo: () => void;
  isLoadingDemo: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartPlanning,
  onLoadDemo,
  isLoadingDemo
}) => {
  return (
    <div className="w-full">
      {/* 1. HERO - TWO STACKED COLOR SLABS */}
      
      {/* TOP SLAB: Rich Black (#010B13) */}
      <section className="bg-bg text-powder px-6 sm:px-12 pt-12 pb-16 border-b border-powder/15 relative overflow-hidden">
        {/* Editorial Top Corner Marker */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-between items-center text-[11px] font-bold tracking-widest text-powder/40 uppercase mb-8"
        >
          <span>01 / 05</span>
          <span>SYSTEM INTRODUCTION</span>
        </motion.div>

        {/* Top Headline Lines sliding up from an overflow:hidden mask */}
        <div className="overflow-hidden">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(3.2rem,11.5vw,10.5rem)] font-slab text-powder tracking-tightest leading-slab select-none"
          >
            PLAN THE
          </motion.div>
        </div>

        <div className="overflow-hidden">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(3.2rem,11.5vw,10.5rem)] font-slab text-powder tracking-tightest leading-slab select-none"
          >
            CELEBRATION.
          </motion.div>
        </div>
      </section>

      {/* BOTTOM SLAB: Cyan (#00E5FF) */}
      <section className="bg-cyan text-[#010B13] px-6 sm:px-12 pt-8 pb-16 relative overflow-hidden">
        {/* Headline Continuation in black text */}
        <div className="overflow-hidden mb-8">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(3.2rem,11.5vw,10.5rem)] font-slab text-[#010B13] tracking-tightest leading-slab select-none"
          >
            NOT THE CHAOS.
          </motion.div>
        </div>

        {/* One Chip Row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          className="flex flex-wrap items-center gap-2 mb-6"
        >
          <Chip variant="on-cyan">WEDDINGS</Chip>
          <Chip variant="on-cyan">BIRTHDAYS</Chip>
          <Chip variant="on-cyan">COMMUNITY EVENTS</Chip>
        </motion.div>

        {/* One-sentence subcopy (max 18 words) */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.36 }}
          className="text-base sm:text-xl font-bold tracking-tight text-[#010B13] max-w-2xl mb-8 leading-snug"
        >
          Every rupee allocated, every date locked, every vendor question ready in seconds.
        </motion.p>

        {/* Action Controls */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.44 }}
          className="flex flex-col sm:flex-row sm:items-center gap-5"
        >
          <Button
            variant="black-on-cyan"
            size="lg"
            onClick={onStartPlanning}
          >
            START PLANNING ›
          </Button>

          <button
            onClick={onLoadDemo}
            disabled={isLoadingDemo}
            className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#010B13] underline underline-offset-4 hover:opacity-70 transition cursor-pointer text-left"
          >
            {isLoadingDemo ? 'LOADING DEMO...' : 'OR EXPLORE NAGPUR ROYAL WEDDING ›'}
          </button>
        </motion.div>

        {/* Editorial Micro-Details in Bottom Corners */}
        <div className="flex justify-between items-center text-[11px] font-bold tracking-widest text-[#010B13]/60 uppercase pt-16 border-t border-[#010B13]/20 mt-12">
          <span>2026 | JASHN</span>
          <span>SCROLL ›</span>
        </div>
      </section>

      {/* 2. MARQUEE STRIP (Steel Black slab, cyan text, slow linear loop) */}
      <section className="bg-steel py-4 overflow-hidden border-y border-powder/15 select-none">
        <div className="animate-marquee whitespace-nowrap text-cyan font-slab text-xl sm:text-2xl tracking-tight">
          <span className="mx-4">WEDDINGS ✦ BIRTHDAYS ✦ COMMUNITY EVENTS ✦ REAL BUDGETS ✦ T-MINUS MILESTONES ✦</span>
          <span className="mx-4">WEDDINGS ✦ BIRTHDAYS ✦ COMMUNITY EVENTS ✦ REAL BUDGETS ✦ T-MINUS MILESTONES ✦</span>
          <span className="mx-4">WEDDINGS ✦ BIRTHDAYS ✦ COMMUNITY EVENTS ✦ REAL BUDGETS ✦ T-MINUS MILESTONES ✦</span>
          <span className="mx-4">WEDDINGS ✦ BIRTHDAYS ✦ COMMUNITY EVENTS ✦ REAL BUDGETS ✦ T-MINUS MILESTONES ✦</span>
        </div>
      </section>

      {/* 3. HOW IT WORKS (Powder White slab, dark ink text, 3 full-width rows with whileInView) */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-powder text-ink px-6 sm:px-12 py-20 relative"
      >
        <div className="flex justify-between items-center text-[11px] font-bold tracking-widest text-ink/40 uppercase mb-12">
          <span>02 / 05</span>
          <span>HOW IT WORKS</span>
        </div>

        <div className="divide-y divide-ink/15 border-y border-ink/15">
          {/* Row 01 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline group"
          >
            <div className="md:col-span-2 text-5xl sm:text-7xl font-slab text-ink/30 select-none group-hover:text-ink/60 transition-colors">
              01
            </div>
            <div className="md:col-span-5 text-2xl sm:text-3xl font-slab text-ink">
              TELL US THE OCCASION
            </div>
            <div className="md:col-span-5 text-sm sm:text-base text-ink/80 font-medium leading-relaxed">
              Weddings, milestone birthdays, or community celebrations with your city and guest scale.
            </div>
          </motion.div>

          {/* Row 02 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline group"
          >
            <div className="md:col-span-2 text-5xl sm:text-7xl font-slab text-ink/30 select-none group-hover:text-ink/60 transition-colors">
              02
            </div>
            <div className="md:col-span-5 text-2xl sm:text-3xl font-slab text-ink">
              GET A PLAN THAT ADDS UP
            </div>
            <div className="md:col-span-5 text-sm sm:text-base text-ink/80 font-medium leading-relaxed">
              Every rupee balanced to your total, with real lead times and custom vendor questions.
            </div>
          </motion.div>

          {/* Row 03 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline group"
          >
            <div className="md:col-span-2 text-5xl sm:text-7xl font-slab text-ink/30 select-none group-hover:text-ink/60 transition-colors">
              03
            </div>
            <div className="md:col-span-5 text-2xl sm:text-3xl font-slab text-ink">
              CHANGE ONE THING, WATCH IT ALL MOVE
            </div>
            <div className="md:col-span-5 text-sm sm:text-base text-ink/80 font-medium leading-relaxed">
              Shift the guest list or budget and see exactly what adjusts without starting over.
            </div>
          </motion.div>
        </div>

        <div className="flex justify-between items-center text-[11px] font-bold tracking-widest text-ink/40 uppercase mt-12">
          <span>03 ROWS</span>
          <span>STRUCTURAL CERTAINTY</span>
        </div>
      </motion.section>

      {/* 4. PROOF SLAB (Cyan slab, black text, 4 oversized statements with CountUp) */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-cyan text-[#010B13] px-6 sm:px-12 py-20 relative"
      >
        <div className="flex justify-between items-center text-[11px] font-bold tracking-widest text-[#010B13]/40 uppercase mb-12">
          <span>03 / 05</span>
          <span>FACTS</span>
        </div>

        <div className="divide-y divide-[#010B13]/20 border-y border-[#010B13]/20">
          {/* Stat 1 */}
          <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline">
            <div className="md:col-span-3 text-5xl sm:text-6xl font-slab text-[#010B13]">
              <CountUp value={100} duration={1200} />%
            </div>
            <div className="md:col-span-9 text-xl sm:text-3xl font-slab text-[#010B13]">
              Budgets that always add up.
            </div>
          </div>

          {/* Stat 2 */}
          <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline">
            <div className="md:col-span-3 text-5xl sm:text-6xl font-slab text-[#010B13]">
              T-0
            </div>
            <div className="md:col-span-9 text-xl sm:text-3xl font-slab text-[#010B13]">
              Real dates, counted back from the day.
            </div>
          </div>

          {/* Stat 3 */}
          <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline">
            <div className="md:col-span-3 text-5xl sm:text-6xl font-slab text-[#010B13]">
              DIFF
            </div>
            <div className="md:col-span-9 text-xl sm:text-3xl font-slab text-[#010B13]">
              Change the guest list, see exactly what moves.
            </div>
          </div>

          {/* Stat 4 */}
          <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline">
            <div className="md:col-span-3 text-5xl sm:text-6xl font-slab text-[#010B13]">
              SAFE
            </div>
            <div className="md:col-span-9 text-xl sm:text-3xl font-slab text-[#010B13]">
              Never a blank screen, even when the AI stumbles.
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-[11px] font-bold tracking-widest text-[#010B13]/50 uppercase mt-12">
          <span>NO HALLUCINATIONS</span>
          <span>STRICT INVARIANTS</span>
        </div>
      </motion.section>

      {/* 5. CTA SLAB (Steel Black slab, cyan button, minimal corner labels) */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-steel text-powder px-6 sm:px-12 py-24 relative"
      >
        <div className="flex justify-between items-center text-[11px] font-bold tracking-widest text-powder/40 uppercase mb-8">
          <span>04 / 05</span>
          <span>INTERACTIVE DEMO</span>
        </div>

        <div className="max-w-4xl">
          <h2 className="text-4xl sm:text-6xl font-slab text-powder tracking-tightest leading-slab mb-6">
            TRY THE NAGPUR ROYAL WEDDING.
          </h2>
          <p className="text-sm sm:text-base text-powder/70 max-w-xl mb-10 leading-relaxed font-medium">
            220 guests, 18 lakhs, 75 days away. A multi-ceremony Indian wedding with real venue rates, booked items, and an interactive re-plan diff.
          </p>

          <Button
            variant="cyan"
            size="lg"
            onClick={onLoadDemo}
            disabled={isLoadingDemo}
          >
            {isLoadingDemo ? 'LOADING...' : 'OPEN DEMO PLAN ›'}
          </Button>
        </div>

        <div className="flex justify-between items-center text-[11px] font-bold tracking-widest text-powder/40 uppercase pt-16 border-t border-powder/10 mt-16">
          <span>2026 | JASHN</span>
          <span>END OF OVERVIEW</span>
        </div>
      </motion.section>
    </div>
  );
};
