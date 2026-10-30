import { BudgetCategory, BudgetItem } from '@jashn/shared';

export interface RawBudgetProposal {
  category: BudgetCategory;
  label: string;
  allocation_pct: number;
  rationale: string;
}

export class BudgetEngine {
  /**
   * Computes exact integer INR allocations ensuring:
   * 1. sum(planned) === totalBudget (exact to the rupee)
   * 2. contingency >= 5% of total budget
   * 3. remainder after integer rounding is absorbed into contingency
   */
  static computeAllocations(
    rawProposals: RawBudgetProposal[],
    totalBudget: number,
    eventId: string
  ): BudgetItem[] {
    if (totalBudget <= 0) {
      throw new Error('Total budget must be greater than 0');
    }

    if (!rawProposals || rawProposals.length === 0) {
      throw new Error('Budget proposals must not be empty');
    }

    // Clone proposals to avoid mutation
    let proposals = rawProposals.map(p => ({ ...p }));

    // Check if contingency exists
    let contingencyIndex = proposals.findIndex(p => p.category === 'contingency');
    if (contingencyIndex === -1) {
      proposals.push({
        category: 'contingency',
        label: 'Emergency & Overrun Buffer',
        allocation_pct: 5,
        rationale: 'Mandatory risk reserve for unexpected price changes or ceremony add-ons'
      });
      contingencyIndex = proposals.length - 1;
    } else {
      if (proposals[contingencyIndex].allocation_pct < 5) {
        proposals[contingencyIndex].allocation_pct = 5;
      }
    }

    // Normalize percentages to sum to 100
    const totalRawPct = proposals.reduce((acc, curr) => acc + curr.allocation_pct, 0);
    const normalizedProposals = proposals.map(p => ({
      ...p,
      normalizedPct: (p.allocation_pct / totalRawPct) * 100
    }));

    // Ensure contingency has at least 5% after normalization
    const contItem = normalizedProposals[contingencyIndex];
    if (contItem.normalizedPct < 5) {
      const deficit = 5 - contItem.normalizedPct;
      contItem.normalizedPct = 5;
      
      // Reduce from the highest percentage item other than contingency
      const nonContItems = normalizedProposals.filter((_, idx) => idx !== contingencyIndex);
      nonContItems.sort((a, b) => b.normalizedPct - a.normalizedPct);
      if (nonContItems.length > 0) {
        nonContItems[0].normalizedPct -= deficit;
      }
    }

    // Compute raw rupee amounts rounded down to integer rupees
    let assignedTotal = 0;
    const itemsWithAmounts = normalizedProposals.map((item, idx) => {
      // Calculate exact integer rupee
      const planned = Math.floor((item.normalizedPct / 100) * totalBudget);
      assignedTotal += planned;
      return {
        ...item,
        planned,
        sortOrder: idx + 1
      };
    });

    // Absorb rounding discrepancy into contingency
    const remainder = totalBudget - assignedTotal;
    const contingencyItem = itemsWithAmounts[contingencyIndex];
    contingencyItem.planned += remainder;

    // Recalculate clean final percentages
    return itemsWithAmounts.map((item, idx) => ({
      id: `budget-${eventId.slice(0, 8)}-${idx + 1}`,
      eventId,
      category: item.category,
      label: item.label,
      allocationPct: Number(((item.planned / totalBudget) * 100).toFixed(1)),
      planned: item.planned,
      actual: 0,
      rationale: item.rationale,
      aiGenerated: true,
      sortOrder: item.sortOrder
    }));
  }

  /**
   * Re-balances budget when a user manually edits a line item's planned amount.
   * If adjustContingency is true, the difference is absorbed into the contingency buffer.
   */
  static adjustItem(
    items: BudgetItem[],
    targetItemId: string,
    newPlanned: number,
    totalBudget: number
  ): { items: BudgetItem[]; warning?: string } {
    let warning: string | undefined;
    const updated = items.map(i => ({ ...i }));
    const target = updated.find(i => i.id === targetItemId);
    if (!target) return { items: updated };

    const oldPlanned = target.planned;
    const delta = newPlanned - oldPlanned;
    target.planned = Math.max(0, newPlanned);
    target.allocationPct = Number(((target.planned / totalBudget) * 100).toFixed(1));

    // Try to adjust contingency
    const cont = updated.find(i => i.category === 'contingency');
    if (cont && cont.id !== targetItemId) {
      if (cont.planned >= delta) {
        cont.planned -= delta;
        cont.allocationPct = Number(((cont.planned / totalBudget) * 100).toFixed(1));
      } else {
        warning = `Increasing this item reduces contingency below ₹0. Total is currently exceeding planned budget by ₹${delta - cont.planned}.`;
        cont.planned = 0;
        cont.allocationPct = 0;
      }
    }

    return { items: updated, warning };
  }
}

