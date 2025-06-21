import type { TowerVisual } from '../models/gameTypes';

export const GAME_CONSTANTS = {
  DEBUG_MODE: false,
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
  TOWER_MAX_LEVEL: 25,
  RELOCATE_COOLDOWN: 5000,
  BUILD_TILE_DISTANCE: 120,
  DISMANTLE_REFUND: 0.5,
  MAP_ACTIONS_PER_WAVE: 3,
  MAP_ACTION_ENERGY: {
    wall: 20,
    trench: 15,
    buff: 25,
  },
  BASE_ENERGY: 100,
  ENERGY_REGEN_WAVE: 10,
  ENERGY_COSTS: {
    buildTower: 20,
    upgradeTower: 30,
    relocateTower: 15,
    specialAbility: 40,
  },
  PREP_TIME: 15000,
  PREP_WARNING_THRESHOLD: 5000,
  WALL_BLOCK_DURATION: 5000,
  TRENCH_SLOW_MULTIPLIER: 0.5,
  BUFF_RANGE_MULTIPLIER: 1.2,
  BUILD_TILE_COLORS: {
    fixed: '#4ade80',
    dynamic: '#60a5fa',
  },
  ROAD_PADDING: 80,
  TOWER_ATTACK_SOUNDS: Array.from({ length: 25 }, (_, i) => `tower_attack_${i + 1}`),
  TOWER_VISUALS: [
    { level: 1, model: 'basic' },
    { level: 2, model: 'spiked', glow: true },
    { level: 3, model: 'cannon', effect: 'electric_aura' },
  ] as TowerVisual[],
  TOWER_COLORS: [
    '#D2B48C', '#A9A9A9', '#FFD700', '#9370DB', '#FF69B4', // 1-5
    '#00CED1', '#32CD32', '#FF4500', '#8A2BE2', '#FF1493', // 6-10
    '#00BFFF', '#7CFC00', '#FF6347', '#9932CC', '#FF69B4', // 11-15
    '#00FFFF', '#00FF00', '#FF0000', '#800080', '#FF4500', // 16-20
    '#FFD700', '#FF69B4', '#00CED1', '#32CD32', '#FF1493'  // 21-25
  ],
  TOWER_HEALTHBAR_HEIGHT: 8,
  UPGRADE_ARROW_SIZE: 14,
  UPGRADE_ARROW_COLOR: '#4ade80',

  // Tower Upgrades - 25 Levels with Special Mechanics
  TOWER_UPGRADES: [
    // Level 1-5: Defense Focus
    { 
      level: 1, damage: 20, fireRate: 800, health: 100, cost: 60,
      name: 'Gözetleme Kulesi', special: 'none'
    },
    { 
      level: 2, damage: 30, fireRate: 700, health: 150, cost: 120,
      name: 'Ortaçağ Kalesi', special: 'none'
    },
    { 
      level: 3, damage: 45, fireRate: 600, health: 200, cost: 200,
      name: 'Saray Kulesi', special: 'none'
    },
    { 
      level: 4, damage: 65, fireRate: 550, health: 300, cost: 350,
      name: 'Kraliyet Kalesi', special: 'none'
    },
    { 
      level: 5, damage: 90, fireRate: 500, health: 450, cost: 600,
      name: 'İmparatorluk Kulesi', special: 'none'
    },
    
    // Level 6-10: Fire Rate Focus
    { 
      level: 6, damage: 120, fireRate: 450, health: 600, cost: 1000,
      name: 'Hızlı Atış Kulesi', special: 'rapid_fire'
    },
    { 
      level: 7, damage: 160, fireRate: 400, health: 750, cost: 1500,
      name: 'Çoklu Atış Kulesi', special: 'multi_shot'
    },
    { 
      level: 8, damage: 210, fireRate: 350, health: 900, cost: 2200,
      name: 'Otomatik Kule', special: 'auto_target'
    },
    { 
      level: 9, damage: 270, fireRate: 300, health: 1100, cost: 3200,
      name: 'Gatling Kulesi', special: 'gatling'
    },
    { 
      level: 10, damage: 340, fireRate: 250, health: 1300, cost: 4500,
      name: 'Lazer Kulesi', special: 'laser'
    },
    
    // Level 11-15: Damage Focus
    { 
      level: 11, damage: 420, fireRate: 220, health: 1500, cost: 6500,
      name: 'Plazma Kulesi', special: 'plasma'
    },
    { 
      level: 12, damage: 510, fireRate: 200, health: 1700, cost: 9000,
      name: 'Elektrik Kulesi', special: 'chain_lightning'
    },
    { 
      level: 13, damage: 610, fireRate: 180, health: 1900, cost: 12000,
      name: 'Buz Kulesi', special: 'freeze'
    },
    { 
      level: 14, damage: 720, fireRate: 160, health: 2100, cost: 16000,
      name: 'Ateş Kulesi', special: 'burn'
    },
    { 
      level: 15, damage: 840, fireRate: 140, health: 2300, cost: 21000,
      name: 'Asit Kulesi', special: 'acid'
    },
    
    // Level 16-20: Hybrid Focus
    { 
      level: 16, damage: 970, fireRate: 120, health: 2600, cost: 27000,
      name: 'Kuantum Kulesi', special: 'quantum'
    },
    { 
      level: 17, damage: 1110, fireRate: 100, health: 2900, cost: 35000,
      name: 'Nano Kulesi', special: 'nano'
    },
    { 
      level: 18, damage: 1260, fireRate: 80, health: 3200, cost: 45000,
      name: 'Psi Kulesi', special: 'psi'
    },
    { 
      level: 19, damage: 1420, fireRate: 60, health: 3500, cost: 58000,
      name: 'Zaman Kulesi', special: 'time_warp'
    },
    { 
      level: 20, damage: 1590, fireRate: 40, health: 3800, cost: 75000,
      name: 'Uzay Kulesi', special: 'space'
    },
    
    // Level 21-25: Ultimate Focus
    { 
      level: 21, damage: 1770, fireRate: 30, health: 4200, cost: 95000,
      name: 'Efsanevi Kule', special: 'legendary'
    },
    { 
      level: 22, damage: 1960, fireRate: 25, health: 4600, cost: 120000,
      name: 'Kutsal Kule', special: 'divine'
    },
    { 
      level: 23, damage: 2160, fireRate: 20, health: 5000, cost: 150000,
      name: 'Kozmik Kule', special: 'cosmic'
    },
    { 
      level: 24, damage: 2370, fireRate: 15, health: 5500, cost: 200000,
      name: 'Sonsuzluk Kulesi', special: 'infinity'
    },
    { 
      level: 25, damage: 2600, fireRate: 10, health: 6000, cost: 300000,
      name: 'Tanrı Kulesi', special: 'god_mode'
    }
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
  ENEMY_SPAWN_RATE: 800,
  ENEMY_WAVE_INCREASE: 2,
  ENEMY_HEALTH_INCREASE: 25,
  ENEMY_COLORS: ['#ff3333', '#ff8800', '#ffcc00'],
  ENEMY_HEALTHBAR_HEIGHT: 6,
  ENEMY_TYPES: {
    Basic: { speed: 80, hp: 60, damage: 10, color: '#ff3333', behaviorTag: 'normal' },
    Scout: { speed: 140, hp: 40, damage: 8, color: '#6ee7b7', behaviorTag: 'avoid' },
    Tank: { speed: 60, hp: 200, damage: 20, color: '#94a3b8', behaviorTag: 'tank' },
    Ghost: { speed: 100, hp: 70, damage: 12, color: '#a78bfa', behaviorTag: 'ghost' },
  },
  TANK_DEATH_RADIUS: 80,

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

  // Yeni Sur Sistemi
  WALL_SYSTEM: {
    // Sur seviyeleri
    WALL_LEVELS: [
      { name: 'Taş Sur', strength: 3, cost: 100, regenTime: 15000, fireRateBonus: 1.0 },
      { name: 'Demir Sur', strength: 5, cost: 250, regenTime: 12000, fireRateBonus: 1.1 },
      { name: 'Çelik Sur', strength: 8, cost: 500, regenTime: 10000, fireRateBonus: 1.2 },
      { name: 'Kristal Sur', strength: 12, cost: 1000, regenTime: 8000, fireRateBonus: 1.3 },
      { name: 'Enerji Suru', strength: 18, cost: 2000, regenTime: 6000, fireRateBonus: 1.4 },
      { name: 'Kuantum Suru', strength: 25, cost: 4000, regenTime: 4000, fireRateBonus: 1.5 },
      { name: 'Sonsuzluk Suru', strength: 35, cost: 8000, regenTime: 3000, fireRateBonus: 1.6 },
      { name: 'Tanrı Suru', strength: 50, cost: 15000, regenTime: 2000, fireRateBonus: 1.8 },
    ],
    
    // Global etkiler
    GLOBAL_EFFECTS: {
      NO_WALL_ENEMY_SPEED_MULTIPLIER: 0.3, // Sur yokken düşman hızı %30'a düşer
      NO_WALL_FIRE_RATE_MULTIPLIER: 0.5, // Sur yokken ateş hızı yarıya düşer
      NO_WALL_DAMAGE_MULTIPLIER: 0.7, // Sur yokken hasar %30 azalır
      WALL_REGEN_DELAY: 5000, // Sur yok olduktan 5 saniye sonra yenilenmeye başlar
      FROST_EFFECT_DURATION: 3000, // Buz efekti süresi
    }
  },

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