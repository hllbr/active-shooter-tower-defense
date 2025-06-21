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
  TOWER_COST: 50,
  TOWER_UPGRADE_COST: 60,
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
  INITIAL_TOWER_LIMIT: 2,

  // Enemy
  ENEMY_SIZE: 36,
  ENEMY_HEALTH: 60,
  ENEMY_SPEED: 80,
  ENEMY_GOLD_DROP: 50,
  ENEMY_SPAWN_RATE: 900,
  ENEMY_WAVE_INCREASE: 2,
  ENEMY_HEALTH_INCREASE: 25,
  ENEMY_COLORS: ['#ff3333', '#ff8800', '#ffcc00'],
  ENEMY_HEALTHBAR_HEIGHT: 6,

  // Mines
  MINE_VISUALS: {
    size: 22,
    bodyColor: '#4a4a4a',
    borderColor: '#212121',
    lightColor: '#ff1111',
  },
  MINE_UPGRADES: [
    { cost: 500, count: 3, damage: 100, radius: 80 },
    { cost: 750, count: 4, damage: 120, radius: 90 },
    { cost: 1100, count: 5, damage: 150, radius: 100 },
    { cost: 1500, count: 6, damage: 180, radius: 110 },
    { cost: 2000, count: 7, damage: 220, radius: 120 },
    { cost: 2600, count: 8, damage: 260, radius: 130 },
    { cost: 3300, count: 9, damage: 300, radius: 140 },
    { cost: 4100, count: 10, damage: 350, radius: 150 },
    { cost: 5000, count: 12, damage: 400, radius: 160 },
    { cost: 6000, count: 15, damage: 500, radius: 180 },
    {
      cost: 5000,
      count: 10,
      damage: 175,
      radius: 120,
      description: 'Sınırsız Mayın: Patlayan her mayının yerine anında yenisi gelir.',
    },
  ],

  // Knockback effect
  KNOCKBACK_DISTANCE: 40, // pixels
  KNOCKBACK_STUN_DURATION: 300, // ms

  // Special Microbe Enemy (Yadama)
  MICROBE_ENEMY: {
    size: 28,
    health: 40,
    speed: 60,
    baseGoldDrop: 5,
    goldDropInterval: 2000, // Drop gold every 2 seconds
    color: '#00ff88',
    borderColor: '#00cc66',
    pulseColor: '#00ffaa',
    spawnChance: 0.15, // 15% chance to spawn as microbe in eligible waves
  },

  // Wave completion formula: wave * (wave + 1) + 8
  // Wave 1: 10, Wave 2: 22, Wave 3: 36, Wave 4: 52, Wave 5: 70, ..., Wave 100: 10108
  getWaveEnemiesRequired: (wave: number) => wave * (wave + 1) + 8,

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
  WALL_SHIELDS: [
    { name: 'Taş Kalkanı', strength: 5, cost: 50 },
    { name: 'Bronz Kalkanı', strength: 10, cost: 100 },
    { name: 'Demir Kalkanı', strength: 15, cost: 150 },
    { name: 'Çelik Kalkanı', strength: 20, cost: 200 },
    { name: 'Mithril Kalkanı', strength: 25, cost: 250 },
    { name: 'Adamantium Kalkanı', strength: 30, cost: 300 },
    { name: 'Kristal Kalkanı', strength: 35, cost: 350 },
    { name: 'Efsanevi Kalkan', strength: 40, cost: 400 },
    { name: 'Gölge Kalkanı', strength: 45, cost: 450 },
    { name: 'Işık Kalkanı', strength: 50, cost: 500 },
  ],

  // Avantajlı Paketler - Matematiksel hesaplama ile %15-25 indirim
  UPGRADE_PACKAGES: [
    {
      name: 'Başlangıç Paketi',
      bulletLevel: 1, // Ejderha Nefesi
      shieldIndex: 0, // Taş Kalkanı
      originalCost: 300 + 50, // 350
      discountedCost: 300, // %14 indirim
      description: 'Ejderha Nefesi + Taş Kalkanı',
      color: '#ff4400',
    },
    {
      name: 'Güç Paketi',
      bulletLevel: 2, // Mamut Öfkesi
      shieldIndex: 2, // Demir Kalkanı
      originalCost: 300 + 150, // 450
      discountedCost: 380, // %16 indirim
      description: 'Mamut Öfkesi + Demir Kalkanı',
      color: '#ffcc00',
    },
    {
      name: 'Savaş Paketi',
      bulletLevel: 3, // Alevor
      shieldIndex: 4, // Mithril Kalkanı
      originalCost: 300 + 250, // 550
      discountedCost: 450, // %18 indirim
      description: 'Alevor + Mithril Kalkanı',
      color: '#ff5500',
    },
    {
      name: 'Efsanevi Paket',
      bulletLevel: 4, // Yakhar
      shieldIndex: 6, // Kristal Kalkanı
      originalCost: 300 + 350, // 650
      discountedCost: 520, // %20 indirim
      description: 'Yakhar + Kristal Kalkanı',
      color: '#cc3300',
    },
    {
      name: 'Gölge Paketi',
      bulletLevel: 5, // Ignorak
      shieldIndex: 8, // Gölge Kalkanı
      originalCost: 300 + 450, // 750
      discountedCost: 580, // %23 indirim
      description: 'Ignorak + Gölge Kalkanı',
      color: '#ff0066',
    },
    {
      name: 'Volkan Paketi',
      bulletLevel: 6, // Volkanor
      shieldIndex: 9, // Işık Kalkanı
      originalCost: 300 + 500, // 800
      discountedCost: 600, // %25 indirim
      description: 'Volkanor + Işık Kalkanı',
      color: '#ff6600',
    },
    {
      name: 'Ultimate Paket',
      bulletLevel: 7, // Pyrax
      shieldIndex: 9, // Işık Kalkanı
      originalCost: 300 + 500, // 800
      discountedCost: 650, // %19 indirim (en güçlü paket)
      description: 'Pyrax + Işık Kalkanı',
      color: '#ff3300',
    },
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