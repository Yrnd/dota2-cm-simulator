import React, { useEffect } from 'react';
import { useDraftStore } from '@/stores/draft-store';
import { cn } from '@/lib/utils';

export function CoinFlip() {
  const { coinFlip, startCoinFlip, chooseSideOrOrder, chooseSide, chooseOrder, skipCoinFlip } = useDraftStore();
  const { result, winner, choice, isFlipping, phase } = coinFlip;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="dota-panel rounded-sm p-6 mb-4 text-center">
          <h2 className="text-lg font-bold text-glow-gold mb-1" style={{ color: '#c7a44e' }}>
            COIN FLIP
          </h2>
          <p className="text-[11px] text-[#7a7568]">
            Who wins the flip chooses side or draft order
          </p>
        </div>

        {/* Idle state — start */}
        {phase === 'idle' && (
          <div className="dota-panel rounded-sm p-6 text-center space-y-4">
            <button
              onClick={startCoinFlip}
              className="dota-btn dota-btn-gold w-full py-3 text-sm"
            >
              FLIP COIN
            </button>
            <button
              onClick={skipCoinFlip}
              className="dota-btn w-full py-2 text-xs"
            >
              SKIP — START DRAFT
            </button>
          </div>
        )}

        {/* Flipping animation */}
        {phase === 'flipping' && (
          <div className="dota-panel rounded-sm p-12 text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-b from-[#d4a84a] to-[#9a7a24] border-2 border-[#e0b850] flex items-center justify-center animate-spin">
              <span className="text-2xl font-bold text-[#1a1400]" style={{ fontFamily: "'Georgia', serif" }}>?</span>
            </div>
            <p className="text-sm text-[#7a7568] animate-pulse">Flipping...</p>
          </div>
        )}

        {/* Result — choose side or order */}
        {phase === 'choosing_side_or_order' && (
          <div className="dota-panel dota-panel-gold rounded-sm p-6 text-center space-y-4">
            {/* Coin result */}
            <div className={cn(
              'w-16 h-16 mx-auto rounded-full flex items-center justify-center border-2',
              result === 'heads'
                ? 'bg-gradient-to-b from-[#d4a84a] to-[#9a7a24] border-[#e0b850]'
                : 'bg-gradient-to-b from-[#555a68] to-[#3d4250] border-[#666b7a]',
            )}>
              <span className="text-lg font-bold" style={{
                color: result === 'heads' ? '#1a1400' : '#d4cfbf',
                fontFamily: "'Georgia', serif",
              }}>
                {result === 'heads' ? 'H' : 'T'}
              </span>
            </div>

            <div>
              <p className="text-sm font-medium text-[#d4cfbf]">
                {winner === 'player1' ? 'Player 1' : 'Player 2'} wins!
              </p>
              <p className="text-[11px] text-[#7a7568] mt-1">
                Winner chooses: side (Radiant/Dire) or first/second pick
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => chooseSideOrOrder('side')}
                className="dota-btn py-3 text-xs"
              >
                CHOOSE SIDE
              </button>
              <button
                onClick={() => chooseSideOrOrder('order')}
                className="dota-btn dota-btn-gold py-3 text-xs"
              >
                CHOOSE ORDER
              </button>
            </div>
          </div>
        )}

        {/* Choosing side */}
        {phase === 'choosing' && choice === 'side' && (
          <div className="dota-panel rounded-sm p-6 text-center space-y-4">
            <p className="text-sm text-[#d4cfbf]">Choose your side:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => chooseSide('radiant')}
                className="dota-btn py-3 text-xs border-[#4b9e4b]/30 hover:border-[#4b9e4b]/60"
              >
                <span className="text-[#5fcc5f]">☀ RADIANT</span>
              </button>
              <button
                onClick={() => chooseSide('dire')}
                className="dota-btn py-3 text-xs border-[#b8312a]/30 hover:border-[#b8312a]/60"
              >
                <span className="text-[#e04040]">🌙 DIRE</span>
              </button>
            </div>
            <p className="text-[10px] text-[#7a7568]">
              Loser gets first/second pick automatically
            </p>
          </div>
        )}

        {/* Choosing order */}
        {phase === 'choosing' && choice === 'order' && (
          <div className="dota-panel rounded-sm p-6 text-center space-y-4">
            <p className="text-sm text-[#d4cfbf]">Choose your draft order:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => chooseOrder('first')}
                className="dota-btn dota-btn-gold py-3 text-xs"
              >
                FIRST PICK
              </button>
              <button
                onClick={() => chooseOrder('second')}
                className="dota-btn py-3 text-xs"
              >
                SECOND PICK
              </button>
            </div>
            <p className="text-[10px] text-[#7a7568]">
              Loser picks their side automatically
            </p>
          </div>
        )}

        {/* Done */}
        {phase === 'done' && (
          <div className="dota-panel rounded-sm p-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#1a3a1a] border border-[#2a5a2a] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#5fcc5f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <p className="text-sm text-[#d4cfbf] font-medium">Ready to draft!</p>
            <p className="text-[11px] text-[#7a7568]">
              Press <span className="text-[#c7a44e]">Start Draft</span> to begin
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
