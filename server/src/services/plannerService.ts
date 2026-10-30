import { Brief, EventData, IdeaItem, VendorChecklistItem } from '@jashn/shared';
import { GeminiClient } from '../ai/geminiClient.js';
import { BudgetEngine } from '../engines/budgetEngine.js';
import { DateEngine } from '../engines/dateEngine.js';

export class PlannerService {
  private geminiClient: GeminiClient;

  constructor() {
    this.geminiClient = new GeminiClient();
  }

  async createPlan(brief: Brief, eventId: string): Promise<EventData> {
    const { plan: rawPlan } = await this.geminiClient.generatePlan(brief);

    // 1. Process Budget via Deterministic Engine
    const budgetItems = BudgetEngine.computeAllocations(
      rawPlan.budget,
      brief.totalBudget,
      eventId
    );

    // 2. Process Timeline via Deterministic Engine
    const { tasks: timelineTasks, isCompressedTimeline } = DateEngine.computeTimeline(
      rawPlan.timeline,
      brief.eventDate,
      eventId
    );

    const daysLeft = DateEngine.getDaysLeft(brief.eventDate);

    // Add risk if timeline is compressed
    const risks = [...rawPlan.risks];
    if (isCompressedTimeline && !risks.some(r => r.toLowerCase().includes('lead time'))) {
      risks.unshift(`Tight lead time (${daysLeft} days remaining) requires expedited vendor booking and contract locks.`);
    }

    // 3. Process Vendor Checklist
    const vendorChecklist: VendorChecklistItem[] = rawPlan.vendors.map((v, idx) => ({
      id: `vendor-${eventId.slice(0, 8)}-${idx + 1}`,
      eventId,
      category: v.category,
      why: v.why,
      mustAsk: v.must_ask,
      status: 'to_contact'
    }));

    // 4. Process Creative Ideas with Calculated Rupee Ranges
    const ideas: IdeaItem[] = rawPlan.ideas.map((idea, idx) => {
      const minPct = idea.est_cost_pct_min ?? 1;
      const maxPct = idea.est_cost_pct_max ?? 3;
      const estCostMin = Math.round((minPct / 100) * brief.totalBudget);
      const estCostMax = Math.round((maxPct / 100) * brief.totalBudget);

      return {
        id: `idea-${eventId.slice(0, 8)}-${idx + 1}`,
        eventId,
        kind: idea.kind,
        title: idea.title,
        description: idea.description,
        estCostMin,
        estCostMax,
        saved: false
      };
    });

    const eventData: EventData = {
      id: eventId,
      type: brief.type,
      title: brief.title,
      eventDate: brief.eventDate,
      city: brief.city,
      cityTier: brief.cityTier,
      guestCount: brief.guestCount,
      totalBudget: brief.totalBudget,
      currency: brief.currency || 'INR',
      vibe: brief.vibe,
      preferences: brief.preferences,
      summary: rawPlan.summary,
      risks,
      daysLeft,
      readinessPct: 15, // Base readiness on creation
      createdAt: new Date().toISOString(),
      budgetItems,
      timelineTasks,
      vendorChecklist,
      ideas
    };

    return eventData;
  }
}

