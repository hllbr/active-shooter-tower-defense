import type { TowerVisual } from '../../models/gameTypes';
import type { BulletTypeData } from '../../ui/game/upgrades/types';
import { waveCompositions } from '../../config/waves';

const generateCircularTowerSlots = (count: number, centerX: number, centerY: number, radius: number) => {
  const slots = [];
  const angleStep = (2 * Math.PI) / count;
  for (let i = 0; i < count; i++) {
    // Start from the top and distribute clockwise
    const angle = i * angleStep - Math.PI / 2; 
    slots.push({
      x: Math.round(centerX + radius * Math.cos(angle)),
      y: Math.round(centerY + radius * Math.sin(angle)),
    });
  }
  return slots;
};

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
  
  // Gelişmiş Action Sistemi
  ACTION_SYSTEM: {
    BASE_ACTIONS: 3,
    // Her 10 wave'de +1 action (doğal ilerleme)
    ACTIONS_PER_10_WAVES: 1,
    // Maksimum action sayısı
    MAX_ACTIONS: 15,
    // Action regenerasyon sistemi
    ACTION_REGEN_ENABLED: true,
    ACTION_REGEN_TIME: 30000 as number, // 30 saniye başına 1 action
  },
  MAP_ACTION_ENERGY: {
    wall: 20,
    trench: 15,
    buff: 25,
  },
  BASE_ENERGY: 100,
  ENERGY_REGEN_WAVE: 10,
  ENERGY_REGEN_PASSIVE: 0.5, // Saniye başına pasif rejenerasyon
  ENERGY_REGEN_KILL: 2, // Düşman öldürme bonusu
  ENERGY_COSTS: {
    buildTower: 20,
    upgradeTower: 30,
    relocateTower: 15,
    specialAbility: 40,
  },
  
  // Yeni Enerji Sistemi
  ENERGY_SYSTEM: {
    // Pasif rejenerasyon (saniye başına)
    PASSIVE_REGEN_BASE: 0.5,
    // Düşman öldürme bazlı enerji
    ENERGY_PER_KILL: 2,
    ENERGY_PER_SPECIAL_KILL: 5, // Microbe gibi özel düşmanlar
    // Aktivite bazlı bonuslar
    ACTIVITY_BONUS_MULTIPLIER: 0.15, // Harcanan enerjinin %15'i geri kazanılır
    // Maksimum enerji
    MAX_ENERGY_BASE: 100,
    // Combo sistemi
    KILL_COMBO_THRESHOLD: 5, // 5 düşman öldürünce
    KILL_COMBO_BONUS: 3, // +3 enerji bonus
    COMBO_RESET_TIME: 10000, // 10 saniye combo süresi
  },

  // Kapsamlı Güç Sistemi Market
  POWER_MARKET: {
    // Enerji Kategorisi
    ENERGY_UPGRADES: [
      {
        id: 'energy_tank_basic',
        name: 'Temel Enerji Tankı',
        description: 'Maksimum enerji +20',
        category: 'energy_capacity',
        cost: 200,
        maxLevel: 15,
        effect: { type: 'max_energy', value: 20 },
        icon: '🔋',
      },
      {
        id: 'energy_generator',
        name: 'Enerji Jeneratörü',
        description: 'Pasif enerji üretimi +0.3/sn',
        category: 'energy_regen',
        cost: 350,
        maxLevel: 10,
        effect: { type: 'passive_regen', value: 0.3 },
        icon: '⚡',
      },
      {
        id: 'energy_turbine',
        name: 'Enerji Türbini',
        description: 'Düşman öldürme bonusu +1.5',
        category: 'energy_combat',
        cost: 450,
        maxLevel: 8,
        effect: { type: 'kill_bonus', value: 1.5 },
        icon: '🌪️',
      },
      {
        id: 'energy_recycler',
        name: 'Enerji Geri Dönüştürücü',
        description: 'Harcanan enerjinin %8\'i geri kazanılır',
        category: 'energy_efficiency',
        cost: 600,
        maxLevel: 5,
        effect: { type: 'activity_bonus', value: 0.08 },
        icon: '♻️',
      },
      {
        id: 'energy_optimizer',
        name: 'Enerji Optimize Edici',
        description: 'Tüm enerji harcamaları %12 azalır',
        category: 'energy_efficiency',
        cost: 800,
        maxLevel: 6,
        effect: { type: 'efficiency', value: 0.12 },
        icon: '🔧',
      },
    ],

    // Aksiyon Kategorisi
    ACTION_UPGRADES: [
      {
        id: 'action_core',
        name: 'Aksiyon Çekirdeği',
        description: 'Maksimum aksiyon +1',
        category: 'action_capacity',
        cost: 500,
        maxLevel: 7,
        effect: { type: 'action_capacity', value: 1 },
        icon: '⚡',
      },
      {
        id: 'action_accelerator',
        name: 'Aksiyon Hızlandırıcı',
        description: 'Aksiyon rejenerasyon süresini 4sn azaltır',
        category: 'action_regen',
        cost: 750,
        maxLevel: 5,
        effect: { type: 'action_regen', value: 4000 },
        icon: '🚀',
      },
      {
        id: 'action_amplifier',
        name: 'Aksiyon Yükselticisi',
        description: 'Özel düşman öldürünce +1 aksiyon kazanılır',
        category: 'action_combat',
        cost: 900,
        maxLevel: 3,
        effect: { type: 'special_kill_action', value: 1 },
        icon: '📡',
      },
      {
        id: 'action_multiplier',
        name: 'Aksiyon Çoğaltıcı',
        description: '%20 şansla aksiyon harcanmaz',
        category: 'action_efficiency',
        cost: 1200,
        maxLevel: 4,
        effect: { type: 'action_save_chance', value: 0.2 },
        icon: '🎲',
      },
    ],

    // Kombo Sistemleri
    COMBO_UPGRADES: [
      {
        id: 'combo_master',
        name: 'Kombo Ustası',
        description: 'Kombo bonusu +2 enerji, süre +3sn',
        category: 'combo_system',
        cost: 700,
        maxLevel: 4,
        effect: { type: 'combo_master', value: { bonus: 2, time: 3000 } },
        icon: '🔥',
      },
      {
        id: 'streak_keeper',
        name: 'Seri Koruyucusu',
        description: 'Kombo süresini %25 uzatır',
        category: 'combo_system',
        cost: 850,
        maxLevel: 3,
        effect: { type: 'combo_duration', value: 0.25 },
        icon: '⏰',
      },
      {
        id: 'rampage_mode',
        name: 'Saldırı Modu',
        description: '10+ kombo ile enerji maliyetleri %30 azalır',
        category: 'combo_system',
        cost: 1100,
        maxLevel: 2,
        effect: { type: 'rampage_efficiency', value: 0.3 },
        icon: '💀',
      },
    ],

    // Elite Sistemler
    ELITE_UPGRADES: [
      {
        id: 'power_core',
        name: 'Güç Çekirdeği',
        description: 'Enerji ve aksiyon kapasitesi +50%',
        category: 'elite_power',
        cost: 2500,
        maxLevel: 2,
        effect: { type: 'power_core', value: 0.5 },
        icon: '💎',
      },
      {
        id: 'infinite_loop',
        name: 'Sonsuz Döngü',
        description: '%5 şansla enerji ve aksiyon harcamaları geri gelir',
        category: 'elite_efficiency',
        cost: 3000,
        maxLevel: 1,
        effect: { type: 'infinite_loop', value: 0.05 },
        icon: '∞',
      },
      {
        id: 'quantum_processor',
        name: 'Kuantum İşlemci',
        description: 'Tüm rejenerasyon %100 hızlanır',
        category: 'elite_regen',
        cost: 3500,
        maxLevel: 1,
        effect: { type: 'quantum_regen', value: 1.0 },
        icon: '🌌',
      },
    ],
  },
  PREP_TIME: 15000,
  PREP_WARNING_THRESHOLD: 5000,
  WALL_BLOCK_DURATION: 5000,
  TRENCH_SLOW_MULTIPLIER: 0.5,
  BUFF_RANGE_MULTIPLIER: 1.2,
  BUILD_TILE_COLORS: {
    fixed: '#4ade80',
    dynamic: '#4ade80',
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

  // ✅ BALANCED TOWER UPGRADES - Consistent efficiency across all levels
  TOWER_UPGRADES: [
    // Level 1-5: Defense Focus (Early game viable, good ROI)
    { 
      level: 1, damage: 25, fireRate: 800, health: 100, cost: 50,
      name: 'Gözetleme Kulesi', special: 'none'
    },
    { 
      level: 2, damage: 40, fireRate: 700, health: 150, cost: 80,
      name: 'Ortaçağ Kalesi', special: 'none'
    },
    { 
      level: 3, damage: 60, fireRate: 600, health: 200, cost: 120,
      name: 'Saray Kulesi', special: 'none'
    },
    { 
      level: 4, damage: 85, fireRate: 550, health: 300, cost: 170,
      name: 'Kraliyet Kalesi', special: 'none'
    },
    { 
      level: 5, damage: 115, fireRate: 500, health: 450, cost: 230,
      name: 'İmparatorluk Kulesi', special: 'none'
    },
    
    // Level 6-10: Fire Rate Focus (Consistent efficiency maintained)
    { 
      level: 6, damage: 150, fireRate: 450, health: 600, cost: 300,
      name: 'Hızlı Atış Kulesi', special: 'rapid_fire'
    },
    { 
      level: 7, damage: 190, fireRate: 400, health: 750, cost: 380,
      name: 'Çoklu Atış Kulesi', special: 'multi_shot'
    },
    { 
      level: 8, damage: 235, fireRate: 350, health: 900, cost: 470,
      name: 'Otomatik Kule', special: 'auto_target'
    },
    { 
      level: 9, damage: 285, fireRate: 300, health: 1100, cost: 570,
      name: 'Gatling Kulesi', special: 'gatling'
    },
    { 
      level: 10, damage: 340, fireRate: 250, health: 1300, cost: 680,
      name: 'Lazer Kulesi', special: 'laser'
    },
    
    // Level 11-15: Damage Focus (Mid-game progression)
    { 
      level: 11, damage: 400, fireRate: 220, health: 1500, cost: 800,
      name: 'Plazma Kulesi', special: 'plasma'
    },
    { 
      level: 12, damage: 465, fireRate: 200, health: 1700, cost: 930,
      name: 'Elektrik Kulesi', special: 'chain_lightning'
    },
    { 
      level: 13, damage: 535, fireRate: 180, health: 1900, cost: 1070,
      name: 'Buz Kulesi', special: 'freeze'
    },
    { 
      level: 14, damage: 610, fireRate: 160, health: 2100, cost: 1220,
      name: 'Ateş Kulesi', special: 'burn'
    },
    { 
      level: 15, damage: 690, fireRate: 140, health: 2300, cost: 1380,
      name: 'Asit Kulesi', special: 'acid'
    },
    
    // Level 16-20: Special Abilities (Late game complexity)
    { 
      level: 16, damage: 775, fireRate: 130, health: 2500, cost: 1550,
      name: 'Kuantum Kulesi', special: 'quantum'
    },
    { 
      level: 17, damage: 865, fireRate: 120, health: 2700, cost: 1730,
      name: 'Nano Kulesi', special: 'nano'
    },
    { 
      level: 18, damage: 960, fireRate: 110, health: 2900, cost: 1920,
      name: 'Psi Kulesi', special: 'psi'
    },
    { 
      level: 19, damage: 1060, fireRate: 100, health: 3100, cost: 2120,
      name: 'Zaman Kulesi', special: 'time_warp'
    },
    { 
      level: 20, damage: 1165, fireRate: 90, health: 3300, cost: 2330,
      name: 'Uzay Kulesi', special: 'space'
    },
    
    // Level 21-25: God-tier (End game power)
    { 
      level: 21, damage: 1275, fireRate: 80, health: 3500, cost: 2550,
      name: 'Efsanevi Kule', special: 'legendary'
    },
    { 
      level: 22, damage: 1390, fireRate: 70, health: 3700, cost: 2780,
      name: 'Tanrısal Kule', special: 'divine'
    },
    { 
      level: 23, damage: 1510, fireRate: 60, health: 3900, cost: 3020,
      name: 'Kozmik Kule', special: 'cosmic'
    },
    { 
      level: 24, damage: 1635, fireRate: 50, health: 4100, cost: 3270,
      name: 'Sonsuzluk Kulesi', special: 'infinity'
    },
    { 
      level: 25, damage: 1765, fireRate: 40, health: 4300, cost: 3530,
      name: 'Tanrı Modu', special: 'god_mode'
    },
  ],

  // ✅ NEW: Specialized Tower Types for Issue #54
  SPECIALIZED_TOWERS: {
    // ASSAULT CATEGORY
    sniper: {
      name: 'Sniper Tower',
      category: 'assault',
      baseDamage: 200,
      baseRange: 400,
      baseFireRate: 2000, // Slow but powerful
      criticalChance: 0.2,
      criticalDamage: 3.0,
      armorPenetration: 50,
      cost: 300,
      description: 'High damage, long range, critical hits',
      upgradePaths: {
        marksman: { criticalChance: 0.4, criticalDamage: 4.0 },
        penetrator: { projectilePenetration: 3, armorPenetration: 100 },
        spotter: { supportRadius: 200, supportIntensity: 1.5 }
      }
    },
    
    gatling: {
      name: 'Gatling Gun',
      category: 'assault',
      baseDamage: 25,
      baseRange: 250,
      baseFireRate: 200, // Very fast
      spinUpLevel: 0,
      maxSpinUpLevel: 5,
      cost: 200,
      description: 'Fast attack speed, spin-up mechanic',
      upgradePaths: {
        suppressor: { empDuration: 1000, areaOfEffect: 50 },
        incendiary: { burnDuration: 3000, damage: 35 },
        overcharge: { maxSpinUpLevel: 8, fireRate: 100 }
      }
    },
    
    laser: {
      name: 'Laser Cannon',
      category: 'assault',
      baseDamage: 150,
      baseRange: 350,
      baseFireRate: 500,
      beamFocusMultiplier: 1.0,
      beamLockTime: 0,
      armorPenetration: 75,
      cost: 400,
      description: 'Beam focus damage, armor penetration',
      upgradePaths: {
        prism: { projectilePenetration: 2, areaOfEffect: 75 },
        overload: { criticalChance: 0.15, criticalDamage: 2.5 },
        precision: { armorPenetration: 150, beamFocusMultiplier: 2.0 }
      }
    },
    
    // AREA CONTROL CATEGORY
    mortar: {
      name: 'Mortar Tower',
      category: 'area_control',
      baseDamage: 100,
      baseRange: 500,
      baseFireRate: 1000,
      areaOfEffect: 150,
      cost: 350,
      description: 'Long-range area damage',
      upgradePaths: {
        cluster: { areaOfEffect: 200, multiShotCount: 3 },
        incendiary: { burnDuration: 5000, areaOfEffect: 180 },
        guided: { range: 600, manualTargeting: true }
      }
    },
    
    flamethrower: {
      name: 'Flamethrower',
      category: 'area_control',
      baseDamage: 50,
      baseRange: 150,
      baseFireRate: 125, // 8 times per second
      areaOfEffect: 90, // Cone area
      burnDuration: 2000,
      cost: 250,
      description: 'Close-range area control, burning',
      upgradePaths: {
        napalm: { burnDuration: 4000, areaOfEffect: 120 },
        pressure: { range: 200, empDuration: 500 }, // Knockback
        chemical: { armorPenetration: 25, acidStack: 3 }
      }
    },
    
    // SUPPORT CATEGORY
    radar: {
      name: 'Radar Tower',
      category: 'support',
      baseDamage: 0,
      baseRange: 300,
      baseFireRate: 0,
      supportRadius: 200,
      supportIntensity: 1.3, // 30% accuracy bonus
      stealthDetectionRange: 400,
      cost: 150,
      description: 'Increases nearby tower accuracy, reveals stealth',
      upgradePaths: {
        surveillance: { stealthDetectionRange: 600, supportRadius: 250 },
        coordination: { supportIntensity: 1.5, supportRadius: 300 },
        countermeasures: { empDuration: 2000, supportRadius: 200 }
      }
    },
    
    supply_depot: {
      name: 'Supply Depot',
      category: 'support',
      baseDamage: 0,
      baseRange: 0,
      baseFireRate: 0,
      supportRadius: 250,
      supportIntensity: 1.2, // 20% reload speed bonus
      cost: 200,
      description: 'Enhances nearby towers, provides resources',
      upgradePaths: {
        logistics: { supportIntensity: 1.4, repairRate: 10 },
        armory: { supportIntensity: 1.3, supportRadius: 300 },
        command: { manualTargeting: true, supportRadius: 200 }
      }
    },
    
    // DEFENSIVE CATEGORY
    shield_generator: {
      name: 'Shield Generator',
      category: 'defensive',
      baseDamage: 0,
      baseRange: 0,
      baseFireRate: 0,
      shieldStrength: 500,
      shieldRegenRate: 10,
      supportRadius: 150,
      cost: 250,
      description: 'Provides shield protection to nearby towers',
      upgradePaths: {
        personal: { shieldStrength: 800, shieldRegenRate: 15 },
        area: { supportRadius: 200, shieldStrength: 1000 },
        adaptive: { shieldRegenRate: 20, supportIntensity: 1.2 }
      }
    },
    
    repair_station: {
      name: 'Repair Station',
      category: 'defensive',
      baseDamage: 0,
      baseRange: 0,
      baseFireRate: 0,
      repairRate: 50,
      supportRadius: 200,
      cost: 180,
      description: 'Repairs damaged towers automatically',
      upgradePaths: {
        drone: { repairRate: 75, supportRadius: 250 },
        nanobots: { repairRate: 25, supportRadius: 400 }, // Continuous repair
        emergency: { repairRate: 200, supportRadius: 150 } // Burst repair
      }
    },
    
    // SPECIALIST CATEGORY
    emp: {
      name: 'EMP Tower',
      category: 'specialist',
      baseDamage: 50,
      baseRange: 200,
      baseFireRate: 3000,
      empDuration: 3000,
      areaOfEffect: 100,
      cost: 300,
      description: 'Disables enemy electronics',
      upgradePaths: {
        pulse: { empDuration: 5000, areaOfEffect: 150 },
        overload: { damage: 100, empDuration: 4000 },
        cascade: { projectilePenetration: 5, empDuration: 2000 }
      }
    },
    
    stealth_detector: {
      name: 'Stealth Detector',
      category: 'specialist',
      baseDamage: 0,
      baseRange: 0,
      baseFireRate: 0,
      stealthDetectionRange: 300,
      supportRadius: 250,
      supportIntensity: 1.4, // Bonus damage to revealed enemies
      cost: 200,
      description: 'Reveals stealth enemies, marks targets',
      upgradePaths: {
        scanner: { stealthDetectionRange: 500, supportRadius: 350 },
        tracker: { supportIntensity: 1.8, stealthDetectionRange: 400 },
        disruptor: { empDuration: 1500, stealthDetectionRange: 300 }
      }
    },
    
    air_defense: {
      name: 'Air Defense',
      category: 'specialist',
      baseDamage: 120,
      baseRange: 400,
      baseFireRate: 800,
      projectilePenetration: 1,
      cost: 320,
      description: 'Specialized against flying enemies',
      upgradePaths: {
        interceptor: { projectilePenetration: 3, range: 500 },
        flak: { areaOfEffect: 80, damage: 150 },
        guided: { criticalChance: 0.3, manualTargeting: true }
      }
    }
  },

  // Tower Slots - New circular layout
  TOWER_SLOTS: generateCircularTowerSlots(8, 1920 / 2 - 100, 1080 / 2 - 100, 300),
  
  TOWER_SLOT_UNLOCK_GOLD: [
    0,    // Slot 0 - Free (starting slot)
    0,    // Slot 1 - Free (starting slot)
    0,    // Slot 2 - Free (starting slot)
    0,    // Slot 3 - Free (starting slot)
    300,  // Slot 4 - First paid slot
    600,  // Slot 5 - Second paid slot
    1200, // Slot 6 - Third paid slot
    2400, // Slot 7 - Fourth paid slot (very expensive)
  ],
  INITIAL_SLOT_COUNT: 4,
  INITIAL_TOWER_LIMIT: 4,

  // Enemy - Improved for better visual clarity
  ENEMY_SIZE: 32, // Reduced from 36 to 32 for less screen coverage
  ENEMY_HEALTH: 60,
  ENEMY_SPEED: 80,
  ENEMY_GOLD_DROP: 50,
  ENEMY_SPAWN_RATE: 1200, // Increased from 800ms to 1200ms for better pacing
  ENEMY_WAVE_INCREASE: 2,
  ENEMY_HEALTH_INCREASE: 25,
  ENEMY_COLORS: ['#ff3333', '#ff8800', '#ffcc00'],
  ENEMY_HEALTHBAR_HEIGHT: 4, // Reduced from 6 to 4 for less visual clutter
  ENEMY_TYPES: {
    // Basic Enemies (Wave 1-10)
    Basic: { speed: 80, hp: 60, damage: 10, color: '#ff3333', behaviorTag: 'normal' },
    Scout: { speed: 140, hp: 40, damage: 8, color: '#6ee7b7', behaviorTag: 'avoid' },
    Tank: { speed: 60, hp: 200, damage: 20, color: '#94a3b8', behaviorTag: 'tank' },
    Ghost: { speed: 100, hp: 70, damage: 12, color: '#a78bfa', behaviorTag: 'ghost' },
    
    // Advanced Enemies (Wave 11-30)
    Assassin: { speed: 160, hp: 80, damage: 15, color: '#dc2626', behaviorTag: 'stealth' },
    Berserker: { speed: 90, hp: 180, damage: 25, color: '#ea580c', behaviorTag: 'rage' },
    Shaman: { speed: 70, hp: 120, damage: 18, color: '#7c3aed', behaviorTag: 'healer' },
    Archer: { speed: 110, hp: 90, damage: 22, color: '#059669', behaviorTag: 'ranged' },
    
    // Elite Enemies (Wave 31-60)
    Demon: { speed: 120, hp: 250, damage: 35, color: '#991b1b', behaviorTag: 'fire' },
    Wraith: { speed: 130, hp: 150, damage: 30, color: '#4338ca', behaviorTag: 'phase' },
    Golem: { speed: 40, hp: 400, damage: 40, color: '#78716c', behaviorTag: 'armor' },
    Phoenix: { speed: 150, hp: 200, damage: 28, color: '#f97316', behaviorTag: 'resurrect' },
    
    // Boss Enemies (Wave 10, 20, 30, etc.)
    TankBoss: { speed: 30, hp: 800, damage: 50, color: '#475569', behaviorTag: 'tank_boss' },
    GhostBoss: { speed: 80, hp: 600, damage: 45, color: '#6366f1', behaviorTag: 'ghost_boss' },
    DemonLord: { speed: 60, hp: 1200, damage: 80, color: '#7f1d1d', behaviorTag: 'demon_boss' },
    DragonKing: { speed: 50, hp: 2000, damage: 120, color: '#dc2626', behaviorTag: 'dragon_boss' },
    
    // Ultimate Bosses (Wave 70-100)
    LichKing: { speed: 70, hp: 3000, damage: 150, color: '#1e1b4b', behaviorTag: 'lich_boss' },
    TitanLord: { speed: 35, hp: 5000, damage: 200, color: '#365314', behaviorTag: 'titan_boss' },
    VoidGod: { speed: 90, hp: 8000, damage: 300, color: '#0c0a09', behaviorTag: 'void_boss' },
    UltimateGod: { speed: 100, hp: 15000, damage: 500, color: '#fbbf24', behaviorTag: 'ultimate_boss' },
  },
  TANK_DEATH_RADIUS: 80,

  // Mines
  MINE_VISUALS: {
    size: 22,
    bodyColor: '#4a4a4a',
    borderColor: '#212121',
    lightColor: '#ff1111',
  },
  MINE_MIN_DISTANCE_FROM_TOWER: 100,
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

  // Calculate how many enemies need to be defeated in a wave. If a custom
  // composition exists, sum the counts; otherwise use the basic formula based on
  // ENEMY_WAVE_INCREASE to match spawn count.
  getWaveEnemiesRequired: (wave: number) => {
    const comp = waveCompositions[wave];
    if (comp) {
      const required = comp.reduce((sum, c) => sum + c.count, 0);
      return required;
    }
    const fallback = GAME_CONSTANTS.ENEMY_WAVE_INCREASE * wave;
    return fallback;
  },

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
      missionRequirement: {
        id: 'fire_mastery',
        text: '20 düşman öldür (Günlük Görev)'
      },
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
  ] as const satisfies BulletTypeData[],
  BULLET_UPGRADE_COST: 300,
  WALL_COST: 150,
  WALL_SHIELDS: [
    { name: 'Taş Kalkanı', strength: 5, cost: 50, purchaseLimit: 3 },
    { name: 'Bronz Kalkanı', strength: 10, cost: 100, purchaseLimit: 3 },
    { name: 'Demir Kalkanı', strength: 15, cost: 150, purchaseLimit: 2 },
    { name: 'Çelik Kalkanı', strength: 20, cost: 200, purchaseLimit: 2 },
    { name: 'Mithril Kalkanı', strength: 25, cost: 250, purchaseLimit: 2 },
    { name: 'Adamantium Kalkanı', strength: 30, cost: 300, purchaseLimit: 2 },
    { name: 'Kristal Kalkanı', strength: 35, cost: 350, purchaseLimit: 1 },
    { name: 'Efsanevi Kalkan', strength: 40, cost: 400, purchaseLimit: 1 },
    { name: 'Gölge Kalkanı', strength: 45, cost: 450, purchaseLimit: 1 },
    { name: 'Işık Kalkanı', strength: 50, cost: 500, purchaseLimit: 1 },
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
    },

    // Duvar çarpışma hasarı
    WALL_COLLISION_DAMAGE: [5, 10, 20, 35, 50, 75, 100, 150], // Her duvar seviyesi için
  },

  // Avantajlı Paketler - Wave progression'a göre daha anlamlı paketler
  UPGRADE_PACKAGES: [
    // Erken Wave Paketleri (Wave 1-20)
    {
      name: 'Başlangıç Paketi',
      bulletLevel: 1, // Ejderha Nefesi
      shieldIndex: 0, // Taş Kalkanı
      originalCost: 300 + 50, // 350
      discountedCost: 280, // %20 indirim
      description: 'Ejderha Nefesi + Taş Kalkanı',
      color: '#ff4400',
      requiredWave: 1,
      maxWave: 15,
    },
    {
      name: 'Güç Paketi',
      bulletLevel: 2, // Mamut Öfkesi
      shieldIndex: 2, // Demir Kalkanı
      originalCost: 600 + 150, // 750
      discountedCost: 580, // %23 indirim
      description: 'Mamut Öfkesi + Demir Kalkanı',
      color: '#ffcc00',
      requiredWave: 8,
      maxWave: 25,
    },
    
    // Orta Wave Paketleri (Wave 15-50)
    {
      name: 'Savaş Paketi',
      bulletLevel: 4, // Yakhar
      shieldIndex: 4, // Mithril Kalkanı
      originalCost: 1200 + 250, // 1450
      discountedCost: 1100, // %24 indirim
      description: 'Yakhar + Mithril Kalkanı + Bonus Enerji',
      color: '#cc3300',
      requiredWave: 15,
      maxWave: 40,
      bonusEnergy: 50,
    },
    {
      name: 'Elite Savaşçı Paketi',
      bulletLevel: 5, // Ignorak
      shieldIndex: 6, // Kristal Kalkanı
      originalCost: 1800 + 350, // 2150
      discountedCost: 1600, // %26 indirim
      description: 'Ignorak + Kristal Kalkanı + Enerji + Aksiyon',
      color: '#ff0066',
      requiredWave: 25,
      maxWave: 55,
      bonusEnergy: 80,
      bonusActions: 2,
    },
    
    // Geç Wave Paketleri (Wave 40-80)
    {
      name: 'Usta Komutanı Paketi',
      bulletLevel: 6, // Volkanor
      shieldIndex: 8, // Gölge Kalkanı
      originalCost: 2400 + 450, // 2850
      discountedCost: 2050, // %28 indirim
      description: 'Volkanor + Gölge Kalkanı + Tüm Bonuslar',
      color: '#ff6600',
      requiredWave: 40,
      maxWave: 75,
      bonusEnergy: 120,
      bonusActions: 3,
      bonusGold: 500,
    },
    {
      name: 'Efsane Komandan Paketi',
      bulletLevel: 7, // Pyrax
      shieldIndex: 9, // Işık Kalkanı
      originalCost: 3000 + 500, // 3500
      discountedCost: 2450, // %30 indirim
      description: 'Pyrax + Işık Kalkanı + Tüm Maksimum Bonuslar',
      color: '#ff3300',
      requiredWave: 50,
      maxWave: 85,
      bonusEnergy: 180,
      bonusActions: 5,
      bonusGold: 800,
      bonusTowers: 1,
    },
    
    // End Game Paketleri (Wave 70+)
    {
      name: 'Tanrı Savaşçısı Paketi',
      bulletLevel: 8, // Ultimate (Yeni)
      shieldIndex: 9, // Işık Kalkanı
      originalCost: 4500, // Yalnızca şekilsel 
      discountedCost: 3000, // %33 indirim
      description: 'Ultimate Power + Tüm Sistemler + Mega Bonuslar',
      color: '#9933ff',
      requiredWave: 70,
      maxWave: 100,
      bonusEnergy: 300,
      bonusActions: 8,
      bonusGold: 1500,
      bonusTowers: 2,
      specialEffect: 'quantum_boost', // Özel efekt
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

  // Economy constants
  WAVE_GOLD_BONUS_CAP: 7,

  // Energy Management - NEW ADDITION
  ENERGY_BOOST_COST: 150,
  MAX_ENERGY_BOOST_LEVEL: 10,
  MAX_ACTIONS_COST: 200,
  MAX_MAX_ACTIONS_LEVEL: 8,
  ELITE_MODULE_COST: 500,
  MAX_ELITE_MODULE_LEVEL: 5,
  ELITE_COST_MULTIPLIER: 2.5,
  COST_MULTIPLIER: 1.75,

  // Bullet upgrade costs
  BULLET_COST: 120,
  BULLET_COST_MULTIPLIER: 1.8,

  // Package System Weights (Wave-based availability)

  // Defense Upgrade Limits (CRITICAL FIX for unlimited purple cards bug)
  DEFENSE_UPGRADE_LIMITS: {
    MINES: {
      MAX_PURCHASES: 3, // Maximum mine upgrades per game
      MAX_LEVEL: 11,    // Maximum level per upgrade
    },
    WALLS: {
      MAX_PURCHASES: 5, // Maximum wall upgrades per game
      MAX_LEVEL: 8,     // Maximum level per upgrade
    },
  },

  // ✅ NEW: Mine Variety System for Issue #54
  MINE_TYPES: {
    explosive: {
      standard: {
        name: 'Standard Mine',
        description: 'Basic explosive mine with area damage',
        damage: 100,
        radius: 50,
        cost: 150,
        triggerCondition: 'contact' as const,
        icon: '💣'
      },
      cluster: {
        name: 'Cluster Mine',
        description: 'Creates multiple smaller explosions',
        damage: 60,
        radius: 80,
        cost: 200,
        triggerCondition: 'contact' as const,
        subExplosions: 3,
        icon: '🎆'
      }
    },
    utility: {
      emp: {
        name: 'EMP Mine',
        description: 'Disables enemy electronics and shields',
        damage: 50,
        radius: 100,
        cost: 180,
        triggerCondition: 'proximity' as const,
        empDuration: 3000,
        effects: ['disable_electronics', 'disable_shields'],
        icon: '⚡'
      },
      smoke: {
        name: 'Smoke Mine',
        description: 'Creates smoke cloud reducing tower accuracy',
        damage: 0,
        radius: 120,
        cost: 120,
        triggerCondition: 'proximity' as const,
        smokeDuration: 5000,
        effects: ['reduce_accuracy', 'concealment'],
        icon: '💨'
      }
    },
    area_denial: {
      caltrops: {
        name: 'Caltrops',
        description: 'Slows enemies passing through area',
        damage: 20,
        radius: 60,
        cost: 100,
        triggerCondition: 'contact' as const,
        duration: 8000,
        slowMultiplier: 0.5,
        effects: ['slow_movement'],
        icon: '🗡️'
      },
      tar: {
        name: 'Tar Mine',
        description: 'Creates sticky tar pit slowing enemies',
        damage: 10,
        radius: 80,
        cost: 140,
        triggerCondition: 'proximity' as const,
        duration: 10000,
        slowMultiplier: 0.3,
        effects: ['slow_movement', 'damage_over_time'],
        icon: '🖤'
      },
      freeze: {
        name: 'Freeze Mine',
        description: 'Freezes enemies in place temporarily',
        damage: 0,
        radius: 70,
        cost: 160,
        triggerCondition: 'proximity' as const,
        freezeDuration: 2000,
        effects: ['freeze', 'vulnerable_to_fire'],
        icon: '❄️'
      }
    }
  },

  // ✅ NEW: Mine Placement Limits for Issue #54
  MINE_PLACEMENT_LIMITS: {
    MAX_MINES_PER_WAVE: 8, // Maximum total mines that can be placed per wave
    MAX_MINES_PER_TYPE: {
      explosive: 3,
      utility: 2,
      area_denial: 4
    },
    MIN_DISTANCE_BETWEEN_MINES: 100, // Minimum distance between mines
    PLACEMENT_COOLDOWN: 2000, // Cooldown between mine placements (ms)
    STRATEGIC_ZONES: {
      // Different zones have different placement rules
      chokepoint: { maxMines: 2, bonusDamage: 1.5 },
      open_area: { maxMines: 4, bonusDamage: 1.0 },
      tower_vicinity: { maxMines: 1, bonusDamage: 1.2 }
    }
  },

  // ✅ NEW: Environment & Terrain System for Issue #62
  ENVIRONMENT_SYSTEM: {
    // Terrain Types
    TERRAIN_TYPES: {
      lowlands: {
        elevation: 0,
        visibility: 1.0,
        movementSpeed: 1.0,
        towerBonuses: { damage: 0, range: 0, fireRate: 0 },
        coverBonus: 0,
        color: '#90EE90'
      },
      hills: {
        elevation: 50,
        visibility: 1.25,
        movementSpeed: 0.8,
        towerBonuses: { damage: 0.1, range: 0.25, fireRate: 0 },
        coverBonus: 0.25,
        color: '#8B4513'
      },
      plateaus: {
        elevation: 100,
        visibility: 1.5,
        movementSpeed: 0.6,
        towerBonuses: { damage: 0.15, range: 0.5, fireRate: 0 },
        coverBonus: 0.5,
        color: '#A0522D'
      },
      valleys: {
        elevation: -25,
        visibility: 0.85,
        movementSpeed: 1.1,
        towerBonuses: { damage: 0, range: -0.15, fireRate: 0 },
        coverBonus: 0.75,
        color: '#228B22'
      }
    },

    // Weather Types
    WEATHER_TYPES: {
      clear: {
        visibility: 1.0,
        movementPenalty: 0,
        damageModifier: 1.0,
        duration: { min: 60000, max: 120000 },
        color: '#87CEEB',
        effects: []
      },
      rain: {
        visibility: 0.8,
        movementPenalty: 0.1,
        damageModifier: 0.75,
        duration: { min: 30000, max: 90000 },
        color: '#4682B4',
        effects: ['extinguishes_fire', 'reduces_accuracy']
      },
      fog: {
        visibility: 0.5,
        movementPenalty: 0,
        damageModifier: 0.75,
        duration: { min: 45000, max: 75000 },
        color: '#D3D3D3',
        effects: ['stealth_bonus', 'reduces_accuracy']
      },
      storm: {
        visibility: 0.6,
        movementPenalty: 0.2,
        damageModifier: 1.5,
        duration: { min: 20000, max: 60000 },
        color: '#2F4F4F',
        effects: ['lightning_damage', 'grounds_flying_units']
      },
      sandstorm: {
        visibility: 0.4,
        movementPenalty: 0.3,
        damageModifier: 0.5,
        duration: { min: 30000, max: 90000 },
        color: '#F4A460',
        effects: ['jams_mechanical', 'reduces_projectile_accuracy']
      },
      snow: {
        visibility: 0.9,
        movementPenalty: 0.15,
        damageModifier: 1.25,
        duration: { min: 60000, max: 180000 },
        color: '#F0F8FF',
        effects: ['ice_weapon_bonus', 'slippery_surfaces']
      }
    },

    // Time of Day Phases
    TIME_OF_DAY: {
      dawn: {
        lighting: 0.85,
        visibility: 0.85,
        enemyBehavior: 1.2,
        color: '#FFE4B5',
        effects: ['stealth_detection_reduced']
      },
      day: {
        lighting: 1.0,
        visibility: 1.0,
        enemyBehavior: 1.0,
        color: '#FFFFFF',
        effects: []
      },
      dusk: {
        lighting: 0.9,
        visibility: 0.9,
        enemyBehavior: 1.1,
        color: '#FF6347',
        effects: ['transition_bonuses']
      },
      night: {
        lighting: 0.6,
        visibility: 0.6,
        enemyBehavior: 1.3,
        color: '#191970',
        effects: ['stealth_enemies_common', 'night_vision_valuable']
      }
    },

    // Environmental Hazards
    HAZARDS: {
      earthquake: {
        frequency: 300000, // 5 minutes
        duration: 10000,
        effects: ['screen_shake', 'accuracy_reduction', 'structure_damage'],
        warningTime: 10000
      },
      volcanic_activity: {
        frequency: 600000, // 10 minutes
        duration: 180000,
        effects: ['lava_flows', 'ash_clouds', 'fire_weapon_bonus'],
        warningTime: 15000
      },
      solar_flare: {
        frequency: 900000, // 15 minutes
        duration: 30000,
        effects: ['electronic_disruption', 'energy_weapon_disruption'],
        warningTime: 5000
      }
    },

    // Interactive Elements
    INTERACTIVE_ELEMENTS: {
      tree: {
        health: 100,
        strategicValue: 0.3,
        effects: ['cover_bonus', 'line_of_sight_block'],
        resourceDrop: 'materials'
      },
      rock: {
        health: 300,
        strategicValue: 0.5,
        effects: ['pathway_block', 'cover_bonus'],
        resourceDrop: 'materials'
      },
      building: {
        health: 500,
        strategicValue: 0.8,
        effects: ['cover_bonus', 'debris_field'],
        resourceDrop: 'advanced_materials'
      },
      bridge: {
        health: 200,
        strategicValue: 0.9,
        effects: ['pathway_control', 'chokepoint_creation'],
        resourceDrop: 'materials'
      },
      gate: {
        health: 400,
        strategicValue: 0.7,
        effects: ['access_control', 'defensive_position'],
        resourceDrop: 'materials'
      }
    }
  },

  // Spawn Zone System (NEW)
  SPAWN_ZONES: {
    ENABLED: true, // Enable zone-based spawning
    DEBUG_VISIBLE: false, // Show zones visually (separate from general debug)
    PERFORMANCE_LOGGING: true, // Log performance improvements
    FALLBACK_TO_LEGACY: false, // Fallback to edge spawning if needed
  },
  } as const;

// Debug utilities for spawn zone testing
export const toggleDebugMode = () => {
  const constants = GAME_CONSTANTS as { DEBUG_MODE: boolean };
  constants.DEBUG_MODE = !constants.DEBUG_MODE;
  return constants.DEBUG_MODE;
};

export const toggleSpawnZoneDebug = () => {
  const spawnZones = GAME_CONSTANTS.SPAWN_ZONES as { DEBUG_VISIBLE: boolean };
  spawnZones.DEBUG_VISIBLE = !spawnZones.DEBUG_VISIBLE;
  return spawnZones.DEBUG_VISIBLE;
};

// Add to window for easy console access
if (typeof window !== 'undefined') {
  const globalWindow = window as Window & { 
    toggleDebugMode?: () => boolean; 
    toggleSpawnZoneDebug?: () => boolean; 
  };
  globalWindow.toggleDebugMode = toggleDebugMode;
  globalWindow.toggleSpawnZoneDebug = toggleSpawnZoneDebug;
} 