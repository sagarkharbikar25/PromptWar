import { TimelinePhase, TimelineTask, TaskStatus } from '@jashn/shared';

export interface RawTaskProposal {
  title: string;
  phase: TimelinePhase;
  due_offset_days: number;
  category?: string;
}

export class DateEngine {
  /**
   * Helper to parse YYYY-MM-DD as UTC midnight
   */
  static parseUTCDate(dateStr: string): Date {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(Date.UTC(year, month, day));
    }
    const d = new Date(dateStr);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  }

  /**
   * Helper to format Date to YYYY-MM-DD in UTC
   */
  static formatDate(d: Date): string {
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Calculates days remaining between today and eventDate
   */
  static getDaysLeft(eventDateStr: string, referenceToday?: string): number {
    const today = referenceToday ? DateEngine.parseUTCDate(referenceToday) : DateEngine.parseUTCDate(DateEngine.formatDate(new Date()));
    const eventDate = DateEngine.parseUTCDate(eventDateStr);

    const diffMs = eventDate.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Converts relative day offsets into absolute calendar dates.
   * Clamps past dates to today and flags them as compressed.
   * Asserts no task is dated after eventDate.
   */
  static computeTimeline(
    rawTasks: RawTaskProposal[],
    eventDateStr: string,
    eventId: string,
    referenceToday?: string
  ): { tasks: TimelineTask[]; isCompressedTimeline: boolean } {
    const today = referenceToday ? DateEngine.parseUTCDate(referenceToday) : DateEngine.parseUTCDate(DateEngine.formatDate(new Date()));
    const todayStr = DateEngine.formatDate(today);

    const eventDate = DateEngine.parseUTCDate(eventDateStr);

    let hasCompressed = false;

    const tasks: TimelineTask[] = rawTasks.map((t, idx) => {
      // Invariant: due_offset_days cannot be negative (no tasks after event)
      const offsetDays = Math.max(0, t.due_offset_days);

      const targetMs = eventDate.getTime() - offsetDays * 24 * 60 * 60 * 1000;
      let targetDate = new Date(targetMs);

      let isCompressed = false;
      let dueDateStr = DateEngine.formatDate(targetDate);

      // If the ideal planning date has already passed, clamp to today
      if (targetDate.getTime() < today.getTime()) {
        dueDateStr = todayStr;
        isCompressed = true;
        hasCompressed = true;
      }

      return {
        id: `task-${eventId.slice(0, 8)}-${idx + 1}`,
        eventId,
        title: t.title,
        phase: t.phase,
        dueOffsetDays: offsetDays,
        dueDate: dueDateStr,
        status: 'todo' as TaskStatus,
        category: t.category,
        isCompressed,
        isOverdue: false,
        aiGenerated: true,
        sortOrder: idx + 1
      };
    });

    // Phase hierarchy for stable chronological sort
    const phaseWeights: Record<TimelinePhase, number> = {
      foundation: 10,
      booking: 20,
      details: 30,
      final_month: 40,
      event_week: 50,
      event_day: 60,
      after: 70
    };

    tasks.sort((a, b) => {
      const dateA = DateEngine.parseUTCDate(a.dueDate).getTime();
      const dateB = DateEngine.parseUTCDate(b.dueDate).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return phaseWeights[a.phase] - phaseWeights[b.phase];
    });

    return {
      tasks,
      isCompressedTimeline: hasCompressed
    };
  }

  /**
   * Recalculates task dates when eventDate moves during a re-plan.
   */
  static shiftTimeline(
    existingTasks: TimelineTask[],
    newEventDateStr: string,
    referenceToday?: string
  ): {
    updatedTasks: TimelineTask[];
    tasksMoved: Array<{ id: string; title: string; oldDate: string; newDate: string; daysShifted: number }>;
  } {
    const today = referenceToday ? DateEngine.parseUTCDate(referenceToday) : DateEngine.parseUTCDate(DateEngine.formatDate(new Date()));
    const todayStr = DateEngine.formatDate(today);

    const newEventDate = DateEngine.parseUTCDate(newEventDateStr);

    const tasksMoved: Array<{ id: string; title: string; oldDate: string; newDate: string; daysShifted: number }> = [];

    const updatedTasks = existingTasks.map(task => {
      const targetMs = newEventDate.getTime() - task.dueOffsetDays * 24 * 60 * 60 * 1000;
      let targetDate = new Date(targetMs);

      let newDueDateStr = DateEngine.formatDate(targetDate);
      let isCompressed = false;

      if (targetDate.getTime() < today.getTime()) {
        newDueDateStr = todayStr;
        isCompressed = true;
      }

      if (newDueDateStr !== task.dueDate) {
        const oldMs = DateEngine.parseUTCDate(task.dueDate).getTime();
        const newMs = DateEngine.parseUTCDate(newDueDateStr).getTime();
        const daysShifted = Math.round((newMs - oldMs) / (1000 * 60 * 60 * 24));

        tasksMoved.push({
          id: task.id,
          title: task.title,
          oldDate: task.dueDate,
          newDate: newDueDateStr,
          daysShifted
        });
      }

      return {
        ...task,
        dueDate: newDueDateStr,
        isCompressed
      };
    });

    return { updatedTasks, tasksMoved };
  }
}
