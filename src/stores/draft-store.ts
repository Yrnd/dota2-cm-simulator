import { create } from 'zustand';
import { CM_STAGES, DraftStage, BONUS_TIME, TURN_TIME, TOTAL_STAGES, CoinFlipState, CoinFlipResult, flipCoin, getRandomAvailableHero } from '@/lib/cm-rules';
import { useHeroStore } from './hero-store';

interface DraftState {
  currentStageIndex: number;
  radiantPicks: number[];
  radiantBans: number[];
  direPicks: number[];
  direBans: number[];
  radiantBonusTime: number;
  direBonusTime: number;
  timeRemaining: number;
  isActive: boolean;
  isComplete: boolean;
  history: { stage: DraftStage; heroId: number }[];
  stages: DraftStage[];

  coinFlip: CoinFlipState;

  getCurrentStage: () => DraftStage;
  getAvailableHeroes: () => number[];
  performAction: (heroId: number) => void;
  passTime: () => void;
  startCoinFlip: () => void;
  handleCoinFlipResult: () => void;
  chooseSideOrOrder: (choice: 'side' | 'order') => void;
  chooseSide: (side: 'radiant' | 'dire') => void;
  chooseOrder: (order: 'first' | 'second') => void;
  skipCoinFlip: () => void;
  startDraft: () => void;
  resetDraft: () => void;
  importDraft: (history: { stage: DraftStage; heroId: number }[]) => void;
}

export const useDraftStore = create<DraftState>((set, get) => ({
  currentStageIndex: 0,
  radiantPicks: [],
  radiantBans: [],
  direPicks: [],
  direBans: [],
  radiantBonusTime: BONUS_TIME,
  direBonusTime: BONUS_TIME,
  timeRemaining: TURN_TIME,
  isActive: false,
  isComplete: false,
  history: [],
  stages: [...CM_STAGES],

  coinFlip: {
    result: null,
    winner: null,
    choice: null,
    chosenSide: null,
    chosenOrder: null,
    isFlipping: false,
    phase: 'idle',
  },

  getCurrentStage: () => {
    const state = get();
    return state.stages[state.currentStageIndex];
  },

  getAvailableHeroes: () => {
    const state = get();
    const usedHeroes = [...state.radiantPicks, ...state.radiantBans, ...state.direPicks, ...state.direBans];
    return useHeroStore.getState().heroes.filter(h => !usedHeroes.includes(h.id)).map(h => h.id);
  },

  performAction: (heroId) => {
    const state = get();
    if (state.currentStageIndex >= TOTAL_STAGES) return;
    const stage = state.stages[state.currentStageIndex];
    const newState: Partial<DraftState> = {
      history: [...state.history, { stage, heroId }],
      currentStageIndex: state.currentStageIndex + 1,
      timeRemaining: TURN_TIME,
      isComplete: state.currentStageIndex + 1 >= TOTAL_STAGES,
      isActive: state.currentStageIndex + 1 < TOTAL_STAGES ? state.isActive : false,
    };
    if (stage.type === 'ban') {
      if (stage.team === 'radiant') newState.radiantBans = [...state.radiantBans, heroId];
      else newState.direBans = [...state.direBans, heroId];
    } else {
      if (stage.team === 'radiant') newState.radiantPicks = [...state.radiantPicks, heroId];
      else newState.direPicks = [...state.direPicks, heroId];
    }
    set(newState as DraftState);
  },

  passTime: () => {
    const state = get();
    if (!state.isActive || state.currentStageIndex >= TOTAL_STAGES) return;
    const newTime = state.timeRemaining - 1;
    if (newTime <= 0) {
      const available = get().getAvailableHeroes();
      if (available.length > 0) {
        get().performAction(getRandomAvailableHero(available));
      }
    } else {
      set({ timeRemaining: newTime });
    }
  },

  startCoinFlip: () => {
    set({
      coinFlip: {
        result: null,
        winner: null,
        choice: null,
        chosenSide: null,
        chosenOrder: null,
        isFlipping: true,
        phase: 'flipping',
      },
    });

    setTimeout(() => {
      const result = flipCoin();
      const winner = result === 'heads' ? 'player1' : 'player2';
      set({
        coinFlip: {
          result,
          winner,
          choice: null,
          chosenSide: null,
          chosenOrder: null,
          isFlipping: false,
          phase: 'choosing_side_or_order',
        },
      });
    }, 1500);
  },

  handleCoinFlipResult: () => {},

  chooseSideOrOrder: (choice) => {
    set(state => ({
      coinFlip: { ...state.coinFlip, choice, phase: 'choosing' },
    }));
  },

  chooseSide: (side) => {
    const state = get();
    const isWinner = state.coinFlip.winner === 'player1';
    const radiantsFirst = side === 'radiant' ? isWinner : !isWinner;
    const stages = radiantsFirst ? [...CM_STAGES] : CM_STAGES.map(s => ({ ...s, team: s.team === 'radiant' ? 'dire' : 'radiant' as 'radiant' | 'dire' }));
    set({
      coinFlip: { ...state.coinFlip, chosenSide: side, phase: 'done' },
      stages,
    });
  },

  chooseOrder: (order) => {
    const state = get();
    const isWinner = state.coinFlip.winner === 'player1';
    const radiantsFirst = order === 'first' ? isWinner : !isWinner;
    const stages = radiantsFirst ? [...CM_STAGES] : CM_STAGES.map(s => ({ ...s, team: s.team === 'radiant' ? 'dire' : 'radiant' as 'radiant' | 'dire' }));
    set({
      coinFlip: { ...state.coinFlip, chosenOrder: order, phase: 'done' },
      stages,
    });
  },

  skipCoinFlip: () => {
    set({
      coinFlip: {
        result: null,
        winner: null,
        choice: null,
        chosenSide: null,
        chosenOrder: null,
        isFlipping: false,
        phase: 'done',
      },
    });
  },

  startDraft: () => set({ isActive: true }),

  resetDraft: () => set({
    currentStageIndex: 0, radiantPicks: [], radiantBans: [], direPicks: [], direBans: [],
    radiantBonusTime: BONUS_TIME, direBonusTime: BONUS_TIME, timeRemaining: TURN_TIME,
    isActive: false, isComplete: false, history: [], stages: [...CM_STAGES],
    coinFlip: {
      result: null, winner: null, choice: null, chosenSide: null, chosenOrder: null,
      isFlipping: false, phase: 'idle',
    },
  }),

  importDraft: (history) => {
    let radiantPicks: number[] = [], radiantBans: number[] = [], direPicks: number[] = [], direBans: number[] = [];
    history.forEach(({ stage, heroId }) => {
      if (stage.type === 'ban') {
        if (stage.team === 'radiant') radiantBans.push(heroId); else direBans.push(heroId);
      } else {
        if (stage.team === 'radiant') radiantPicks.push(heroId); else direPicks.push(heroId);
      }
    });
    set({
      currentStageIndex: history.length, radiantPicks, radiantBans, direPicks, direBans,
      history, isActive: false, isComplete: history.length >= TOTAL_STAGES, timeRemaining: TURN_TIME,
      stages: [...CM_STAGES],
      coinFlip: { result: null, winner: null, choice: null, chosenSide: null, chosenOrder: null, isFlipping: false, phase: 'done' },
    });
  },
}));
