import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EventData, ReplanResponse } from '@jashn/shared';
import { formatINR, formatCompactINR, formatDateHuman } from '../../lib/utils';
import { replanEvent } from '../../lib/api';
import { X, RefreshCw, AlertTriangle, ArrowRight, Check } from 'lucide-react';

interface ReplanSheetProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventData;
  onReplanSuccess: (updatedEvent: EventData) => void;
}

export const ReplanSheet: React.FC<ReplanSheetProps> = ({
  isOpen,
  onClose,
  event,
  onReplanSuccess
}) => {
  const [newGuestCount, setNewGuestCount] = useState<number>(event.guestCount);
  const [newBudget, setNewBudget] = useState<number>(event.totalBudget);
  const [newEventDate, setNewEventDate] = useState<string>(event.eventDate);
  const [isComputing, setIsComputing] = useState(false);
  const [replanDiff, setReplanDiff] = useState<ReplanResponse | null>(null);

  const handleComputeDiff = async () => {
    setIsComputing(true);
    try {
      const response = await replanEvent(event.id, {
        guestCount: newGuestCount,
        totalBudget: newBudget,
        eventDate: newEventDate
      });
      setReplanDiff(response);
    } catch (err) {
      console.error('Replan failed:', err);
    } finally {
      setIsComputing(false);
    }
  };

  const handleApply = () => {
    if (replanDiff) {
      onReplanSuccess(replanDiff.updatedEvent);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 flex justify-end">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-xl bg-steel border-l border-powder/20 h-full flex flex-col justify-between overflow-y-auto p-6 sm:p-8"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-powder/15 mb-6">
            <div>
              <h3 className="font-slab uppercase text-2xl text-powder tracking-tight">
                DYNAMIC RE-PLAN DIFF
              </h3>
              <div className="text-xs font-semibold text-powder/50 mt-0.5">
                Adjust variables to recompute budget & timeline in real-time
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full border border-powder/20 text-powder hover:border-cyan hover:text-cyan transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Controls */}
          <div className="space-y-4 mb-6">
            {/* Guest Count */}
            <div className="p-4 rounded-xl bg-[#010B13] border border-powder/15 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-powder/70">Guest Count</span>
                <span className="text-xs font-bold text-powder">
                  {event.guestCount} → <span className="text-cyan font-slab text-base">{newGuestCount} pax</span>
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                step="10"
                value={newGuestCount}
                onChange={e => setNewGuestCount(Number(e.target.value))}
                className="w-full accent-cyan h-2 bg-steel rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Total Budget */}
            <div className="p-4 rounded-xl bg-[#010B13] border border-powder/15 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-powder/70">Total Budget</span>
                <span className="text-xs font-bold text-powder">
                  {formatCompactINR(event.totalBudget)} →{' '}
                  <span className="text-cyan font-slab text-base">{formatCompactINR(newBudget)}</span>
                </span>
              </div>
              <input
                type="range"
                min="200000"
                max="10000000"
                step="50000"
                value={newBudget}
                onChange={e => setNewBudget(Number(e.target.value))}
                className="w-full accent-cyan h-2 bg-steel rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Event Date */}
            <div className="p-4 rounded-xl bg-[#010B13] border border-powder/15 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-powder/70">Event Target Date</span>
                <span className="text-xs font-bold text-cyan font-slab text-sm">
                  {formatDateHuman(newEventDate)}
                </span>
              </div>
              <input
                type="date"
                value={newEventDate}
                onChange={e => setNewEventDate(e.target.value)}
                className="w-full bg-steel border border-powder/20 rounded-lg px-3 py-2 text-xs font-bold text-powder focus:border-cyan"
              />
            </div>

            <button
              onClick={handleComputeDiff}
              disabled={isComputing}
              className="w-full bg-cyan text-[#010B13] hover:bg-[#33ebff] py-3 rounded-full text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isComputing ? 'animate-spin' : ''}`} />
              {isComputing ? 'COMPUTING...' : 'COMPUTE ANIMATED DIFF ›'}
            </button>
          </div>

          {/* Diff View Result */}
          <AnimatePresence>
            {replanDiff && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-4 pt-2"
              >
                {/* Warnings */}
                {replanDiff.warnings.length > 0 && (
                  <div className="space-y-2">
                    {replanDiff.warnings.map((w, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5 font-medium leading-relaxed"
                      >
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Budget Diff Table */}
                {replanDiff.budgetDiff.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-powder/70">
                      BUDGET DELTAS
                    </h4>
                    <div className="space-y-2">
                      {replanDiff.budgetDiff
                        .filter(d => d.delta !== 0)
                        .map(diff => (
                          <div
                            key={diff.category}
                            className="p-3 rounded-xl bg-[#010B13] border border-powder/15 flex items-center justify-between text-xs"
                          >
                            <div>
                              <div className="font-bold text-powder uppercase">{diff.label}</div>
                              <div className="text-[11px] text-powder/50 line-clamp-1">{diff.reason}</div>
                            </div>

                            <div className="text-right">
                              <div className="flex items-center gap-1.5 justify-end text-xs font-semibold">
                                <span className="opacity-40 line-through">
                                  {formatCompactINR(diff.from)}
                                </span>
                                <ArrowRight className="w-3 h-3 opacity-30" />
                                <span className="text-powder font-bold">
                                  {formatCompactINR(diff.to)}
                                </span>
                              </div>
                              <div
                                className={`text-[11px] font-bold ${
                                  diff.delta > 0 ? 'text-amber-300' : 'text-emerald-400'
                                }`}
                              >
                                {diff.delta > 0 ? `+${formatINR(diff.delta)}` : formatINR(diff.delta)}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Timeline Shifts */}
                {replanDiff.tasksMoved.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-powder/70">
                      DATE SHIFTS ({replanDiff.tasksMoved.length} TASKS)
                    </h4>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {replanDiff.tasksMoved.map(shift => (
                        <div
                          key={shift.id}
                          className="p-2.5 rounded-lg bg-[#010B13] border border-powder/15 text-xs flex items-center justify-between"
                        >
                          <span className="truncate pr-2 text-powder/80 font-semibold">{shift.title}</span>
                          <span className="text-[11px] font-bold text-cyan shrink-0">
                            {formatDateHuman(shift.oldDate)} → {formatDateHuman(shift.newDate)} (
                            {shift.daysShifted > 0 ? `+${shift.daysShifted}d` : `${shift.daysShifted}d`})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        <div className="pt-6 border-t border-powder/15 flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="text-xs font-bold uppercase text-powder/60 hover:text-powder px-4 py-2 cursor-pointer"
          >
            Cancel
          </button>
          <button
            disabled={!replanDiff}
            onClick={handleApply}
            className="bg-cyan text-[#010B13] hover:bg-[#33ebff] disabled:opacity-40 disabled:pointer-events-none px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
          >
            APPLY RE-PLAN <Check className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
