import { describe, it } from 'node:test';
import assert from 'node:assert';
import { BudgetEngine, RawBudgetProposal } from '../src/engines/budgetEngine.js';
import { DateEngine, RawTaskProposal } from '../src/engines/dateEngine.js';

describe('BudgetEngine Invariants', () => {
  const sampleProposals: RawBudgetProposal[] = [
    { category: 'venue', label: 'Lawn & Banquet Hall', allocation_pct: 35, rationale: 'Primary venue' },
    { category: 'catering', label: 'Royal Buffet (300 pax)', allocation_pct: 25, rationale: 'Food & drinks' },
    { category: 'decor', label: 'Floral & Mandap Styling', allocation_pct: 15, rationale: 'Decor' },
    { category: 'photo_video', label: 'Candid Photography & Drone', allocation_pct: 10, rationale: 'Media' },
    { category: 'entertainment', label: 'DJ, Sound & Dhol Tasha', allocation_pct: 10, rationale: 'Music' },
    { category: 'contingency', label: 'Emergency Buffer', allocation_pct: 5, rationale: 'Reserve' }
  ];

  it('allocates budget so that sum(planned) === totalBudget exactly', () => {
    const testBudgets = [100000, 1534567, 2500000, 899999, 12500000, 50000];

    for (const budget of testBudgets) {
      const items = BudgetEngine.computeAllocations(sampleProposals, budget, 'event-test-1');
      const sum = items.reduce((acc, curr) => acc + curr.planned, 0);
      assert.strictEqual(sum, budget, `Sum ${sum} must equal total budget ${budget}`);
    }
  });

  it('guarantees contingency is at least 5% even if omitted by LLM', () => {
    const proposalsWithoutContingency: RawBudgetProposal[] = [
      { category: 'venue', label: 'Venue', allocation_pct: 50, rationale: '' },
      { category: 'catering', label: 'Catering', allocation_pct: 30, rationale: '' },
      { category: 'decor', label: 'Decor', allocation_pct: 20, rationale: '' }
    ];

    const totalBudget = 2000000;
    const items = BudgetEngine.computeAllocations(proposalsWithoutContingency, totalBudget, 'event-test-2');
    const cont = items.find(i => i.category === 'contingency');

    assert.ok(cont, 'Contingency item must be present');
    assert.ok(cont.planned >= totalBudget * 0.05, `Contingency ${cont.planned} must be >= 5% of ${totalBudget}`);
    
    const sum = items.reduce((acc, curr) => acc + curr.planned, 0);
    assert.strictEqual(sum, totalBudget, 'Sum must equal total budget');
  });

  it('handles manual item adjustments with contingency absorption', () => {
    const totalBudget = 1000000;
    const items = BudgetEngine.computeAllocations(sampleProposals, totalBudget, 'event-test-3');
    const venueItem = items.find(i => i.category === 'venue')!;
    const contItemBefore = items.find(i => i.category === 'contingency')!;

    const { items: updatedItems } = BudgetEngine.adjustItem(items, venueItem.id, venueItem.planned + 20000, totalBudget);
    const contItemAfter = updatedItems.find(i => i.category === 'contingency')!;

    assert.strictEqual(contItemAfter.planned, contItemBefore.planned - 20000);
  });
});

describe('DateEngine Invariants', () => {
  const sampleTasks: RawTaskProposal[] = [
    { title: 'Lock Venue & Muhurat Slot', phase: 'foundation', due_offset_days: 90 },
    { title: 'Book Main Caterer', phase: 'booking', due_offset_days: 60 },
    { title: 'Send Digital Save-the-Date', phase: 'booking', due_offset_days: 45 },
    { title: 'Finalize Stage Decor', phase: 'details', due_offset_days: 20 },
    { title: 'Coordinate Sound Check', phase: 'event_day', due_offset_days: 0 }
  ];

  it('calculates correct due dates and clamps past dates to today', () => {
    const refToday = '2026-11-01';
    const eventDate = '2026-12-01'; // 30 days away

    const { tasks, isCompressedTimeline } = DateEngine.computeTimeline(sampleTasks, eventDate, 'event-test-4', refToday);

    assert.strictEqual(isCompressedTimeline, true, 'Tasks with offset > 30 days must be compressed');
    
    // Check venue lock (offset 90 days from Dec 1 would be Sep 2, which is before Nov 1)
    const venueTask = tasks.find(t => t.title.includes('Venue'))!;
    assert.strictEqual(venueTask.dueDate, refToday, 'Compressed task should clamp to refToday');
    assert.strictEqual(venueTask.isCompressed, true);

    // Check Sound check (offset 0 days = Dec 1)
    const soundTask = tasks.find(t => t.title.includes('Sound'))!;
    assert.strictEqual(soundTask.dueDate, '2026-12-01');
    assert.strictEqual(soundTask.isCompressed, false);
  });

  it('shifts timeline accurately when event date moves', () => {
    const refToday = '2026-11-01';
    const originalEvent = '2026-12-15';
    const { tasks } = DateEngine.computeTimeline(sampleTasks, originalEvent, 'event-test-5', refToday);

    const newEvent = '2026-12-25'; // moved 10 days later
    const { updatedTasks, tasksMoved } = DateEngine.shiftTimeline(tasks, newEvent, refToday);

    assert.ok(tasksMoved.length > 0, 'Tasks should have moved');
    const soundTask = updatedTasks.find(t => t.title.includes('Sound'))!;
    assert.strictEqual(soundTask.dueDate, '2026-12-25');
  });
});

