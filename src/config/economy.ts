export const economyConfig = {
  baseIncome: 50,
  extractorIncome: 10,
  missionBonuses: [{
    wave: 5,
    condition: 'noLoss',
    bonus: 100,
  }, {
    wave: 10,
    condition: 'under60',
    bonus: 150,
  }]
} as const;
export type MissionCondition = 'noLoss' | 'under60';
