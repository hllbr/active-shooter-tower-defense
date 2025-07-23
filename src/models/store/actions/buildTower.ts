import type { Store } from '../index';
import type { Tower, TowerClass, SpecializedTowerConfig } from '../../gameTypes';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { upgradeEffectsManager } from '../../../game-systems/UpgradeEffects';

export function buildTowerAction(
  state: Store,
  slotIdx: number,
  free = false,
  towerType: 'attack' | 'economy' = 'attack',
  towerClass?: TowerClass
): Partial<Store> {
  const slot = state.towerSlots[slotIdx];
  if (!slot || slot.tower) return {};

  const cost = free ? 0 : GAME_CONSTANTS.TOWER_COST;
  if (!free && state.gold < cost) return {};

  const upgrade = GAME_CONSTANTS.TOWER_UPGRADES[0];

  let specializedTowerData: SpecializedTowerConfig | null = null;
  if (towerClass && GAME_CONSTANTS.SPECIALIZED_TOWERS[towerClass]) {
    specializedTowerData = GAME_CONSTANTS.SPECIALIZED_TOWERS[towerClass];
    if (!free && state.gold < specializedTowerData.cost) return {};
  }

  const finalCost = free ? 0 : (specializedTowerData?.cost || cost);

  const newTower: Tower = {
    id: `${Date.now()}-${Math.random()}`,
    position: { x: slot.x, y: slot.y },
    size: GAME_CONSTANTS.TOWER_SIZE,
    isActive: true,
    level: 1,
    range: towerType === 'economy' ? 0 : (specializedTowerData?.baseRange || GAME_CONSTANTS.TOWER_RANGE),
    damage: towerType === 'economy' ? 0 : (specializedTowerData?.baseDamage || upgrade.damage),
    fireRate: towerType === 'economy' ? 0 : (specializedTowerData?.baseFireRate || upgrade.fireRate),
    lastFired: 0,
    health: upgrade.health,
    maxHealth: upgrade.health,
    wallStrength: upgradeEffectsManager.applyShieldUpgrades(state.globalWallStrength),
    specialAbility: upgrade.special,
    healthRegenRate: 0,
    lastHealthRegen: 0,
    specialCooldown: 5000,
    lastSpecialUse: 0,
    multiShotCount: 3,
    chainLightningJumps: 5,
    freezeDuration: 2000,
    burnDuration: 3000,
    acidStack: 0,
    quantumState: false,
    nanoSwarmCount: 5,
    psiRange: 150,
    timeWarpSlow: 0.3,
    spaceGravity: 0.5,
    legendaryAura: false,
    divineProtection: false,
    cosmicEnergy: 100,
    infinityLoop: false,
    godModeActive: false,
    attackSound: towerType === 'economy' ? undefined : GAME_CONSTANTS.TOWER_ATTACK_SOUNDS[0],
    visual: GAME_CONSTANTS.TOWER_VISUALS.find(v => v.level === 1),
    rangeMultiplier: slot.modifier?.type === 'buff' ? GAME_CONSTANTS.BUFF_RANGE_MULTIPLIER : 1,
    towerType,
    towerCategory: specializedTowerData?.category,
    towerClass,
    criticalChance: specializedTowerData?.criticalChance ?? 0,
    criticalDamage: specializedTowerData?.criticalDamage ?? 1,
    armorPenetration: specializedTowerData?.armorPenetration ?? 0,
    areaOfEffect: specializedTowerData?.areaOfEffect ?? 0,
    projectilePenetration: specializedTowerData?.projectilePenetration ?? 0,
    spinUpLevel: specializedTowerData?.spinUpLevel ?? 0,
    maxSpinUpLevel: specializedTowerData?.maxSpinUpLevel ?? 0,
    beamFocusMultiplier: specializedTowerData?.beamFocusMultiplier ?? 1,
    beamLockTime: specializedTowerData?.beamLockTime ?? 0,
    supportRadius: specializedTowerData?.supportRadius ?? 0,
    supportIntensity: specializedTowerData?.supportIntensity ?? 1,
    shieldStrength: specializedTowerData?.shieldStrength ?? 0,
    shieldRegenRate: specializedTowerData?.shieldRegenRate ?? 0,
    repairRate: specializedTowerData?.repairRate ?? 0,
    empDuration: specializedTowerData?.empDuration ?? 0,
    stealthDetectionRange: specializedTowerData?.stealthDetectionRange ?? 0,
    manualTargeting: false,
    upgradePath: '',
    synergyBonuses: { damage: 0, range: 0, fireRate: 0 },
    // Area effect properties for support towers
    areaEffectType: specializedTowerData?.areaEffectType ?? null,
    areaEffectRadius: specializedTowerData?.areaEffectRadius ?? 0,
    areaEffectPower: specializedTowerData?.areaEffectPower ?? 0,
    areaEffectDuration: specializedTowerData?.areaEffectDuration ?? 0,
    areaEffectActive: specializedTowerData?.areaEffectActive ?? false,
    areaEffectLastTick: undefined,
    areaEffectDecayTimer: specializedTowerData?.areaEffectDecayTimer ?? 0,
  };

  const newSlots = [...state.towerSlots];
  newSlots[slotIdx] = { ...slot, tower: newTower, wasDestroyed: false };
  state.towerUpgradeListeners.forEach(fn => fn(newTower, 0, 1));

  setTimeout(() => {
    import('../../../utils/sound').then(({ playContextualSound }) => {
      playContextualSound('tower-build');
    });
  }, 50);

  // If this is the first tower placed, set isFirstTowerPlaced to true
  const isFirstTowerPlaced = state.isFirstTowerPlaced || false;
  const willBeFirstTower = !isFirstTowerPlaced && state.towers.length === 0;

  return {
    towerSlots: newSlots,
    towers: [...state.towers, newTower],
    gold: state.gold - finalCost,
    totalGoldSpent: state.totalGoldSpent + finalCost,
    ...(willBeFirstTower ? { isFirstTowerPlaced: true } : {}),
  };
}
