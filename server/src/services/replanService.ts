import { BudgetDiffItem, EventData, ReplanRequest, ReplanResponse } from '@jashn/shared';
import { BudgetEngine } from '../engines/budgetEngine.js';
import { DateEngine } from '../engines/dateEngine.js';

export class ReplanService {
  static replan(currentEvent: EventData, request: ReplanRequest): ReplanResponse {
    const warnings: string[] = [];
    let updatedEvent: EventData = JSON.parse(JSON.stringify(currentEvent));

    const newGuestCount = request.guestCount ?? currentEvent.guestCount;
    const newBudget = request.totalBudget ?? currentEvent.totalBudget;
    const newEventDate = request.eventDate ?? currentEvent.eventDate;

    const guestRatio = newGuestCount / currentEvent.guestCount;
    const budgetRatio = newBudget / currentEvent.totalBudget;

    // 1. Budget Re-allocation & Diff
    const budgetDiff: BudgetDiffItem[] = [];

    if (newGuestCount !== currentEvent.guestCount || newBudget !== currentEvent.totalBudget) {
      // If guests increased but budget didn't increase proportionally:
      if (guestRatio > 1.05 && budgetRatio <= 1.0) {
        warnings.push(
          `Guest count increased by ${Math.round((guestRatio - 1) * 100)}% without budget expansion. Catering and food services will compress other categories.`
        );
      }

      // Propose adjusted percentages
      const rawProposals = currentEvent.budgetItems.map(item => {
        let weight = item.allocationPct;

        if (item.category === 'catering') {
          // Scale catering with guest change
          weight = weight * Math.sqrt(guestRatio);
        } else if (item.category === 'invitations') {
          weight = weight * (guestRatio > 1 ? 1.1 : 0.95);
        }

        return {
          category: item.category,
          label: item.label,
          allocation_pct: weight,
          rationale: item.rationale
        };
      });

      const newBudgetItems = BudgetEngine.computeAllocations(rawProposals, newBudget, currentEvent.id);

      // Compute diffs
      for (const newItem of newBudgetItems) {
        const oldItem = currentEvent.budgetItems.find(i => i.category === newItem.category);
        const oldPlanned = oldItem ? oldItem.planned : 0;
        const delta = newItem.planned - oldPlanned;
        const deltaPct = oldPlanned > 0 ? Number(((delta / oldPlanned) * 100).toFixed(1)) : 0;

        let reason = 'Re-balanced according to updated event brief parameters';
        if (newItem.category === 'catering' && guestRatio !== 1) {
          reason = `Scaled for ${newGuestCount} guests (previously ${currentEvent.guestCount})`;
        } else if (newItem.category === 'contingency') {
          reason = 'Adjusted to absorb rounding and ensure safety reserve';
        }

        budgetDiff.push({
          category: newItem.category,
          label: newItem.label,
          from: oldPlanned,
          to: newItem.planned,
          delta,
          deltaPct,
          reason
        });
      }

      updatedEvent.budgetItems = newBudgetItems;
      updatedEvent.totalBudget = newBudget;
      updatedEvent.guestCount = newGuestCount;
    }

    // 2. Timeline Shift
    let tasksMoved: Array<{ id: string; title: string; oldDate: string; newDate: string; daysShifted: number }> = [];

    if (newEventDate !== currentEvent.eventDate) {
      const shiftResult = DateEngine.shiftTimeline(currentEvent.timelineTasks, newEventDate);
      updatedEvent.timelineTasks = shiftResult.updatedTasks;
      tasksMoved = shiftResult.tasksMoved;
      updatedEvent.eventDate = newEventDate;
      updatedEvent.daysLeft = DateEngine.getDaysLeft(newEventDate);

      const daysDifference = DateEngine.getDaysLeft(newEventDate) - currentEvent.daysLeft;
      if (daysDifference < 0) {
        warnings.push(`Target date moved ${Math.abs(daysDifference)} days closer. Lead times are tighter.`);
      }
    }

    // Update readiness score based on tasks done
    const doneTasks = updatedEvent.timelineTasks.filter(t => t.status === 'done').length;
    const totalTasks = updatedEvent.timelineTasks.length;
    updatedEvent.readinessPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 85 + 15) : 15;

    return {
      budgetDiff,
      tasksAdded: [],
      tasksMoved,
      warnings,
      updatedEvent
    };
  }
}

