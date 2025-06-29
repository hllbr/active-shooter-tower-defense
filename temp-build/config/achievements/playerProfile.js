"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInitialPlayerProfile = void 0;
// ===== INITIAL PLAYER PROFILE =====
const createInitialPlayerProfile = () => ({
    level: 1,
    experience: 0,
    experienceToNext: 1000,
    achievementsCompleted: 0,
    achievementPoints: 0,
    unlockedTitles: ['Çaylak'], // Starting title
    activeTitle: 'Çaylak',
    statistics: {
        totalWavesCompleted: 0,
        highestWaveReached: 0,
        totalPlaytime: 0,
        gamesPlayed: 0,
        totalEnemiesKilled: 0,
        totalDamageDealt: 0,
        perfectWaves: 0,
        totalTowersBuilt: 0,
        totalTowersLost: 0,
        highestTowerLevel: 0,
        totalUpgradesPurchased: 0,
        totalGoldEarned: 0,
        totalGoldSpent: 0,
        totalPackagesPurchased: 0,
        bestGoldPerWave: 0,
        speedrunRecords: {},
        efficiencyRecords: {},
        survivalStreaks: []
    },
    unlockedCosmetics: [],
    researchPoints: 0,
    permanentBonuses: {}
});
exports.createInitialPlayerProfile = createInitialPlayerProfile;
