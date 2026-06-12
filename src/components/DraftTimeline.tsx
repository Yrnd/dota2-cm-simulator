import React from 'react';
import { useDraftStore } from '@/stores/draft-store';
import { CM_STAGES } from '@/lib/cm-rules';
import { cn } from '@/lib/utils';

export function DraftTimeline() {
  const { currentStageIndex } = useDraftStore();

  return (
    <div className="flex items-center gap-0">
      {/* Radiant label */}
      <span className="text-[8px] font-bold text-[#5fcc5f]/60 w-6 shrink-0">RAD</span>

      {/* All 24 stages */}
      <div className="flex-1 flex items-center gap-px">
        {CM_STAGES.map((stage, i) => {
          const isCurrent = i === currentStageIndex;
          const isPast = i < currentStageIndex;
          const isFuture = i > currentStageIndex;
          const isRadiant = stage.team === 'radiant';

          return (
            <div
              key={stage.order}
              className={cn(
                'flex-1 h-5 rounded-[1px] flex items-center justify-center border transition-all duration-200',
                isCurrent && 'bg-[#4a3a1a] border-[#c7a44e]/50 shadow-[0_0_6px_rgba(199,164,78,0.3)]',
                isPast && isRadiant && 'bg-[#1a3a1a]/40 border-[#4b9e4b]/20',
                isPast && !isRadiant && 'bg-[#3a1a1a]/40 border-[#b8312a]/20',
                isFuture && 'bg-[#1e2028] border-[#2a2e38]/40',
              )}
            >
              {stage.type === 'ban' ? (
                <svg className={cn('w-2 h-2', isPast ? (isRadiant ? 'text-[#4b9e4b]/60' : 'text-[#b8312a]/60') : isCurrent ? 'text-[#c7a44e]' : 'text-[#3d4250]/40')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg className={cn('w-2 h-2', isPast ? (isRadiant ? 'text-[#4b9e4b]/60' : 'text-[#b8312a]/60') : isCurrent ? 'text-[#c7a44e]' : 'text-[#3d4250]/40')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Dire label */}
      <span className="text-[8px] font-bold text-[#e04040]/60 w-6 shrink-0 text-right">DRE</span>
    </div>
  );
}
