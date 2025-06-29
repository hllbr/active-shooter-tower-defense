"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACHIEVEMENT_SERIES = void 0;
// ===== ACHIEVEMENT SERIES =====
exports.ACHIEVEMENT_SERIES = [
    {
        id: 'wave_progression',
        name: 'Dalga Savaşçısı Serisi',
        description: 'Dalgalarda ilerleyerek deneyim kazan',
        category: 'progression',
        achievements: ['wave_survivor_10', 'wave_survivor_25', 'wave_survivor_50', 'wave_survivor_100'],
        seriesReward: {
            type: 'unlock',
            value: 1,
            name: 'Master Commander',
            description: 'Tüm wave serisi tamamlandı! Master Commander unvanı açıldı!'
        }
    },
    {
        id: 'fire_mastery',
        name: 'Ateş Ustası Serisi',
        description: 'Ateş gücünde ustalaş',
        category: 'upgrade',
        achievements: ['fire_master_5', 'fire_master_15'],
        seriesReward: {
            type: 'cosmetic',
            value: 1,
            name: 'Ateş Efekti',
            description: 'Özel ateş efektleri açıldı!'
        }
    },
    {
        id: 'shield_mastery',
        name: 'Kalkan Ustası Serisi',
        description: 'Savunmada ustalaş',
        category: 'upgrade',
        achievements: ['shield_defender_5', 'shield_defender_10'],
        seriesReward: {
            type: 'cosmetic',
            value: 1,
            name: 'Kalkan Efekti',
            description: 'Özel kalkan efektleri açıldı!'
        }
    },
    {
        id: 'economy_mastery',
        name: 'Ekonomi Ustası Serisi',
        description: 'Ekonomide ustalaş',
        category: 'economy',
        achievements: ['package_collector_10', 'package_collector_25'],
        seriesReward: {
            type: 'bonus',
            value: 50,
            name: 'Ekonomi Bonusu',
            description: '+50% kalıcı ekonomi bonusu!'
        }
    },
    {
        id: 'building_mastery',
        name: 'İnşaatçı Ustası Serisi',
        description: 'İnşaatta ustalaş',
        category: 'building',
        achievements: ['tower_builder_5', 'tower_builder_10'],
        seriesReward: {
            type: 'unlock',
            value: 1,
            name: 'Advanced Building',
            description: 'Gelişmiş inşaat seçenekleri açıldı!'
        }
    },
    {
        id: 'combat_mastery',
        name: 'Savaş Ustası Serisi',
        description: 'Savaşta ustalaş',
        category: 'combat',
        achievements: ['enemy_slayer_100', 'enemy_slayer_1000'],
        seriesReward: {
            type: 'bonus',
            value: 100,
            name: 'Combat Master',
            description: '+100% savaş deneyimi bonusu!'
        }
    }
];
