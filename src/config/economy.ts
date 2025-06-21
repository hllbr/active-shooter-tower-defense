export const economyConfig = {
  baseIncome: 50,
  extractorIncome: 25,
  extractorLevelMultiplier: 1.5,
  waveIncomeBonus: (wave: number) => Math.floor(wave / 5) * 10,
  missionBonuses: [
    {
      wave: 5,
      condition: 'noLoss',
      bonus: 100,
    }, 
    {
      wave: 10,
      condition: 'under60',
      bonus: 150,
    },
    {
      wave: 15,
      condition: 'noLoss',
      bonus: 200,
    },
    {
      wave: 20,
      condition: 'under60',
      bonus: 250,
    },
    {
      wave: 25,
      condition: 'noLoss',
      bonus: 300,
    }
  ]
} as const;

export type MissionCondition = 'noLoss' | 'under60';

export function getExtractorIncome(extractorLevel: number, currentWave: number): number {
  const baseIncome = economyConfig.extractorIncome;
  const levelBonus = Math.pow(economyConfig.extractorLevelMultiplier, extractorLevel - 1);
  const waveBonus = economyConfig.waveIncomeBonus(currentWave);
  return Math.floor(baseIncome * levelBonus + waveBonus);
}
