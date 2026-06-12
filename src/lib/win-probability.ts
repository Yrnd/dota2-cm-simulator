import { Hero } from '@/data/heroes';

export interface WinProbabilityResult {
  radiantWinRate: number;
  direWinRate: number;
  factors: {
    baseWinRate: number;
    synergyBonus: number;
    counterPenalty: number;
    roleBalance: number;
  };
}

export function calculateWinProbability(
  radiantHeroes: Hero[],
  direHeroes: Hero[],
  synergyMatrix: Record<string, number>,
  counterMatrix: Record<string, number>
): WinProbabilityResult {
  const radiantBase = radiantHeroes.reduce((sum, h) => sum + h.baseWinRate, 0) / (radiantHeroes.length || 1);
  const direBase = direHeroes.reduce((sum, h) => sum + h.baseWinRate, 0) / (direHeroes.length || 1);

  let radiantSynergy = 0;
  let direSynergy = 0;

  for (let i = 0; i < radiantHeroes.length; i++) {
    for (let j = i + 1; j < radiantHeroes.length; j++) {
      const key = `${radiantHeroes[i].id}_${radiantHeroes[j].id}`;
      radiantSynergy += synergyMatrix[key] || 0;
    }
  }

  for (let i = 0; i < direHeroes.length; i++) {
    for (let j = i + 1; j < direHeroes.length; j++) {
      const key = `${direHeroes[i].id}_${direHeroes[j].id}`;
      direSynergy += synergyMatrix[key] || 0;
    }
  }

  let radiantCounter = 0;
  let direCounter = 0;

  radiantHeroes.forEach(rHero => {
    direHeroes.forEach(dHero => {
      radiantCounter += counterMatrix[`${rHero.id}_${dHero.id}`] || 0;
      direCounter += counterMatrix[`${dHero.id}_${rHero.id}`] || 0;
    });
  });

  const radiantRoles = new Set(radiantHeroes.flatMap(h => h.roles));
  const direRoles = new Set(direHeroes.flatMap(h => h.roles));
  const roleBalanceBonus = 0.02;
  const radiantRoleBalance = radiantRoles.size >= 5 ? roleBalanceBonus : 0;
  const direRoleBalance = direRoles.size >= 5 ? roleBalanceBonus : 0;

  const synergyWeight = 0.3;
  const counterWeight = 0.4;
  const roleWeight = 0.1;

  const radiantWinRate = (radiantBase + radiantSynergy * synergyWeight + radiantCounter * counterWeight + radiantRoleBalance * roleWeight) * 100;
  const direWinRate = (direBase + direSynergy * synergyWeight + direCounter * counterWeight + direRoleBalance * roleWeight) * 100;

  const total = radiantWinRate + direWinRate || 1;

  return {
    radiantWinRate: (radiantWinRate / total) * 100,
    direWinRate: (direWinRate / total) * 100,
    factors: {
      baseWinRate: radiantBase - direBase,
      synergyBonus: radiantSynergy - direSynergy,
      counterPenalty: radiantCounter - direCounter,
      roleBalance: radiantRoleBalance - direRoleBalance,
    },
  };
}
