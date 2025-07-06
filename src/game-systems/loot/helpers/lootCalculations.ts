import type { LootItem } from '../../LootManager';

export function determineRarity(weights: Record<string, number>): 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' {
  const random = Math.random() * 100;
  let cumulative = 0;
  for (const [rarity, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (random <= cumulative) {
      return rarity as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    }
  }
  return 'common';
}

export function determineLootType(rarity: string): LootItem['type'] {
  const typesByRarity: Record<string, LootItem['type'][]> = {
    common: ['gold', 'experience'],
    uncommon: ['research_points', 'upgrade_materials'],
    rare: ['rare_components', 'upgrade_materials'],
    epic: ['rare_components', 'legendary_items'],
    legendary: ['legendary_items', 'cosmetics']
  };
  const availableTypes = typesByRarity[rarity] || ['gold'];
  return availableTypes[Math.floor(Math.random() * availableTypes.length)];
}

export function calculateLootAmount(type: LootItem['type'], rarity: string): number {
  const baseAmounts: Record<LootItem['type'], number> = {
    gold: 50,
    research_points: 10,
    upgrade_materials: 1,
    rare_components: 1,
    legendary_items: 1,
    achievements: 1,
    cosmetics: 1,
    experience: 25
  };
  const rarityMultipliers: Record<string, number> = {
    common: 1,
    uncommon: 2,
    rare: 4,
    epic: 8,
    legendary: 15
  };
  const baseAmount = baseAmounts[type] || 1;
  const multiplier = rarityMultipliers[rarity] || 1;
  return Math.floor(baseAmount * multiplier);
}

export function getLootName(type: LootItem['type'], rarity: string): string {
  const names: Record<LootItem['type'], Record<string, string>> = {
    gold: {
      common: 'Gold Coins',
      uncommon: 'Gold Purse',
      rare: 'Gold Chest',
      epic: 'Gold Treasury',
      legendary: 'Gold Vault'
    },
    research_points: {
      common: 'Research Notes',
      uncommon: 'Research Data',
      rare: 'Advanced Research',
      epic: 'Breakthrough Research',
      legendary: 'Revolutionary Discovery'
    },
    upgrade_materials: {
      common: 'Basic Materials',
      uncommon: 'Quality Materials',
      rare: 'Advanced Materials',
      epic: 'Master Materials',
      legendary: 'Legendary Materials'
    },
    rare_components: {
      common: 'Component',
      uncommon: 'Quality Component',
      rare: 'Rare Component',
      epic: 'Epic Component',
      legendary: 'Legendary Component'
    },
    legendary_items: {
      common: 'Item',
      uncommon: 'Quality Item',
      rare: 'Rare Item',
      epic: 'Epic Item',
      legendary: 'Legendary Artifact'
    },
    achievements: {
      common: 'Achievement',
      uncommon: 'Achievement',
      rare: 'Achievement',
      epic: 'Achievement',
      legendary: 'Legendary Achievement'
    },
    cosmetics: {
      common: 'Cosmetic',
      uncommon: 'Quality Cosmetic',
      rare: 'Rare Cosmetic',
      epic: 'Epic Cosmetic',
      legendary: 'Legendary Cosmetic'
    },
    experience: {
      common: 'Experience',
      uncommon: 'Bonus Experience',
      rare: 'Major Experience',
      epic: 'Massive Experience',
      legendary: 'Ultimate Experience'
    }
  };
  return names[type]?.[rarity] || 'Unknown Item';
}

export const getLootDescription = (type: LootItem['type'], rarity: string): string =>
  `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} ${type.replace('_', ' ')}`;

export function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    common: '#ffffff',
    uncommon: '#00ff00',
    rare: '#0080ff',
    epic: '#9933ff',
    legendary: '#ff8000'
  };
  return colors[rarity] || '#ffffff';
}

export function getRarityScale(rarity: string): number {
  const scales: Record<string, number> = {
    common: 1.0,
    uncommon: 1.2,
    rare: 1.4,
    epic: 1.6,
    legendary: 2.0
  };
  return scales[rarity] || 1.0;
}

export function getPickupRadius(rarity: string): number {
  const radii: Record<string, number> = {
    common: 40,
    uncommon: 50,
    rare: 60,
    epic: 70,
    legendary: 80
  };
  return radii[rarity] || 40;
}

export function calculateLootValue(type: LootItem['type'], amount: number): number {
  const typeValues: Record<LootItem['type'], number> = {
    gold: 1,
    research_points: 5,
    upgrade_materials: 20,
    rare_components: 50,
    legendary_items: 200,
    achievements: 0,
    cosmetics: 0,
    experience: 2
  };
  return (typeValues[type] || 0) * amount;
}

export function getLootVisualEffect(rarity: string): string {
  const effects: Record<string, string> = {
    common: 'simple_glow',
    uncommon: 'green_sparkle',
    rare: 'blue_aura',
    epic: 'purple_energy',
    legendary: 'golden_explosion'
  };
  return effects[rarity] || 'simple_glow';
}
