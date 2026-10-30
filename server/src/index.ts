import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { BriefSchema, EventData, ReplanRequestSchema } from '@jashn/shared';
import { PlannerService } from './services/plannerService.js';
import { ReplanService } from './services/replanService.js';
import { BudgetEngine } from './engines/budgetEngine.js';
import { EventRepository, memoryEventsStore } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve Client Static Build if available
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// Planner Service
const plannerService = new PlannerService();

// Pre-seed Demo Event (Nagpur Royal Wedding)
const DEMO_EVENT_ID = 'demo-nagpur-royal-wedding';
async function initializeDemoEvent() {
  const demoBrief = {
    type: 'wedding' as const,
    title: 'Aditya & Ananya’s Royal Maratha-Rajasthani Wedding',
    eventDate: '2026-12-18',
    city: 'Nagpur',
    cityTier: 2 as const,
    guestCount: 220,
    totalBudget: 1800000,
    currency: 'INR',
    vibe: ['Royal Heritage', 'High Energy Sangeet', 'Warm Hospitality', 'Cultural Fusion'],
    preferences: {
      dietary: 'Pure Veg & Regional Maharashtrian + Marwari Buffet',
      ceremonies: ['Haldi', 'Mehendi', 'Sangeet', 'Varmala', 'Reception'],
      specialNotes: 'Require dedicated dhol-tasha troupe for Baraat and organic gulal station for Haldi'
    }
  };

  const demoEvent = await plannerService.createPlan(demoBrief, DEMO_EVENT_ID);
  
  // Mark a couple of tasks as doing/done to demonstrate live progress
  if (demoEvent.timelineTasks[0]) demoEvent.timelineTasks[0].status = 'done';
  if (demoEvent.timelineTasks[1]) demoEvent.timelineTasks[1].status = 'doing';
  if (demoEvent.vendorChecklist[0]) {
    demoEvent.vendorChecklist[0].status = 'quoted';
    demoEvent.vendorChecklist[0].vendorName = 'Radisson Blu Lawns & Banquets';
    demoEvent.vendorChecklist[0].quote = 580000;
  }

  await EventRepository.saveEvent(demoEvent);
  console.log(`[Demo Seed] Demo event '${DEMO_EVENT_ID}' initialized successfully.`);
}

initializeDemoEvent();

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    eventsCount: memoryEventsStore.size
  });
});

// Demo event quick-access
app.get('/api/demo', async (_req: Request, res: Response) => {
  const demo = await EventRepository.getEvent(DEMO_EVENT_ID);
  if (!demo) {
    return res.status(404).json({ error: 'Demo event not initialized' });
  }
  res.json(demo);
});

// GET Event by ID
app.get('/api/events/:id', async (req: Request, res: Response) => {
  const eventId = String(req.params.id);
  const event = await EventRepository.getEvent(eventId);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  res.json(event);
});

// SSE Streaming Generation Endpoint
app.post('/api/events/generate', async (req: Request, res: Response) => {
  const parseResult = BriefSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid brief data', details: parseResult.error.format() });
  }

  const brief = parseResult.data;
  const eventId = `event-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    sendEvent('status', { step: 1, message: 'Analyzing event parameters & regional constraints...', progress: 20 });
    await new Promise(r => setTimeout(r, 600));

    sendEvent('status', { step: 2, message: 'Computing deterministic budget allocations & reserves...', progress: 40 });
    await new Promise(r => setTimeout(r, 600));

    sendEvent('status', { step: 3, message: 'Synthesizing ceremony milestones & T-minus rail...', progress: 65 });
    await new Promise(r => setTimeout(r, 700));

    sendEvent('status', { step: 4, message: 'Curating vendor checklist & high-priority must-ask questions...', progress: 85 });
    await new Promise(r => setTimeout(r, 600));

    // Generate actual plan
    const eventData = await plannerService.createPlan(brief, eventId);
    await EventRepository.saveEvent(eventData);

    sendEvent('status', { step: 5, message: 'Finalizing personalized celebration concepts & creative ideas...', progress: 100 });
    await new Promise(r => setTimeout(r, 400));

    sendEvent('complete', { eventId, event: eventData });
    res.end();
  } catch (err: any) {
    console.error('Error during generation SSE:', err);
    sendEvent('error', { message: err?.message || 'Plan generation failed' });
    res.end();
  }
});

// PATCH Budget Line Item
app.patch('/api/budget/:itemId', async (req: Request, res: Response) => {
  const itemId = String(req.params.itemId);
  const { planned, actual } = req.body;

  let targetEvent: EventData | undefined;
  for (const event of memoryEventsStore.values()) {
    if (event.budgetItems.some(i => i.id === itemId)) {
      targetEvent = event;
      break;
    }
  }

  if (!targetEvent) {
    return res.status(404).json({ error: 'Budget item not found' });
  }

  const item = targetEvent.budgetItems.find(i => i.id === itemId)!;

  if (actual !== undefined) {
    item.actual = Number(actual);
  }

  if (planned !== undefined) {
    const { items, warning } = BudgetEngine.adjustItem(
      targetEvent.budgetItems,
      itemId,
      Number(planned),
      targetEvent.totalBudget
    );
    targetEvent.budgetItems = items;
    await EventRepository.saveEvent(targetEvent);
    return res.json({ item, items, warning });
  }

  await EventRepository.saveEvent(targetEvent);
  res.json({ item, items: targetEvent.budgetItems });
});

// PATCH Task Status
app.patch('/api/tasks/:id', async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { status, dueDate } = req.body;

  let targetEvent: EventData | undefined;
  for (const event of memoryEventsStore.values()) {
    if (event.timelineTasks.some(t => t.id === id)) {
      targetEvent = event;
      break;
    }
  }

  if (!targetEvent) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const task = targetEvent.timelineTasks.find(t => t.id === id)!;
  if (status) task.status = status;
  if (dueDate) task.dueDate = dueDate;

  // Recompute readiness score
  const doneTasks = targetEvent.timelineTasks.filter(t => t.status === 'done').length;
  targetEvent.readinessPct = Math.round((doneTasks / targetEvent.timelineTasks.length) * 85 + 15);
  await EventRepository.saveEvent(targetEvent);

  res.json({ task, readinessPct: targetEvent.readinessPct });
});

// POST Add custom task
app.post('/api/events/:id/tasks', async (req: Request, res: Response) => {
  const eventId = String(req.params.id);
  const event = await EventRepository.getEvent(eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const { title, phase, dueDate, category } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const newTask = {
    id: `task-custom-${Date.now()}`,
    eventId: event.id,
    title,
    phase: phase || 'details',
    dueOffsetDays: 0,
    dueDate: dueDate || event.eventDate,
    status: 'todo' as const,
    category: category || 'custom',
    isCompressed: false,
    isOverdue: false,
    aiGenerated: false,
    sortOrder: event.timelineTasks.length + 1
  };

  event.timelineTasks.push(newTask);
  await EventRepository.saveEvent(event);
  res.status(201).json(newTask);
});

// PATCH Vendor Status / Quote
app.patch('/api/vendors/:id', async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { status, vendorName, contact, quote, notes } = req.body;

  let targetEvent: EventData | undefined;
  for (const event of memoryEventsStore.values()) {
    if (event.vendorChecklist.some(v => v.id === id)) {
      targetEvent = event;
      break;
    }
  }

  if (!targetEvent) {
    return res.status(404).json({ error: 'Vendor item not found' });
  }

  const vendor = targetEvent.vendorChecklist.find(v => v.id === id)!;
  if (status) vendor.status = status;
  if (vendorName !== undefined) vendor.vendorName = vendorName;
  if (contact !== undefined) vendor.contact = contact;
  if (quote !== undefined) vendor.quote = Number(quote);
  if (notes !== undefined) vendor.notes = notes;

  await EventRepository.saveEvent(targetEvent);
  res.json(vendor);
});

// POST Re-plan Event
app.post('/api/events/:id/replan', async (req: Request, res: Response) => {
  const eventId = String(req.params.id);
  const event = await EventRepository.getEvent(eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const parseResult = ReplanRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid replan parameters', details: parseResult.error.format() });
  }

  const response = ReplanService.replan(event, parseResult.data);
  await EventRepository.saveEvent(response.updatedEvent);

  res.json(response);
});

// Catch-all route to serve client index.html for SPA routing
app.get('*', (req: Request, res: Response, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexHtml = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }
  next();
});

// Local dev only. On Vercel the default export is the entrypoint.
if (!process.env.VERCEL) {
  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`[Jashn Server] REST & SSE service listening on port ${port}`);
  });
}

export default app;
