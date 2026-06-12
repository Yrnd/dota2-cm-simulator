import React, { useEffect, useState } from 'react';
import { HeroGrid } from './components/HeroGrid';
import { DraftPanel } from './components/DraftPanel';
import { DraftTimeline } from './components/DraftTimeline';
import { WinProbabilityChart } from './components/WinProbabilityChart';
import { Recommendations } from './components/Recommendations';
import { MatchImport } from './components/MatchImport';
import { LobbyMenu } from './components/LobbyMenu';
import { useDraftStore } from './stores/draft-store';
import { useLobbyStore } from './stores/lobby-store';
import { useCalculationStore } from './stores/calculation-store';
import { CM_STAGES, TOTAL_STAGES } from '@/lib/cm-rules';
import { cn } from './lib/utils';

type Screen = 'menu' | 'lobby_menu' | 'draft';

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');

  const {
    isActive: localActive, isComplete: localComplete,
    startDraft: localStart, resetDraft: localReset,
    currentStageIndex: localIndex, timeRemaining: localTime,
    getCurrentStage: localGetStage,
  } = useDraftStore();

  const {
    status: lobbyStatus, lobbyCode, myTeam, isMyTurn,
    currentStageIndex: lobbyIndex, timeRemaining: lobbyTime,
    radiantPlayer, direPlayer, passTime: lobbyPassTime,
    endDraft, leaveLobby,
  } = useLobbyStore();

  const calculate = useCalculationStore(state => state.calculate);

  const isLobby = screen === 'draft' && lobbyCode !== null;
  const isComplete = isLobby ? lobbyStatus === 'completed' : localComplete;
  const isActive = isLobby ? lobbyStatus === 'drafting' : localActive;
  const currentStageIndex = isLobby ? lobbyIndex : localIndex;
  const timeRemaining = isLobby ? lobbyTime : localTime;
  const stage = isLobby
    ? (currentStageIndex < TOTAL_STAGES ? CM_STAGES[currentStageIndex] : null)
    : localGetStage();
  const isWarning = timeRemaining <= 10;
  const isCritical = timeRemaining <= 5;

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        if (isLobby) lobbyPassTime();
        else useDraftStore.getState().passTime();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isActive, isLobby]);

  useEffect(() => { calculate(); }, [currentStageIndex, calculate]);

  const handleEndDraft = () => {
    if (isLobby) endDraft();
    else localReset();
    setScreen('menu');
    if (isLobby) leaveLobby();
  };

  // ═══ MENU SCREEN ═══
  if (screen === 'menu') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        <div className="dota-panel dota-panel-gold rounded-sm p-8 max-w-sm w-full text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded bg-gradient-to-b from-[#4a3a1a] to-[#2a1a0a] border-2 border-[#c7a44e] flex items-center justify-center">
            <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="#c7a44e" strokeWidth="1.5">
              <path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M15 21l6-6" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-glow-gold" style={{ color: '#c7a44e' }}>
              DOTA 2 CM SIMULATOR
            </h1>
            <p className="text-[11px] text-[#7a7568] mt-1">Captain's Mode draft simulator</p>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => { localReset(); setScreen('draft'); }}
              className="dota-btn dota-btn-gold w-full py-2.5 text-xs"
            >
              LOCAL DRAFT
            </button>
            <button
              onClick={() => setScreen('lobby_menu')}
              className="dota-btn w-full py-2.5 text-xs"
            >
              ONLINE DRAFT
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══ LOBBY MENU SCREEN ═══
  if (screen === 'lobby_menu') {
    return <LobbyMenu onBack={() => setScreen('menu')} />;
  }

  // ═══ DRAFT SCREEN ═══
  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* ═══════════ TOP BAR ═══════════ */}
      <div className="shrink-0 dota-panel-header border-b border-[#1a1d24]">
        <div className="top-bar-inner max-w-[1920px] mx-auto px-3 py-1.5 flex items-center gap-3">
          {/* Logo / Back */}
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleEndDraft} className="dota-btn text-[9px] px-2 py-1" title="End draft">
              ← EXIT
            </button>
            {isLobby && lobbyCode && (
              <span className="text-[10px] font-bold text-[#c7a44e] tracking-wider" style={{ fontFamily: "'Georgia', serif" }}>
                #{lobbyCode}
              </span>
            )}
          </div>

          <div className="w-px h-5 bg-[#3d4250]" />

          {/* Timer */}
          <div className={cn(
            'flex items-center justify-center px-4 py-1 rounded-sm border',
            isComplete ? 'bg-[#1a1d24] border-[#2a2e38]' : 'bg-gradient-to-b from-[#2c303c] to-[#1e2028] border-[#3d4250]',
          )}>
            <span className={cn(
              'timer-display text-xl font-bold tabular-nums min-w-[2.5ch] text-right',
              isCritical ? 'text-[#e04040] animate-timer-pulse' : isWarning ? 'text-[#e04040]' : 'text-[#f0e8d0] text-glow-gold',
            )} style={{ fontFamily: "'Georgia', serif" }}>
              {isComplete ? '--' : timeRemaining}
            </span>
            <span className="text-[10px] ml-1 text-[#7a7568]">SEC</span>
          </div>

          <div className="w-px h-5 bg-[#3d4250]" />

          {/* Stage + turn info */}
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-2 h-2 rounded-full',
              isActive ? (stage?.team === 'radiant' ? 'bg-[#4b9e4b]' : 'bg-[#b8312a]') : 'bg-[#3d4250]',
            )} />
            <span className="text-[11px] font-medium text-[#7a7568]">
              {isComplete ? 'COMPLETE' : `STAGE ${currentStageIndex + 1}/${TOTAL_STAGES}`}
            </span>
            {isActive && (
              <span className={cn(
                'text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase',
                stage?.team === 'radiant' ? 'bg-[#1a3a1a] text-[#5fcc5f] border border-[#2a5a2a]' : 'bg-[#3a1a1a] text-[#e04040] border border-[#5a2a2a]',
              )}>
                {stage?.team === 'radiant' ? 'RADIANT' : 'DIRE'} {stage?.type.toUpperCase()}
              </span>
            )}
            {isLobby && isMyTurn && !isComplete && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-[#4a3a1a] text-[#e8c95a] border border-[#6a5020] animate-pulse">
                YOUR TURN
              </span>
            )}
            {isLobby && !isMyTurn && !isComplete && (
              <span className="text-[9px] text-[#7a7568]">
                Waiting for {stage?.team === 'radiant' ? radiantPlayer || 'Radiant' : direPlayer || 'Dire'}...
              </span>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 ml-auto">
            {!isActive && currentStageIndex === 0 && !isLobby && (
              <button onClick={localStart} className="dota-btn dota-btn-gold text-[11px] px-5 py-1.5">
                LOCK IN
              </button>
            )}
            {!isLobby && (
              <button onClick={localReset} className="dota-btn text-[11px] px-3 py-1.5">
                RESET
              </button>
            )}
            {!isComplete && (
              <button onClick={handleEndDraft} className="dota-btn dota-btn-red text-[11px] px-3 py-1.5">
                END DRAFT
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════ DRAFT TIMELINE ═══════════ */}
      <div className="shrink-0 border-b border-[#2a2e38] bg-[#1a1d24]/80">
        <div className="draft-timeline-bar max-w-[1920px] mx-auto px-3 py-1.5">
          <DraftTimeline />
        </div>
      </div>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-2 overflow-hidden">
          <HeroGrid />
        </div>
        <div className="draft-sidebar w-64 shrink-0 border-l border-[#2a2e38] bg-[#1a1d24]/60 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <DraftPanel team="radiant" />
          </div>
          <div className="h-px bg-[#2a2e38] mx-2" />
          <div className="flex-1 overflow-hidden">
            <DraftPanel team="dire" />
          </div>
        </div>
      </div>

      {/* ═══════════ BOTTOM BAR ═══════════ */}
      <div className="shrink-0 border-t border-[#2a2e38] bg-[#1e2028]">
        <div className="bottom-bar-inner max-w-[1920px] mx-auto px-3 py-2 flex items-center gap-4">
          <WinProbabilityChart />
          <div className="bottom-separator w-px h-5 bg-[#3d4250]" />
          <Recommendations />
          <div className="bottom-separator w-px h-5 bg-[#3d4250]" />
          <MatchImport />
        </div>
      </div>

      {/* ═══════════ DRAFT COMPLETE OVERLAY ═══════════ */}
      {isComplete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="dota-panel dota-panel-gold rounded-sm p-8 text-center max-w-sm animate-slide-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-b from-[#4a3a1a] to-[#2a1a0a] border-2 border-[#c7a44e] flex items-center justify-center">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#c7a44e" strokeWidth="2">
                <path d="M12 15l-5.878 3.09 1.123-6.545L2.489 6.91l6.572-.955L12 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-glow-gold mb-1" style={{ color: '#c7a44e' }}>DRAFT COMPLETE</h2>
            {isLobby && (
              <p className="text-xs text-[#7a7568] mb-2">
                {radiantPlayer || 'Radiant'} vs {direPlayer || 'Dire'}
              </p>
            )}
            <p className="text-xs text-[#7a7568] mb-5">All {TOTAL_STAGES} stages have been completed</p>
            <button onClick={handleEndDraft} className="dota-btn dota-btn-gold w-full py-2 text-xs">
              {isLobby ? 'END & BACK TO MENU' : 'NEW DRAFT'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
