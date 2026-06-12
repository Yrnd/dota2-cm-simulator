import React from 'react';
import { useHeroStore } from '@/stores/hero-store';
import { useDraftStore } from '@/stores/draft-store';
import { useLobbyStore } from '@/stores/lobby-store';
import { useCalculationStore } from '@/stores/calculation-store';
import { cn } from '@/lib/utils';
import { Hero, HeroRole, ROLE_LABELS, ALL_ROLES } from '@/data/heroes';

const ATTRS = [
  { key: 'str', label: 'STR', icon: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_strength.png', activeClass: 'active-red' },
  { key: 'agi', label: 'AGI', icon: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_agility.png', activeClass: 'active-green' },
  { key: 'int', label: 'INT', icon: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_intelligence.png', activeClass: 'active-blue' },
  { key: 'uni', label: 'UNI', icon: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_universal.png', activeClass: 'active' },
] as const;

const ROLE_ICONS: Record<HeroRole, string> = {
  carry: '⚔',
  mid: '★',
  offlane: '🛡',
  support: '✦',
  hard_support: '♥',
};

function HeroCell({ hero, status, onClick }: { hero: Hero; status: 'available' | 'banned' | 'picked'; onClick: () => void }) {
  const isAvailable = status === 'available';
  return (
    <div
      className={cn(
        'hero-cell aspect-[16/10]',
        status === 'picked' && 'picked',
        status === 'banned' && 'banned',
      )}
      onClick={isAvailable ? onClick : undefined}
    >
      <img
        src={hero.imageUrl}
        alt={hero.localizedName}
        className="w-full h-full object-cover object-top"
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src = `https://placehold.co/120x75/1e2028/555?text=${hero.localizedName.slice(0, 2)}`;
        }}
      />
      {/* Bottom gradient with name */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-0.5 pb-0.5 pt-2">
        <p className="text-[7px] font-medium text-[#d4cfbf] truncate text-center leading-tight">
          {hero.localizedName}
        </p>
      </div>
      {/* Status overlays */}
      {status === 'banned' && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#4a1a1a]/70">
          <svg className="w-5 h-5 text-[#e04040]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </div>
      )}
      {status === 'picked' && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#c7a44e]/10">
          <svg className="w-4 h-4 text-[#c7a44e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
      )}
    </div>
  );
}

export function HeroGrid() {
  const filteredHeroes = useHeroStore(state => state.filteredHeroes);
  const { radiantPicks, radiantBans, direPicks, direBans, performAction: localPerformAction, currentStageIndex: localIndex, isActive: localActive } = useDraftStore();
  const { lobbyCode, currentStageIndex: lobbyIndex, status: lobbyStatus, isMyTurn, performAction: lobbyPerformAction, radiantPicks: lRP, radiantBans: lRB, direPicks: lDP, direBans: lDB } = useLobbyStore();
  const calculate = useCalculationStore(state => state.calculate);
  const { searchQuery, setSearchQuery, attributeFilter, setAttributeFilter, roleFilter, setRoleFilter } = useHeroStore();

  const isLobby = !!lobbyCode;
  const currentStageIndex = isLobby ? lobbyIndex : localIndex;
  const isActive = isLobby ? lobbyStatus === 'drafting' : localActive;
  const rPicks = isLobby ? lRP : radiantPicks;
  const rBans = isLobby ? lRB : radiantBans;
  const dPicks = isLobby ? lDP : direPicks;
  const dBans = isLobby ? lDB : direBans;

  const getHeroStatus = (heroId: number): 'available' | 'banned' | 'picked' => {
    if (rPicks.includes(heroId) || dPicks.includes(heroId)) return 'picked';
    if (rBans.includes(heroId) || dBans.includes(heroId)) return 'banned';
    return 'available';
  };

  const handleHeroClick = (heroId: number) => {
    if (getHeroStatus(heroId) !== 'available' || currentStageIndex >= 24 || !isActive) return;
    if (isLobby && !isMyTurn) return;

    if (isLobby) {
      lobbyPerformAction(heroId);
    } else {
      localPerformAction(heroId);
    }
    setTimeout(() => calculate(), 0);
  };

  // Group by attribute
  const grouped = {
    str: filteredHeroes.filter(h => h.primaryAttr === 'str'),
    agi: filteredHeroes.filter(h => h.primaryAttr === 'agi'),
    int: filteredHeroes.filter(h => h.primaryAttr === 'int'),
    uni: filteredHeroes.filter(h => h.primaryAttr === 'uni'),
  };

  const showGroup = (attr: keyof typeof grouped) => {
    if (attributeFilter && attributeFilter !== attr) return false;
    return grouped[attr].length > 0;
  };

  return (
    <div className="flex flex-col h-full">
      {/* ═══ FILTER BAR ═══ */}
      <div className="filter-bar flex items-center gap-2 mb-2">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#7a7568]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-32 h-7 pl-7 pr-2 rounded-sm text-[11px] bg-[#1e2028] border border-[#3d4250] text-[#d4cfbf] placeholder:text-[#7a7568]/50 focus:outline-none focus:border-[#c7a44e]/50 transition-colors"
          />
        </div>

        {/* Attribute filters */}
        <div className="attr-filters flex">
          {ATTRS.map(a => (
            <button
              key={a.key}
              onClick={() => setAttributeFilter(attributeFilter === a.key ? null : a.key)}
              className={cn('dota-filter flex items-center gap-1', attributeFilter === a.key && a.activeClass)}
            >
              <img src={a.icon} className="w-3 h-3" alt="" />
              {a.label}
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="w-px h-4 bg-[#3d4250]" />

        {/* Role filters (desktop) */}
        <div className="role-filters flex">
          {ALL_ROLES.map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(roleFilter === role ? null : role)}
              className={cn('dota-filter', roleFilter === role && 'active')}
            >
              <span className="mr-0.5">{ROLE_ICONS[role]}</span>
              {ROLE_LABELS[role]}
            </button>
          ))}
        </div>

        {/* Role filters (mobile - icon only) */}
        <div className="role-filters-mobile flex">
          {ALL_ROLES.map(role => (
            <button
              key={role}
              onClick={() => setRoleFilter(roleFilter === role ? null : role)}
              className={cn('dota-filter px-1.5', roleFilter === role && 'active')}
              title={ROLE_LABELS[role]}
            >
              {ROLE_ICONS[role]}
            </button>
          ))}
        </div>

        {/* Active filter count */}
        {(attributeFilter || roleFilter) && (
          <button
            onClick={() => { setAttributeFilter(null); setRoleFilter(null); }}
            className="text-[9px] text-[#c7a44e] hover:text-[#e8c95a] transition-colors ml-1"
          >
            ✕ Clear
          </button>
        )}

        {/* Hero count */}
        <span className="ml-auto text-[10px] text-[#7a7568]">
          {filteredHeroes.length} heroes
        </span>
      </div>

      {/* ═══ HERO GRID ═══ */}
      <div className="hero-grid-scroll flex-1 overflow-y-auto scrollbar-thin pr-1">
        <div className="space-y-2">
          {showGroup('str') && (
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <img src={ATTRS[0].icon} className="w-3.5 h-3.5" alt="" />
                <span className="text-[9px] font-bold text-[#e04040] uppercase tracking-wider">Strength</span>
                <span className="text-[8px] text-[#7a7568]/50">({grouped.str.length})</span>
                <div className="flex-1 h-px bg-[#b8312a]/20" />
              </div>
              <div className="hero-grid-container grid grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-[3px]">
                {grouped.str.map(hero => (
                  <HeroCell key={hero.id} hero={hero} status={getHeroStatus(hero.id)} onClick={() => handleHeroClick(hero.id)} />
                ))}
              </div>
            </div>
          )}
          {showGroup('agi') && (
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <img src={ATTRS[1].icon} className="w-3.5 h-3.5" alt="" />
                <span className="text-[9px] font-bold text-[#5fcc5f] uppercase tracking-wider">Agility</span>
                <span className="text-[8px] text-[#7a7568]/50">({grouped.agi.length})</span>
                <div className="flex-1 h-px bg-[#4b9e4b]/20" />
              </div>
              <div className="hero-grid-container grid grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-[3px]">
                {grouped.agi.map(hero => (
                  <HeroCell key={hero.id} hero={hero} status={getHeroStatus(hero.id)} onClick={() => handleHeroClick(hero.id)} />
                ))}
              </div>
            </div>
          )}
          {showGroup('int') && (
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <img src={ATTRS[2].icon} className="w-3.5 h-3.5" alt="" />
                <span className="text-[9px] font-bold text-[#5fa8e8] uppercase tracking-wider">Intelligence</span>
                <span className="text-[8px] text-[#7a7568]/50">({grouped.int.length})</span>
                <div className="flex-1 h-px bg-[#4b7eb8]/20" />
              </div>
              <div className="hero-grid-container grid grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-[3px]">
                {grouped.int.map(hero => (
                  <HeroCell key={hero.id} hero={hero} status={getHeroStatus(hero.id)} onClick={() => handleHeroClick(hero.id)} />
                ))}
              </div>
            </div>
          )}
          {showGroup('uni') && (
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <img src={ATTRS[3].icon} className="w-3.5 h-3.5" alt="" />
                <span className="text-[9px] font-bold text-[#c7a44e] uppercase tracking-wider">Universal</span>
                <span className="text-[8px] text-[#7a7568]/50">({grouped.uni.length})</span>
                <div className="flex-1 h-px bg-[#c7a44e]/20" />
              </div>
              <div className="hero-grid-container grid grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-[3px]">
                {grouped.uni.map(hero => (
                  <HeroCell key={hero.id} hero={hero} status={getHeroStatus(hero.id)} onClick={() => handleHeroClick(hero.id)} />
                ))}
              </div>
            </div>
          )}
          {filteredHeroes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-[#7a7568]">No heroes match your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
