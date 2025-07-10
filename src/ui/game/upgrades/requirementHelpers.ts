// Upgrade requirement helper functions

export interface UpgradeRequirement {
  type: 'fire_level' | 'shield_level' | 'wave' | 'gold' | 'tower_count';
  value: number;
  current: number;
  met: boolean;
  displayText: string;
}

export interface UpgradeRequirements {
  requirements: UpgradeRequirement[];
  allMet: boolean;
  blockingRequirement?: UpgradeRequirement;
}

export const checkFireUpgradeRequirements = (
  bulletLevel: number,
  targetLevel: number,
  gold: number,
  targetCost: number
): UpgradeRequirements => {
  const requirements: UpgradeRequirement[] = [];

  // Previous fire level requirement
  if (targetLevel > bulletLevel + 1) {
    requirements.push({
      type: 'fire_level',
      value: targetLevel - 1,
      current: bulletLevel,
      met: false,
      displayText: `Ateş Gücü Level ${targetLevel - 1} gerekli`
    });
  }

  // Gold requirement
  requirements.push({
    type: 'gold',
    value: targetCost,
    current: gold,
    met: gold >= targetCost,
    displayText: `${targetCost} altın gerekli`
  });

  const allMet = requirements.every(req => req.met);
  const blockingRequirement = requirements.find(req => !req.met);

  return {
    requirements,
    allMet,
    blockingRequirement
  };
};

export const checkShieldUpgradeRequirements = (
  wallLevel: number,
  targetLevel: number,
  gold: number,
  targetCost: number
): UpgradeRequirements => {
  const requirements: UpgradeRequirement[] = [];

  // Previous shield level requirement
  if (targetLevel > wallLevel + 1) {
    requirements.push({
      type: 'shield_level',
      value: targetLevel - 1,
      current: wallLevel,
      met: false,
      displayText: `Kalkan Level ${targetLevel - 1} gerekli`
    });
  }

  // Gold requirement
  requirements.push({
    type: 'gold',
    value: targetCost,
    current: gold,
    met: gold >= targetCost,
    displayText: `${targetCost} altın gerekli`
  });

  const allMet = requirements.every(req => req.met);
  const blockingRequirement = requirements.find(req => !req.met);

  return {
    requirements,
    allMet,
    blockingRequirement
  };
};

export const checkEliteUpgradeRequirements = (
  bulletLevel: number,
  wallLevel: number,
  currentWave: number,
  gold: number,
  targetCost: number
): UpgradeRequirements => {
  const requirements: UpgradeRequirement[] = [];

  // High-level fire power requirement for elite upgrades
  const requiredFireLevel = 5;
  if (bulletLevel < requiredFireLevel) {
    requirements.push({
      type: 'fire_level',
      value: requiredFireLevel,
      current: bulletLevel,
      met: false,
      displayText: `Ateş Gücü Level ${requiredFireLevel} gerekli`
    });
  }

  // Shield level requirement for elite upgrades
  const requiredShieldLevel = 3;
  if (wallLevel < requiredShieldLevel) {
    requirements.push({
      type: 'shield_level',
      value: requiredShieldLevel,
      current: wallLevel,
      met: false,
      displayText: `Kalkan Level ${requiredShieldLevel} gerekli`
    });
  }

  // Wave progression requirement
  const requiredWave = 10;
  if (currentWave < requiredWave) {
    requirements.push({
      type: 'wave',
      value: requiredWave,
      current: currentWave,
      met: false,
      displayText: `Dalga ${requiredWave} gerekli`
    });
  }

  // Gold requirement
  requirements.push({
    type: 'gold',
    value: targetCost,
    current: gold,
    met: gold >= targetCost,
    displayText: `${targetCost} altın gerekli`
  });

  const allMet = requirements.every(req => req.met);
  const blockingRequirement = requirements.find(req => !req.met);

  return {
    requirements,
    allMet,
    blockingRequirement
  };
};

export const getRequirementDisplayText = (requirements: UpgradeRequirements): string => {
  if (requirements.allMet) {
    return '✅ Tüm gereklilikler karşılandı';
  }

  if (requirements.blockingRequirement) {
    return `🔒 ${requirements.blockingRequirement.displayText}`;
  }

  return '🔒 Gereklilikler karşılanmadı';
};

export const getRequirementColor = (requirements: UpgradeRequirements): string => {
  if (requirements.allMet) {
    return '#4ade80'; // Green
  }
  return '#ef4444'; // Red
}; 