import React from 'react';
import { useDraftStore } from '@/stores/draft-store';
import { useHeroStore } from '@/stores/hero-store';
import { cn } from '@/lib/utils';
import { Shield, Swords, Ban } from 'lucide-react';

interface TeamPanelProps {
  team: 'radiant' | 'dire';
}

export function TeamPanel({ team }: TeamPanelProps) {
  const { radiantPicks, radiantBans, direPicks, direBans } = useDraftStore();
  const getHeroById = useHeroStore(state => state.getHeroById);

  const picks = team === 'radiant' ? radiantPicks : direPicks;
  const bans = team === 'radiant' ? radiantBans : direBans;

  const isRadiant = team === 'radiant';

  return (
    <div className={cn(
      'panel-window h-full',
      isRadiant ? 'glow-radiant' : 'glow-dire',
    )}>
      {/* Header with team logo */}
      <div className={cn(
        'panel-header relative overflow-hidden',
        isRadiant
          ? 'bg-gradient-to-r from-emerald-900/40 to-emerald-950/40'
          : 'bg-gradient-to-r from-red-900/40 to-red-950/40',
      )}>
        {/* Background pattern */}
        <div className={cn(
          'absolute inset-0 opacity-10',
          isRadiant ? 'bg-[radial-gradient(circle_at_30%_50%,rgba(45,180,80,0.5),transparent_70%)]' : 'bg-[radial-gradient(circle_at_70%_50%,rgba(220,50,50,0.5),transparent_70%)]',
        )} />

        <div className="relative flex items-center gap-2.5">
          <div className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center',
            isRadiant ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-red-500/20 border border-red-500/30',
          )}>
            {isRadiant ? (
              <Shield className="w-5 h-5 text-emerald-400" />
            ) : (
              <Swords className="w-5 h-5 text-red-400" />
            )}
          </div>
          <div>
            <h2 className={cn(
              'text-base font-bold tracking-wide',
              isRadiant ? 'text-emerald-400' : 'text-red-400',
            )}>
              {isRadiant ? 'RADIANT' : 'DIRE'}
            </h2>
            <p className="text-[10px] text-muted-foreground">
              {picks.length}/5 picks • {bans.length}/5 bans
            </p>
          </div>
        </div>
      </div>

      <div className="panel-body space-y-4">
        {/* Picks section */}
        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <Swords className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Picks
            </span>
            <span className={cn(
              'ml-auto text-[11px] font-bold',
              isRadiant ? 'text-emerald-400' : 'text-red-400',
            )}>
              {picks.length}/5
            </span>
          </div>
          <div className="space-y-1.5">
            {picks.map((heroId, index) => {
              const hero = getHeroById(heroId);
              return hero ? (
                <div
                  key={index}
                  className={cn(
                    'flex items-center gap-2.5 p-2 rounded-lg animate-slide-in',
                    'bg-gradient-to-r border',
                    isRadiant
                      ? 'from-emerald-950/50 to-transparent border-emerald-500/15'
                      : 'from-red-950/50 to-transparent border-red-500/15',
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative">
                    <img
                      src={hero.imageUrl}
                      alt={hero.localizedName}
                      className="w-9 h-9 rounded-md object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/36x36/1a1a2e/888?text=${hero.localizedName.slice(0, 2)}`;
                      }}
                    />
                    <div className={cn(
                      'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold',
                      'border-2 border-card',
                      isRadiant ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white',
                    )}>
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{hero.localizedName}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">
                      {hero.primaryAttr === 'str' ? 'Strength' : hero.primaryAttr === 'agi' ? 'Agility' : 'Intelligence'}
                    </p>
                  </div>
                </div>
              ) : null;
            })}
            {/* Empty pick slots */}
            {Array.from({ length: Math.max(0, 5 - picks.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center gap-2.5 p-2 rounded-lg border border-dashed border-border/30"
              >
                <div className="w-9 h-9 rounded-md bg-secondary/30" />
                <div className="flex-1">
                  <div className="w-16 h-2.5 rounded bg-secondary/30" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bans section */}
        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <Ban className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Bans
            </span>
            <span className="ml-auto text-[11px] font-bold text-muted-foreground">
              {bans.length}/5
            </span>
          </div>
          <div className="space-y-1">
            {bans.map((heroId, index) => {
              const hero = getHeroById(heroId);
              return hero ? (
                <div
                  key={index}
                  className="flex items-center gap-2 p-1.5 rounded-lg bg-secondary/20 opacity-50 animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <img
                    src={hero.imageUrl}
                    alt={hero.localizedName}
                    className="w-6 h-6 rounded grayscale"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://placehold.co/24x24/1a1a2e/555?text=${hero.localizedName.slice(0, 1)}`;
                    }}
                  />
                  <span className="text-[11px] line-through text-muted-foreground truncate">
                    {hero.localizedName}
                  </span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
