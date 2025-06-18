export const GAME_CONSTANTS = {
  // Canvas
  CANVAS_BG: '#222831',
  CANVAS_WIDTH: 1920,
  CANVAS_HEIGHT: 1080,

  // Player (not used for movement, only for reference)
  PLAYER_SIZE: 30,

  // Tower
  TOWER_SIZE: 48,
  TOWER_RANGE: Infinity,
  TOWER_DAMAGE: 20,
  TOWER_FIRE_RATE: 800, // ms
  TOWER_HEALTH: 100,
  TOWER_COST: 100,
  TOWER_UPGRADE_COST: 120,
  TOWER_MAX_LEVEL: 3,
  TOWER_COLORS: ['#00aaff', '#aa00ff', '#ffaa00'],
  TOWER_HEALTHBAR_HEIGHT: 8,
  UPGRADE_ARROW_SIZE: 14,
  UPGRADE_ARROW_COLOR: '#4ade80',

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
    { x: 400, y: 500 },
    { x: 1200, y: 500 },
    { x: 200, y: 200 },
    { x: 1400, y: 200 },
    { x: 200, y: 600 },
    { x: 1400, y: 600 },
    { x: 800, y: 550 },
  ],
  TOWER_SLOT_UNLOCK_GOLD: [
    0,
    200,
    400,
    700,
    1200,
    1500,
    1800,
    2100,
    2400,
    2700,
    3000,
    3300,
  ],
  INITIAL_SLOT_COUNT: 2,

  // Enemy
  ENEMY_SIZE: 36,
  ENEMY_HEALTH: 60,
  ENEMY_SPEED: 80,
  ENEMY_GOLD_DROP: 50,
  ENEMY_SPAWN_RATE: 1200,
  ENEMY_WAVE_INCREASE: 2,
  ENEMY_HEALTH_INCREASE: 25,
  ENEMY_COLORS: ['#ff3333', '#ff8800', '#ffcc00'],
  ENEMY_HEALTHBAR_HEIGHT: 6,

  // Bullet
  BULLET_SIZE: 10,
  BULLET_SPEED: 420,
  BULLET_TYPES: [
    {
      name: 'Buz Kraliçesinin Bakışı',
      color: '#00ccff',
      damageMultiplier: 1,
      fireRateMultiplier: 1,
      speedMultiplier: 1,
      freezeDuration: 1000,
    },
    {
      name: 'Ejderha Nefesi',
      color: '#ff4400',
      damageMultiplier: 1.1,
      fireRateMultiplier: 0.95,
      speedMultiplier: 1.1,
    },
    {
      name: 'Mamut Öfkesi',
      color: '#ffcc00',
      damageMultiplier: 1.3,
      fireRateMultiplier: 0.85,
      speedMultiplier: 1.2,
    },
    {
      name: 'Alevor',
      color: '#ff5500',
      damageMultiplier: 1.5,
      fireRateMultiplier: 0.8,
      speedMultiplier: 1.3,
    },
    {
      name: 'Yakhar',
      color: '#cc3300',
      damageMultiplier: 1.7,
      fireRateMultiplier: 0.75,
      speedMultiplier: 1.4,
    },
    {
      name: 'Ignorak',
      color: '#ff0066',
      damageMultiplier: 2,
      fireRateMultiplier: 0.7,
      speedMultiplier: 1.5,
    },
    {
      name: 'Volkanor',
      color: '#ff6600',
      damageMultiplier: 2.3,
      fireRateMultiplier: 0.65,
      speedMultiplier: 1.6,
    },
    {
      name: 'Pyrax',
      color: '#ff3300',
      damageMultiplier: 2.6,
      fireRateMultiplier: 0.6,
      speedMultiplier: 1.7,
    },
  ],
  BULLET_UPGRADE_COST: 300,
  WALL_COST: 150,

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