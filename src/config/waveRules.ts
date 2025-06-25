import type { WaveModifier } from '../models/gameTypes';

// ✅ BALANCED WAVE MODIFIERS - No impossible combinations, all have counter-play
export const waveRules: Record<number, WaveModifier> = {
  // Early game gentle challenges
  5: { speedMultiplier: 1.3 },  // Reduced from 1.5 (too harsh early game)
  
  // Mid game interesting challenges  
  8: { disableTowerType: 'sniper' }, // OK - players can adapt strategy
  10: { bonusEnemies: true },        // Removed towerRangeReduced - double penalty was unfair
  
  // Late game strategic challenges (all have counter-play)
  15: { speedMultiplier: 1.4 },      // Speed challenge with upgrade options
  20: { bonusEnemies: true },        // More enemies but players have strong towers
  25: { towerRangeReduced: true },   // Range challenge but players can upgrade
  30: { speedMultiplier: 1.5 },     // High speed but manageable with good strategy
  
  // End game epic challenges (single modifier focus)
  40: { bonusEnemies: true },        // Pure quantity challenge
  50: { speedMultiplier: 1.6 },     // Pure speed challenge
  
  // Boss waves (future: special boss modifiers)
  // 60: { specialEvent: 'boss' },   // Future: Boss encounter
  // 70: { specialEvent: 'boss' },   // Future: Boss encounter  
  // 80: { specialEvent: 'boss' },   // Future: Boss encounter
  // 90: { specialEvent: 'boss' },   // Future: Boss encounter
  // 100: { specialEvent: 'final' }, // Future: Final boss
} as const;

// ✅ COUNTER-PLAY GUIDELINES: Every modifier has strategic responses
// speedMultiplier → Upgrade fire rate, use slowing effects
// bonusEnemies → Focus on damage upgrades, area effects  
// towerRangeReduced → Build more towers, strategic positioning
// disableTowerType → Adapt tower strategy, use other types
// bossWave → Save resources, focus single-target damage
