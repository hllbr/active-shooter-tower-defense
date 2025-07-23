// TowerTypeConfig.ts
export type TargetingPriority = 'lowest_hp' | 'highest_hp' | 'closest_to_exit' | 'nearest' | 'fastest' | 'highest_value' | 'threat_assessment';

export interface TowerTypeTargetingConfig {
  targetingPriority: TargetingPriority[];
}

export const TowerTypeConfig: Record<string, TowerTypeTargetingConfig> = {
  sniper: { targetingPriority: ['highest_hp', 'closest_to_exit'] },
  gatling: { targetingPriority: ['fastest', 'nearest'] },
  mortar: { targetingPriority: ['lowest_hp', 'closest_to_exit'] },
  laser: { targetingPriority: ['threat_assessment', 'highest_hp'] },
  flamethrower: { targetingPriority: ['nearest', 'lowest_hp'] },
  emp: { targetingPriority: ['threat_assessment', 'fastest'] },
  air_defense: { targetingPriority: ['closest_to_exit', 'highest_value'] },
  radar: { targetingPriority: ['nearest'] },
  supply_depot: { targetingPriority: ['nearest'] },
  shield_generator: { targetingPriority: ['nearest'] },
  repair_station: { targetingPriority: ['nearest'] },
  stealth_detector: { targetingPriority: ['fastest', 'highest_value'] },
  economy: { targetingPriority: ['highest_value'] },
}; 