# JASHN — GenAI Celebration & Event Planner
### PromptWars · Challenge 5 · Submission

> **"Plan the celebration. Not the chaos."**  
> An Indian celebration planning platform that replaces generic markdown chat with structured, editable, mathematically invariant plans, real T-minus milestone rails, vendor checklist pipelines, and real-time re-planning with animated diffs.

---

## 🌟 Core Highlights & Differentiators

Most AI event planner submissions return a wall of markdown text from a generic LLM chat prompt. **JASHN** beats this baseline across five structural dimensions:

1. **Structured, Live Workspace (Not Chat Walls):**
   - Instant validated JSON schemas render into an interactive 5-tab dashboard (Overview, Budget Allocator, T-Minus Rail, Vendor Pipeline, Ideas). Every single item is editable and persisted.
2. **Deterministic Math Invariant (The LLM Never Does Currency Math):**
   - The LLM proposes category percentage weights ($w_i$) and relative day offsets.
   - The pure TypeScript `BudgetEngine` computes exact integer rupees, guarantees a **minimum 5% Contingency reserve**, and absorbs rounding discrepancies so that:
     $$\sum \text{Allocated INR} = \text{Total Event Budget}$$
3. **The Re-Plan "Demo Showstopper":**
   - Adjust guest count (e.g. 220 → 300 pax), adjust budget, or move event dates.
   - The system recomputes in real time and renders an **animated diff** showing what changed, which tasks shifted, and warning alerts (e.g. guest increase without budget increase).
4. **Culturally Authentic Indian Celebration Context:**
   - Pre-configured ceremony architectures (Haldi, Mehendi, Sangeet, Varmala, Reception).
   - City Tier pricing heuristics (Tier 1 vs Tier 2/3), sound curfew lead times, and specific vendor vetting questions (generator backup, staff-to-guest ratios, cold pyro clearance).
5. **Editorial Flat Color Slab Design Language:**
   - Full-bleed solid color blocks with **Archivo variable typography** (`wdth 125`, `wght 900`, uppercase, tight tracking), **Manrope** body type, complementary color flips (Cyan `#00E5FF` slab with `#010B13` text; Rich Black `#010B13` slab with Powder `#EBF1F5` text), 180ms card hover color inversion, and zero gradients, box-shadows, or blurs.

---

## 🏗️ Architecture

```
┌────────────────────────── Client (Vite + React + TS) ──────────────────────────┐
│  Landing · Brief Wizard · Generating SSE View · 5-Tab Dashboard                 │
│  Tailwind CSS · CSS Tokens · Motion (motion/react) · TanStack Query · Zustand    │
└───────────────┬───────────────────────────────────────────────┬────────────────┘
                │ REST + SSE (streaming status)                 │
┌───────────────▼──────────────────────────┐                    │
│  Server (Node + Express + TypeScript)    │                    │
│  routes → services → repositories        │                    │
│                                          │                    │
│  PlannerService & ReplanService          │        ┌───────────▼───────────────┐
│   ├─ Gemini API Client (Flash-tier)      │───────►│  Google Gemini Flash API  │
│   │   └─ 1-retry repair + offline backup │        └───────────────────────────┘
│   ├─ BudgetEngine (Deterministic INR)    │                    │
│   ├─ DateEngine (T-minus offset & clamp) │                    │
│   └─ Supabase Repository (PostgreSQL)    │───────►┌───────────▼───────────────┐
└──────────────────────────────────────────┘        │  Supabase (PostgreSQL)    │
                                                    └───────────────────────────┘
```

---

## 🎨 Design Tokens & UI Reference

| Token | Hex / Value | Purpose |
|---|---|---|
| `--rich-black` | `#010B13` | Rich Black canvas slab |
| `--steel-black` | `#111111` | Secondary slab & input background |
| `--powder` | `#EBF1F5` | Powder White typography & light slab |
| `--cyan` | `#00E5FF` | Cyan Aash primary slab & accent |
| `--ink` | `#081926` | Dark navy text for Powder White slab |
| `--surface` | `#07151F` | Dark container cards on Rich Black |
| `--ok` | `#3DDC97` | Status: Booked / On Track |
| `--warn` | `#FFB020` | Status: Compressed timeline |
| `--danger` | `#FF5C7A` | Over-budget alert |

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- Node.js >= 18 (Tested on Node v24)
- npm >= 9

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `server/.env`:
```env
PORT=4000
HOST=0.0.0.0
NODE_ENV=development

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash-lite

# Supabase
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_ANON_KEY=<your-anon-publishable-key>
SUPABASE_PUBLISHABLE_KEY=<your-anon-publishable-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-secret-key>
SUPABASE_SECRET_KEY=<your-service-role-secret-key>

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:4000
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-publishable-key>
```
*(Note: If `GEMINI_API_KEY` is omitted, JASHN automatically uses culturally authentic offline fallback templates).*

### 3. Run Unit Tests
```bash
npm run test
```
Verifies mathematical budget summation and date clamping invariants across randomized datasets (5/5 tests passing).

### 4. Run Development Mode
```bash
npm run dev
```
Starts both the Express API (:4000) and the Vite frontend (:3000) concurrently with unified output. Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm start
```

---

## 🎬 3-Minute Demo Walkthrough

1. **Landing & Instant Demo:**
   - Tap **"Try Demo"** or **"Nagpur Royal Wedding"** on the hero page.
   - Instantly loads pre-seeded 220-guest Indian wedding (₹18 Lakhs, Nagpur Tier-2) with live tasks and booked venue quotes.
2. **Budget Allocator:**
   - Inspect the stacked **Allocation Bar**. Point out how every rupee reconciles to 100% exactly down to ₹0 discrepancy with minimum 5% Contingency reserve.
   - Edit any planned amount; see contingency absorb the delta dynamically.
3. **T-Minus Timeline:**
   - Observe milestones grouped chronologically from `T-90 Foundation` to `T-0 Event Day`.
   - Click a task to cycle (`todo` → `doing` → `done`) and watch the confetti burst and readiness gauge increase.
4. **Vendor Pipeline:**
   - Switch to **Vendor Pipeline**. Open any card to view culturally tailored `must_ask` questions with tap-to-copy clipboard actions.
   - Transition vendors across `To Contact` → `Contacted` → `Quoted` → `Booked`.
5. **The Showstopper: Dynamic Re-Plan:**
   - Click **"Re-Plan Diff"** in the top header.
   - Slide guest count from `220` → `300` pax or shift budget.
   - Click **"Compute Animated Diff"** to see rupee deltas and deadline shifts, then **"Apply Re-Plan"**.

---

## 🛡️ Reliability & Resilience

To guarantee high reliability during live evaluation:
1. **Gemini Flash Structured Output**: Queries model with strict system schemas.
2. **1-Retry Schema Repair**: In the event of a malformed response, the error is fed back to the model for instant repair.
3. **Curated Cultural Fallbacks**: If network, quotas, or rate limits block generation, curated authentic templates for Weddings, Milestone Birthdays, and Community Festivals render within 200ms.
4. **Offline Local Demo Fixture**: The Nagpur Royal Wedding demo works with zero external network dependencies.
