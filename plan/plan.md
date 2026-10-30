# JASHN — GenAI Celebration & Event Planner
### PromptWars · Challenge 5 · Build Plan v2

> **Problem statement:** Create a GenAI-powered planning assistant that helps users organize weddings, birthdays, and community events with budgets, timelines, vendor checklists, and personalized ideas.

`JASHN` (Hindi/Urdu: celebration) is the working name.

**What changed in v2:** deployable stack finalised (Supabase + two Vercel projects from one repo), deployment runbook added, design language replaced (flat color slabs instead of glow/gradients), demo no longer depends on the LLM, and "deploy a skeleton first" moved to the very start.

---

## 0. Winning thesis

Most submissions will be "chat box that returns a wall of markdown". Judges score whether the output is **usable**, not long.

1. **Structured, editable plan, not chat text.** The AI returns validated JSON that becomes a live budget, dated timeline, vendor pipeline and idea cards. Everything is editable and persisted.
2. **The LLM never does arithmetic.** It proposes percentages and day-offsets; the server computes rupee amounts and calendar dates. Budget always sums to the total.
3. **Re-planning with a diff.** "Guests 220 → 300", "cut budget 20%", "move date earlier" recomputes the plan and shows what changed and why. This is the demo closer.
4. **India-aware.** INR, ceremony-level structure (Mehendi / Haldi / Sangeet / Wedding / Reception), city-tier pricing, muhurat lead times.
5. **A distinctive UI** that does not look like a template (§9).
6. **The demo cannot fail.** The "Nagpur Royal Wedding" demo is a hand-curated fixture cloned into the user's account. It works even if Gemini is down or out of quota.

**Non-goals:** real payments, real vendor marketplace, multi-user collaboration, native app. Put them on the roadmap slide, do not build them.

**Current status (from your screenshots):** landing page v1 runs locally at `localhost:3000` and needs the restyle in §9 / Appendix A. A re-plan sheet component already exists in the client.

---

## 1. Scope

### MVP (ship in this order)
| # | Feature | Done when |
|---|---------|-----------|
| 0 | **Deploy skeleton** (client + API + Supabase wired, health check green) | Public URLs work before any feature exists |
| 1 | Guest mode (Supabase anonymous auth) + brief wizard | User starts without signup |
| 2 | AI plan generation (budget + timeline + vendors + ideas) | One click gives a validated plan |
| 3 | Demo clone ("Try Nagpur Royal Wedding") | Works with the LLM turned off |
| 4 | Dashboard with 5 tabs | All data from DB, editable |
| 5 | Budget: planned vs actual, always reconciles | Totals exact |
| 6 | Timeline: T-minus rail, status, overdue | Tasks tick, overdue flagged |
| 7 | Vendor pipeline | To contact → Booked |
| 8 | Re-plan with animated diff | Change one input, see what moved |

### Stretch (only after MVP is deployed)
Assistant chat that can act (function calling) · print/PDF export · shareable read-only link · Hindi/Marathi toggle · idea regeneration.

---

## 2. Architecture

```
                    ┌──────────── GitHub monorepo (main) ────────────┐
                    │  client/        server/        supabase/       │
                    └───────┬────────────────┬───────────────────────┘
                            │ Git push       │ Git push
                 ┌──────────▼──────┐  ┌──────▼─────────────────────────┐
                 │ Vercel Project A│  │ Vercel Project B               │
                 │ jashn-web       │  │ jashn-api                      │
                 │ Root: client/   │  │ Root: server/                  │
                 │ Vite static+CDN │  │ Express = ONE Vercel Function  │
                 └──────────┬──────┘  │ (Fluid compute, streaming)     │
                            │         └───────┬───────────────┬────────┘
        fetch + Bearer JWT  │                 │ supabase-js   │ @google/genai
        (CORS allowlist)    └────────────────►│ (HTTPS)       │
                                              ▼               ▼
                                     ┌────────────────┐  ┌──────────────┐
                                     │ Supabase       │  │ Gemini API   │
                                     │ Postgres + RLS │  │ (Flash tier) │
                                     │ Anonymous Auth │  └──────────────┘
                                     └────────────────┘
```

### Key decisions and trade-offs

| Decision | Why | Trade-off |
|----------|-----|-----------|
| **Two Vercel projects from one repo** (web + api) | Clean separation, independent deploys, each gets its own env vars | Two URLs and a CORS config. Alternative: one project with a rewrite proxy; rejected because proxied streaming adds a failure mode you do not need |
| **Express as a single Vercel Function** | Vercel detects Express with zero config when `src/index.ts` default-exports the app; runs on Fluid compute and supports response streaming | The whole app is one function: keep dependencies light to limit cold starts |
| **supabase-js over HTTPS, no raw Postgres driver** | Serverless + direct Postgres connections can exhaust connection limits; PostgREST over HTTPS has no pool to manage | Less SQL freedom. For complex queries use Postgres functions (RPC) or, if you must use `pg`/Drizzle, the **pooled** connection string |
| **Anonymous auth** | No signup friction; real `auth.uid()` so RLS is genuine | Anonymous users are lost if they clear storage; offer "Save my plan" email link later |
| **Fetch-based streaming for generation progress** | `EventSource` is GET-only and cannot send an `Authorization` header | Slightly more client code (a `ReadableStream` reader), fully controllable |
| **Demo = fixture clone, not an LLM call** | Zero quota risk, instant, identical every time | Must keep the fixture quality high; it is your showpiece |

---

## 3. Tech stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Frontend | React + Vite + TypeScript (strict) | Static build, deploys as CDN assets |
| Styling | Tailwind + CSS variables | Tokens in §9.2 |
| Animation | Motion (`motion/react`) | Only the restrained set in §9.5. No GSAP / Three.js / Lenis |
| Client data | TanStack Query | Optimistic updates for task ticking |
| UI state | Zustand | Tiny |
| Backend | Node + Express + TypeScript | Single function on Vercel |
| Validation | Zod, shared package | One schema validates LLM output, API input, and types the client |
| Database | Supabase Postgres + RLS + Anonymous Auth | Free tier |
| LLM | Gemini Flash-tier via `@google/genai` | Model id in env var `GEMINI_MODEL`. Default `gemini-2.5-flash`, fallback `gemini-2.5-flash-lite`. Newer preview models exist but preview models change and have tighter limits; **check the model list and your free-tier rate limits in Google AI Studio before the final week** |
| Hosting | Vercel (Hobby is fine for a hackathon; it is non-commercial use) | See §11 |
| CI | GitHub Actions: typecheck + lint + engine tests | |

**Gemini schema note:** Gemini's structured output supports simple objects, arrays and enums but is restrictive with `anyOf` / polymorphic types. The schema in §4.3 is deliberately flat for this reason.

---

## 4. AI design

### 4.1 Pipeline
```
Brief ─► Normalise ─► Planner call (JSON) ─► Zod validate ─► Engines compute ─► Persist
         cityTier,     % budget, tasks as     1 repair        ₹ amounts,         events, budget_items,
         event rules   T-minus days, vendor   retry, then     real dates,        timeline_tasks,
                       categories             FALLBACK        invariants         vendor_checklist
              └──► Ideas call (parallel, Promise.all) ─────────────────────────► ideas
```
Two parallel calls: lower latency, smaller failure surface; ideas can fail without losing the plan.

### 4.2 The LLM proposes, the server disposes
| LLM output | Server converts to |
|------------|--------------------|
| `allocation_pct` per category | ₹ via `budgetEngine`; rounding remainder goes to Contingency so the sum is exact |
| `due_offset_days` | `due_date = eventDate − offset`; if already past, clamp to today and flag **"compressed timeline"** |
| `vendor_category` + `must_ask` | Checklist rows, status `to_contact` |
| `est_cost_pct` on ideas | Estimated ₹ range |

**Invariants (unit tested):**
- `sum(planned) == total_budget`
- No task dated after the event date
- Every vendor category referenced by a budget line exists in the checklist
- Contingency ≥ 5%

### 4.3 Structured output schema (shared Zod)
```ts
export const PlanSchema = z.object({
  summary: z.string().max(300),
  budget: z.array(z.object({
    category: z.enum(['venue','catering','decor','photo_video','entertainment',
                      'attire','invitations','transport','gifts','misc','contingency']),
    label: z.string(),
    allocation_pct: z.number().min(0).max(100),
    rationale: z.string().max(160),
  })).min(5),
  timeline: z.array(z.object({
    title: z.string(),
    phase: z.enum(['foundation','booking','details','final_month','event_week','event_day','after']),
    due_offset_days: z.number().int().min(0).max(540),
    category: z.string().optional(),
  })).min(10),
  vendors: z.array(z.object({
    category: z.string(),
    why: z.string().max(140),
    must_ask: z.array(z.string()).min(2).max(5),
  })).min(4),
  risks: z.array(z.string()).max(5),
});
```

### 4.4 Prompt skeleton (system)
```
You are a professional event planner operating in India.
Return ONLY JSON matching the provided schema. Do not do currency arithmetic;
give percentages and day offsets only.

Context:
- Event type: {type} | City: {city} (tier {tier}) | Guests: {guests}
- Total budget: {budget} INR | Date: {date} | Days until event: {daysLeft}
- Vibe / constraints: {vibe}, {dietary}, {cultural_notes}

Rules:
- Weddings: split by ceremony when named; include muhurat and venue lock lead times.
- If daysLeft < typical lead time, compress the timeline and add a risk entry.
- Tier-2/3 cities: weight venue/catering value over premium decor.
- Always include contingency (min 5%).
- must_ask items must be specific and answerable ("Is overtime billed per hour?").
```
Store prompts as versioned files in `server/src/ai/prompts/`, never inline strings. User text goes in the user role only, never interpolated into the system prompt.

### 4.5 Re-plan (the demo moment)
`POST /events/:id/replan` with a change set (`guests`, `budget`, `date`). Send current plan + change to the model asking only for **adjustments**, apply via engines, return:
```json
{ "budget_diff": [{ "category": "catering", "from": 400000, "to": 560000, "reason": "..." }],
  "tasks_added": [], "tasks_moved": [], "warnings": [] }
```
For guest-count changes, the engine can compute catering/venue scaling **deterministically** (per-plate and per-guest cost ratios) and only ask the LLM for the *explanations* and any new tasks. That makes the diff reliable and faster.

### 4.6 Failure handling
- Zod validate → one repair retry with the validation error appended → else **curated fallback plan** per event type (hand-written JSON in `server/src/ai/fallbackPlans/`). The user never sees an error screen.
- LLM timeout 25 s; progress stream keeps the UI alive.
- Rate-limit the generate route per user (5/min) to protect quota.
- Log every run to `ai_runs` (latency, model, ok). Use the numbers in your presentation.

---

## 5. Database (Supabase Postgres)

Run as `supabase/migrations/0001_init.sql` in the Supabase SQL editor.

```sql
create type event_type    as enum ('wedding','birthday','community');
create type task_status   as enum ('todo','doing','done');
create type vendor_status as enum ('to_contact','contacted','quoted','booked','rejected');

create table events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  type event_type not null,
  title text not null,
  event_date date not null,
  city text not null,
  city_tier smallint not null default 2,
  guest_count int not null check (guest_count > 0),
  total_budget numeric(12,2) not null check (total_budget > 0),
  currency text not null default 'INR',
  vibe text[] default '{}',
  preferences jsonb not null default '{}',
  summary text,
  is_demo boolean not null default false,
  created_at timestamptz default now()
);

create table budget_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  category text not null,
  label text not null,
  planned numeric(12,2) not null,
  actual numeric(12,2) not null default 0,
  rationale text,
  ai_generated boolean default true,
  sort_order int default 0
);

create table timeline_tasks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  title text not null,
  phase text not null,
  due_date date not null,
  status task_status not null default 'todo',
  category text,
  ai_generated boolean default true,
  sort_order int default 0
);

create table vendor_checklist (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  category text not null,
  why text,
  must_ask text[] default '{}',
  vendor_name text,
  contact text,
  quote numeric(12,2),
  status vendor_status not null default 'to_contact',
  notes text
);

create table ideas (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  kind text not null,               -- theme | decor | menu | entertainment | gift | activity
  title text not null,
  description text not null,
  est_cost_min numeric(12,2),
  est_cost_max numeric(12,2),
  saved boolean default false
);

create table ai_runs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete set null,
  kind text not null,               -- generate | replan | ideas | chat
  model text, latency_ms int, ok boolean,
  input jsonb, output jsonb,
  created_at timestamptz default now()
);

create index on events(owner_id);
create index on budget_items(event_id);
create index on timeline_tasks(event_id, due_date);
create index on vendor_checklist(event_id);
create index on ideas(event_id);
```

### Row Level Security
```sql
alter table events           enable row level security;
alter table budget_items     enable row level security;
alter table timeline_tasks   enable row level security;
alter table vendor_checklist enable row level security;
alter table ideas            enable row level security;
alter table ai_runs          enable row level security;

create policy "own events" on events
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- repeat for each child table (budget_items, timeline_tasks, vendor_checklist, ideas):
create policy "own budget_items" on budget_items
  for all using (exists (select 1 from events e where e.id = event_id and e.owner_id = auth.uid()))
  with check (exists (select 1 from events e where e.id = event_id and e.owner_id = auth.uid()));

-- ai_runs: no policy = no client access. Only the server (service role) writes/reads it.
```
**How the server respects RLS:** create a per-request Supabase client with the **anon key** and the caller's `Authorization` header, so every query runs *as that user*. Use the **service-role key only** for `ai_runs` logging. Never use the service-role key for user-facing reads/writes; it bypasses RLS entirely.

**Verify:** open two browsers (two anonymous sessions), create an event in one, confirm the other cannot read it by id.

### Supabase dashboard settings
- Authentication → Providers → enable **Anonymous sign-ins**
- Authentication → URL configuration → add your Vercel web URL(s) as Site URL / redirect URLs
- Project Settings → API: copy URL, anon key (client + server), service-role key (server only), never commit it

---

## 6. API surface

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/health` | Warm-up + uptime check |
| POST | `/api/events/generate` | Body: brief. **Streams progress**, ends with `{eventId}` |
| POST | `/api/demo/clone` | Clones the Nagpur Royal Wedding fixture into the caller's account |
| GET | `/api/events` | List the caller's events |
| GET | `/api/events/:id` | Event + budget + tasks + vendors + ideas |
| PATCH | `/api/events/:id` | Update brief fields |
| POST | `/api/events/:id/replan` | Change set → diff, persisted |
| PATCH | `/api/budget/:itemId` | Edit planned/actual |
| PATCH | `/api/tasks/:id` | Status / date |
| POST | `/api/events/:id/tasks` | Add custom task |
| PATCH | `/api/vendors/:id` | Pipeline status, quote, contact |
| POST | `/api/events/:id/ideas/regenerate` | New ideas by kind |
| POST | `/api/events/:id/chat` | *(stretch)* function-calling assistant |

**Auth middleware:** read `Authorization: Bearer <jwt>`, validate with `supabase.auth.getUser(jwt)`, reject 401 otherwise, attach a per-request client. Add `express-rate-limit` on `/generate` (and `/replan`).

**Streaming the generate route (important on Vercel):**
```ts
res.status(200);
res.setHeader('Content-Type', 'text/event-stream');
res.setHeader('Cache-Control', 'no-cache, no-transform');
res.setHeader('Connection', 'keep-alive');
res.flushHeaders();
const send = (event: string, data: unknown) =>
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
send('step', { id: 'budget', label: 'Allocating budget' });
```
Do **not** use the `compression` middleware on this route (it buffers and breaks streaming). Client reads it with `fetch()` + `response.body.getReader()` so it can send the Bearer header.

---

## 7. Repo structure

```
jashn/
├─ client/                      # Vercel Project A (Root Directory = client)
│  ├─ index.html
│  ├─ vercel.json               # SPA fallback rewrite
│  ├─ vite.config.ts
│  ├─ .env.example
│  └─ src/
│     ├─ app/                   # router, providers (Query, Supabase session)
│     ├─ pages/                 # Landing, Builder, Generating, Dashboard
│     ├─ features/
│     │  ├─ brief/              # wizard steps
│     │  ├─ plan-stream/        # fetch-stream hook + generating view
│     │  ├─ budget/             # AllocationBar, BudgetTable
│     │  ├─ timeline/           # TMinusRail, TaskCard
│     │  ├─ vendors/            # PipelineBoard, VendorCard
│     │  ├─ ideas/              # IdeaCard, IdeaGrid
│     │  ├─ replan/             # ReplanSheet, DiffView
│     │  └─ assistant/          # (stretch)
│     ├─ components/ui/         # Button, Card, Chip, Slab, CountUp, Marquee, MaskLine
│     ├─ lib/                   # api client, supabase client, ₹ format, cn()
│     ├─ styles/                # tokens.css, globals.css
│     └─ motion/                # shared variants/easings
├─ server/                      # Vercel Project B (Root Directory = server)
│  ├─ package.json              # "type": "module"
│  ├─ tsconfig.json
│  ├─ .env.example
│  └─ src/
│     ├─ index.ts               # builds app, `export default app`
│     ├─ routes/                # events, budget, tasks, vendors, ideas, demo, health
│     ├─ services/              # PlannerService, ReplanService, IdeasService, DemoService
│     ├─ engines/               # budgetEngine.ts, dateEngine.ts (pure, tested)
│     ├─ ai/                    # client.ts, prompts/, fallbackPlans/
│     ├─ fixtures/              # nagpur-royal-wedding.json
│     ├─ middleware/            # auth, rateLimit, cors, errorHandler
│     └─ lib/                   # supabase clients (user / service)
├─ packages/shared/             # zod schemas + types (workspace package)
├─ supabase/
│  ├─ migrations/0001_init.sql
│  └─ seed.sql                  # optional
├─ docs/
│  ├─ plan.md                   # this file
│  └─ features/                 # one MD per feature branch
├─ .github/workflows/ci.yml
└─ README.md
```
**Monorepo tip:** use npm workspaces (`client`, `server`, `packages/shared`). On Vercel, set each project's Root Directory and make sure "Include source files outside of the Root Directory" is enabled so the shared package resolves. If that causes friction, copy `packages/shared` into both apps at build time or publish the schema as a file imported by relative path; do not lose time fighting it.

---

## 8. Git workflow

```
main      ← production (both Vercel projects deploy from here)
develop   ← integration (Vercel preview deployments)
feature/00-deploy-skeleton     hello-world client + /api/health + Supabase wired, both deployed
feature/01-foundation          tokens, fonts, router, CI
feature/02-supabase-schema     migrations, RLS, anonymous auth
feature/03-shared-schemas      zod plan schema
feature/04-engines             budgetEngine, dateEngine + tests
feature/05-ai-planner          prompts, Gemini client, repair, fallback
feature/06-brief-wizard
feature/07-generation-stream   streaming endpoint + generating view
feature/08-demo-clone          fixture + /demo/clone
feature/09-dashboard-shell
feature/10-budget-module
feature/11-timeline-module
feature/12-vendor-pipeline
feature/13-ideas-module
feature/14-replan-diff
feature/15-design-restyle      flat-slab language pass (Appendix A)
feature/16-polish-demo         seed, README, video, deck
```
Each branch gets `docs/features/NN-name.md`: goal, acceptance criteria, API/DB touched, test checklist. Commits: `feat(budget): ...`. Squash-merge into `develop`; `develop → main` only after a smoke test.

---

## 9. UI / design system (flat color slabs)

### 9.1 What the reference actually is
Your Instagram carousel slides are **flat, full-bleed solid color blocks** with **huge, ultra-heavy, tightly tracked wide-grotesque type** that nearly touches both edges, small bordered pills, and tiny editorial corner labels (`2026 | All Rights Reserved`, `SWIPE ›`, `5/8`). There are no gradients, glows, blurs or shadows. Copy that language.

### 9.2 Palette and tokens
Use **Rich Black `#010B13` as the main canvas**, **Powder White `#EBF1F5`**, and **Cyan Aash `#00E5FF` as a slab color**. Steel Black `#111111` is a secondary slab for CTA/footer/marquee only.

```css
:root {
  --rich-black:  #010B13;
  --steel-black: #111111;
  --powder:      #EBF1F5;
  --cyan:        #00E5FF;
  --ink:         /* eyedrop the dark indigo-navy used on the Powder White slide */;
  --surface:     #07151F;                 /* cards on rich-black slabs */
  --line:        rgb(235 241 245 / 0.12); /* 1px borders */
  --muted:       rgb(235 241 245 / 0.62);
  --ok: #3DDC97; --warn: #FFB020; --danger: #FF5C7A;
  --ease: cubic-bezier(.22,1,.36,1);
  --radius: 18px;
}
```
**Color-flip rule (from the reference):** Cyan slab → `--rich-black` text. Rich Black slab → Powder or Cyan text. Powder slab → `--ink` text. Steel Black slab → Cyan or Powder text.

### 9.3 Typography
| Role | Font | Settings |
|------|------|----------|
| Display | **Archivo** (variable, Google Fonts) | `wdth 125`, `wght 900`, UPPERCASE, `letter-spacing: -0.045em`, `line-height: 0.88`, size `clamp(3rem, 11.5vw, 12rem)` for heroes |
| Body / UI / chips | **Manrope** 400–700 | Chips: 600, uppercase, 11–12 px, tracking 0.06em |
| Numbers | Archivo display with `tabular-nums` | **No monospace font anywhere**; mono labels are a strong "AI-built" tell |

Preload display + body, `font-display: swap`. Test the hero at 1440 px **and 390 px**: edge-to-edge type is where most builds break on mobile.

### 9.4 Rules
**Do:** flat fills · full-bleed slabs · left-aligned asymmetric layouts · oversized numerals · 1 px borders · one chip group per section · tiny corner labels · human copy.

**Never:** gradients, radial glows, grid/dot backgrounds, backdrop-blur, box-shadows, glassmorphism, centered hero, four equal feature columns, icon-in-rounded-square rows, monospace text, status pills, buzzwords ("command center", "operating system", "Invariant Engine", "Zero-Crash AI").

### 9.5 Motion (only these)
All `transform` / `opacity` / `clip-path`, easing `--ease`, honour `prefers-reduced-motion`.

| # | Where | Effect |
|---|-------|--------|
| 1 | Headlines | Lines slide up from an `overflow:hidden` mask, 60 ms stagger |
| 2 | Slabs | `clip-path: inset(100% 0 0 0)` → `inset(0)` wipe on first scroll-in, once |
| 3 | Marquee strip | Slow linear loop |
| 4 | Figures | `CountUp` for ₹ and day numbers, also on re-plan change |
| 5 | Cards | **Hover inverts the card to a cyan fill with `--rich-black` text** (180 ms). Replaces glow |
| 6 | Timeline / budget | `layout` animation when tasks or segments move |
| 7 | Generating screen | Step list with text-scramble on the active step, progress bar fills per stream event |
| 8 | Routes | 300 ms slab-wipe transition |

No parallax, floating shapes, particles or smooth-scroll hijacking.

### 9.6 Landing structure
1. **Nav:** flat, 1 px bottom rule, logo left, pill "Try demo" right.
2. **Hero (two stacked slabs):** top Rich Black `PLAN THE / CELEBRATION.` in Powder; bottom Cyan `NOT THE CHAOS.` in Rich Black. One chip row `WEDDING · BIRTHDAY · COMMUNITY`. One line of subcopy (≤18 words), primary button, secondary link. Corner labels `2026 | JASHN` and `SCROLL ›`.
3. **Marquee** (Steel Black slab, Cyan text): `WEDDINGS ✦ BIRTHDAYS ✦ COMMUNITY EVENTS ✦`
4. **How it works** (Powder slab): three full-width rows with giant `01 02 03`, 1 px rules. "Tell us the occasion" / "Get a plan that adds up" / "Change one thing, watch it all move".
5. **Proof** (Cyan slab): four oversized statements. "Budgets that always add up." / "Real dates, counted back from the day." / "Change the guest list, see exactly what moves." / "Never a blank screen, even when the AI stumbles."
6. **CTA** (Steel Black): `TRY THE NAGPUR ROYAL WEDDING` + Cyan button. Footer = tiny corner labels only.

### 9.7 Dashboard
- Header band in Cyan: event title in display type, **days-left as a giant numeral**
- Tabs are pills; active = Rich Black fill on cyan
- *Overview:* readiness %, top risks, next 3 tasks
- *Budget:* flat **allocation bar** using only cyan / powder / steel tonal steps (no rainbow), planned vs actual table, over-budget warning
- *Timeline:* horizontal **T-minus rail** (T-90 … T-0), overdue in `--warn`
- *Vendors:* 4-column pipeline; `must_ask` as a tap-to-copy checklist
- *Ideas:* masonry cards by kind with a save toggle
- *Re-plan:* slide-over with three inputs and the animated diff
- Cards: flat `--surface`, 1 px border, no shadow

### 9.8 Logo (Gemini prompt)
Generate the **mark only** (image models garble lettering); set the wordmark in Archivo 900 yourself. Prefer a sharp-cornered or fully circular mark to suit the flat slabs.
```
Design a minimal vector-style logo mark for an AI event planning product named
"Jashn". Concept: a bold four-point sparkle star whose lower-right arm resolves
into a checkmark, symbolising celebration and completed planning. Flat design,
geometric, symmetrical, thick uniform shapes, sharp clean edges. Single colour
electric cyan (#00E5FF) on a solid deep navy-black background (#010B13). No
gradients, no shadows, no 3D, no texture, no text, no letters. Centered with
generous padding, square 1:1, suitable for favicon and app icon.
```
Variations: *letter J whose top is a sparkle* · *square calendar with a sparkle corner* · *ring of confetti dots around an empty centre*.
Finish: test at 32 px → vectorise (Inkscape Trace Bitmap) → export `logo.svg`, `favicon.svg`, `apple-touch-icon.png` (180), `og-image.png` (1200×630).

---

## 10. Environment variables

**client/.env.example** (Vercel Project A → Settings → Environment Variables)
```
VITE_API_URL=https://jashn-api.vercel.app
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```
**server/.env.example** (Vercel Project B)
```
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>   # server only, never in client
GEMINI_API_KEY=<key from Google AI Studio>
GEMINI_MODEL=gemini-2.5-flash
GEMINI_MODEL_FALLBACK=gemini-2.5-flash-lite
ALLOWED_ORIGINS=https://jashn-web.vercel.app,http://localhost:5173
```
Anything prefixed `VITE_` is public in the browser bundle. Never put a secret behind that prefix.

---

## 11. Deployment runbook (Vercel + Supabase)

### 11.1 Server entry (`server/src/index.ts`)
```ts
import express from 'express';
import cors from 'cors';
import { authMiddleware } from './middleware/auth.js';
import { routes } from './routes/index.js';

const app = express();
const allowed = (process.env.ALLOWED_ORIGINS ?? '').split(',').filter(Boolean);

app.use(cors({
  origin: (origin, cb) =>
    !origin || allowed.includes(origin) || /^https:\/\/jashn-web-.*\.vercel\.app$/.test(origin)
      ? cb(null, true) : cb(new Error('CORS blocked')),
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, t: Date.now() }));
app.use('/api', authMiddleware, routes);

// Local dev only. On Vercel the default export is the entrypoint.
if (!process.env.VERCEL) {
  app.listen(process.env.PORT ?? 4000, () => console.log('API on :4000'));
}
export default app;
```
The regex permits Vercel **preview** URLs of the web project (`jashn-web-<hash>-<team>.vercel.app`); adjust it to your actual project name. Place the entry at `src/index.ts` so Vercel detects it. Vercel's Express support requires a recent CLI (47.0.5 or newer).

### 11.2 Client SPA fallback (`client/vercel.json`)
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

### 11.3 Step-by-step
1. **Supabase:** create project → run `0001_init.sql` + RLS → enable Anonymous sign-ins → copy URL / anon / service-role keys.
2. **Gemini:** create an API key in Google AI Studio; confirm the model id and your free-tier limits there.
3. **Push** the monorepo to GitHub.
4. **Vercel Project B (API):** Import repo → **Root Directory `server`** → framework detected as Express → add env vars from §10 → deploy → open `https://<api>/api/health`.
5. **Vercel Project A (web):** Import the same repo → **Root Directory `client`** → Vite preset → set `VITE_API_URL` to the API URL → deploy.
6. Put the web URL into the API's `ALLOWED_ORIGINS` and Supabase's Auth URL configuration → redeploy the API.
7. **Smoke test on a real phone:** open the site → anonymous session starts → "Try Nagpur Royal Wedding" clones → generate a fresh plan → tick a task → run a re-plan.
8. Set a production branch (`main`); preview deployments for `develop` and PRs come free.

### 11.4 Platform limits worth knowing (verified against current Vercel docs)
- With Fluid compute (default for new projects), Hobby functions default to and max out at **300 s**. The earlier worry about a ~10 s limit no longer applies; a 6–15 s Gemini call is fine.
- Express runs as **one function** with response streaming support.
- Hobby is for non-commercial use; fine for a hackathon, not for a paid product.
- **Supabase free projects pause after a period of inactivity.** Open the dashboard and hit the app the day before and the morning of the demo.
- `express.static()` does not serve assets on Vercel; this API has none, so ignore.

### 11.5 Local development
```
supabase: use the hosted project (simplest) — no local Docker needed
server:   npm run dev   (tsx watch src/index.ts → :4000)
client:   npm run dev   (:5173, VITE_API_URL=http://localhost:4000)
```
`vercel dev` also works for the server if you want to mirror production behaviour.

---

## 12. Execution timeline

I still do not know your submission deadline (the countdown in your first screenshot was cut off): **confirm it**. Plan in blocks and cut from the bottom.

| Block | Output | Branches |
|-------|--------|----------|
| 0 | **Deploy skeleton live on both Vercel projects + Supabase** | 00 |
| 1 | Tokens/fonts, schema + RLS, shared Zod, engines with tests | 01–04 |
| 2 | AI planner + fallback, generate stream, demo clone | 05, 07, 08 |
| 3 | Brief wizard, dashboard shell, budget, timeline | 06, 09–11 |
| 4 | Vendors, ideas | 12–13 |
| **Checkpoint: full MVP on the public URL, tested on a phone** | | |
| 5 | Re-plan diff, **design restyle**, mobile pass | 14–15 |
| 6 | README, demo video, deck, rehearsal | 16 |

**Cut line if time collapses:** drop ideas regeneration, drop landing marquee and wipe transitions, simplify re-plan diff to a plain list. **Never drop:** validation, fallback plan, demo clone, deployed URL.

---

## 13. Risks and mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| LLM returns invalid JSON | Broken demo | Schema mode + Zod + repair retry + curated fallback |
| LLM arithmetic errors | Budget does not add up | Percentages only; engines compute; unit tests |
| Gemini free-tier quota or model deprecation | Generation fails live | Model id in env, fallback model, per-user rate limit, **demo clone needs no LLM**, record a backup video |
| CORS misconfig between the two Vercel projects | Every call fails in prod | Allowlist + preview regex; test the deployed pair on day 0 |
| Streaming buffered (compression/proxy) | Generating screen freezes then dumps | No `compression`, `no-transform` header, `flushHeaders()`, test on the deployed URL |
| Supabase project paused | First request fails | Warm up before demo; `/health` pings |
| RLS misconfigured or service-role key misused | Data leak | Per-request user client, service role only for `ai_runs`, two-session test |
| Secrets leak to client bundle | Key compromise | Only `VITE_` public values in client; `.env` in `.gitignore`; rotate if exposed |
| Edge-to-edge hero type breaks on phones | Looks broken | `clamp()`, test at 390 px |
| Design drifts back to generic AI look | Lower score | Appendix A checklist; compare side by side with the reference slides |
| Scope creep | Unfinished MVP | MVP table in §1 is the contract |

---

## 14. Demo and presentation strategy

### 3-minute demo
1. **(0:00)** "Planning a wedding means 200 decisions across budget, time and vendors. JASHN turns one brief into a living plan."
2. **(0:15)** Fill the brief live: wedding, Nagpur, 220 guests, ₹18 lakh, 75 days away.
3. **(0:35)** Generating screen streams steps. One sentence on structured output while it runs.
4. **(1:00)** Dashboard: budget sums exactly (engine, not LLM). Timeline shows the **compressed-timeline** warning caused by the short lead time.
5. **(1:40)** Vendors: open a card, show `must_ask` questions. Tick a task, enter a quote.
6. **(2:00)** **Re-plan:** guests 220 → 300. Diff animates.
7. **(2:40)** Architecture slide, roadmap, ask.

**Backup:** if anything fails live, click "Try Nagpur Royal Wedding" (fixture, no LLM) and continue from step 4.

### Deck (6 slides)
Problem · Solution screenshot · Pipeline diagram (§4.1) · Why it is trustworthy (engines, validation, fallback, RLS) · Live demo / video · Roadmap.

### Submission hygiene
README with live URLs, architecture diagram, setup steps, env list · "Try demo" button so judges never see an empty app · 60–90 s backup screen recording · mobile screenshots.

---

## 15. Post-hackathon

Function-calling assistant that edits the plan · vendor marketplace with real quotes · WhatsApp/voice interface · collaboration with roles · Hindi/Marathi · learned pricing from anonymised actuals.

---

## 16. Definition of done

- [ ] Both Vercel URLs live; `/api/health` green; works on a phone
- [ ] Anonymous session → generate → dashboard, with streaming feedback
- [ ] Demo clone works with `GEMINI_API_KEY` removed
- [ ] Budget sums exactly in every test run
- [ ] Fallback plan triggers when the LLM is forced to fail
- [ ] Two-session RLS isolation verified
- [ ] Re-plan diff accurate
- [ ] Design checklist (Appendix A) passes against the reference slides
- [ ] README, backup video, deck complete

---

## Appendix A — UI restyle prompt (paste into your AI coding tool, attach all four reference slides)

````
ROLE: Senior art director + frontend engineer. The current JASHN UI looks
AI-generated and generic. Redesign it to match the attached reference slides.
The palette is already approved; the problem is the design language.

REFERENCE DESIGN LANGUAGE (extract and obey):
- FLAT COLOR SLABS. Every section is a full-bleed solid block. Hero = two
  stacked slabs. No gradients, no glow, no blur, no glassmorphism, no shadows,
  no grid/dot patterns, no vignette. Flat fills only.
- COMPLEMENTARY FLIPS: Cyan #00E5FF slab -> text #010B13. Rich Black #010B13
  slab -> text #EBF1F5 or cyan. Powder White #EBF1F5 slab -> very dark ink text
  (eyedrop the dark indigo-navy from the reference image, do not guess).
  Steel Black #111111 slab -> cyan or white text. Cyan is a SLAB color, not just
  a text color.
- TYPE IS THE LAYOUT. Display font: Archivo variable, wdth 125, wght 900,
  UPPERCASE, letter-spacing -0.045em, line-height 0.88. Headlines are sized to
  nearly touch both edges (~10-13vw via clamp), left-aligned, allowed to break
  into 2-3 stacked lines. Body: Manrope 400-600.
- CHIPS: small, rounded-full, 1px border, Manrope 600 uppercase 11-12px,
  slightly lighter fill than the slab. Max ONE chip group per section.
  Not monospace.
- EDITORIAL MICRO-DETAILS in slab corners: "2026 | JASHN", "SCROLL ›",
  section index "01/05", like "5/8" and "SWIPE ›" in the reference.
- ASYMMETRY: left-anchored layouts, oversized numerals, uneven column splits.
  No centered hero. No 4 equal feature columns. No icon-in-rounded-square rows.

DELETE (list what you remove before coding):
- background gradients, radial glows, grid backgrounds, backdrop-blur, box-shadows
- the "INR Invariant Engine · Active" status pill and the
  "PROMPTWARS · GENAI EVENT OPERATING SYSTEM" badge
- all monospace headings, the 4-column feature row, centered hero
- cursor-tracking glow cards
- buzzword copy: "command center", "operating system", "Invariant Engine",
  "Zero-Crash AI", "Discrepancy". Users should never see engineering terms.

LANDING PAGE STRUCTURE: see plan.md §9.6 (nav, two-slab hero, marquee,
how-it-works on Powder, proof on Cyan, CTA on Steel Black).

DASHBOARD: see plan.md §9.7 (Cyan header band with giant days-left numeral,
pill tabs, flat bordered cards that INVERT to cyan on hover, flat allocation bar).

MOTION (only these, transform/opacity/clip-path only):
1. Headline lines reveal by sliding up from an overflow:hidden mask, 60ms stagger.
2. Slabs enter with a clip-path wipe (inset bottom -> 0) as they scroll into view, once.
3. Marquee loop. 4. CountUp on figures. 5. Card hover color-invert.
6. Route change: slab wipe 300ms. Honor prefers-reduced-motion.
No parallax, no floating shapes, no particle effects.

ACCEPTANCE CHECKLIST (verify and report before finishing):
[ ] zero gradients/shadows/blur in the codebase (grep for gradient, shadow, blur)
[ ] every section is a flat full-bleed slab with a complementary text color
[ ] hero headline spans nearly the full viewport width at 1440px and 390px
[ ] no centered hero, no equal 4-column feature grid
[ ] no monospace font anywhere
[ ] no buzzword copy remains
[ ] side-by-side with the reference slides, it reads as the same family

Do it in two passes: (1) tokens, fonts, landing page; show me; (2) dashboard.
````