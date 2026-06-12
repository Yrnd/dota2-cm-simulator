export interface DraftStage {
  phase: 1 | 2 | 3;
  type: 'ban' | 'pick';
  team: 'radiant' | 'dire';
  order: number;
}

export const CM_STAGES: DraftStage[] = [
  // Phase 1: 7 bans, 2 picks
  { phase: 1, type: 'ban', team: 'radiant', order: 1 },
  { phase: 1, type: 'ban', team: 'radiant', order: 2 },
  { phase: 1, type: 'ban', team: 'dire', order: 3 },
  { phase: 1, type: 'ban', team: 'dire', order: 4 },
  { phase: 1, type: 'ban', team: 'radiant', order: 5 },
  { phase: 1, type: 'ban', team: 'dire', order: 6 },
  { phase: 1, type: 'ban', team: 'dire', order: 7 },
  { phase: 1, type: 'pick', team: 'radiant', order: 8 },
  { phase: 1, type: 'pick', team: 'dire', order: 9 },
  // Phase 2: 3 bans, 6 picks
  { phase: 2, type: 'ban', team: 'radiant', order: 10 },
  { phase: 2, type: 'ban', team: 'radiant', order: 11 },
  { phase: 2, type: 'ban', team: 'dire', order: 12 },
  { phase: 2, type: 'pick', team: 'dire', order: 13 },
  { phase: 2, type: 'pick', team: 'radiant', order: 14 },
  { phase: 2, type: 'pick', team: 'radiant', order: 15 },
  { phase: 2, type: 'pick', team: 'dire', order: 16 },
  { phase: 2, type: 'pick', team: 'dire', order: 17 },
  { phase: 2, type: 'pick', team: 'radiant', order: 18 },
  // Phase 3: 4 bans, 2 picks
  { phase: 3, type: 'ban', team: 'radiant', order: 19 },
  { phase: 3, type: 'ban', team: 'dire', order: 20 },
  { phase: 3, type: 'ban', team: 'radiant', order: 21 },
  { phase: 3, type: 'ban', team: 'dire', order: 22 },
  { phase: 3, type: 'pick', team: 'radiant', order: 23 },
  { phase: 3, type: 'pick', team: 'dire', order: 24 },
];

export const TOTAL_STAGES = CM_STAGES.length;
export const BONUS_TIME = 130;
export const TURN_TIME = 30;

export function getRandomAvailableHero(availableHeroes: number[]): number {
  return availableHeroes[Math.floor(Math.random() * availableHeroes.length)];
}
