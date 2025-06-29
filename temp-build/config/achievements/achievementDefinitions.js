"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACHIEVEMENT_DEFINITIONS = void 0;
// ===== ACHIEVEMENT DEFINITIONS =====
exports.ACHIEVEMENT_DEFINITIONS = [
    // PROGRESSION CATEGORY
    {
        id: 'wave_survivor_10',
        title: '🌊 Acemi Savaşçı',
        description: '10 dalgaya kadar hayatta kal',
        category: 'progression',
        rarity: 'common',
        target: 10,
        progress: 0,
        completed: false,
        series: 'wave_progression',
        rewards: {
            type: 'research_points',
            value: 50,
            name: 'Araştırma Puanı',
            description: '+50 araştırma puanı kazandın!'
        },
        tracking: {
            condition: 'currentWave >= target',
            trackingFunction: 'trackWaveProgress',
            triggerEvents: ['wave_completed']
        }
    },
    {
        id: 'wave_survivor_25',
        title: '🌊 Veteran Komutan',
        description: '25 dalgaya kadar hayatta kal',
        category: 'progression',
        rarity: 'rare',
        target: 25,
        progress: 0,
        completed: false,
        series: 'wave_progression',
        rewards: {
            type: 'title',
            value: 1,
            name: 'Veteran',
            description: 'Yeni unvan: Veteran Komutan!'
        },
        tracking: {
            condition: 'currentWave >= target',
            trackingFunction: 'trackWaveProgress',
            triggerEvents: ['wave_completed']
        }
    },
    {
        id: 'wave_survivor_50',
        title: '🌊 Elite Stratejist',
        description: '50 dalgaya kadar hayatta kal',
        category: 'progression',
        rarity: 'epic',
        target: 50,
        progress: 0,
        completed: false,
        series: 'wave_progression',
        rewards: {
            type: 'bonus',
            value: 15,
            name: 'Enerji Bonusu',
            description: '+15% kalıcı enerji bonusu!',
            permanent: true
        },
        tracking: {
            condition: 'currentWave >= target',
            trackingFunction: 'trackWaveProgress',
            triggerEvents: ['wave_completed']
        }
    },
    {
        id: 'wave_survivor_100',
        title: '🌊 Efsanevi Defender',
        description: '100 dalgaya kadar hayatta kal',
        category: 'progression',
        rarity: 'legendary',
        target: 100,
        progress: 0,
        completed: false,
        series: 'wave_progression',
        rewards: {
            type: 'unlock',
            value: 1,
            name: 'Prestij Sistemi',
            description: 'Prestij sistemi açıldı!'
        },
        tracking: {
            condition: 'currentWave >= target',
            trackingFunction: 'trackWaveProgress',
            triggerEvents: ['wave_completed']
        }
    },
    // UPGRADE CATEGORY
    {
        id: 'fire_master_5',
        title: '🔥 Ateş Çırağı',
        description: '5 ateş yükseltmesi satın al',
        category: 'upgrade',
        rarity: 'common',
        target: 5,
        progress: 0,
        completed: false,
        series: 'fire_mastery',
        rewards: {
            type: 'research_points',
            value: 25,
            name: 'Araştırma Puanı',
            description: '+25 araştırma puanı kazandın!'
        },
        tracking: {
            condition: 'fireUpgradesPurchased >= target',
            trackingFunction: 'trackFireUpgrades',
            triggerEvents: ['fire_upgrade_purchased']
        }
    },
    {
        id: 'fire_master_15',
        title: '🔥 Ateş Uzmanı',
        description: '15 ateş yükseltmesi satın al',
        category: 'upgrade',
        rarity: 'rare',
        target: 15,
        progress: 0,
        completed: false,
        series: 'fire_mastery',
        rewards: {
            type: 'bonus',
            value: 10,
            name: 'Hasar Bonusu',
            description: '+10% kalıcı hasar bonusu!',
            permanent: true
        },
        tracking: {
            condition: 'fireUpgradesPurchased >= target',
            trackingFunction: 'trackFireUpgrades',
            triggerEvents: ['fire_upgrade_purchased']
        }
    },
    {
        id: 'shield_defender_5',
        title: '🛡️ Kalkan Çırağı',
        description: '5 kalkan yükseltmesi satın al',
        category: 'upgrade',
        rarity: 'common',
        target: 5,
        progress: 0,
        completed: false,
        series: 'shield_mastery',
        rewards: {
            type: 'research_points',
            value: 25,
            name: 'Araştırma Puanı',
            description: '+25 araştırma puanı kazandın!'
        },
        tracking: {
            condition: 'shieldUpgradesPurchased >= target',
            trackingFunction: 'trackShieldUpgrades',
            triggerEvents: ['shield_upgrade_purchased']
        }
    },
    {
        id: 'shield_defender_10',
        title: '🛡️ Kalkan Ustası',
        description: '10 kalkan yükseltmesi satın al',
        category: 'upgrade',
        rarity: 'rare',
        target: 10,
        progress: 0,
        completed: false,
        series: 'shield_mastery',
        rewards: {
            type: 'bonus',
            value: 20,
            name: 'Savunma Bonusu',
            description: '+20% kalıcı duvar gücü bonusu!',
            permanent: true
        },
        tracking: {
            condition: 'shieldUpgradesPurchased >= target',
            trackingFunction: 'trackShieldUpgrades',
            triggerEvents: ['shield_upgrade_purchased']
        }
    },
    // ECONOMY CATEGORY
    {
        id: 'package_collector_10',
        title: '📦 Paket Toplayıcısı',
        description: '10 paket satın al',
        category: 'economy',
        rarity: 'common',
        target: 10,
        progress: 0,
        completed: false,
        series: 'economy_mastery',
        rewards: {
            type: 'research_points',
            value: 30,
            name: 'Araştırma Puanı',
            description: '+30 araştırma puanı kazandın!'
        },
        tracking: {
            condition: 'packagesPurchased >= target',
            trackingFunction: 'trackPackagePurchases',
            triggerEvents: ['package_purchased']
        }
    },
    {
        id: 'package_collector_25',
        title: '📦 Paket Koleksiyoncusu',
        description: '25 paket satın al',
        category: 'economy',
        rarity: 'rare',
        target: 25,
        progress: 0,
        completed: false,
        series: 'economy_mastery',
        rewards: {
            type: 'bonus',
            value: 25,
            name: 'Altın Bonusu',
            description: '+25% kalıcı altın bonusu!',
            permanent: true
        },
        tracking: {
            condition: 'packagesPurchased >= target',
            trackingFunction: 'trackPackagePurchases',
            triggerEvents: ['package_purchased']
        }
    },
    {
        id: 'gold_spender_10k',
        title: '💰 Büyük Spender',
        description: '10,000 altın harca',
        category: 'economy',
        rarity: 'rare',
        target: 10000,
        progress: 0,
        completed: false,
        rewards: {
            type: 'title',
            value: 1,
            name: 'Büyük Spender',
            description: 'Yeni unvan: Büyük Spender!'
        },
        tracking: {
            condition: 'totalGoldSpent >= target',
            trackingFunction: 'trackGoldSpending',
            triggerEvents: ['gold_spent']
        }
    },
    // BUILDING CATEGORY
    {
        id: 'tower_builder_5',
        title: '🏰 Acemi İnşaatçı',
        description: 'Aynı anda 5 kule inşa et',
        category: 'building',
        rarity: 'common',
        target: 5,
        progress: 0,
        completed: false,
        series: 'building_mastery',
        rewards: {
            type: 'research_points',
            value: 20,
            name: 'Araştırma Puanı',
            description: '+20 araştırma puanı kazandın!'
        },
        tracking: {
            condition: 'activeTowers >= target',
            trackingFunction: 'trackActiveTowers',
            triggerEvents: ['tower_built', 'tower_destroyed']
        }
    },
    {
        id: 'tower_builder_10',
        title: '🏰 Usta İnşaatçı',
        description: 'Aynı anda 10 kule inşa et',
        category: 'building',
        rarity: 'rare',
        target: 10,
        progress: 0,
        completed: false,
        series: 'building_mastery',
        rewards: {
            type: 'bonus',
            value: 1,
            name: 'Kule Slotu',
            description: '+1 maksimum kule slotu!',
            permanent: true
        },
        tracking: {
            condition: 'activeTowers >= target',
            trackingFunction: 'trackActiveTowers',
            triggerEvents: ['tower_built', 'tower_destroyed']
        }
    },
    {
        id: 'tower_level_25',
        title: '🏰 Efsanevi Mimar',
        description: 'Bir kuleyi 25. seviyeye çıkar',
        category: 'building',
        rarity: 'epic',
        target: 25,
        progress: 0,
        completed: false,
        rewards: {
            type: 'cosmetic',
            value: 1,
            name: 'Efsanevi Kule Görünümü',
            description: 'Özel kule görünümü açıldı!'
        },
        tracking: {
            condition: 'maxTowerLevel >= target',
            trackingFunction: 'trackMaxTowerLevel',
            triggerEvents: ['tower_upgraded']
        }
    },
    // COMBAT CATEGORY
    {
        id: 'enemy_slayer_100',
        title: '⚔️ Düşman Avcısı',
        description: '100 düşman öldür',
        category: 'combat',
        rarity: 'common',
        target: 100,
        progress: 0,
        completed: false,
        series: 'combat_mastery',
        rewards: {
            type: 'research_points',
            value: 40,
            name: 'Araştırma Puanı',
            description: '+40 araştırma puanı kazandın!'
        },
        tracking: {
            condition: 'totalEnemiesKilled >= target',
            trackingFunction: 'trackEnemyKills',
            triggerEvents: ['enemy_killed']
        }
    },
    {
        id: 'enemy_slayer_1000',
        title: '⚔️ Katil Makine',
        description: '1,000 düşman öldür',
        category: 'combat',
        rarity: 'rare',
        target: 1000,
        progress: 0,
        completed: false,
        series: 'combat_mastery',
        rewards: {
            type: 'bonus',
            value: 15,
            name: 'Kritik Vuruş Şansı',
            description: '+15% kritik vuruş şansı!',
            permanent: true
        },
        tracking: {
            condition: 'totalEnemiesKilled >= target',
            trackingFunction: 'trackEnemyKills',
            triggerEvents: ['enemy_killed']
        }
    },
    {
        id: 'perfect_wave_5',
        title: '🛡️ Mükemmel Savunma',
        description: '5 dalgayı hiç kule kaybetmeden tamamla',
        category: 'combat',
        rarity: 'epic',
        target: 5,
        progress: 0,
        completed: false,
        rewards: {
            type: 'title',
            value: 1,
            name: 'Mükemmel Defender',
            description: 'Yeni unvan: Mükemmel Defender!'
        },
        tracking: {
            condition: 'perfectWaves >= target',
            trackingFunction: 'trackPerfectWaves',
            triggerEvents: ['wave_completed']
        }
    },
    // SPECIAL CATEGORY
    {
        id: 'dice_master',
        title: '🎲 Zar Ustası',
        description: '10 kez zar at',
        category: 'special',
        rarity: 'common',
        target: 10,
        progress: 0,
        completed: false,
        rewards: {
            type: 'bonus',
            value: 10,
            name: 'Şans Bonusu',
            description: '+10% daha iyi zar sonuçları!',
            permanent: true
        },
        tracking: {
            condition: 'diceRolls >= target',
            trackingFunction: 'trackDiceRolls',
            triggerEvents: ['dice_rolled']
        }
    },
    {
        id: 'energy_efficient',
        title: '⚡ Enerji Uzmanı',
        description: 'Bir wave boyunca enerji limitine ulaş',
        category: 'special',
        rarity: 'rare',
        target: 1,
        progress: 0,
        completed: false,
        rewards: {
            type: 'bonus',
            value: 20,
            name: 'Enerji Verimi',
            description: '+20% enerji verimi bonusu!',
            permanent: true
        },
        tracking: {
            condition: 'energyMaxReached >= target',
            trackingFunction: 'trackEnergyUsage',
            triggerEvents: ['energy_limit_reached']
        }
    },
    // DEFENSE CATEGORY
    {
        id: 'mine_master_3',
        title: '💣 Mayın Ustası',
        description: 'Maksimum mayın yükseltmesi al',
        category: 'defense',
        rarity: 'rare',
        target: 3,
        progress: 0,
        completed: false,
        rewards: {
            type: 'bonus',
            value: 30,
            name: 'Mayın Hasarı',
            description: '+30% mayın hasarı bonusu!',
            permanent: true
        },
        tracking: {
            condition: 'mineUpgrades >= target',
            trackingFunction: 'trackMineUpgrades',
            triggerEvents: ['mine_upgrade_purchased']
        }
    },
    {
        id: 'wall_fortress',
        title: '🏰 Kale Lordu',
        description: 'Maksimum duvar yükseltmesi al',
        category: 'defense',
        rarity: 'rare',
        target: 5,
        progress: 0,
        completed: false,
        rewards: {
            type: 'bonus',
            value: 25,
            name: 'Duvar Gücü',
            description: '+25% duvar gücü bonusu!',
            permanent: true
        },
        tracking: {
            condition: 'wallUpgrades >= target',
            trackingFunction: 'trackWallUpgrades',
            triggerEvents: ['wall_upgrade_purchased']
        }
    },
    // SECRET ACHIEVEMENTS (hidden: true)
    {
        id: 'secret_speedrun',
        title: '⚡ Hızlı ve Öfkeli',
        description: '5 dalgayı 2 dakikada tamamla',
        category: 'special',
        rarity: 'legendary',
        target: 1,
        progress: 0,
        completed: false,
        hidden: true,
        rewards: {
            type: 'title',
            value: 1,
            name: 'Speedrunner',
            description: 'Gizli unvan: Speedrunner!'
        },
        tracking: {
            condition: 'speedrunRecord <= 120000', // 2 minutes in ms
            trackingFunction: 'trackSpeedrun',
            triggerEvents: ['wave_completed']
        }
    }
];
