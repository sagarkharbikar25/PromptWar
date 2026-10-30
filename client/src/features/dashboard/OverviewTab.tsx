import React from 'react';
import { motion } from 'motion/react';
import { EventData } from '@jashn/shared';
import { formatCompactINR, formatINR, formatDateHuman } from '../../lib/utils';
import { CountUp } from '../../components/ui/CountUp';

interface OverviewTabProps {
  event: EventData;
  onNavigateTab: (tab: 'budget' | 'timeline' | 'vendors' | 'ideas') => void;
  onTaskToggle: (taskId: string, currentStatus: 'todo' | 'doing' | 'done') => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  event,
  onNavigateTab,
  onTaskToggle
}) => {
  const totalPlanned = event.budgetItems.reduce((acc, curr) => acc + curr.planned, 0);
  const totalActual = event.budgetItems.reduce((acc, curr) => acc + curr.actual, 0);
  const doneTasks = event.timelineTasks.filter(t => t.status === 'done').length;
  const bookedVendors = event.vendorChecklist.filter(v => v.status === 'booked').length;

  const upcomingTasks = event.timelineTasks
    .filter(t => t.status !== 'done')
    .slice(0, 4);

  return (
    <div className="space-y-12">
      {/* 4 Core Number Slabs with 180ms Color Inversion on Hover and Staggered Reveal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Budget */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          whileHover={{ y: -2 }}
          onClick={() => onNavigateTab('budget')}
          className="slab-card p-6 rounded-2xl flex flex-col justify-between cursor-pointer"
        >
          <div className="text-[11px] font-bold uppercase tracking-widest opacity-60 invert-child">
            TOTAL BUDGET
          </div>
          <div className="my-4">
            <div className="text-4xl sm:text-5xl font-slab tracking-tight leading-none">
              <CountUp value={totalPlanned} formatter={formatCompactINR} />
            </div>
            <div className="text-xs font-semibold mt-1 opacity-75 invert-child">
              Actual spent: {formatINR(totalActual)}
            </div>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 invert-child">
            VIEW ALLOCATION ›
          </div>
        </motion.div>

        {/* Metric 2: Guests */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ y: -2 }}
          className="slab-card p-6 rounded-2xl flex flex-col justify-between cursor-default"
        >
          <div className="text-[11px] font-bold uppercase tracking-widest opacity-60 invert-child">
            GUEST CAPACITY
          </div>
          <div className="my-4">
            <div className="text-4xl sm:text-5xl font-slab tracking-tight leading-none">
              <CountUp value={event.guestCount} />
            </div>
            <div className="text-xs font-semibold mt-1 opacity-75 invert-child">
              {event.city} · Tier {event.cityTier}
            </div>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 invert-child">
            HEADCOUNT SCALE
          </div>
        </motion.div>

        {/* Metric 3: Readiness Score */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          whileHover={{ y: -2 }}
          className="slab-card p-6 rounded-2xl flex flex-col justify-between cursor-default"
        >
          <div className="text-[11px] font-bold uppercase tracking-widest opacity-60 invert-child">
            MILESTONE COMPLETION
          </div>
          <div className="my-4">
            <div className="text-4xl sm:text-5xl font-slab tracking-tight leading-none">
              <CountUp value={event.readinessPct} />%
            </div>
            <div className="text-xs font-semibold mt-1 opacity-75 invert-child">
              {doneTasks} of {event.timelineTasks.length} tasks completed
            </div>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 invert-child">
            EXECUTION STATUS
          </div>
        </motion.div>

        {/* Metric 4: Booked Vendors */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ y: -2 }}
          onClick={() => onNavigateTab('vendors')}
          className="slab-card p-6 rounded-2xl flex flex-col justify-between cursor-pointer"
        >
          <div className="text-[11px] font-bold uppercase tracking-widest opacity-60 invert-child">
            CONTRACTED VENDORS
          </div>
          <div className="my-4">
            <div className="text-4xl sm:text-5xl font-slab tracking-tight leading-none">
              {bookedVendors} / {event.vendorChecklist.length}
            </div>
            <div className="text-xs font-semibold mt-1 opacity-75 invert-child">
              Categories mapped & vetted
            </div>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 invert-child">
            VIEW PIPELINE ›
          </div>
        </motion.div>
      </div>

      {/* Asymmetric Split: Immediate Action Items (Left 7 cols) & Identified Attention Points (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Next Tasks */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-powder/15">
            <h3 className="font-slab text-xl uppercase tracking-tight text-powder">
              IMMEDIATE TASKS
            </h3>
            <button
              onClick={() => onNavigateTab('timeline')}
              className="text-xs font-bold uppercase tracking-wider text-cyan hover:underline cursor-pointer"
            >
              All Milestones ›
            </button>
          </div>

          <div className="space-y-2">
            {upcomingTasks.map(task => (
              <div
                key={task.id}
                onClick={() => onTaskToggle(task.id, task.status)}
                className="slab-card p-4 rounded-xl flex items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div>
                  <div className="text-sm font-bold tracking-tight">{task.title}</div>
                  <div className="text-[11px] font-semibold opacity-60 invert-child mt-0.5">
                    Due {formatDateHuman(task.dueDate)} {task.isCompressed && '· [Compressed timeline]'}
                  </div>
                </div>

                <div className="shrink-0 text-[10px] font-bold uppercase px-3 py-1 rounded-full border border-powder/20 invert-child">
                  {task.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risks / Notes */}
        <div className="lg:col-span-5 space-y-4">
          <div className="pb-3 border-b border-powder/15">
            <h3 className="font-slab text-xl uppercase tracking-tight text-powder">
              ATTENTION POINTS
            </h3>
          </div>

          <div className="space-y-3">
            {event.risks.map((risk, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-steel border border-powder/15 text-xs text-powder/85 leading-relaxed"
              >
                <div className="text-[10px] font-bold uppercase tracking-widest text-cyan mb-1">
                  POINT 0{idx + 1}
                </div>
                {risk}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
