import { useGameStore } from '../models/store';
import { GAME_CONSTANTS } from '../utils/Constants';
import type { Effect, Tower, Bullet, BulletEffect, BulletSpecial } from '../models/gameTypes';
import type { Enemy, Position } from '../models/gameTypes';

// Get a random wall color that hasn't been used yet
function getRandomWallColor(existingColors: string[]): string {
  const availableColors = GAME_CONSTANTS.TOWER_WALL_COLORS.filter(
    color => !existingColors.includes(color)
  );
  if (availableColors.length === 0) {
    // If all colors are used, start over
    return GAME_CONSTANTS.TOWER_WALL_COLORS[
      Math.floor(Math.random() * GAME_CONSTANTS.TOWER_WALL_COLORS.length)
    ];
  }
  return availableColors[Math.floor(Math.random() * availableColors.length)];
}

function getNearestEnemy(pos: Position, enemies: Enemy[]): { enemy: Enemy | null; distance: number } {
  let min = Infinity;
  let nearest: Enemy | null = null;
  enemies.forEach((e) => {
    const dx = e.position.x - pos.x;
    const dy = e.position.y - pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < min) {
      min = dist;
      nearest = e;
    }
  });
  return { enemy: nearest, distance: min };
}

// Apply tower upgrade stats
function applyTowerUpgrade(tower: Tower, level: number) {
  const upgrade = GAME_CONSTANTS.TOWER_UPGRADES[level - 1];
  tower.damage = upgrade.damage;
  tower.fireRate = upgrade.fireRate;
  tower.health += upgrade.healthBonus;
  return tower;
}

// Create a new tower with initial stats
export function createTower(position: Position): Tower {
  const state = useGameStore.getState();
  const existingWallColors = state.towerSlots
    .filter(slot => slot.tower)
    .map(slot => slot.tower?.wallColor || '');

  const tower: Tower = {
    id: `${Date.now()}-${Math.random()}`,
    position,
    size: GAME_CONSTANTS.TOWER_SIZE,
    isActive: true,
    level: 1,
    range: GAME_CONSTANTS.TOWER_RANGE,
    damage: GAME_CONSTANTS.TOWER_UPGRADES[0].damage,
    fireRate: GAME_CONSTANTS.TOWER_UPGRADES[0].fireRate,
    lastFired: 0,
    health: GAME_CONSTANTS.TOWER_HEALTH,
    wallStrength: 0,
    wallColor: getRandomWallColor(existingWallColors),
    powerMultiplier: 1, // Initialize power multiplier
  };

  return applyTowerUpgrade(tower, 1);
}

// Add update method to Bullet prototype
function createBulletUpdate() {
  return function update(this: Bullet) {
    if (!this.isActive) return;
    
    // Update position based on direction and speed
    this.position.x += this.direction.x * this.speed;
    this.position.y += this.direction.y * this.speed;

    // Check if bullet is out of bounds
    if (this.position.x < 0 || this.position.x > GAME_CONSTANTS.CANVAS_WIDTH ||
        this.position.y < 0 || this.position.y > GAME_CONSTANTS.CANVAS_HEIGHT) {
      this.isActive = false;
    }
  };
}

// Attach update method to Bullet prototype
Object.defineProperty(Bullet.prototype, 'update', {
  value: createBulletUpdate(),
  writable: false,
  configurable: true
});

export function updateTowerFire() {
  const state = useGameStore.getState();
  const now = performance.now();
  state.towerSlots.forEach((slot) => {
    const tower = slot.tower;
    if (!tower) return;
    
    const bulletType = GAME_CONSTANTS.BULLET_TYPES.find(t => t.id === tower.bulletTypeId);
    if (!bulletType) return;

    const bulletLevel = bulletType.levels[tower.bulletLevel - 1];
    if (!bulletLevel) return;

    if (now - tower.lastFired < tower.fireRate * bulletLevel.fireRateMultiplier) return;
    const { enemy, distance } = getNearestEnemy(tower.position, state.enemies);
    if (!enemy || distance > tower.range) return;

    for (let i = 0; i < (bulletLevel.count || 1); i++) {
      const angle = Math.atan2(
        enemy.position.y - tower.position.y,
        enemy.position.x - tower.position.x,
      );
      const spread = (bulletLevel.count > 1) ? ((i - (bulletLevel.count - 1) / 2) * 10 * Math.PI) / 180 : 0;
      const dir = {
        x: Math.cos(angle + spread),
        y: Math.sin(angle + spread),
      };

      const bullet: Bullet = {
        id: `${Date.now()}-${Math.random()}`,
        position: { x: tower.position.x, y: tower.position.y },
        size: GAME_CONSTANTS.BULLET_SIZE,
        isActive: true,
        speed: GAME_CONSTANTS.BULLET_SPEED * bulletLevel.speedMultiplier,
        damage: tower.damage * bulletLevel.damageMultiplier * tower.powerMultiplier,
        direction: dir,
        color: Array.isArray(bulletLevel.color) ? bulletLevel.color[Math.floor(Math.random() * bulletLevel.color.length)] : bulletLevel.color,
        typeIndex: tower.bulletLevel - 1,
        effect: bulletLevel.effect,
        special: bulletLevel.special,
        createdAt: now,
      };
      useGameStore.getState().addBullet(bullet);
    }
    tower.lastFired = now;
  });
}

export function updateBullets() {
  const {
    bullets,
    removeBullet,
    enemies,
    damageEnemy,
    addEffect,
  } = useGameStore.getState();
  bullets.forEach((b) => {
    b.update();

    for (const e of enemies) {
      const dx = e.position.x - b.position.x;
      const dy = e.position.y - b.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < (e.size + b.size) / 2) {
        damageEnemy(e.id, b.damage);
        if (b.effect === 'freeze') {
          e.frozenUntil = performance.now() + 2000; // 2 seconds freeze
        }
        const effect: Effect = {
          id: `${Date.now()}-${Math.random()}`,
          position: { x: b.position.x, y: b.position.y },
          radius: 20,
          color: '#ff6600',
          life: 300,
          maxLife: 300,
        };
        addEffect(effect);
        removeBullet(b.id);
        break;
      }
    }
  });
}
