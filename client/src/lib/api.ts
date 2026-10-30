import { Brief, EventData, ReplanRequest, ReplanResponse, TimelineTask, VendorChecklistItem } from '@jashn/shared';
import { DEMO_EVENT } from './demoFixture.js';

const API_BASE = (import.meta.env.VITE_API_URL && !import.meta.env.DEV)
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export async function getDemoEvent(): Promise<EventData> {
  try {
    const res = await fetch(`${API_BASE}/demo`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('[JASHN API] Server unreachable, using local demo fixture:', e);
  }
  return DEMO_EVENT;
}

export async function getEvent(id: string): Promise<EventData> {
  try {
    const res = await fetch(`${API_BASE}/events/${id}`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('[JASHN API] Fetch event fallback:', e);
  }
  return DEMO_EVENT;
}

export async function updateBudget(
  itemId: string,
  payload: { planned?: number; actual?: number }
): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/budget/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('[JASHN API] Local budget update fallback');
  }
  return { items: DEMO_EVENT.budgetItems };
}

export async function updateTask(
  taskId: string,
  payload: { status?: 'todo' | 'doing' | 'done'; dueDate?: string }
): Promise<{ task: TimelineTask; readinessPct: number }> {
  try {
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('[JASHN API] Local task update fallback');
  }

  const task = DEMO_EVENT.timelineTasks.find(t => t.id === taskId) || {
    id: taskId,
    eventId: DEMO_EVENT.id,
    title: 'Updated Task',
    phase: 'details' as const,
    dueOffsetDays: 0,
    dueDate: '2026-12-18',
    status: payload.status || 'done',
    isCompressed: false,
    aiGenerated: true,
    sortOrder: 1
  };
  return { task: { ...task, status: payload.status || 'done' }, readinessPct: 40 };
}

export async function addTask(
  eventId: string,
  payload: { title: string; phase?: string; dueDate?: string; category?: string }
): Promise<TimelineTask> {
  try {
    const res = await fetch(`${API_BASE}/events/${eventId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('[JASHN API] Local add task fallback');
  }

  return {
    id: `task-custom-${Date.now()}`,
    eventId,
    title: payload.title,
    phase: (payload.phase as any) || 'details',
    dueOffsetDays: 0,
    dueDate: payload.dueDate || '2026-12-18',
    status: 'todo',
    category: payload.category || 'custom',
    isCompressed: false,
    aiGenerated: false,
    sortOrder: 10
  };
}

export async function updateVendor(
  vendorId: string,
  payload: Partial<VendorChecklistItem>
): Promise<VendorChecklistItem> {
  try {
    const res = await fetch(`${API_BASE}/vendors/${vendorId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('[JASHN API] Local update vendor fallback');
  }

  const existing = DEMO_EVENT.vendorChecklist.find(v => v.id === vendorId) || DEMO_EVENT.vendorChecklist[0];
  return { ...existing, ...payload };
}

export async function replanEvent(
  eventId: string,
  payload: ReplanRequest
): Promise<ReplanResponse> {
  try {
    const res = await fetch(`${API_BASE}/events/${eventId}/replan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('[JASHN API] Local replan fallback');
  }

  const newGuests = payload.guestCount || DEMO_EVENT.guestCount;
  const newBudget = payload.totalBudget || DEMO_EVENT.totalBudget;
  const ratio = newGuests / DEMO_EVENT.guestCount;

  const budgetDiff = [
    {
      category: 'catering',
      label: 'Multi-Cuisine Royal Buffet',
      from: 468000,
      to: Math.round(468000 * Math.sqrt(ratio)),
      delta: Math.round(468000 * Math.sqrt(ratio)) - 468000,
      deltaPct: Number(((Math.sqrt(ratio) - 1) * 100).toFixed(1)),
      reason: `Scaled for ${newGuests} guests`
    },
    {
      category: 'contingency',
      label: 'Emergency Reserve',
      from: 90000,
      to: Math.round(newBudget * 0.05),
      delta: Math.round(newBudget * 0.05) - 90000,
      deltaPct: Number((((Math.round(newBudget * 0.05) - 90000) / 90000) * 100).toFixed(1)),
      reason: 'Recalibrated 5% safety buffer'
    }
  ];

  return {
    budgetDiff,
    tasksAdded: [],
    tasksMoved: payload.eventDate && payload.eventDate !== DEMO_EVENT.eventDate
      ? [
          {
            id: 'task-demo-9',
            title: 'Verify Sound Check, Baraat Route & Mandap Fire Safety',
            oldDate: DEMO_EVENT.eventDate,
            newDate: payload.eventDate,
            daysShifted: 10
          }
        ]
      : [],
    warnings: ratio > 1.1 ? [`Guest count increased by ${Math.round((ratio - 1) * 100)}%. Catering allocation scaled.`] : [],
    updatedEvent: {
      ...DEMO_EVENT,
      guestCount: newGuests,
      totalBudget: newBudget,
      eventDate: payload.eventDate || DEMO_EVENT.eventDate
    }
  };
}

/**
 * Streams plan generation via Server-Sent Events (SSE)
 * with zero-fail fallback simulation if backend is offline
 */
export function generateEventSSE(
  brief: Brief,
  onProgress: (status: { step: number; message: string; progress: number }) => void,
  onComplete: (data: { eventId: string; event: EventData }) => void,
  _onError: (err: Error) => void
) {
  fetch(`${API_BASE}/events/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(brief)
  })
    .then(async response => {
      if (!response.ok || !response.body) throw new Error('SSE not available');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          const eventMatch = block.match(/event:\s*(\w+)/);
          const dataMatch = block.match(/data:\s*(.*)/);

          if (eventMatch && dataMatch) {
            const eventName = eventMatch[1];
            try {
              const payload = JSON.parse(dataMatch[1]);
              if (eventName === 'status') onProgress(payload);
              else if (eventName === 'complete') onComplete(payload);
            } catch (e) {
              console.error('SSE parse error:', e);
            }
          }
        }
      }
    })
    .catch(() => {
      // Ponytail fallback: If backend isn't up, simulate seamless generation
      let step = 1;
      const steps = [
        { step: 1, message: 'Analyzing event parameters & regional constraints...', progress: 25 },
        { step: 2, message: 'Computing deterministic budget allocations...', progress: 50 },
        { step: 3, message: 'Synthesizing ceremony milestones & T-minus rail...', progress: 75 },
        { step: 4, message: 'Curating vendor checklist & must-ask questions...', progress: 90 },
        { step: 5, message: 'Personalizing celebration concepts & creative ideas...', progress: 100 }
      ];

      const timer = setInterval(() => {
        if (step <= steps.length) {
          onProgress(steps[step - 1]);
          step++;
        } else {
          clearInterval(timer);
          const generatedEvent: EventData = {
            ...DEMO_EVENT,
            id: `event-${Date.now()}`,
            type: brief.type,
            title: brief.title,
            city: brief.city,
            cityTier: brief.cityTier,
            guestCount: brief.guestCount,
            totalBudget: brief.totalBudget,
            eventDate: brief.eventDate
          };
          onComplete({ eventId: generatedEvent.id, event: generatedEvent });
        }
      }, 350);
    });
}
