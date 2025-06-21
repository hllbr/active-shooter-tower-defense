export const economyConfig = {
  baseIncome: 50,
  extractorIncome: 10,
  missionBonus: {
    wave: 5,
    condition: 'noLoss',
    bonus: 100,
  },
} as const;
export type MissionCondition = 'noLoss' | 'under60';
