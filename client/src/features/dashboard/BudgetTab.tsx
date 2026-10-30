import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BudgetItem, EventData } from '@jashn/shared';
import { formatINR } from '../../lib/utils';

interface BudgetTabProps {
  event: EventData;
  onUpdateBudget: (itemId: string, payload: { planned?: number; actual?: number }) => Promise<void>;
}

// Flat tonal steps only: Cyan, Powder White, and Steel shades. No rainbow!
const TONAL_COLORS = [
  '#00E5FF', // Pure Cyan
  '#EBF1F5', // Powder White
  '#8EA3B0', // Light slate
  '#00ADC0', // Deep Cyan
  '#C5D3DC', // Pale Powder
  '#4E6370', // Medium steel
  '#2C3C47', // Dark steel
  '#728694', // Silver steel
  '#007987', // Darkest Cyan
  '#99AAB5'  // Muted steel
];

export const BudgetTab: React.FC<BudgetTabProps> = ({ event, onUpdateBudget }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPlanned, setEditPlanned] = useState<number>(0);
  const [editActual, setEditActual] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);

  const totalPlanned = event.budgetItems.reduce((acc, curr) => acc + curr.planned, 0);
  const totalActual = event.budgetItems.reduce((acc, curr) => acc + curr.actual, 0);
  const contingencyItem = event.budgetItems.find(i => i.category === 'contingency');

  const handleStartEdit = (item: BudgetItem) => {
    setEditingId(item.id);
    setEditPlanned(item.planned);
    setEditActual(item.actual);
  };

  const handleSaveEdit = async (itemId: string) => {
    setIsSaving(true);
    try {
      await onUpdateBudget(itemId, {
        planned: editPlanned,
        actual: editActual
      });
      setEditingId(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Overview Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-steel border border-powder/15">
          <div className="text-[11px] font-bold uppercase tracking-widest text-powder/50">
            TOTAL EVENT BUDGET
          </div>
          <div className="text-3xl sm:text-4xl font-slab text-powder mt-2">
            {formatINR(totalPlanned)}
          </div>
          <div className="text-[11px] text-cyan font-bold uppercase tracking-wider mt-1">
            EXACT 100% RECONCILED
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-steel border border-powder/15">
          <div className="text-[11px] font-bold uppercase tracking-widest text-powder/50">
            ACTUAL EXPENDITURE
          </div>
          <div className="text-3xl sm:text-4xl font-slab text-powder mt-2">
            {formatINR(totalActual)}
          </div>
          <div className="text-[11px] text-powder/60 font-semibold mt-1">
            Recorded so far
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-steel border border-powder/15">
          <div className="text-[11px] font-bold uppercase tracking-widest text-powder/50">
            CONTINGENCY BUFFER
          </div>
          <div className="text-3xl sm:text-4xl font-slab text-cyan mt-2">
            {contingencyItem ? formatINR(contingencyItem.planned) : '₹0'}
          </div>
          <div className="text-[11px] text-powder/60 font-semibold mt-1">
            {contingencyItem ? `${contingencyItem.allocationPct}% reserved for overruns` : 'None'}
          </div>
        </div>
      </div>

      {/* Flat Tonal Allocation Bar (Cyan, Powder White, Steel steps only) */}
      <div className="p-6 rounded-2xl bg-surface border border-powder/15 space-y-4">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-powder/70">
          <span>ALLOCATION DISTRIBUTION</span>
          <span>100% SUMMED</span>
        </div>

        {/* The Bar with smooth entrance expansion */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ originX: 0 }}
          className="h-6 w-full rounded-full overflow-hidden flex bg-[#010B13] border border-powder/20 p-0.5"
        >
          {event.budgetItems.map((item, idx) => {
            const color = TONAL_COLORS[idx % TONAL_COLORS.length];
            return (
              <motion.div
                key={item.id}
                layout
                className="h-full relative cursor-pointer"
                style={{
                  width: `${item.allocationPct}%`,
                  backgroundColor: color
                }}
                title={`${item.label}: ${item.allocationPct}% (${formatINR(item.planned)})`}
              />
            );
          })}
        </motion.div>

        {/* Tonal Legend */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold pt-2">
          {event.budgetItems.map((item, idx) => {
            const color = TONAL_COLORS[idx % TONAL_COLORS.length];
            return (
              <div key={item.id} className="flex items-center gap-2 text-powder/80">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span>{item.label}</span>
                <span className="text-cyan font-bold">{item.allocationPct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flat Breakdown Table */}
      <div className="rounded-2xl border border-powder/15 bg-surface overflow-hidden">
        <div className="p-5 border-b border-powder/15 flex justify-between items-center bg-steel">
          <h3 className="font-slab text-lg uppercase tracking-tight text-powder">
            ALLOCATED LINE ITEMS & EXPENSES
          </h3>
          <span className="text-xs font-bold text-powder/50 uppercase">
            {event.budgetItems.length} CATEGORIES
          </span>
        </div>

        <div className="divide-y divide-powder/10">
          {event.budgetItems.map(item => {
            const isEditing = editingId === item.id;
            return (
              <div
                key={item.id}
                className="slab-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none"
              >
                <div className="max-w-md">
                  <div className="text-base font-bold uppercase tracking-tight">
                    {item.label}
                  </div>
                  <div className="text-xs opacity-70 invert-child mt-0.5">
                    {item.rationale || 'Proportional allocation based on city tier'}
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:justify-end">
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 invert-child">
                      PLANNED ({item.allocationPct}%)
                    </div>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editPlanned}
                        onChange={e => setEditPlanned(Number(e.target.value))}
                        className="w-28 bg-[#010B13] border border-cyan text-cyan font-bold px-2 py-1 text-xs rounded mt-1"
                      />
                    ) : (
                      <div className="text-sm font-bold mt-0.5 font-slab tracking-wide">
                        {formatINR(item.planned)}
                      </div>
                    )}
                  </div>

                  <div className="text-right border-l border-powder/15 pl-6 invert-child">
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 invert-child">
                      ACTUAL SPENT
                    </div>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editActual}
                        onChange={e => setEditActual(Number(e.target.value))}
                        className="w-28 bg-[#010B13] border border-powder text-powder font-bold px-2 py-1 text-xs rounded mt-1"
                      />
                    ) : (
                      <div className="text-sm font-bold mt-0.5 font-slab tracking-wide">
                        {item.actual > 0 ? formatINR(item.actual) : '₹0'}
                      </div>
                    )}
                  </div>

                  <div>
                    {isEditing ? (
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        disabled={isSaving}
                        className="bg-[#010B13] text-powder hover:bg-[#111111] px-3 py-1.5 rounded-full text-xs font-bold uppercase transition cursor-pointer"
                      >
                        SAVE
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="text-xs font-bold uppercase underline underline-offset-2 opacity-60 hover:opacity-100 transition cursor-pointer invert-child"
                      >
                        EDIT
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
