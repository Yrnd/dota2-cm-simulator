import React from 'react';
import { useDraftStore } from '@/stores/draft-store';
import { useHeroStore } from '@/stores/hero-store';
import { cn } from '@/lib/utils';
import { CM_STAGES } from '@/lib/cm-rules';

interface DraftPanelProps {
  team: 'radiant' | 'dire';
}

export function DraftPanel({ team }: DraftPanelProps) {
  const { radiantPicks, radiantBans, direPicks, direBans, currentStageIndex } = useDraftStore();
  const getHeroById = useHeroStore(state => state.getHeroById);

  const picks = team === 'radiant' ? radiantPicks : direPicks;
  const bans = team === 'radiant' ? radiantBans : direBans;
  const isRadiant = team === 'radiant';

  const teamStages = CM_STAGES.filter(s => s.team === team);
  const banStages = teamStages.filter(s => s.type === 'ban');
  const pickStages = teamStages.filter(s => s.type === 'pick');

  const isStageActive = (stageOrder: number) => CM_STAGES[currentStageIndex]?.order === stageOrder;

  return (
    <div className="flex flex-col h-full">
      {/* Team Header */}
      <div className={cn(
        'px-2 py-1.5 border-b flex items-center gap-2',
        isRadiant
          ? 'bg-gradient-to-r from-[#1a3a1a] to-[#142814] border-[#2a5a2a]'
          : 'bg-gradient-to-r from-[#3a1a1a] to-[#281414] border-[#5a2a2a]',
      )}>
        <div className={cn(
          'w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-bold',
          isRadiant ? 'bg-[#4b9e4b]/20 text-[#5fcc5f]' : 'bg-[#b8312a]/20 text-[#e04040]',
        )}>
          {isRadiant ? 'R' : 'D'}
        </div>
        <span className={cn(
          'text-[10px] font-bold tracking-wider',
          isRadiant ? 'text-[#5fcc5f]' : 'text-[#e04040]',
        )}>
          {isRadiant ? 'RADIANT' : 'DIRE'}
        </span>
        <span className="ml-auto text-[9px] text-[#7a7568]">{picks.length}/5</span>
      </div>

      <div className="flex-1 flex flex-col p-1.5 gap-1.5 overflow-y-auto scrollbar-thin">
        {/* ═══ BANS ROW ═══ */}
        <div>
          <p className="text-[8px] font-bold text-[#7a7568]/60 uppercase tracking-wider mb-1 px-0.5">Bans</p>
          <div className="grid grid-cols-5 gap-[3px]">
            {banStages.map((stage) => {
              const idx = banStages.indexOf(stage);
              const heroId = idx < bans.length ? bans[idx] : null;
              const hero = heroId ? getHeroById(heroId) : null;
              const active = isStageActive(stage.order);

              return (
                <div
                  key={stage.order}
                  className={cn(
                    'draft-slot aspect-square rounded-sm',
                    hero ? 'draft-slot-filled' : active ? 'draft-slot-active' : 'draft-slot-empty',
                  )}
                >
                  {hero ? (
                    <div className="w-full h-full relative animate-fill-slot">
                      <img src={hero.imageUrl} alt="" className="w-full h-full object-cover grayscale opacity-50" onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/48x28/1e2028/444?text=×`; }} />
                      <div className="absolute inset-0 bg-[#4a1a1a]/60 flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#e04040]/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className={cn('w-2 h-2 rounded-full', active ? 'bg-[#c7a44e]/60' : 'bg-[#2a2e38]')} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ PICKS ═══ */}
        <div>
          <p className="text-[8px] font-bold text-[#7a7568]/60 uppercase tracking-wider mb-1 px-0.5">Picks</p>
          <div className="grid grid-cols-3 gap-[3px]">
            {pickStages.map((stage) => {
              const idx = pickStages.indexOf(stage);
              const heroId = idx < picks.length ? picks[idx] : null;
              const hero = heroId ? getHeroById(heroId) : null;
              const active = isStageActive(stage.order);
              const isLastPick = idx === pickStages.length - 1;

              return (
                <div
                  key={stage.order}
                  className={cn(
                    'draft-slot rounded-sm',
                    isLastPick ? 'aspect-[2/1]' : 'aspect-[16/10]',
                    hero ? 'draft-slot-filled' : active ? 'draft-slot-active' : 'draft-slot-empty',
                    isLastPick && hero && 'border-[#c7a44e]/40',
                  )}
                >
                  {hero ? (
                    <div className="w-full h-full relative animate-fill-slot">
                      <img src={hero.imageUrl} alt="" className="w-full h-full object-cover object-top" onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/128x72/1e2028/666?text=${hero.localizedName.slice(0, 2)}`; }} />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-1 py-0.5">
                        <p className="text-[8px] font-medium text-[#d4cfbf] truncate">{hero.localizedName}</p>
                      </div>
                      {isLastPick && (
                        <div className={cn(
                          'absolute inset-0 rounded-sm',
                          isRadiant ? 'shadow-[inset_0_0_10px_rgba(75,158,75,0.2)]' : 'shadow-[inset_0_0_10px_rgba(184,49,42,0.2)]',
                        )} />
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#1e2028]">
                      <div className={cn(
                        'w-3 h-3 rounded-full border border-dashed',
                        active ? 'border-[#c7a44e]/60' : 'border-[#3d4250]/40',
                      )} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
