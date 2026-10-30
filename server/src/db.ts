import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { EventData } from '@jashn/shared';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// In-Memory fallback store
export const memoryEventsStore = new Map<string, EventData>();

export class EventRepository {
  static async saveEvent(event: EventData): Promise<void> {
    memoryEventsStore.set(event.id, event);

    if (!supabase) return;

    try {
      // 1. Upsert event header
      const { error: eventErr } = await supabase.from('events').upsert({
        id: event.id,
        type: event.type,
        title: event.title,
        event_date: event.eventDate,
        city: event.city,
        city_tier: event.cityTier,
        guest_count: event.guestCount,
        total_budget: event.totalBudget,
        currency: event.currency,
        vibe: event.vibe,
        preferences: event.preferences,
        summary: event.summary,
        risks: event.risks,
        readiness_pct: event.readinessPct
      });
      if (eventErr) console.warn('[Supabase] Event upsert error:', eventErr.message);

      // 2. Upsert budget items
      if (event.budgetItems?.length) {
        const rows = event.budgetItems.map(b => ({
          id: b.id,
          event_id: event.id,
          category: b.category,
          label: b.label,
          allocation_pct: b.allocationPct,
          planned: b.planned,
          actual: b.actual,
          rationale: b.rationale,
          ai_generated: b.aiGenerated,
          sort_order: b.sortOrder
        }));
        const { error: budgetErr } = await supabase.from('budget_items').upsert(rows);
        if (budgetErr) console.warn('[Supabase] Budget upsert error:', budgetErr.message);
      }

      // 3. Upsert timeline tasks
      if (event.timelineTasks?.length) {
        const rows = event.timelineTasks.map(t => ({
          id: t.id,
          event_id: event.id,
          title: t.title,
          phase: t.phase,
          due_offset_days: t.dueOffsetDays,
          due_date: t.dueDate,
          status: t.status,
          category: t.category,
          is_compressed: t.isCompressed,
          ai_generated: t.aiGenerated,
          sort_order: t.sortOrder
        }));
        const { error: taskErr } = await supabase.from('timeline_tasks').upsert(rows);
        if (taskErr) console.warn('[Supabase] Tasks upsert error:', taskErr.message);
      }

      // 4. Upsert vendor checklist
      if (event.vendorChecklist?.length) {
        const rows = event.vendorChecklist.map(v => ({
          id: v.id,
          event_id: event.id,
          category: v.category,
          why: v.why,
          must_ask: v.mustAsk,
          vendor_name: v.vendorName,
          contact: v.contact,
          quote: v.quote,
          status: v.status,
          notes: v.notes
        }));
        const { error: vendorErr } = await supabase.from('vendor_checklist').upsert(rows);
        if (vendorErr) console.warn('[Supabase] Vendors upsert error:', vendorErr.message);
      }

      // 5. Upsert ideas
      if (event.ideas?.length) {
        const rows = event.ideas.map(i => ({
          id: i.id,
          event_id: event.id,
          kind: i.kind,
          title: i.title,
          description: i.description,
          est_cost_min: i.estCostMin,
          est_cost_max: i.estCostMax,
          saved: i.saved
        }));
        const { error: ideaErr } = await supabase.from('ideas').upsert(rows);
        if (ideaErr) console.warn('[Supabase] Ideas upsert error:', ideaErr.message);
      }
    } catch (e: any) {
      console.warn('[Supabase] Persistence error:', e.message);
    }
  }

  static async getEvent(id: string): Promise<EventData | null> {
    if (memoryEventsStore.has(id)) {
      return memoryEventsStore.get(id)!;
    }

    if (!supabase) return null;

    try {
      const { data: eventRow, error } = await supabase.from('events').select('*').eq('id', id).single();
      if (error || !eventRow) return null;

      const [budgetRes, tasksRes, vendorsRes, ideasRes] = await Promise.all([
        supabase.from('budget_items').select('*').eq('event_id', id).order('sort_order'),
        supabase.from('timeline_tasks').select('*').eq('event_id', id).order('sort_order'),
        supabase.from('vendor_checklist').select('*').eq('event_id', id),
        supabase.from('ideas').select('*').eq('event_id', id)
      ]);

      const event: EventData = {
        id: eventRow.id,
        type: eventRow.type,
        title: eventRow.title,
        eventDate: eventRow.event_date,
        city: eventRow.city,
        cityTier: eventRow.city_tier,
        guestCount: eventRow.guest_count,
        totalBudget: Number(eventRow.total_budget),
        currency: eventRow.currency,
        vibe: eventRow.vibe || [],
        preferences: eventRow.preferences || {},
        summary: eventRow.summary || '',
        risks: eventRow.risks || [],
        daysLeft: 0,
        readinessPct: eventRow.readiness_pct || 15,
        createdAt: eventRow.created_at,
        budgetItems: (budgetRes.data || []).map((b: any) => ({
          id: b.id,
          eventId: b.event_id,
          category: b.category,
          label: b.label,
          allocationPct: Number(b.allocation_pct),
          planned: Number(b.planned),
          actual: Number(b.actual),
          rationale: b.rationale,
          aiGenerated: b.ai_generated,
          sortOrder: b.sort_order
        })),
        timelineTasks: (tasksRes.data || []).map((t: any) => ({
          id: t.id,
          eventId: t.event_id,
          title: t.title,
          phase: t.phase,
          dueOffsetDays: t.due_offset_days,
          dueDate: t.due_date,
          status: t.status,
          category: t.category,
          isCompressed: t.is_compressed,
          aiGenerated: t.ai_generated,
          sortOrder: t.sort_order
        })),
        vendorChecklist: (vendorsRes.data || []).map((v: any) => ({
          id: v.id,
          eventId: v.event_id,
          category: v.category,
          why: v.why,
          mustAsk: v.must_ask || [],
          vendorName: v.vendor_name,
          contact: v.contact,
          quote: v.quote ? Number(v.quote) : undefined,
          status: v.status,
          notes: v.notes
        })),
        ideas: (ideasRes.data || []).map((i: any) => ({
          id: i.id,
          eventId: i.event_id,
          kind: i.kind,
          title: i.title,
          description: i.description,
          estCostMin: Number(i.est_cost_min),
          estCostMax: Number(i.est_cost_max),
          saved: i.saved
        }))
      };

      memoryEventsStore.set(event.id, event);
      return event;
    } catch {
      return null;
    }
  }
}

