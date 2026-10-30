import { Brief, PlanRawLLM, PlanRawLLMSchema } from '@jashn/shared';
import { getFallbackPlan } from './fallbackPlans.js';

export class GeminiClient {
  private apiKey: string | undefined;
  private modelName: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
  }

  private buildSystemPrompt(): string {
    return `You are a professional event planner operating in India with deep expertise in weddings, birthdays, and community gatherings.
Return ONLY a valid JSON object matching the requested schema.
CRITICAL INSTRUCTIONS:
1. Do NOT calculate currency arithmetic or absolute calendar dates.
2. Provide percentage allocations ('allocation_pct') that sum to roughly 100%. Always include 'contingency' with at least 5%.
3. Provide day offsets ('due_offset_days') relative to the event date (e.g., 90 means 90 days before the event, 0 means on event day).
4. For weddings in India, represent key cultural ceremonies (Mehendi, Haldi, Sangeet, Wedding, Reception).
5. For Tier-2/3 cities, prioritize venue, hospitality, and catering value over hyper-premium decor.
6. Vendor 'must_ask' items must be sharp, specific, and culturally practical (e.g., generator fuel, overtime rates, license permissions, buffet staff ratios).
7. Suggest creative, memorable celebration ideas and highlight real logistical risks.`;
  }

  private buildUserPrompt(brief: Brief): string {
    return `Create a comprehensive celebration plan for:
Event Type: ${brief.type}
Title: ${brief.title}
Target Date: ${brief.eventDate}
City: ${brief.city} (Tier ${brief.cityTier})
Guest Count: ${brief.guestCount} pax
Total Budget: ₹${brief.totalBudget.toLocaleString('en-IN')} INR
Vibe & Style: ${brief.vibe.join(', ') || 'Festive and elegant'}
Cultural & Dietary Notes: ${brief.preferences?.dietary || 'Standard'}, ${brief.preferences?.specialNotes || 'None'}

Return a JSON object with:
- summary (string up to 300 chars)
- budget (array of { category, label, allocation_pct, rationale })
- timeline (array of { title, phase ('foundation'|'booking'|'details'|'final_month'|'event_week'|'event_day'|'after'), due_offset_days, category })
- vendors (array of { category, why, must_ask: string[] })
- ideas (array of { kind ('theme'|'decor'|'menu'|'entertainment'|'gift'|'activity'), title, description, est_cost_pct_min, est_cost_pct_max })
- risks (array of string risks)`;
  }

  async generatePlan(brief: Brief): Promise<{ plan: PlanRawLLM; isFallback: boolean; latencyMs: number }> {
    const startTime = Date.now();

    if (!this.apiKey) {
      console.warn('[GeminiClient] No GEMINI_API_KEY configured. Utilizing curated cultural fallback template.');
      return {
        plan: getFallbackPlan(brief.type),
        isFallback: true,
        latencyMs: Date.now() - startTime
      };
    }

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: `${this.buildSystemPrompt()}\n\n${this.buildUserPrompt(brief)}` }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.4
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(20000) // 20s timeout
      });

      if (!response.ok) {
        throw new Error(`Gemini API returned HTTP ${response.status}: ${await response.text()}`);
      }

      const jsonResponse = await response.json();
      const rawText = jsonResponse.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error('Gemini API returned empty text');
      }

      const parsedJSON = JSON.parse(rawText);
      const validation = PlanRawLLMSchema.safeParse(parsedJSON);

      if (validation.success) {
        return {
          plan: validation.data,
          isFallback: false,
          latencyMs: Date.now() - startTime
        };
      }

      console.warn('[GeminiClient] Validation failed, initiating 1 repair retry:', validation.error.message);

      // 1 repair retry
      const repairPayload = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: `${this.buildSystemPrompt()}\n\nRepair this JSON so it matches the schema. Validation error: ${validation.error.message}\n\nInvalid JSON:\n${rawText}` }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      };

      const repairResponse = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(repairPayload),
        signal: AbortSignal.timeout(15000)
      });

      if (repairResponse.ok) {
        const repairJSON = await repairResponse.json();
        const repairedText = repairJSON.candidates?.[0]?.content?.parts?.[0]?.text;
        const reValidation = PlanRawLLMSchema.safeParse(JSON.parse(repairedText));
        if (reValidation.success) {
          return {
            plan: reValidation.data,
            isFallback: false,
            latencyMs: Date.now() - startTime
          };
        }
      }

      console.warn('[GeminiClient] Repair failed. Utilizing curated fallback template.');
      return {
        plan: getFallbackPlan(brief.type),
        isFallback: true,
        latencyMs: Date.now() - startTime
      };
    } catch (err) {
      console.error('[GeminiClient] Error during AI generation:', err);
      return {
        plan: getFallbackPlan(brief.type),
        isFallback: true,
        latencyMs: Date.now() - startTime
      };
    }
  }
}
