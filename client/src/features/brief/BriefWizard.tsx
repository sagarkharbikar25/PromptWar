import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brief, EventType } from '@jashn/shared';
import { Button } from '../../components/ui/Button';
import { formatCompactINR, formatINR } from '../../lib/utils';
import { Calendar, Users, MapPin, IndianRupee, Sparkles, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface BriefWizardProps {
  onSubmit: (brief: Brief) => void;
  onCancel: () => void;
}

const EVENT_TYPES: Array<{ type: EventType; title: string; desc: string; icon: string }> = [
  {
    type: 'wedding',
    title: 'Indian Wedding',
    desc: 'Multi-ceremony celebration (Haldi, Mehendi, Sangeet, Varmala, Reception)',
    icon: '💍'
  },
  {
    type: 'birthday',
    title: 'Milestone Birthday',
    desc: 'Rooftop sundowners, curated cocktails, music, and interactive moments',
    icon: '🎂'
  },
  {
    type: 'community',
    title: 'Community Festival',
    desc: 'Diwali mela, cultural concerts, food stalls, and public stage logistics',
    icon: '🎪'
  }
];

const VIBE_TAGS = [
  'Royal Heritage',
  'Minimalist Pastel',
  'High-Energy DJ',
  'Traditional Vedic',
  'Eco-Friendly & Floral',
  'Retro Bollywood',
  'Curated Gourmet',
  'Sundowner Lounge'
];

export const BriefWizard: React.FC<BriefWizardProps> = ({ onSubmit, onCancel }) => {
  const [step, setStep] = useState(1);

  // Form State
  const [type, setType] = useState<EventType>('wedding');
  const [title, setTitle] = useState('My Grand Celebration');
  const [city, setCity] = useState('Nagpur');
  const [cityTier, setCityTier] = useState<1 | 2 | 3>(2);
  const [guestCount, setGuestCount] = useState<number>(200);
  const [eventDate, setEventDate] = useState<string>('2026-12-18');
  const [totalBudget, setTotalBudget] = useState<number>(1500000);
  const [selectedVibes, setSelectedVibes] = useState<string[]>(['Royal Heritage', 'High-Energy DJ']);
  const [dietary, setDietary] = useState('Multi-Cuisine Buffet with Live Counters');
  const [specialNotes, setSpecialNotes] = useState('Require dedicated Baraat route coordination and Haldi pool setup');

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const brief: Brief = {
      type,
      title: title || `${type.toUpperCase()} Celebration`,
      eventDate,
      city,
      cityTier,
      guestCount,
      totalBudget,
      currency: 'INR',
      vibe: selectedVibes,
      preferences: {
        dietary,
        specialNotes
      }
    };
    onSubmit(brief);
  };

  const toggleVibe = (v: string) => {
    if (selectedVibes.includes(v)) {
      setSelectedVibes(selectedVibes.filter(item => item !== v));
    } else {
      setSelectedVibes([...selectedVibes, v]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-powder/60 mb-3">
          <span>Step {step} of 4</span>
          <span>{step === 1 ? 'Event Type' : step === 2 ? 'Who, Where & When' : step === 3 ? 'Budget & Atmosphere' : 'Ceremony Specifics'}</span>
        </div>
        <div className="h-1.5 w-full bg-steel rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-cyan"
            initial={{ width: '25%' }}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-display uppercase tracking-tight text-powder">
                  What are we celebrating?
                </h2>
                <p className="text-powder/60 text-sm mt-1">
                  Select the core format to load regional planning heuristics and ceremony templates.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {EVENT_TYPES.map(item => {
                  const isSelected = type === item.type;
                  return (
                    <div
                      key={item.type}
                      onClick={() => {
                        setType(item.type);
                        if (item.type === 'wedding') setTitle('Aditya & Ananya Wedding');
                        if (item.type === 'birthday') setTitle('Rohan’s 30th Rooftop Bash');
                        if (item.type === 'community') setTitle('Diwali Mela & Cultural Fest');
                      }}
                      className={`cursor-pointer rounded-2xl p-5 border transition-all duration-150 text-left ${
                        isSelected
                          ? 'border-cyan bg-cyan/15 text-powder'
                          : 'border-powder/20 bg-surface hover:border-powder/40'
                      }`}
                    >
                      <div className="text-3xl mb-3">{item.icon}</div>
                      <h3 className="font-display uppercase text-lg text-powder font-bold">{item.title}</h3>
                      <p className="text-xs text-powder/60 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-powder/70 mb-2">Event Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-steel border border-powder/20 rounded-xl px-4 py-3 text-powder placeholder:text-powder/40 focus:outline-none focus:border-cyan text-sm font-medium"
                  placeholder="e.g. Aditya & Ananya's Royal Celebration"
                  required
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-display uppercase tracking-tight text-powder">
                  Who, Where & When?
                </h2>
                <p className="text-powder/60 text-sm mt-1">
                  City tiers determine realistic vendor pricing rates; dates calculate lead time urgency.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-powder/70 mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan" /> City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full bg-steel border border-powder/20 rounded-xl px-4 py-3 text-powder placeholder:text-powder/40 focus:outline-none focus:border-cyan text-sm font-medium"
                    placeholder="e.g. Nagpur, Jaipur, Mumbai"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-powder/70 mb-2">City Tier</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([1, 2, 3] as const).map(tier => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setCityTier(tier)}
                        className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                          cityTier === tier
                            ? 'border-cyan bg-cyan/20 text-cyan font-bold'
                            : 'border-powder/20 bg-steel text-powder/60 hover:text-powder'
                        }`}
                      >
                        Tier {tier}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-powder/70 mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-cyan" /> Guest Count (pax)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    value={guestCount}
                    onChange={e => setGuestCount(Number(e.target.value))}
                    className="w-full bg-steel border border-powder/20 rounded-xl px-4 py-3 text-powder placeholder:text-powder/40 focus:outline-none focus:border-cyan text-sm font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-powder/70 mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan" /> Target Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    className="w-full bg-steel border border-powder/20 rounded-xl px-4 py-3 text-powder placeholder:text-powder/40 focus:outline-none focus:border-cyan text-sm font-medium"
                    required
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-display uppercase tracking-tight text-powder">
                  Budget & Atmosphere
                </h2>
                <p className="text-powder/60 text-sm mt-1">
                  Rupee calculations are guaranteed by pure engines down to ₹0 discrepancies.
                </p>
              </div>

              {/* Budget Slider */}
              <div className="p-6 rounded-2xl bg-surface border border-powder/20">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase text-powder/70 flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-cyan" /> Total Planned Budget
                  </span>
                  <span className="text-3xl font-slab text-cyan tracking-tight">
                    {formatINR(totalBudget)}
                  </span>
                </div>

                <input
                  type="range"
                  min="200000"
                  max="10000000"
                  step="50000"
                  value={totalBudget}
                  onChange={e => setTotalBudget(Number(e.target.value))}
                  className="w-full accent-cyan cursor-pointer h-2 bg-steel rounded-lg appearance-none"
                />

                <div className="flex justify-between text-xs font-bold text-powder/50 mt-2">
                  <span>₹2 Lakhs</span>
                  <span className="text-cyan">{formatCompactINR(totalBudget)}</span>
                  <span>₹1 Crore</span>
                </div>
              </div>

              {/* Vibe Selection */}
              <div>
                <label className="block text-xs font-bold uppercase text-powder/70 mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan" /> Celebration Aesthetic / Vibe
                </label>
                <div className="flex flex-wrap gap-2">
                  {VIBE_TAGS.map(v => {
                    const active = selectedVibes.includes(v);
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => toggleVibe(v)}
                        className={`text-xs px-3.5 py-1.5 rounded-full border transition-all ${
                          active
                            ? 'bg-cyan text-[#010B13] font-bold border-cyan'
                            : 'bg-steel border-powder/20 text-powder/70 hover:text-powder'
                        }`}
                      >
                        {v} {active && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl font-display uppercase tracking-tight text-powder">
                  Ceremony Specifics
                </h2>
                <p className="text-powder/60 text-sm mt-1">
                  Add cultural preferences so vendor questions and timeline milestones are tailored.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-powder/70 mb-2">
                  Dietary & Catering Style
                </label>
                <input
                  type="text"
                  value={dietary}
                  onChange={e => setDietary(e.target.value)}
                  className="w-full bg-steel border border-powder/20 rounded-xl px-4 py-3 text-powder placeholder:text-powder/40 text-sm font-medium focus:outline-none focus:border-cyan"
                  placeholder="e.g. Pure Veg Jain buffet, Maharashtrian counters, Cocktails"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-powder/70 mb-2">
                  Special Notes or Must-Haves
                </label>
                <textarea
                  value={specialNotes}
                  onChange={e => setSpecialNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-steel border border-powder/20 rounded-xl p-4 text-powder placeholder:text-powder/40 text-sm font-medium focus:outline-none focus:border-cyan"
                  placeholder="e.g. Need outdoor pool for Haldi, strict 10 PM sound curfew, senior citizen accessibility"
                />
              </div>

              <div className="bg-cyan/10 border border-cyan/30 rounded-2xl flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyan shrink-0" />
                  <div className="text-xs text-powder/90">
                    <span className="font-bold text-cyan">Ready to generate:</span> Live budget, T-minus timeline, vendor pipeline with must-ask checklists, and curated ideas.
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-line">
          {step > 1 ? (
            <Button type="button" variant="outline" size="md" onClick={handlePrev}>
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          ) : (
            <Button type="button" variant="ghost" size="md" onClick={onCancel}>
              Cancel
            </Button>
          )}

          {step < 4 ? (
            <Button type="button" variant="primary" size="md" onClick={handleNext}>
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button type="submit" variant="primary" size="lg">
              Generate Live Plan <Sparkles className="w-4 h-4" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
