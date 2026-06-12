import React from 'react';
import { cn } from '@/lib/utils';
import { Hero } from '@/data/heroes';

interface HeroCardProps {
  hero: Hero;
  status: 'available' | 'banned' | 'picked';
  onClick?: () => void;
}

export function HeroCard({ hero, status, onClick }: HeroCardProps) {
  const attrColors: Record<string, string> = {
    str: 'from-red-500/30 to-red-900/30',
    agi: 'from-green-500/30 to-green-900/30',
    int: 'from-blue-500/30 to-blue-900/30',
  };

  const attrBorder: Record<string, string> = {
    str: 'border-red-500/40',
    agi: 'border-green-500/40',
    int: 'border-blue-500/40',
  };

  const attrText: Record<string, string> = {
    str: 'text-red-400',
    agi: 'text-green-400',
    int: 'text-blue-400',
  };

  const attrIcons: Record<string, string> = {
    str: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_strength.png',
    agi: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_agility.png',
    int: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_intelligence.png',
  };

  return (
    <div
      className={cn(
        'hero-card-grid group cursor-pointer border transition-all duration-200',
        status === 'available' && [
          'border-border/50 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.03]',
          'bg-gradient-to-b from-card to-card/80',
        ],
        status === 'banned' && [
          'border-red-500/30 opacity-40 cursor-not-allowed',
          'bg-gradient-to-b from-red-950/30 to-card/80',
        ],
        status === 'picked' && [
          'border-primary/50 shadow-md shadow-primary/10',
          'bg-gradient-to-b from-amber-950/30 to-card/80',
        ],
      )}
      onClick={status === 'available' ? onClick : undefined}
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={hero.imageUrl}
          alt={hero.localizedName}
          className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://placehold.co/192x108/1a1a2e/666?text=${hero.localizedName.slice(0, 3)}`;
          }}
        />
        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Status badge */}
        {status !== 'available' && (
          <div className={cn(
            'absolute top-1.5 right-1.5 draft-badge',
            status === 'banned' ? 'bg-red-500/90 text-white' : 'bg-primary/90 text-primary-foreground',
          )}>
            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              {status === 'banned' ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M20 6L9 17l-5-5" />
              )}
            </svg>
            {status === 'banned' ? 'BANNED' : 'PICKED'}
          </div>
        )}

        {/* Attribute icon */}
        <div className={cn(
          'absolute top-1.5 left-1.5 w-5 h-5 rounded-full flex items-center justify-center',
          'bg-black/60 backdrop-blur-sm border',
          attrBorder[hero.primaryAttr],
        )}>
          <img src={attrIcons[hero.primaryAttr]} className="w-3 h-3" alt="" />
        </div>
      </div>

      {/* Hero name */}
      <div className="px-1.5 py-1.5 relative">
        <p className={cn(
          'text-[10px] font-medium text-center truncate leading-tight',
          status === 'banned' && 'line-through opacity-60',
        )}>
          {hero.localizedName}
        </p>
      </div>
    </div>
  );
}
