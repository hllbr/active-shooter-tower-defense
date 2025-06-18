export const GAME_CONSTANTS = {
  // Canvas
  CANVAS_BG: '#222831',
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,

  // Player (not used for movement, only for reference)
  PLAYER_SIZE: 30,

  // Tower
  TOWER_SIZE: 48,
  TOWER_RANGE: Infinity,
  TOWER_DAMAGE: 20,
  TOWER_FIRE_RATE: 800, // ms
  TOWER_HEALTH: 100,
  TOWER_COST: 50,
  TOWER_UPGRADE_COST: 60,
  POWER_UPGRADE_COST: 40, // Cost for power upgrades
  TOWER_MAX_LEVEL: 5,
  TOWER_COLORS: [
    '#00aaff',   // Level 1
    '#aa00ff',   // Level 2
    '#ffaa00',   // Level 3
    '#ff5500',   // Level 4
    '#ff0066'    // Level 5
  ],
  TOWER_WALL_COLORS: [
    '#4a90e2',   // Blue
    '#50e3c2',   // Turquoise
    '#b8e986',   // Light Green
    '#f5a623',   // Orange
    '#d0021b',   // Red
    '#9013fe',   // Purple
    '#417505',   // Dark Green
    '#7ed321',   // Bright Green
    '#bd10e0',   // Pink
    '#8b572a',   // Brown
  ],
  WALL_STRENGTH_COLORS: {
    WEAK: '#cccccc',     // 1-3 strength
    MEDIUM: '#ffd700',   // 4-7 strength
    STRONG: '#00ff00',   // 8-12 strength
    EPIC: '#ff00ff',     // 13+ strength
  },
  TOWER_HEALTHBAR_HEIGHT: 14,
  TOWER_HEALTHBAR_WIDTH: 64,
  TOWER_HEALTHBAR_COLORS: {
    HIGH: '#22c55e', // Bright green for high health
    MEDIUM: '#fbbf24', // Yellow for medium health
    LOW: '#ef4444', // Red for low health
    BACKGROUND: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
    DAMAGE_FLASH: '#ffffff', // White flash when taking damage
  },
  UPGRADE_ARROW_SIZE: 14,
  UPGRADE_ARROW_COLOR: '#4ade80',

  // Tower Upgrades
  TOWER_UPGRADES: [
    { damage: 20, fireRate: 800, spread: 0, multi: 1, healthBonus: 0 }, // Level 1
    { damage: 35, fireRate: 700, spread: 10, multi: 2, healthBonus: 50 }, // Level 2
    { damage: 55, fireRate: 600, spread: 15, multi: 2, healthBonus: 100 }, // Level 3
    { damage: 80, fireRate: 500, spread: 20, multi: 3, healthBonus: 200 }, // Level 4
    { damage: 120, fireRate: 400, spread: 25, multi: 3, healthBonus: 300 }, // Level 5
  ],

  // Tower Slots
  TOWER_SLOTS: [
    { x: 100, y: 100 },
    { x: 200, y: 100 },
    { x: 300, y: 100 },
    { x: 400, y: 100 },
    { x: 500, y: 100 },
    { x: 100, y: 300 },
    { x: 200, y: 300 },
    { x: 300, y: 300 },
    { x: 400, y: 300 },
    { x: 500, y: 300 },
    { x: 100, y: 500 },
    { x: 200, y: 500 },
    { x: 300, y: 500 },
    { x: 400, y: 500 },
    { x: 500, y: 500 }
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
  INITIAL_SLOT_COUNT: 3,
  INITIAL_TOWER_LIMIT: 2,

  // Enemy
  ENEMY_SIZE: 36,
  ENEMY_HEALTH: 100,
  ENEMY_SPEED: 1,
  ENEMY_GOLD_DROP: 10,
  ENEMY_SPAWN_RATE: 1000, // 1 second between spawns
  ENEMY_WAVE_INCREASE: 2,
  ENEMY_HEALTH_INCREASE: 50,
  ENEMY_TYPES: [
    { name: 'Scout', healthMult: 0.8, speedMult: 1.5, goldMult: 1, shieldMult: 0.5 },
    { name: 'Soldier', healthMult: 1, speedMult: 1, goldMult: 1, shieldMult: 1 },
    { name: 'Tank', healthMult: 2, speedMult: 0.7, goldMult: 1.5, shieldMult: 2 },
    { name: 'Boss', healthMult: 4, speedMult: 0.5, goldMult: 3, shieldMult: 4 }
  ],
  ENEMY_COLORS: [
    '#ff3333', // Red
    '#ff6633', // Orange
    '#ff9933', // Light Orange
    '#cc3366', // Pink
    '#9933cc', // Purple
    '#3366cc', // Blue
    '#33cc66', // Green
    '#cc9933', // Gold
    '#000033'  // Dark Blue
  ],
  ENEMY_HEALTHBAR_HEIGHT: 6,

  // Bullet
  BULLET_SIZE: 10,
  BULLET_SPEED: 420,
  BULLET_MAX_LEVEL: 5,
  BULLET_UPGRADE_COST: 100,
  BULLET_TYPES: [
    {
      id: 'basic',
      name: 'Basic Shot',
      maxLevel: 3,
      requiredTowerLevel: 1,
      levels: [
        {
          color: '#ff4444',
          effect: undefined,
          damageMultiplier: 1,
          fireRateMultiplier: 1,
          speedMultiplier: 1,
          count: 1,
          special: undefined,
        },
        {
          color: '#ff6666',
          effect: undefined,
          damageMultiplier: 1.2,
          fireRateMultiplier: 1.1,
          speedMultiplier: 1.1,
          count: 1,
          special: undefined,
        },
        {
          color: '#ff8888',
          effect: undefined,
          damageMultiplier: 1.4,
          fireRateMultiplier: 1.2,
          speedMultiplier: 1.2,
          count: 2,
          special: undefined,
        }
      ]
    },
    {
      id: 'frost',
      name: 'Frost Arrow',
      maxLevel: 4,
      requiredTowerLevel: 2,
      levels: [
        {
          color: '#00ccff',
          effect: 'slow',
          damageMultiplier: 1,
          fireRateMultiplier: 1,
          speedMultiplier: 1,
          count: 1,
          special: undefined,
        },
        {
          color: '#33ddff',
          effect: 'slow',
          damageMultiplier: 1.2,
          fireRateMultiplier: 1.1,
          speedMultiplier: 1.1,
          count: 2,
          special: undefined,
        },
        {
          color: '#66eeff',
          effect: 'freeze',
          damageMultiplier: 1.4,
          fireRateMultiplier: 1.2,
          speedMultiplier: 1.2,
          count: 2,
          special: 'star',
        },
        {
          color: '#99ffff',
          effect: 'freeze',
          damageMultiplier: 1.6,
          fireRateMultiplier: 1.3,
          speedMultiplier: 1.3,
          count: 3,
          special: 'star',
        }
      ]
    },
    {
      id: 'dragon',
      name: "Dragon's Breath",
      maxLevel: 5,
      requiredTowerLevel: 3,
      levels: [
        {
          color: '#ff4400',
          effect: 'burn',
          damageMultiplier: 1.3,
          fireRateMultiplier: 0.9,
          speedMultiplier: 1.2,
          count: 1,
          special: 'fire_cloud',
        },
        {
          color: '#ff6600',
          effect: 'burn',
          damageMultiplier: 1.5,
          fireRateMultiplier: 0.85,
          speedMultiplier: 1.3,
          count: 2,
          special: 'fire_cloud',
        },
        {
          color: '#ff8800',
          effect: 'burn',
          damageMultiplier: 1.7,
          fireRateMultiplier: 0.8,
          speedMultiplier: 1.4,
          count: 2,
          special: 'fire_cloud',
        },
        {
          color: '#ffaa00',
          effect: 'burn',
          damageMultiplier: 2.0,
          fireRateMultiplier: 0.75,
          speedMultiplier: 1.5,
          count: 3,
          special: 'fire_cloud',
        },
        {
          color: '#ffcc00',
          effect: 'burn',
          damageMultiplier: 2.3,
          fireRateMultiplier: 0.7,
          speedMultiplier: 1.6,
          count: 3,
          special: 'inferno_cloud',
        }
      ]
    },
    {
      id: 'shadow',
      name: 'Shadow Pulse',
      maxLevel: 4,
      requiredTowerLevel: 4,
      levels: [
        {
          color: '#4b006e',
          effect: 'blind',
          damageMultiplier: 1.5,
          fireRateMultiplier: 0.8,
          speedMultiplier: 1.2,
          count: 1,
          special: 'shadow_wave',
        },
        {
          color: '#6b008e',
          effect: 'blind',
          damageMultiplier: 1.7,
          fireRateMultiplier: 0.75,
          speedMultiplier: 1.3,
          count: 2,
          special: 'shadow_wave',
        },
        {
          color: '#8b00ae',
          effect: 'blind',
          damageMultiplier: 2.0,
          fireRateMultiplier: 0.7,
          speedMultiplier: 1.4,
          count: 2,
          special: 'void_wave',
        },
        {
          color: '#ab00ce',
          effect: 'blind',
          damageMultiplier: 2.3,
          fireRateMultiplier: 0.65,
          speedMultiplier: 1.5,
          count: 3,
          special: 'void_wave',
        }
      ]
    },
    {
      id: 'crystal',
      name: 'Crystal Shard',
      maxLevel: 5,
      requiredTowerLevel: 5,
      levels: [
        {
          color: '#aaf0ff',
          effect: 'shatter',
          damageMultiplier: 1.6,
          fireRateMultiplier: 0.75,
          speedMultiplier: 1.4,
          count: 1,
          special: 'shrapnel',
        },
        {
          color: '#ccf5ff',
          effect: 'shatter',
          damageMultiplier: 1.8,
          fireRateMultiplier: 0.7,
          speedMultiplier: 1.5,
          count: 2,
          special: 'shrapnel',
        },
        {
          color: '#eefaff',
          effect: 'shatter',
          damageMultiplier: 2.1,
          fireRateMultiplier: 0.65,
          speedMultiplier: 1.6,
          count: 2,
          special: 'crystal_burst',
        },
        {
          color: '#ffffff',
          effect: 'shatter',
          damageMultiplier: 2.4,
          fireRateMultiplier: 0.6,
          speedMultiplier: 1.7,
          count: 3,
          special: 'crystal_burst',
        },
        {
          color: ['#ffffff', '#aaf0ff', '#eefaff'],
          effect: 'shatter',
          damageMultiplier: 2.8,
          fireRateMultiplier: 0.55,
          speedMultiplier: 1.8,
          count: 3,
          special: 'crystal_storm',
        }
      ]
    }
  ],
  WALL_COST: 150,
  WALL_SHIELDS: [
    { name: 'Stone Shield', strength: 5, cost: 50 },
    { name: 'Bronze Shield', strength: 10, cost: 100 },
    { name: 'Iron Shield', strength: 15, cost: 150 },
    { name: 'Steel Shield', strength: 20, cost: 200 },
    { name: 'Mithril Shield', strength: 25, cost: 250 },
    { name: 'Adamantium Shield', strength: 30, cost: 300 },
    { name: 'Crystal Shield', strength: 35, cost: 350 },
    { name: 'Legendary Shield', strength: 40, cost: 400 },
    { name: 'Shadow Shield', strength: 45, cost: 450 },
    { name: 'Light Shield', strength: 50, cost: 500 },
  ],

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