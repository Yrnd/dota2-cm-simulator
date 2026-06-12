import React, { useEffect } from 'react';
import { useCalculationStore } from '@/stores/calculation-store';
import { useDraftStore } from '@/stores/draft-store';
import { cn } from '@/lib/utils';

export function WinProbabilityChart() {
  const { winProbability, history, calculate } = useCalculationStore();
  const { currentStageIndex } = useDraftStore();

  useEffect(() => {
    calculate();
  }, [calculate, currentStageIndex]);

  return (
    <div className="flex items-center gap-3 flex-1">
      {/* Radiant side */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[9px] font-bold text-[#5fcc5f]/60 uppercase">RAD</span>
        <span className="text-base font-bold text-[#5fcc5f] tabular-nums text-glow-gold" style={{ fontFamily: "'Georgia', serif" }}>
          {winProbability ? `${winProbability.radiantWinRate.toFixed(1)}%` : '--'}
        </span>
      </div>

      {/* Bar */}
      <div className="flex-1 h-2 bg-[#1e2028] rounded-[1px] overflow-hidden border border-[#2a2e38]">
        {winProbability && (
          <div className="h-full flex">
            <div className="bg-gradient-to-r from-[#4b9e4b] to-[#5fcc5f] transition-all duration-500" style={{ width: `${winProbability.radiantWinRate}%` }} />
            <div className="bg-gradient-to-r from-[#b8312a] to-[#e04040] transition-all duration-500" style={{ width: `${winProbability.direWinRate}%` }} />
          </div>
        )}
      </div>

      {/* Dire side */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-base font-bold text-[#e04040] tabular-nums text-glow-red" style={{ fontFamily: "'Georgia', serif" }}>
          {winProbability ? `${winProbability.direWinRate.toFixed(1)}%` : '--'}
        </span>
        <span className="text-[9px] font-bold text-[#e04040]/60 uppercase">DRE</span>
      </div>

      {/* Factors */}
      {winProbability && (
        <div className="flex items-center gap-2 ml-2">
          <div className="w-px h-3 bg-[#3d4250]" />
          {[
            { label: 'SYN', value: winProbability.factors.synergyBonus },
            { label: 'CTR', value: winProbability.factors.counterPenalty },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-0.5">
              <span className="text-[8px] text-[#7a7568]/50">{label}</span>
              <span className={cn('text-[9px] font-bold', value > 0 ? 'text-[#5fcc5f]' : value < 0 ? 'text-[#e04040]' : 'text-[#7a7568]')}>
                {value > 0 ? '+' : ''}{(value * 100).toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
