import React, { useState } from 'react';
import { motion } from 'motion/react';
import { EventData, TimelinePhase } from '@jashn/shared';
import { formatDateHuman } from '../../lib/utils';

interface TimelineTabProps {
  event: EventData;
  onTaskToggle: (taskId: string, currentStatus: 'todo' | 'doing' | 'done') => void;
  onAddTask: (task: { title: string; phase: TimelinePhase; dueDate: string }) => Promise<void>;
}

const PHASE_LABELS: Record<TimelinePhase, { label: string; desc: string }> = {
  foundation: { label: 'T-90+ FOUNDATION', desc: 'Lock venue, muhurat slot & core budget' },
  booking: { label: 'T-60 BOOKING', desc: 'Secure high-demand vendors, catering & media' },
  details: { label: 'T-30 DETAILS', desc: 'Attire fittings, choreography & invitations' },
  final_month: { label: 'T-15 FINAL MONTH', desc: 'Permissions, final RSVPs & decor sign-off' },
  event_week: { label: 'T-7 EVENT WEEK', desc: 'Reconfirm plate buffer, sound check & room keys' },
  event_day: { label: 'T-0 EVENT DAY', desc: 'Ceremony execution, dhol entry & live logistics' },
  after: { label: 'POST-EVENT', desc: 'Invoices, vendor tips & returns' }
};

export const TimelineTab: React.FC<TimelineTabProps> = ({ event, onTaskToggle, onAddTask }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPhase, setNewPhase] = useState<TimelinePhase>('details');
  const [newDueDate, setNewDueDate] = useState(event.eventDate);

  const phases: TimelinePhase[] = [
    'foundation',
    'booking',
    'details',
    'final_month',
    'event_week',
    'event_day',
    'after'
  ];

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await onAddTask({
      title: newTitle.trim(),
      phase: newPhase,
      dueDate: newDueDate
    });
    setNewTitle('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-10">
      {/* Header Controls */}
      <div className="flex items-center justify-between pb-4 border-b border-powder/15">
        <div>
          <h2 className="font-slab text-2xl uppercase tracking-tight text-powder">
            T-MINUS TIMELINE RAIL
          </h2>
          <div className="text-xs font-semibold text-powder/60 mt-0.5">
            Event Date: {formatDateHuman(event.eventDate)} ({event.daysLeft} days remaining)
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-cyan text-[#010B13] hover:bg-[#33ebff] px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition cursor-pointer"
        >
          + ADD MILESTONE
        </button>
      </div>

      {/* Rail & Phases */}
      <div className="space-y-8">
        {phases.map(phase => {
          const phaseTasks = event.timelineTasks.filter(t => t.phase === phase);
          if (phaseTasks.length === 0) return null;

          const info = PHASE_LABELS[phase];
          const allDone = phaseTasks.every(t => t.status === 'done');

          return (
            <div key={phase} className="relative pl-6 sm:pl-8 border-l-2 border-powder/20">
              {/* Node Marker on Rail */}
              <div
                className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${
                  allDone
                    ? 'bg-cyan border-cyan'
                    : 'bg-[#010B13] border-powder/40'
                }`}
              />

              {/* Phase Header */}
              <div className="mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-slab uppercase text-powder">
                    {info.label}
                  </h3>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border border-powder/20 text-powder/60">
                    {phaseTasks.filter(t => t.status === 'done').length}/{phaseTasks.length} DONE
                  </span>
                </div>
                <div className="text-xs text-powder/50 font-medium mt-0.5">{info.desc}</div>
              </div>

              {/* Tasks in this phase */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {phaseTasks.map(task => {
                  const isDone = task.status === 'done';

                  return (
                    <motion.div
                      layout
                      whileTap={{ scale: 0.98 }}
                      key={task.id}
                      onClick={() => onTaskToggle(task.id, task.status)}
                      className={`slab-card p-4 rounded-xl flex items-start justify-between gap-4 cursor-pointer select-none transition-all ${
                        isDone ? 'opacity-60' : ''
                      }`}
                    >
                      <div>
                        <div
                          className={`text-sm font-bold leading-snug ${
                            isDone ? 'line-through' : ''
                          }`}
                        >
                          {task.title}
                        </div>

                        <div className="text-[11px] font-semibold opacity-60 invert-child mt-1">
                          Due {formatDateHuman(task.dueDate)}
                          {task.isCompressed && ' · [Tight lead time]'}
                        </div>
                      </div>

                      <div className="shrink-0 text-[10px] font-bold uppercase px-3 py-1 rounded-full border border-powder/20 invert-child">
                        {task.status}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-steel p-6 rounded-2xl border border-powder/20 space-y-5">
            <h3 className="font-slab text-xl uppercase tracking-tight text-powder">
              ADD MILESTONE
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-powder/70 mb-1">Task Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Confirm final acoustic sound check"
                  className="w-full bg-[#010B13] border border-powder/20 rounded-xl px-4 py-2.5 text-xs text-powder focus:outline-none focus:border-cyan"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-powder/70 mb-1">Phase</label>
                  <select
                    value={newPhase}
                    onChange={e => setNewPhase(e.target.value as TimelinePhase)}
                    className="w-full bg-[#010B13] border border-powder/20 rounded-xl px-3 py-2 text-xs text-powder focus:outline-none focus:border-cyan"
                  >
                    {phases.map(p => (
                      <option key={p} value={p}>
                        {PHASE_LABELS[p].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-powder/70 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={e => setNewDueDate(e.target.value)}
                    className="w-full bg-[#010B13] border border-powder/20 rounded-xl px-3 py-2 text-xs text-powder focus:outline-none focus:border-cyan"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-powder/15">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-xs font-bold uppercase text-powder/60 hover:text-powder px-4 py-2 cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="bg-cyan text-[#010B13] px-5 py-2 rounded-full text-xs font-bold uppercase cursor-pointer"
                >
                  SAVE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
