import React, { useState } from 'react';
import { EventData, IdeaItem } from '@jashn/shared';
import { formatINR } from '../../lib/utils';
import { Heart } from 'lucide-react';

interface IdeasTabProps {
  event: EventData;
}

export const IdeasTab: React.FC<IdeasTabProps> = ({ event }) => {
  const [ideas, setIdeas] = useState<IdeaItem[]>(event.ideas);

  const toggleSave = (ideaId: string) => {
    setIdeas(prev =>
      prev.map(item => (item.id === ideaId ? { ...item, saved: !item.saved } : item))
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-powder/15">
        <div>
          <h2 className="font-slab text-2xl uppercase tracking-tight text-powder">
            CELEBRATION IDEAS
          </h2>
          <div className="text-xs font-semibold text-powder/60 mt-0.5">
            Tailored suggestions based on your guest count and city tier.
          </div>
        </div>

        <span className="text-xs font-bold uppercase px-3 py-1 rounded-full border border-powder/20 text-powder/70">
          {ideas.filter(i => i.saved).length} SAVED
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ideas.map(idea => {
          return (
            <div
              key={idea.id}
              className="slab-card p-6 rounded-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-powder/20 invert-child">
                    {idea.kind.toUpperCase()}
                  </span>

                  <button
                    onClick={() => toggleSave(idea.id)}
                    className="p-1 rounded-full text-powder hover:text-cyan transition cursor-pointer invert-child"
                  >
                    <Heart className={`w-4 h-4 ${idea.saved ? 'fill-current text-cyan' : ''}`} />
                  </button>
                </div>

                <h3 className="font-slab text-xl uppercase tracking-tight mb-2">
                  {idea.title}
                </h3>

                <p className="text-xs opacity-75 invert-child leading-relaxed">
                  {idea.description}
                </p>
              </div>

              <div className="pt-4 border-t border-powder/15 mt-5 flex items-center justify-between text-xs font-bold invert-child">
                <span className="opacity-60 invert-child uppercase text-[11px]">ESTIMATED COST</span>
                <span className="font-slab text-base text-cyan invert-child">
                  {formatINR(idea.estCostMin)} – {formatINR(idea.estCostMax)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
