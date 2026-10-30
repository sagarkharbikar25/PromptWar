import { EventData } from '@jashn/shared';

export const DEMO_EVENT: EventData = {
  id: 'demo-nagpur-royal-wedding',
  type: 'wedding',
  title: 'Aditya & Ananya’s Royal Maratha-Rajasthani Wedding',
  eventDate: '2026-12-18',
  city: 'Nagpur',
  cityTier: 2,
  guestCount: 220,
  totalBudget: 1800000,
  currency: 'INR',
  vibe: ['Royal Heritage', 'High Energy Sangeet', 'Warm Hospitality', 'Cultural Fusion'],
  preferences: {
    dietary: 'Pure Veg & Regional Maharashtrian + Marwari Buffet',
    ceremonies: ['Haldi', 'Mehendi', 'Sangeet', 'Varmala', 'Reception'],
    specialNotes: 'Require dedicated dhol-tasha troupe for Baraat and organic gulal station for Haldi'
  },
  summary: 'Comprehensive multi-ceremony Indian wedding celebration balanced across Sangeet, Mehendi, Haldi, Varmala, and Grand Reception with Tier-2 city cost optimizations and cultural priority lead times.',
  risks: [
    'Short lead time requires locking venue and primary caterer within 48 hours to preserve auspicious dates.',
    'Outdoor lawns require an active rain & dew canopy plan for evening chill and weather shifts.',
    'High guest count necessitates segregated live counter traffic to avoid dining choke-points.'
  ],
  daysLeft: 75,
  readinessPct: 35,
  createdAt: new Date().toISOString(),
  budgetItems: [
    {
      id: 'budget-demo-1',
      eventId: 'demo-nagpur-royal-wedding',
      category: 'venue',
      label: 'Resort Lawns & Banquet Hall',
      allocationPct: 32,
      planned: 576000,
      actual: 580000,
      rationale: 'Multi-ceremony indoor-outdoor venue lock with guest hospitality suites',
      aiGenerated: true,
      sortOrder: 1
    },
    {
      id: 'budget-demo-2',
      eventId: 'demo-nagpur-royal-wedding',
      category: 'catering',
      label: 'Multi-Cuisine Royal Buffet & Live Counters',
      allocationPct: 26,
      planned: 468000,
      actual: 0,
      rationale: 'Covering 4 dining sessions across ceremonies with regional delicacies',
      aiGenerated: true,
      sortOrder: 2
    },
    {
      id: 'budget-demo-3',
      eventId: 'demo-nagpur-royal-wedding',
      category: 'decor',
      label: 'Floral, Mandap & Thematic Stage Styling',
      allocationPct: 14,
      planned: 252000,
      actual: 0,
      rationale: 'Vibrant marigold for Haldi, neon fairytale for Sangeet, royal pastel for Mandap',
      aiGenerated: true,
      sortOrder: 3
    },
    {
      id: 'budget-demo-4',
      eventId: 'demo-nagpur-royal-wedding',
      category: 'photo_video',
      label: 'Candid Photography, Drone & Cinematic Teasers',
      allocationPct: 9,
      planned: 162000,
      actual: 0,
      rationale: 'Coverage across 2 days including pre-wedding portraits and same-day highlights',
      aiGenerated: true,
      sortOrder: 4
    },
    {
      id: 'budget-demo-5',
      eventId: 'demo-nagpur-royal-wedding',
      category: 'entertainment',
      label: 'DJ, Sound Rig, Live Anchor & Dhol Tasha',
      allocationPct: 7,
      planned: 126000,
      actual: 0,
      rationale: 'High-energy Sangeet sound, professional emcee, and traditional baraat ensemble',
      aiGenerated: true,
      sortOrder: 5
    },
    {
      id: 'budget-demo-6',
      eventId: 'demo-nagpur-royal-wedding',
      category: 'attire',
      label: 'Bridal Lehenga, Groom Sherwani & Family Styling',
      allocationPct: 4,
      planned: 72000,
      actual: 0,
      rationale: 'Ceremonial outfits and professional makeup artists for the bride',
      aiGenerated: true,
      sortOrder: 6
    },
    {
      id: 'budget-demo-7',
      eventId: 'demo-nagpur-royal-wedding',
      category: 'invitations',
      label: 'Digital Video Invite & Luxe Boxed Cards',
      allocationPct: 1.5,
      planned: 27000,
      actual: 0,
      rationale: 'Custom WhatsApp animations and boxed physical invites for VIP elders',
      aiGenerated: true,
      sortOrder: 7
    },
    {
      id: 'budget-demo-8',
      eventId: 'demo-nagpur-royal-wedding',
      category: 'transport',
      label: 'Guest Shuttles & Vintage Baraat Car',
      allocationPct: 1.5,
      planned: 27000,
      actual: 0,
      rationale: 'Airport transfers for outstation relatives and ceremonial vehicle',
      aiGenerated: true,
      sortOrder: 8
    },
    {
      id: 'budget-demo-9',
      eventId: 'demo-nagpur-royal-wedding',
      category: 'contingency',
      label: 'Mandatory Emergency Buffer',
      allocationPct: 5,
      planned: 90000,
      actual: 0,
      rationale: 'Buffer for weather shifts, last-minute extra guest plates, and overtime',
      aiGenerated: true,
      sortOrder: 9
    }
  ],
  timelineTasks: [
    {
      id: 'task-demo-1',
      eventId: 'demo-nagpur-royal-wedding',
      title: 'Lock Venue & Muhurat Slot with Advance Deposit',
      phase: 'foundation',
      dueOffsetDays: 90,
      dueDate: '2026-11-05',
      status: 'done',
      category: 'venue',
      isCompressed: false,
      aiGenerated: true,
      sortOrder: 1
    },
    {
      id: 'task-demo-2',
      eventId: 'demo-nagpur-royal-wedding',
      title: 'Appoint Primary Caterer & Finalize Per-Plate Menu',
      phase: 'booking',
      dueOffsetDays: 75,
      dueDate: '2026-11-15',
      status: 'doing',
      category: 'catering',
      isCompressed: false,
      aiGenerated: true,
      sortOrder: 2
    },
    {
      id: 'task-demo-3',
      eventId: 'demo-nagpur-royal-wedding',
      title: 'Book Candid Photographer & Drone Pilot',
      phase: 'booking',
      dueOffsetDays: 60,
      dueDate: '2026-11-25',
      status: 'todo',
      category: 'photo_video',
      isCompressed: false,
      aiGenerated: true,
      sortOrder: 3
    },
    {
      id: 'task-demo-4',
      eventId: 'demo-nagpur-royal-wedding',
      title: 'Sign Decorator & Confirm Moodboards for Haldi & Sangeet',
      phase: 'booking',
      dueOffsetDays: 45,
      dueDate: '2026-12-01',
      status: 'todo',
      category: 'decor',
      isCompressed: false,
      aiGenerated: true,
      sortOrder: 4
    },
    {
      id: 'task-demo-5',
      eventId: 'demo-nagpur-royal-wedding',
      title: 'Send WhatsApp Digital Save-the-Date Cards',
      phase: 'booking',
      dueOffsetDays: 40,
      dueDate: '2026-12-05',
      status: 'todo',
      category: 'invitations',
      isCompressed: false,
      aiGenerated: true,
      sortOrder: 5
    },
    {
      id: 'task-demo-6',
      eventId: 'demo-nagpur-royal-wedding',
      title: 'Schedule Bridal & Groom Attire Fittings',
      phase: 'details',
      dueOffsetDays: 25,
      dueDate: '2026-12-10',
      status: 'todo',
      category: 'attire',
      isCompressed: false,
      aiGenerated: true,
      sortOrder: 6
    },
    {
      id: 'task-demo-7',
      eventId: 'demo-nagpur-royal-wedding',
      title: 'Lock Sound Permissions & Generator Backup with Venue',
      phase: 'final_month',
      dueOffsetDays: 15,
      dueDate: '2026-12-12',
      status: 'todo',
      category: 'logistics',
      isCompressed: false,
      aiGenerated: true,
      sortOrder: 7
    },
    {
      id: 'task-demo-8',
      eventId: 'demo-nagpur-royal-wedding',
      title: 'Reconfirm Headcount with Caterer & Finalize Plate Buffer',
      phase: 'event_week',
      dueOffsetDays: 5,
      dueDate: '2026-12-15',
      status: 'todo',
      category: 'catering',
      isCompressed: false,
      aiGenerated: true,
      sortOrder: 8
    },
    {
      id: 'task-demo-9',
      eventId: 'demo-nagpur-royal-wedding',
      title: 'Verify Sound Check, Baraat Route & Mandap Fire Safety',
      phase: 'event_day',
      dueOffsetDays: 0,
      dueDate: '2026-12-18',
      status: 'todo',
      category: 'logistics',
      isCompressed: false,
      aiGenerated: true,
      sortOrder: 9
    }
  ],
  vendorChecklist: [
    {
      id: 'vendor-demo-1',
      eventId: 'demo-nagpur-royal-wedding',
      category: 'Venue & Lawns',
      why: 'Demands early confirmation for auspicious dates to avoid surge pricing or date clash',
      mustAsk: [
        'Is generator fuel and standby electrician included in the rental package?',
        'What are the strict decibel and cut-off hours for outdoor sound?',
        'Do you charge a royalty if we bring an external caterer or decorator?',
        'What is your cancellation or date-shift refund schedule?'
      ],
      vendorName: 'Radisson Blu Lawns & Banquets',
      contact: '+91 98220 12345',
      quote: 580000,
      status: 'quoted',
      notes: 'Includes poolside Haldi area and lawn for Sangeet'
    },
    {
      id: 'vendor-demo-2',
      eventId: 'demo-nagpur-royal-wedding',
      category: 'Catering & Beverages',
      why: 'Single largest guest impression; critical to verify live cooking capacity and service staff ratio',
      mustAsk: [
        'What is the ratio of uniformed service staff to guests at buffet and chaat counters?',
        'How many buffer plates are prepared before per-plate surcharges trigger?',
        'Can you provide a live tasting session with the actual head chef assigned to our event?',
        'Are ice cubes, water bottles, and disposable cutlery included in quoted rates?'
      ],
      vendorName: 'Maharaja Royal Caterers',
      contact: '+91 94231 67890',
      quote: 460000,
      status: 'contacted',
      notes: 'Promised 1 staff member per 15 guests'
    },
    {
      id: 'vendor-demo-3',
      eventId: 'demo-nagpur-royal-wedding',
      category: 'Decor & Production',
      why: 'Defines celebratory visual identity across diverse daylight and evening ceremonies',
      mustAsk: [
        'Do you supply fresh or cold-storage flowers, and what is your backup if specific blooms are unavailable?',
        'Is the structural trussing and stage fireproofed for pyrotechnics / cold pyro?',
        'How many hours before the ceremony start will the setup be 100% turnkey ready?',
        'Are generator power lines and ambient wash lighting bundled?'
      ],
      status: 'to_contact'
    },
    {
      id: 'vendor-demo-4',
      eventId: 'demo-nagpur-royal-wedding',
      category: 'Cinematography & Photography',
      why: 'Irreplaceable memories; must guarantee explicit shooter names rather than agency apprentices',
      mustAsk: [
        'Who are the exact senior camera operators attending on the day?',
        'What is turnaround timeline for the 3-minute cinematic teaser versus raw footage?',
        'Are traditional album prints and drone DGCA permissions included?',
        'What is the backup gear plan in case of equipment malfunction on site?'
      ],
      status: 'to_contact'
    }
  ],
  ideas: [
    {
      id: 'idea-demo-1',
      eventId: 'demo-nagpur-royal-wedding',
      kind: 'theme',
      title: 'Neon Gulal & Dhol Sunset Haldi',
      description: 'Replace traditional static yellow decor with a sunset pool-side lounge featuring organic floral gulal, brass urli foot soaks, and ambient dhol rhythms.',
      estCostMin: 27000,
      estCostMax: 54000,
      saved: true
    },
    {
      id: 'idea-demo-2',
      eventId: 'demo-nagpur-royal-wedding',
      kind: 'menu',
      title: 'Midnight Kulhad Chai & Street Chaat Truck',
      description: 'Surprise guests winding down from the Sangeet with an authentic clay-pot chai station serving steamed samosas, bun maska, and hot jalebis.',
      estCostMin: 18000,
      estCostMax: 39600,
      saved: false
    },
    {
      id: 'idea-demo-3',
      eventId: 'demo-nagpur-royal-wedding',
      kind: 'entertainment',
      title: 'Interactive Flash-Mob Baraat Entrance',
      description: 'Choreograph a synchronized 2-minute dance surprise with cousins and bridesmaids right before the groom enters the mandap.',
      estCostMin: 9000,
      estCostMax: 21600,
      saved: false
    },
    {
      id: 'idea-demo-4',
      eventId: 'demo-nagpur-royal-wedding',
      kind: 'gift',
      title: 'Artisan Brass Diyas & Handcrafted Ithra Favors',
      description: 'Locally sourced artisanal gift boxes containing cold-pressed essential oils, organic forest honey, and engraved brass keepsakes for departing guests.',
      estCostMin: 27000,
      estCostMax: 50400,
      saved: true
    }
  ]
};

