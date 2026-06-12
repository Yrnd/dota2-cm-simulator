import React from 'react';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { useDraftStore } from '@/stores/draft-store';
import { TURN_TIME } from '@/lib/cm-rules';
import { cn } from '@/lib/utils';
import { Clock, Zap } from 'lucide-react';

export function Timer() {
  const { timeRemaining, currentStageIndex, isActive, isComplete, getCurrentStage } = useDraftStore();
  const progress = (timeRemaining / TURN_TIME) * 100;
  const isWarning = timeRemaining <= 10;
  const isCritical = timeRemaining <= 5;
  const stage = getCurrentStage();

  if (!isActive && !isComplete) return null;

  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-2 rounded-xl border backdrop-blur-sm',
      isComplete ? 'bg-secondary/30 border-border/40' : 'bg-card/60 border-border/40',
    )}>
      {/* Stage indicator */}
      <div className="flex items-center gap-1.5">
        <Zap className={cn(
          'w-3.5 h-3.5',
          isComplete ? 'text-emerald-400' : stage.team === 'radiant' ? 'text-emerald-400' : 'text-red-400',
        )} />
        <span className="text-[11px] font-semibold text-muted-foreground">
          {isComplete ? 'COMPLETE' : `STAGE ${currentStageIndex + 1}/24`}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-border/40" />

      {/* Timer */}
      <div className="flex items-center gap-2">
        <Clock className={cn(
          'w-4 h-4',
          isWarning ? 'text-red-400' : 'text-muted-foreground',
        )} />
        <span className={cn(
          'text-lg font-bold tabular-nums min-w-[3ch] text-right',
          isCritical ? 'text-red-400 animate-pulse-glow' : isWarning ? 'text-red-400' : 'text-foreground',
        )}>
          {isComplete ? '--' : `${timeRemaining}s`}
        </span>
      </div>

      {/* Progress bar (hidden when complete) */}
      {!isComplete && (
        <div className="w-20">
          <Progress
            value={progress}
            className={cn(
              'h-1.5',
              isWarning && '[&>div]:bg-red-500',
            )}
          />
        </div>
      )}
    </div>
  );
}
