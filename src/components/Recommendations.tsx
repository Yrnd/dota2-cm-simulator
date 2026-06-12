import React from 'react';
import { useDraftStore } from '@/stores/draft-store';
import { useHeroStore } from '@/stores/hero-store';
import { cn } from '@/lib/utils';

export function Recommendations() {
  const { radiantPicks, direPicks, radiantBans, direBans, currentStageIndex, isActive, getCurrentStage } = useDraftStore();
  const heroes = useHeroStore(state => state.heroes);

  const stage = getCurrentStage();
  const currentTeam = stage?.team;

  const getRecommendations = () => {
    const available = heroes.filter(h =>
      !radiantPicks.includes(h.id) && !direPicks.includes(h.id) &&
      !radiantBans.includes(h.id) && !direBans.includes(h.id)
    );
    const sm = useHeroStore.getState().synergyMatrix;
    const cm = useHeroStore.getState().counterMatrix;
    const ally = currentTeam === 'radiant' ? radiantPicks : direPicks;
    const enemy = currentTeam === 'radiant' ? direPicks : radiantPicks;

    return available.map(hero => {
      let syn = 0;
      ally.forEach(id => { syn += sm[`${hero.id}_${id}`] || sm[`${id}_${hero.id}`] || 0; });
      let ctr = 0;
      enemy.forEach(id => { ctr += cm[`${hero.id}_${id}`] || 0; });
      return { hero, score: hero.baseWinRate + syn * 3 + ctr * 4, syn, ctr };
    }).sort((a, b) => b.score - a.score).slice(0, 4);
  };

  const recs = isActive || currentStageIndex > 0 ? getRecommendations() : [];

  return (
    <div className="flex items-center gap-2 flex-1">
      <span className="text-[9px] font-bold text-[#c7a44e]/60 uppercase shrink-0">SUGGEST</span>
      {isActive && (
        <span className={cn(
          'text-[8px] font-bold px-1 py-0.5 rounded-[1px] uppercase',
          currentTeam === 'radiant' ? 'bg-[#1a3a1a] text-[#5fcc5f]' : 'bg-[#3a1a1a] text-[#e04040]',
        )}>
          {currentTeam?.slice(0, 3)}
        </span>
      )}
      <div className="flex items-center gap-1 overflow-x-auto">
        {recs.map(({ hero, score, syn, ctr }, i) => (
          <div
            key={hero.id}
            className={cn(
              'flex items-center gap-1 px-1.5 py-0.5 rounded-[1px] bg-[#1e2028] border shrink-0',
              i === 0 ? 'border-[#c7a44e]/30' : 'border-[#2a2e38]',
            )}
          >
            <img src={hero.imageUrl} alt="" className="w-5 h-5 rounded-[1px] object-cover" onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/20x20/1e2028/555?text=${hero.localizedName.slice(0, 1)}`; }} />
            <span className="text-[9px] text-[#d4cfbf] truncate max-w-[60px]">{hero.localizedName}</span>
            <span className={cn('text-[9px] font-bold tabular-nums', score > 0.52 ? 'text-[#5fcc5f]' : score > 0.5 ? 'text-[#c7a44e]' : 'text-[#7a7568]')}>
              {(score * 100).toFixed(0)}
            </span>
          </div>
        ))}
        {!isActive && currentStageIndex === 0 && (
          <span className="text-[9px] text-[#7a7568]/40">Start draft</span>
        )}
      </div>
    </div>
  );
}
