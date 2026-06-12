import React from 'react';
import { useHeroStore } from '@/stores/hero-store';
import { cn } from '@/lib/utils';

export function AttributeFilter() {
  const { attributeFilter, setAttributeFilter } = useHeroStore();

  const attrs = [
    { key: null, label: 'ALL', color: 'text-foreground', bg: 'bg-primary/15', border: 'border-primary/30' },
    { key: 'str', label: 'STR', color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30' },
    { key: 'agi', label: 'AGI', color: 'text-green-400', bg: 'bg-green-500/15', border: 'border-green-500/30' },
    { key: 'int', label: 'INT', color: 'text-blue-400', bg: 'bg-blue-500/15', border: 'border-blue-500/30' },
  ];

  return (
    <div className="flex gap-1">
      {attrs.map(a => (
        <button
          key={a.label}
          onClick={() => setAttributeFilter(a.key)}
          className={cn(
            'px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-200 border',
            attributeFilter === a.key
              ? [a.bg, a.color, a.border]
              : 'bg-transparent text-muted-foreground border-transparent hover:bg-secondary/40 hover:text-foreground',
          )}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
