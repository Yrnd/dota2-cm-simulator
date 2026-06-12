export interface DraftStage {
  phase: 1 | 2 | 3;
  type: 'ban' | 'pick';
  team: 'radiant' | 'dire';
  order: number;
}

export const CM_STAGES: DraftStage[] = [
  { phase: 1, type: 'ban', team: 'radiant', order: 1 },
  { phase: 1, type: 'ban', team: 'dire', order: 2 },
  { phase: 1, type: 'ban', team: 'radiant', order: 3 },
  { phase: 1, type: 'ban', team: 'dire', order: 4 },
  { phase: 1, type: 'pick', team: 'radiant', order: 5 },
  { phase: 1, type: 'pick', team: 'dire', order: 6 },
  { phase: 1, type: 'pick', team: 'radiant', order: 7 },
  { phase: 1, type: 'pick', team: 'dire', order: 8 },
  { phase: 2, type: 'ban', team: 'radiant', order: 9 },
  { phase: 2, type: 'ban', team: 'dire', order: 10 },
  { phase: 2, type: 'ban', team: 'radiant', order: 11 },
  { phase: 2, type: 'ban', team: 'dire', order: 12 },
  { phase: 2, type: 'pick', team: 'radiant', order: 13 },
  { phase: 2, type: 'pick', team: 'dire', order: 14 },
  { phase: 2, type: 'pick', team: 'radiant', order: 15 },
  { phase: 2, type: 'pick', team: 'dire', order: 16 },
  { phase: 3, type: 'ban', team: 'radiant', order: 17 },
  { phase: 3, type: 'ban', team: 'dire', order: 18 },
  { phase: 3, type: 'pick', team: 'radiant', order: 19 },
  { phase: 3, type: 'pick', team: 'dire', order: 20 },
  { phase: 3, type: 'ban', team: 'radiant', order: 21 },
  { phase: 3, type: 'ban', team: 'dire', order: 22 },
  { phase: 3, type: 'pick', team: 'radiant', order: 23 },
  { phase: 3, type: 'pick', team: 'dire', order: 24 },
];

export const BONUS_TIME = 130;
export const TURN_TIME = 30;

export function getRandomAvailableHero(availableHeroes: number[]): number {
  return availableHeroes[Math.floor(Math.random() * availableHeroes.length)];
}
