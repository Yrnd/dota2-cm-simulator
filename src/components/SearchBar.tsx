import React from 'react';
import { Search, X } from 'lucide-react';
import { useHeroStore } from '@/stores/hero-store';
import { cn } from '@/lib/utils';

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useHeroStore();

  return (
    <div className="relative flex-1 max-w-xs">
      <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search heroes..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={cn(
          'w-full h-8 pl-8 pr-8 rounded-lg text-xs',
          'bg-secondary/30 border border-border/40',
          'placeholder:text-muted-foreground/50',
          'focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/40',
          'transition-all duration-200',
        )}
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
