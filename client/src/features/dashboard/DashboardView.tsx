import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { EventData, TimelinePhase, VendorChecklistItem } from '@jashn/shared';
import { OverviewTab } from './OverviewTab';
import { BudgetTab } from './BudgetTab';
import { TimelineTab } from './TimelineTab';
import { VendorTab } from './VendorTab';
import { IdeasTab } from './IdeasTab';
import { ReplanSheet } from '../replan/ReplanSheet';
import { formatDateHuman } from '../../lib/utils';
import { updateBudget, updateTask, addTask, updateVendor } from '../../lib/api';
import { CountUp } from '../../components/ui/CountUp';

interface DashboardViewProps {
  initialEvent: EventData;
  onNewPlan: () => void;
}

export type DashboardTab = 'overview' | 'budget' | 'timeline' | 'vendors' | 'ideas';

export const DashboardView: React.FC<DashboardViewProps> = ({ initialEvent, onNewPlan }) => {
  const [event, setEvent] = useState<EventData>(initialEvent);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isReplanOpen, setIsReplanOpen] = useState(false);

  // Confetti trigger for celebrations
  const fireConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#00E5FF', '#EBF1F5', '#111111']
    });
  };

  const handleUpdateBudget = async (itemId: string, payload: { planned?: number; actual?: number }) => {
    const res = await updateBudget(itemId, payload);
    setEvent(prev => ({
      ...prev,
      budgetItems: res.items
    }));
  };

  const handleTaskToggle = async (taskId: string, currentStatus: 'todo' | 'doing' | 'done') => {
    const nextStatus = currentStatus === 'todo' ? 'doing' : currentStatus === 'doing' ? 'done' : 'todo';
    
    // Optimistic update
    setEvent(prev => ({
      ...prev,
      timelineTasks: prev.timelineTasks.map(t => (t.id === taskId ? { ...t, status: nextStatus } : t))
    }));

    if (nextStatus === 'done') {
      fireConfetti();
    }

    try {
      const res = await updateTask(taskId, { status: nextStatus });
      setEvent(prev => ({
        ...prev,
        readinessPct: res.readinessPct,
        timelineTasks: prev.timelineTasks.map(t => (t.id === taskId ? res.task : t))
      }));
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleAddTask = async (task: { title: string; phase: TimelinePhase; dueDate: string }) => {
    const newTask = await addTask(event.id, task);
    setEvent(prev => ({
      ...prev,
      timelineTasks: [...prev.timelineTasks, newTask]
    }));
  };

  const handleUpdateVendor = async (vendorId: string, payload: Partial<VendorChecklistItem>) => {
    const updated = await updateVendor(vendorId, payload);
    setEvent(prev => ({
      ...prev,
      vendorChecklist: prev.vendorChecklist.map(v => (v.id === vendorId ? updated : v))
    }));

    if (payload.status === 'booked') {
      fireConfetti();
    }
  };

  const handleReplanSuccess = (updatedEvent: EventData) => {
    setEvent(updatedEvent);
    fireConfetti();
  };

  const tabs: Array<{ id: DashboardTab; label: string }> = [
    { id: 'overview', label: 'OVERVIEW' },
    { id: 'budget', label: 'BUDGET' },
    { id: 'timeline', label: 'TIMELINE' },
    { id: 'vendors', label: 'VENDORS' },
    { id: 'ideas', label: 'IDEAS' }
  ];

  return (
    <div className="w-full space-y-0">
      {/* 1. CYAN HEADER BAND (Display type title, giant days-left numeral, complementary black ink) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="bg-cyan text-[#010B13] px-6 sm:px-12 py-10 border-b border-[#010B13]/20"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-[#010B13]/70">
              <span className="bg-[#010B13] text-cyan px-3 py-0.5 rounded-full text-[10px]">
                {event.type.toUpperCase()}
              </span>
              <span>{event.city} · TIER {event.cityTier}</span>
              <span>·</span>
              <span>{formatDateHuman(event.eventDate)}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-slab text-[#010B13] tracking-tightest leading-slab">
              {event.title}
            </h1>
          </div>

          {/* Right side: Giant Days-Left Numeral + Actions */}
          <div className="flex sm:items-center gap-6 self-start lg:self-auto">
            <div className="border-l-2 border-[#010B13]/20 pl-6">
              <div className="text-[11px] font-bold uppercase tracking-widest text-[#010B13]/60">DAYS REMAINING</div>
              <div className="text-5xl sm:text-6xl font-slab text-[#010B13] leading-none">
                <CountUp value={event.daysLeft} duration={800} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => setIsReplanOpen(true)}
                className="bg-[#010B13] text-powder hover:bg-[#111111] px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition cursor-pointer active:scale-95"
              >
                RE-PLAN DIFF ›
              </button>
              <button
                onClick={onNewPlan}
                className="border border-[#010B13]/40 hover:bg-[#010B13]/10 text-[#010B13] px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition cursor-pointer text-center active:scale-95"
              >
                + NEW BRIEF
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. TAB PILLS BAR (Steel Black slab, active filled with #010B13 on cyan) */}
      <div className="bg-steel px-6 sm:px-12 py-3 border-b border-powder/15 sticky top-16 z-30 flex items-center gap-2 overflow-x-auto select-none">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-cyan text-[#010B13]'
                  : 'bg-transparent text-powder/60 hover:text-powder hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. TAB CONTENT SLAB WITH ANIMATED TRANSITIONS */}
      <div className="px-6 sm:px-12 py-10 min-h-[500px]">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <OverviewTab
                event={event}
                onNavigateTab={tab => setActiveTab(tab)}
                onTaskToggle={handleTaskToggle}
              />
            </motion.div>
          )}

          {activeTab === 'budget' && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <BudgetTab event={event} onUpdateBudget={handleUpdateBudget} />
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <TimelineTab
                event={event}
                onTaskToggle={handleTaskToggle}
                onAddTask={handleAddTask}
              />
            </motion.div>
          )}

          {activeTab === 'vendors' && (
            <motion.div
              key="vendors"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <VendorTab event={event} onUpdateVendor={handleUpdateVendor} />
            </motion.div>
          )}

          {activeTab === 'ideas' && (
            <motion.div
              key="ideas"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <IdeasTab event={event} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Re-Plan Slide-Over Sheet */}
      <ReplanSheet
        isOpen={isReplanOpen}
        onClose={() => setIsReplanOpen(false)}
        event={event}
        onReplanSuccess={handleReplanSuccess}
      />
    </div>
  );
};
