import { useGameStore } from '../models/store';
import { GAME_CONSTANTS } from '../utils/Constants';
import type { Enemy, Position } from '../models/gameTypes';

function getDirection(from: Position, to: Position) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: dx / len, y: dy / len };
}

function getNearestEnemy(pos: Position, enemies: Enemy[]) {
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

export function updateTowerFire() {
  const state = useGameStore.getState();
  const now = performance.now();
  state.towerSlots.forEach((slot) => {
    const tower = slot.tower;
    if (!tower) return;
    if (now - tower.lastFired < tower.fireRate) return;
    const { enemy, distance } = getNearestEnemy(tower.position, state.enemies);
    if (!enemy || distance > tower.range) return;

    const upgrade = GAME_CONSTANTS.TOWER_UPGRADES[tower.level - 1];
    for (let i = 0; i < upgrade.multi; i++) {
      const angle = Math.atan2(
        enemy.position.y - tower.position.y,
        enemy.position.x - tower.position.x,
      );
      const offset = ((i - (upgrade.multi - 1) / 2) * upgrade.spread * Math.PI) / 180;
      const dir = {
        x: Math.cos(angle + offset),
        y: Math.sin(angle + offset),
      };
      const bullet = {
        id: `${Date.now()}-${Math.random()}`,
        position: { x: tower.position.x, y: tower.position.y },
        size: GAME_CONSTANTS.BULLET_SIZE,
        isActive: true,
        speed: GAME_CONSTANTS.BULLET_SPEED,
        damage: tower.damage,
        direction: dir,
        color: GAME_CONSTANTS.BULLET_COLOR,
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
  } = useGameStore.getState();
  bullets.forEach((b) => {
    b.position.x += b.direction.x * b.speed * 0.016;
    b.position.y += b.direction.y * b.speed * 0.016;

    if (
      b.position.x < 0 ||
      b.position.x > window.innerWidth ||
      b.position.y < 0 ||
      b.position.y > window.innerHeight
    ) {
      removeBullet(b.id);
      return;
    }

    for (const e of enemies) {
      const dx = e.position.x - b.position.x;
      const dy = e.position.y - b.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < (e.size + b.size) / 2) {
        damageEnemy(e.id, b.damage);
        removeBullet(b.id);
        break;
      }
    }
  });
}
