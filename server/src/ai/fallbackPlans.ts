import { EventType, PlanRawLLM } from '@jashn/shared';

export const fallbackWeddingPlan: PlanRawLLM = {
  summary: "Comprehensive multi-ceremony Indian wedding celebration balanced across Sangeet, Mehendi, Haldi, Varmala, and Grand Reception with Tier-2 city cost optimizations and cultural priority lead times.",
  budget: [
    { category: 'venue', label: 'Resort Lawns & Banquet Hall', allocation_pct: 32, rationale: 'Multi-ceremony indoor-outdoor venue lock with guest hospitality suites' },
    { category: 'catering', label: 'Multi-Cuisine Royal Buffet & Live Counters', allocation_pct: 26, rationale: 'Covering 4 dining sessions across ceremonies with regional delicacies' },
    { category: 'decor', label: 'Floral, Mandap & Thematic Stage Styling', allocation_pct: 14, rationale: 'Vibrant marigold for Haldi, neon fairytale for Sangeet, royal pastel for Mandap' },
    { category: 'photo_video', label: 'Candid Photography, Drone & Cinematic Teasers', allocation_pct: 9, rationale: 'Coverage across 2 days including pre-wedding portraits and same-day highlights' },
    { category: 'entertainment', label: 'DJ, Sound Rig, Live Anchor & Dhol Tasha', allocation_pct: 7, rationale: 'High-energy Sangeet sound, professional emcee, and traditional baraat ensemble' },
    { category: 'attire', label: 'Bridal Lehenga, Groom Sherwani & Family Styling', allocation_pct: 4, rationale: 'Ceremonial outfits and professional makeup artists for the bride' },
    { category: 'invitations', label: 'Digital Video Invite & Luxe Boxed Cards', allocation_pct: 1.5, rationale: 'Custom WhatsApp animations and boxed physical invites for VIP elders' },
    { category: 'transport', label: 'Guest Shuttles & Vintage Baraat Car', allocation_pct: 1.5, rationale: 'Airport/station transfers for outstation relatives and ceremonial vehicle' },
    { category: 'contingency', label: 'Mandatory Emergency Buffer', allocation_pct: 5, rationale: 'Buffer for weather shifts, last-minute extra guest plates, and overtime' }
  ],
  timeline: [
    { title: 'Lock Venue & Muhurat Slot with Advance Deposit', phase: 'foundation', due_offset_days: 90, category: 'venue' },
    { title: 'Appoint Primary Caterer & Finalize Per-Plate Menu', phase: 'booking', due_offset_days: 75, category: 'catering' },
    { title: 'Book Candid Photographer & Drone Pilot', phase: 'booking', due_offset_days: 60, category: 'photo_video' },
    { title: 'Sign Decorator & Confirm Moodboards for Haldi & Sangeet', phase: 'booking', due_offset_days: 45, category: 'decor' },
    { title: 'Send WhatsApp Digital Save-the-Date Cards', phase: 'booking', due_offset_days: 40, category: 'invitations' },
    { title: 'Book Choreographer for Sangeet Family Performances', phase: 'details', due_offset_days: 35, category: 'entertainment' },
    { title: 'Schedule Bridal & Groom Attire Fittings', phase: 'details', due_offset_days: 25, category: 'attire' },
    { title: 'Lock Sound Permissions & Generator Backup with Venue', phase: 'final_month', due_offset_days: 15, category: 'logistics' },
    { title: 'Dispatch Printed Invites to Outstation Guests', phase: 'final_month', due_offset_days: 14, category: 'invitations' },
    { title: 'Reconfirm Headcount with Caterer & Finalize Plate Buffer', phase: 'event_week', due_offset_days: 5, category: 'catering' },
    { title: 'Verify Sound Check, Baraat Route & Mandap Fire Safety', phase: 'event_day', due_offset_days: 0, category: 'logistics' },
    { title: 'Reconcile Final Invoices & Vendor Tips', phase: 'after', due_offset_days: 0, category: 'finance' }
  ],
  vendors: [
    {
      category: 'Venue & Lawns',
      why: 'Demands early confirmation for auspicious dates to avoid surge pricing or date clash',
      must_ask: [
        'Is the generator fuel and electrician standby included in the rental package?',
        'What are the strict decibel and cut-off hours for outdoor sound?',
        'Do you charge a royalty or penalty if we bring an external caterer or decorator?',
        'What is your cancellation or date-shift refund schedule?'
      ]
    },
    {
      category: 'Catering & Beverages',
      why: 'Single largest guest impression; critical to verify live cooking capacity and service staff ratio',
      must_ask: [
        'What is the ratio of uniformed service staff to guests at buffet and chaat counters?',
        'How many buffer plates are prepared before per-plate surcharges trigger?',
        'Can you provide a live tasting session with the actual head chef assigned to our event?',
        'Are ice cubes, water bottles, and disposable cutlery included in quoted per-plate rates?'
      ]
    },
    {
      category: 'Decor & Production',
      why: 'Defines the celebratory visual identity across diverse daylight and evening ceremonies',
      must_ask: [
        'Do you supply fresh or cold-storage flowers, and what is your backup if specific blooms are unavailable?',
        'Is the structural trussing and stage fireproofed for pyrotechnics / cold pyro?',
        'How many hours before the ceremony start will the setup be 100% turnkey ready?',
        'Are generator power lines and ambient wash lighting bundled?'
      ]
    },
    {
      category: 'Cinematography & Photography',
      why: 'Irreplaceable memories; must guarantee explicit shooter names rather than agency apprentices',
      must_ask: [
        'Who are the exact senior camera operators attending on the day?',
        'What is the turnaround timeline for the 3-minute cinematic teaser versus raw footage?',
        'Are traditional album prints and drone DGCA permissions included?',
        'What is the backup gear plan in case of equipment malfunction on site?'
      ]
    }
  ],
  ideas: [
    {
      kind: 'theme',
      title: 'Neon Gulal & Dhol Sunset Haldi',
      description: 'Replace traditional static yellow decor with a sunset pool-side lounge featuring organic floral gulal, brass urli foot soaks, and ambient dhol rhythms.',
      est_cost_pct_min: 1.5,
      est_cost_pct_max: 3.0
    },
    {
      kind: 'menu',
      title: 'Midnight Kulhad Chai & Street Chaat Truck',
      description: 'Surprise guests winding down from the Sangeet with an authentic clay-pot chai station serving steamed samosas, bun maska, and hot jalebis.',
      est_cost_pct_min: 1.0,
      est_cost_pct_max: 2.2
    },
    {
      kind: 'entertainment',
      title: 'Interactive Flash-Mob Baraat Entrance',
      description: 'Choreograph a synchronized 2-minute dance surprise with cousins and bridesmaids right before the groom enters the mandap.',
      est_cost_pct_min: 0.5,
      est_cost_pct_max: 1.2
    },
    {
      kind: 'gift',
      title: 'Artisan Brass Diyas & Handcrafted Ithra Favors',
      description: 'Locally sourced artisanal gift boxes containing cold-pressed essential oils, organic forest honey, and engraved brass keepsakes for departing guests.',
      est_cost_pct_min: 1.5,
      est_cost_pct_max: 2.8
    }
  ],
  risks: [
    'Short lead time requires locking venue and primary caterer within 48 hours to preserve auspicious dates.',
    'Outdoor lawns require an active rain & dew canopy plan for evening chill and weather shifts.',
    'High guest count necessitates segregated live counter traffic to avoid dining choke-points.'
  ]
};

export const fallbackBirthdayPlan: PlanRawLLM = {
  summary: "Vibrant milestone birthday celebration centered on immersive music, curated cocktail experiences, interactive games, and high-impact visual styling.",
  budget: [
    { category: 'venue', label: 'Rooftop Lounge & Terrace', allocation_pct: 35, rationale: 'Scenic evening skyline venue with integrated sound and bar' },
    { category: 'catering', label: 'Gourmet Tapas & Bar Package', allocation_pct: 30, rationale: 'Curated appetizers, mocktails/cocktails, and artisanal desserts' },
    { category: 'decor', label: 'Retro Neon & Balloon Artistry', allocation_pct: 12, rationale: 'Photo backdrop, metallic shimmer walls, and ambient LED tubes' },
    { category: 'photo_video', label: 'Instant 360 Spin Booth & Candid Media', allocation_pct: 8, rationale: 'High social-media engagement with instant guest video delivery' },
    { category: 'entertainment', label: 'Live Acoustic Trio & Club DJ', allocation_pct: 7, rationale: 'Smooth sundowner vibes transitioning into high-energy dance playlist' },
    { category: 'gifts', label: 'Curated Memory Keepsakes', allocation_pct: 3, rationale: 'Personalized gourmet hampers and polaroid guestbook' },
    { category: 'contingency', label: 'Emergency Reserve', allocation_pct: 5, rationale: 'Buffer for late-night bar extension or extra guests' }
  ],
  timeline: [
    { title: 'Lock Rooftop Terrace & Secure Date', phase: 'foundation', due_offset_days: 30, category: 'venue' },
    { title: 'Approve Custom Signature Cocktail & Hors d’Oeuvres Menu', phase: 'booking', due_offset_days: 20, category: 'catering' },
    { title: 'Send Animated Digital Invitations via WhatsApp', phase: 'booking', due_offset_days: 18, category: 'invitations' },
    { title: 'Book 360-Degree Video Booth & Photographer', phase: 'booking', due_offset_days: 14, category: 'photo_video' },
    { title: 'Finalize Custom Milestone Cake & Dessert Display', phase: 'details', due_offset_days: 7, category: 'catering' },
    { title: 'Soundcheck DJ Rig & Test Lighting Backdrops', phase: 'event_day', due_offset_days: 0, category: 'entertainment' }
  ],
  vendors: [
    {
      category: 'Venue & Bar',
      why: 'Crucial for licensing, sound permits, and custom cocktail policies',
      must_ask: [
        'Are bar licensing fees and excise one-day permits included in the minimum spend?',
        'What is the sound curfew for open-air terrace playback?',
        'Do you provide dedicated valet parking for our estimated guest vehicles?'
      ]
    },
    {
      category: 'Custom Cake & Confections',
      why: 'Centerpiece of celebration and photography moment',
      must_ask: [
        'Can you deliver and assemble the multi-tier cake directly at the venue 1 hour before party start?',
        'Are eggless and dietary options available across all tiers?',
        'Do you provide custom acrylic toppers and dry ice presentation smoke?'
      ]
    }
  ],
  ideas: [
    {
      kind: 'activity',
      title: 'Neon Audio Guestbook & Polaroid Wall',
      description: 'Guests record vintage telephone voice messages and clip retro instant camera snapshots onto a neon wire mesh.',
      est_cost_pct_min: 1.5,
      est_cost_pct_max: 3.0
    },
    {
      kind: 'menu',
      title: 'Interactive Nitrogen Ice Cream & Dessert Bar',
      description: 'A culinary chemist station flash-freezing custom sorbets and chocolates with liquid nitrogen clouds in front of guests.',
      est_cost_pct_min: 2.0,
      est_cost_pct_max: 3.5
    }
  ],
  risks: [
    'Rooftop wind speeds may require securing lightweight balloon installations.',
    'Late guest arrivals can impact synchronized birthday toast timing.'
  ]
};

export const fallbackCommunityPlan: PlanRawLLM = {
  summary: "Engaging community festival designed for high footfall, safe crowd circulation, stage performances, and diverse vendor stalls with transparent cost controls.",
  budget: [
    { category: 'venue', label: 'Community Amphitheater / Grounds', allocation_pct: 25, rationale: 'Open-air grounds rental with public sanitation facilities' },
    { category: 'catering', label: 'Community Food Stalls & Refreshments', allocation_pct: 25, rationale: 'Subsidized snacks, clean drinking water kiosks, and tea/coffee' },
    { category: 'entertainment', label: 'Stage Rigging, Sound & Cultural Performers', allocation_pct: 20, rationale: 'Audio line array, stage lighting, and local troupe performances' },
    { category: 'decor', label: 'Fairy Lights, Banners & Wayfinding Signage', allocation_pct: 12, rationale: 'Festival welcoming arches, clear zoning, and recycling stations' },
    { category: 'misc', label: 'Security, First Aid & Municipal Permits', allocation_pct: 8, rationale: 'Police permissions, fire clearance, ambulance standby, and guards' },
    { category: 'photo_video', label: 'Event Highlights & Live Streaming', allocation_pct: 5, rationale: 'Live stream for remote members and post-event highlight reel' },
    { category: 'contingency', label: 'Contingency Reserve', allocation_pct: 5, rationale: 'Power generator diesel backup and emergency repairs' }
  ],
  timeline: [
    { title: 'Submit Municipal, Police & Fire Safety Applications', phase: 'foundation', due_offset_days: 45, category: 'logistics' },
    { title: 'Invite Local Cultural Troupes & Announce Schedule', phase: 'booking', due_offset_days: 30, category: 'entertainment' },
    { title: 'Onboard Food Vendors & Allocate Stall Spaces', phase: 'booking', due_offset_days: 20, category: 'catering' },
    { title: 'Erect Main Stage, PA Sound System & Generator Hookups', phase: 'final_month', due_offset_days: 2, category: 'logistics' },
    { title: 'Run Full Sound Check, Volunteer Briefing & Gate Testing', phase: 'event_day', due_offset_days: 0, category: 'logistics' }
  ],
  vendors: [
    {
      category: 'Sound & Stage Production',
      why: 'Public community audibility and safety are paramount',
      must_ask: [
        'Does the electrical rigging include earth-leakage breakers (ELCB) for wet ground?',
        'Do you supply wireless microphones and audio monitors for multi-performer transitions?',
        'What is your backup generator switch-over time in case of local power outage?'
      ]
    }
  ],
  ideas: [
    {
      kind: 'activity',
      title: 'Community Lantern Lighting Ceremony',
      description: 'An eco-friendly collective illumination moment where attendees light solar lanterns simultaneously to celebrate community unity.',
      est_cost_pct_min: 1.0,
      est_cost_pct_max: 2.5
    }
  ],
  risks: [
    'Peak crowd surge during evening headline performance requires clear one-way ingress/egress lanes.',
    'Weather changes require covering all open electronic stages with waterproof tarps.'
  ]
};

export function getFallbackPlan(type: EventType): PlanRawLLM {
  switch (type) {
    case 'wedding':
      return fallbackWeddingPlan;
    case 'birthday':
      return fallbackBirthdayPlan;
    case 'community':
    default:
      return fallbackCommunityPlan;
  }
}

