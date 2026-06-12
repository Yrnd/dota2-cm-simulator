import { create } from 'zustand';
import { calculateWinProbability, WinProbabilityResult } from '@/lib/win-probability';
import { useDraftStore } from './draft-store';
import { useHeroStore } from './hero-store';
import { Hero } from '@/data/heroes';

interface CalculationState {
  winProbability: WinProbabilityResult | null;
  history: { radiant: number; dire: number; stage: number }[];
  calculate: () => void;
}

export const useCalculationStore = create<CalculationState>((set, get) => ({
  winProbability: null,
  history: [],
  calculate: () => {
    const draftState = useDraftStore.getState();
    const heroStore = useHeroStore.getState();
    const radiantHeroes = draftState.radiantPicks.map(id => heroStore.getHeroById(id)).filter((h): h is Hero => h !== undefined);
    const direHeroes = draftState.direPicks.map(id => heroStore.getHeroById(id)).filter((h): h is Hero => h !== undefined);
    const result = calculateWinProbability(radiantHeroes, direHeroes, heroStore.synergyMatrix, heroStore.counterMatrix);
    set({
      winProbability: result,
      history: [...get().history, { radiant: result.radiantWinRate, dire: result.direWinRate, stage: draftState.currentStageIndex }],
    });
  },
}));
