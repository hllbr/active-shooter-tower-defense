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

  // 🔒 STRICT REQUIREMENT: Previous fire level requirement (must have previous level)
  if (targetLevel > bulletLevel + 1) {
    requirements.push({
      type: 'fire_level',
      value: targetLevel - 1,
      current: bulletLevel,
      met: false,
      displayText: `🔒 Ateş Gücü Level ${targetLevel - 1} gerekli`
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

  // 🔒 STRICT REQUIREMENT: Previous shield level requirement (must have previous level)
  if (targetLevel > wallLevel + 1) {
    requirements.push({
      type: 'shield_level',
      value: targetLevel - 1,
      current: wallLevel,
      met: false,
      displayText: `🔒 Kalkan Level ${targetLevel - 1} gerekli`
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

export interface MissionRequirement {
  type: 'enemy_kills' | 'wave_complete' | 'tower_build' | 'gold_earned';
  target: number;
  current: number;
  description: string;
}

export interface MissionBasedUpgrade {
  upgradeId: string;
  upgradeName: string;
  requirements: MissionRequirement[];
  reward: {
    type: 'fire_level' | 'shield_level' | 'special_ability';
    value: number;
  };
  isCompleted: boolean;
}

export const checkMissionBasedUpgradeRequirements = (
  currentStats: {
    enemiesKilled: number;
    wavesCompleted: number;
    towersBuilt: number;
    goldEarned: number;
  },
  mission: MissionBasedUpgrade
): { canClaim: boolean; progress: MissionRequirement[] } => {
  const progress: MissionRequirement[] = mission.requirements.map(req => {
    let current = 0;
    switch (req.type) {
      case 'enemy_kills':
        current = currentStats.enemiesKilled;
        break;
      case 'wave_complete':
        current = currentStats.wavesCompleted;
        break;
      case 'tower_build':
        current = currentStats.towersBuilt;
        break;
      case 'gold_earned':
        current = currentStats.goldEarned;
        break;
    }
    
    return {
      ...req,
      current: Math.min(current, req.target)
    };
  });

  const canClaim = progress.every(req => req.current >= req.target);
  
  return { canClaim, progress };
};

export const getMissionDisplayText = (mission: MissionBasedUpgrade, progress: MissionRequirement[]): string => {
  if (mission.isCompleted) {
    return '✅ Görev tamamlandı - Ödül kazanıldı';
  }

  const completedCount = progress.filter(req => req.current >= req.target).length;
  const totalCount = progress.length;

  if (completedCount === 0) {
    return `📋 Görev: ${progress[0]?.description || 'Bilinmeyen görev'}`;
  }

  if (completedCount === totalCount) {
    return '🎁 Görev tamamlandı - Ödülü alabilirsiniz!';
  }

  return `📋 Görev ilerlemesi: ${completedCount}/${totalCount}`;
};

export const getMissionProgressColor = (mission: MissionBasedUpgrade, progress: MissionRequirement[]): string => {
  if (mission.isCompleted) {
    return '#10b981'; // Green
  }

  const completedCount = progress.filter(req => req.current >= req.target).length;
  const totalCount = progress.length;

  if (completedCount === totalCount) {
    return '#f59e0b'; // Amber - ready to claim
  }

  if (completedCount > 0) {
    return '#3b82f6'; // Blue - in progress
  }

  return '#6b7280'; // Gray - not started
}; 