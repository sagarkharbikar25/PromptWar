import { z } from 'zod';

export const EventTypeEnum = z.enum(['wedding', 'birthday', 'community']);
export type EventType = z.infer<typeof EventTypeEnum>;

export const TaskStatusEnum = z.enum(['todo', 'doing', 'done']);
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

export const VendorStatusEnum = z.enum(['to_contact', 'contacted', 'quoted', 'booked', 'rejected']);
export type VendorStatus = z.infer<typeof VendorStatusEnum>;

export const BudgetCategoryEnum = z.enum([
  'venue',
  'catering',
  'decor',
  'photo_video',
  'entertainment',
  'attire',
  'invitations',
  'transport',
  'gifts',
  'misc',
  'contingency'
]);
export type BudgetCategory = z.infer<typeof BudgetCategoryEnum>;

export const TimelinePhaseEnum = z.enum([
  'foundation',
  'booking',
  'details',
  'final_month',
  'event_week',
  'event_day',
  'after'
]);
export type TimelinePhase = z.infer<typeof TimelinePhaseEnum>;

export const IdeaKindEnum = z.enum([
  'theme',
  'decor',
  'menu',
  'entertainment',
  'gift',
  'activity'
]);
export type IdeaKind = z.infer<typeof IdeaKindEnum>;

// Brief submitted by user
export const BriefSchema = z.object({
  type: EventTypeEnum,
  title: z.string().min(2).max(100),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  city: z.string().min(2).max(60),
  cityTier: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(2),
  guestCount: z.number().int().min(1).max(10000),
  totalBudget: z.number().min(10000).max(1000000000),
  currency: z.string().default('INR'),
  vibe: z.array(z.string()).default([]),
  preferences: z.object({
    dietary: z.string().optional(),
    ceremonies: z.array(z.string()).optional(),
    specialNotes: z.string().optional(),
    culturalNotes: z.string().optional()
  }).default({})
});
export type Brief = z.infer<typeof BriefSchema>;

// Raw LLM output schema (Percentages and Day Offsets only - NO rupee math or calendar dates)
export const PlanRawLLMSchema = z.object({
  summary: z.string().max(400),
  budget: z.array(z.object({
    category: BudgetCategoryEnum,
    label: z.string().min(2).max(80),
    allocation_pct: z.number().min(0).max(100),
    rationale: z.string().max(200)
  })).min(5),
  timeline: z.array(z.object({
    title: z.string().min(3).max(100),
    phase: TimelinePhaseEnum,
    due_offset_days: z.number().int().min(0).max(540),
    category: z.string().optional()
  })).min(8),
  vendors: z.array(z.object({
    category: z.string().min(2).max(60),
    why: z.string().max(200),
    must_ask: z.array(z.string()).min(2).max(6)
  })).min(4),
  ideas: z.array(z.object({
    kind: IdeaKindEnum,
    title: z.string().min(2).max(80),
    description: z.string().max(300),
    est_cost_pct_min: z.number().min(0).max(50).optional(),
    est_cost_pct_max: z.number().min(0).max(50).optional()
  })).min(3),
  risks: z.array(z.string().max(160)).max(5)
});
export type PlanRawLLM = z.infer<typeof PlanRawLLMSchema>;

// Concrete Database & Runtime Models
export interface BudgetItem {
  id: string;
  eventId: string;
  category: BudgetCategory;
  label: string;
  allocationPct: number;
  planned: number;
  actual: number;
  rationale: string;
  aiGenerated: boolean;
  sortOrder: number;
}

export interface TimelineTask {
  id: string;
  eventId: string;
  title: string;
  phase: TimelinePhase;
  dueOffsetDays: number;
  dueDate: string; // YYYY-MM-DD
  status: TaskStatus;
  category?: string;
  isOverdue?: boolean;
  isCompressed?: boolean;
  aiGenerated: boolean;
  sortOrder: number;
}

export interface VendorChecklistItem {
  id: string;
  eventId: string;
  category: string;
  why: string;
  mustAsk: string[];
  vendorName?: string;
  contact?: string;
  quote?: number;
  status: VendorStatus;
  notes?: string;
}

export interface IdeaItem {
  id: string;
  eventId: string;
  kind: IdeaKind;
  title: string;
  description: string;
  estCostMin: number;
  estCostMax: number;
  saved: boolean;
}

export interface EventData {
  id: string;
  type: EventType;
  title: string;
  eventDate: string;
  city: string;
  cityTier: 1 | 2 | 3;
  guestCount: number;
  totalBudget: number;
  currency: string;
  vibe: string[];
  preferences: Record<string, any>;
  summary: string;
  risks: string[];
  daysLeft: number;
  readinessPct: number;
  createdAt: string;
  budgetItems: BudgetItem[];
  timelineTasks: TimelineTask[];
  vendorChecklist: VendorChecklistItem[];
  ideas: IdeaItem[];
}

// Re-plan request & diff schemas
export const ReplanRequestSchema = z.object({
  guestCount: z.number().int().min(1).max(10000).optional(),
  totalBudget: z.number().min(10000).max(1000000000).optional(),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().optional()
});
export type ReplanRequest = z.infer<typeof ReplanRequestSchema>;

export interface BudgetDiffItem {
  category: string;
  label: string;
  from: number;
  to: number;
  delta: number;
  deltaPct: number;
  reason: string;
}

export interface TaskShiftItem {
  id: string;
  title: string;
  oldDate: string;
  newDate: string;
  daysShifted: number;
}

export interface ReplanResponse {
  budgetDiff: BudgetDiffItem[];
  tasksAdded: TimelineTask[];
  tasksMoved: TaskShiftItem[];
  warnings: string[];
  updatedEvent: EventData;
}

