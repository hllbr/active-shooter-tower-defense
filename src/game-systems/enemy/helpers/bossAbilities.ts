import type { Enemy, TowerSlot } from '../../../models/gameTypes';
import type { BossDefinition } from '../BossDefinitions';
import { useGameStore } from '../../../models/store';
import { playSound } from '../../../utils/sound';

export function executeChargeAttack(boss: Enemy, _definition: BossDefinition) {
  const { addEffect, towerSlots } = useGameStore.getState();
  const nearestTower = towerSlots
    .filter(slot => slot.tower)
    .reduce((nearest, slot) => {
      const distance = Math.hypot(slot.x - boss.position.x, slot.y - boss.position.y);
      return !nearest || distance < nearest.distance ? { slot, distance } : nearest;
    }, null as { slot: TowerSlot; distance: number } | null);
  if (nearestTower) {
    addEffect({
      id: `charge_effect_${boss.id}`,
      position: boss.position,
      radius: boss.size * 2,
      color: '#ff4444',
      life: 1000,
      maxLife: 1000,
      type: 'charge_attack',
    });
    const originalSpeed = boss.speed;
    boss.speed = boss.speed * 3;
    setTimeout(() => {
      boss.speed = originalSpeed;
    }, 1000);
    playSound('boss-charge');
  }
}

export function executeGroundSlam(boss: Enemy, _definition: BossDefinition) {
  const { addEffect, towerSlots, damageTower } = useGameStore.getState();
  addEffect({
    id: `ground_slam_${boss.id}`,
    position: boss.position,
    radius: 150,
    color: '#8b4513',
    life: 2000,
    maxLife: 2000,
    type: 'ground_slam',
    opacity: 0.7,
  });
  towerSlots.forEach((slot, index) => {
    if (slot.tower) {
      const distance = Math.hypot(slot.x - boss.position.x, slot.y - boss.position.y);
      if (distance <= 150) {
        damageTower(index, boss.damage * 2);
      }
    }
  });
  playSound('boss-ground-slam');
}

export function executeMissileBarrage(_boss: Enemy, _definition: BossDefinition) {
  playSound('boss-missile');
}

export function executeBombingRun(_boss: Enemy, _definition: BossDefinition) {
  playSound('boss-bombing');
}

export function executeShieldRegeneration(boss: Enemy, _definition: BossDefinition) {
  if (boss.shieldStrength !== undefined) {
    boss.shieldStrength = Math.min(boss.maxHealth * 0.3, boss.shieldStrength + 200);
  }
}

export function executeSpawnMinions(_boss: Enemy, _definition: BossDefinition, _minionTypes: string[]) {
  playSound('boss-spawn-minions');
}

export function executeQuantumTunneling(boss: Enemy, _definition: BossDefinition) {
  boss.position.x = Math.random() * window.innerWidth;
  boss.position.y = Math.random() * window.innerHeight;
}

export function executeRealityTear(_boss: Enemy, _definition: BossDefinition) {
  playSound('boss-reality-tear');
}

export function activateRageMode(boss: Enemy, _definition: BossDefinition) {
  boss.rageMode = true;
  boss.speed = Math.floor(boss.speed * 1.5);
  boss.damage = Math.floor(boss.damage * 2.0);
}

export function initiateFlee(boss: Enemy, _definition: BossDefinition) {
  boss.isFleeing = true;
  boss.speed = Math.floor(boss.speed * 2.0);
  boss.behaviorTag = 'fleeing';
}

export function handleMinionSpawning(boss: Enemy, _definition: BossDefinition) {
  const now = performance.now();
  if (now - (boss.lastMinionSpawn || 0) > 10000) {
    boss.lastMinionSpawn = now;
    // Spawn minions logic placeholder
  }
}
