export const GAME_CONSTANTS = {
  // Canvas
  CANVAS_BG: '#f0f0f0',
  CANVAS_WIDTH: 1920,
  CANVAS_HEIGHT: 1080,

  // Player (not used for movement, only for reference)
  PLAYER_SIZE: 30,

  // Tower
  TOWER_SIZE: 48,
  TOWER_RANGE: 220,
  TOWER_DAMAGE: 20,
  TOWER_FIRE_RATE: 800, // ms
  TOWER_HEALTH: 100,
  TOWER_COST: 100,
  TOWER_UPGRADE_COST: 120,
  TOWER_MAX_LEVEL: 3,
  TOWER_COLORS: ['#0077ff', '#00cfff', '#00ff99'],
  TOWER_HEALTHBAR_HEIGHT: 8,

  // Tower Upgrades
  TOWER_UPGRADES: [
    { damage: 20, fireRate: 800, spread: 0, multi: 1 }, // Level 1
    { damage: 30, fireRate: 600, spread: 10, multi: 2 }, // Level 2
    { damage: 40, fireRate: 400, spread: 25, multi: 3 }, // Level 3
  ],

  // Tower Slots
  TOWER_SLOTS: [
    { x: 400, y: 300 },
    { x: 800, y: 400 },
    { x: 1200, y: 300 },
    { x: 600, y: 700 },
    { x: 1000, y: 700 },
  ],
  TOWER_SLOT_UNLOCK_GOLD: [0, 200, 400, 700, 1200],

  // Enemy
  ENEMY_SIZE: 36,
  ENEMY_HEALTH: 60,
  ENEMY_SPEED: 80,
  ENEMY_GOLD_DROP: 30,
  ENEMY_SPAWN_RATE: 1200,
  ENEMY_WAVE_INCREASE: 2,
  ENEMY_HEALTH_INCREASE: 25,
  ENEMY_COLORS: ['#ff3333', '#ff8800', '#ffcc00'],

  // Bullet
  BULLET_SIZE: 10,
  BULLET_SPEED: 420,
  BULLET_COLOR: '#ffe600',

  // UI
  GOLD_COLOR: '#FFD700',
  HEALTHBAR_BG: '#333',
  HEALTHBAR_GOOD: '#00ff00',
  HEALTHBAR_BAD: '#ff3333',
  UI_FONT: 'bold 28px Arial',
  UI_FONT_BIG: 'bold 48px Arial',
  UI_SHADOW: '1px 1px 2px #333',

  // Game
  GAME_TICK: 16,
  WAVE_DURATION: 30000,
  WAVE_ENEMY_INCREASE: 2,
  WAVE_ENEMY_HEALTH_INCREASE: 20,
} as const; 