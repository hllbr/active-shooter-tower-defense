/**
 * 💾 SaveManager Test Suite
 * TASK 24: Save/load system improvement & cloud-ready design
 * 
 * Tests:
 * - Data integrity validation
 * - Save/load operations
 * - Cloud sync functionality
 * - Error handling and recovery
 * - Backup management
 * - Performance and memory usage
 */

import { SaveManager, DataIntegrityValidator, CloudSyncManager } from '../game-systems/SaveManager';
import { useGameStore } from '../models/store';
import type { SaveData, SaveSlot, SaveResult, LoadResult } from '../game-systems/SaveManager';
import type { GameState, PlayerProfile } from '../models/gameTypes';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
    get length() {
      return Object.keys(store).length;
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

// Mock useGameStore
jest.mock('../models/store', () => ({
  useGameStore: {
    getState: jest.fn(),
    setState: jest.fn()
  }
}));

describe('SaveManager', () => {
  let saveManager: SaveManager;
  let mockGameState: GameState;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockLocalStorage.clear();

    // Mock game state
    mockGameState = {
      gold: 1000,
      currentWave: 5,
      isGameOver: false,
      isStarted: true,
      isRefreshing: false,
      playerProfile: {
        level: 3,
        experience: 250,
        experienceToNext: 500,
        achievementsCompleted: 2,
        achievementPoints: 150,
        unlockedTitles: ['Beginner'],
        statistics: {
          totalWavesCompleted: 4,
          highestWaveReached: 5,
          totalPlaytime: 1800000, // 30 minutes
          gamesPlayed: 1,
          totalEnemiesKilled: 50,
          totalDamageDealt: 5000,
          perfectWaves: 2,
          totalTowersBuilt: 8,
          totalTowersLost: 1,
          highestTowerLevel: 3,
          totalUpgradesPurchased: 12,
          totalGoldEarned: 2000,
          totalGoldSpent: 1000,
          totalPackagesPurchased: 3,
          bestGoldPerWave: 500,
          speedrunRecords: {},
          efficiencyRecords: {},
          survivalStreaks: [2, 2],
        },
        unlockedCosmetics: ['tower_skin_1'],
        researchPoints: 25,
        permanentBonuses: { damage: 0.1 },
      },
      achievements: {
        'first_blood': {
          id: 'first_blood',
          title: 'First Blood',
          description: 'Kill your first enemy',
          category: 'combat',
          rarity: 'common',
          target: 1,
          progress: 1,
          completed: true,
          completedAt: Date.now(),
          rewards: { type: 'research_points', value: 10, name: 'Research Points', description: 'Gain research points' },
          tracking: { condition: 'enemiesKilled >= 1', trackingFunction: 'enemiesKilled', triggerEvents: ['enemy_killed'] }
        }
      },
      dailyMissions: [
        {
          id: 'daily_kill_10',
          name: 'Kill 10 Enemies',
          description: 'Kill 10 enemies today',
          category: 'combat',
          objective: { type: 'kill_enemies', target: 10, description: 'Kill 10 enemies', trackingKey: 'enemiesKilled' },
          reward: { type: 'gold', amount: 100, description: 'Earn 100 gold' },
          expiresAt: Date.now() + 86400000,
          completed: false,
          progress: 5,
          maxProgress: 10,
          difficulty: 'easy'
        }
      ],
      gameStartTime: Date.now() - 1800000,
    };

    (useGameStore.getState as jest.Mock).mockReturnValue(mockGameState);
    (useGameStore.setState as jest.Mock).mockImplementation((newState) => {
      Object.assign(mockGameState, newState);
    });

    // Create fresh SaveManager instance
    saveManager = SaveManager.getInstance();
  });

  afterEach(() => {
    // Clean up SaveManager
    saveManager.destroy();
  });

  describe('Data Integrity Validation', () => {
    test('should validate correct save data', () => {
      const validSaveData: SaveData = {
        version: '1.0.0',
        timestamp: Date.now(),
        metadata: {
          slotId: 'test_slot',
          name: 'Test Save',
          gameVersion: '1.0.0',
          totalPlaytime: 1800000,
          currentWave: 5,
          playerLevel: 3,
          fileSize: 1024,
          cloudSyncStatus: 'pending',
        },
        gameState: mockGameState,
        playerProfile: mockGameState.playerProfile,
        achievements: mockGameState.achievements,
        dailyMissions: mockGameState.dailyMissions,
        settings: {
          audio: { musicVolume: 0.7, sfxVolume: 0.7, mute: false },
          visual: { healthBarAlwaysVisible: false, performanceMode: 'normal', showDamageNumbers: true, showFPS: false },
          gameplay: { autoSave: true, confirmActions: true, tutorialEnabled: true, difficultyLevel: 'normal' },
          cloud: { autoSync: true, syncOnSave: true, backupEnabled: true },
        },
        statistics: {
          session: {
            startTime: Date.now() - 1800000,
            currentTime: Date.now(),
            totalPlaytime: 1800000,
            wavesCompleted: 4,
            enemiesKilled: 50,
            goldEarned: 2000,
            goldSpent: 1000,
            towersBuilt: 8,
            towersLost: 1,
            upgradesPurchased: 12,
          },
          lifetime: mockGameState.playerProfile.statistics,
          performance: {
            averageFPS: 60,
            lowestFPS: 30,
            memoryUsage: 0,
            saveLoadTimes: [],
            errorCount: 0,
          },
        },
        checksum: '',
      };

      // Calculate checksum
      validSaveData.checksum = DataIntegrityValidator.calculateChecksum(validSaveData);

      const validation = DataIntegrityValidator.validateSaveData(validSaveData);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should detect missing required fields', () => {
      const invalidSaveData: Partial<SaveData> = {
        version: '1.0.0',
        timestamp: Date.now(),
        // Missing metadata, gameState, playerProfile, checksum
      };

      const validation = DataIntegrityValidator.validateSaveData(invalidSaveData as SaveData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Missing game state');
      expect(validation.errors).toContain('Missing player profile');
      expect(validation.errors).toContain('Missing checksum');
    });

    test('should detect invalid game state structure', () => {
      const invalidSaveData: SaveData = {
        version: '1.0.0',
        timestamp: Date.now(),
        metadata: {
          slotId: 'test_slot',
          name: 'Test Save',
          gameVersion: '1.0.0',
          totalPlaytime: 1800000,
          currentWave: 5,
          playerLevel: 3,
          fileSize: 1024,
          cloudSyncStatus: 'pending',
        },
        gameState: {
          ...mockGameState,
          gold: 'invalid', // Should be number
          currentWave: 'invalid', // Should be number
          isGameOver: 'invalid', // Should be boolean
        },
        playerProfile: mockGameState.playerProfile,
        achievements: mockGameState.achievements,
        dailyMissions: mockGameState.dailyMissions,
        settings: {
          audio: { musicVolume: 0.7, sfxVolume: 0.7, mute: false },
          visual: { healthBarAlwaysVisible: false, performanceMode: 'normal', showDamageNumbers: true, showFPS: false },
          gameplay: { autoSave: true, confirmActions: true, tutorialEnabled: true, difficultyLevel: 'normal' },
          cloud: { autoSync: true, syncOnSave: true, backupEnabled: true },
        },
        statistics: {
          session: {
            startTime: Date.now() - 1800000,
            currentTime: Date.now(),
            totalPlaytime: 1800000,
            wavesCompleted: 4,
            enemiesKilled: 50,
            goldEarned: 2000,
            goldSpent: 1000,
            towersBuilt: 8,
            towersLost: 1,
            upgradesPurchased: 12,
          },
          lifetime: mockGameState.playerProfile.statistics,
          performance: {
            averageFPS: 60,
            lowestFPS: 30,
            memoryUsage: 0,
            saveLoadTimes: [],
            errorCount: 0,
          },
        },
        checksum: '',
      };

      const validation = DataIntegrityValidator.validateSaveData(invalidSaveData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Invalid gold value');
      expect(validation.errors).toContain('Invalid current wave');
      expect(validation.errors).toContain('Invalid game over state');
    });

    test('should detect checksum mismatch', () => {
      const saveData: SaveData = {
        version: '1.0.0',
        timestamp: Date.now(),
        metadata: {
          slotId: 'test_slot',
          name: 'Test Save',
          gameVersion: '1.0.0',
          totalPlaytime: 1800000,
          currentWave: 5,
          playerLevel: 3,
          fileSize: 1024,
          cloudSyncStatus: 'pending',
        },
        gameState: mockGameState,
        playerProfile: mockGameState.playerProfile,
        achievements: mockGameState.achievements,
        dailyMissions: mockGameState.dailyMissions,
        settings: {
          audio: { musicVolume: 0.7, sfxVolume: 0.7, mute: false },
          visual: { healthBarAlwaysVisible: false, performanceMode: 'normal', showDamageNumbers: true, showFPS: false },
          gameplay: { autoSave: true, confirmActions: true, tutorialEnabled: true, difficultyLevel: 'normal' },
          cloud: { autoSync: true, syncOnSave: true, backupEnabled: true },
        },
        statistics: {
          session: {
            startTime: Date.now() - 1800000,
            currentTime: Date.now(),
            totalPlaytime: 1800000,
            wavesCompleted: 4,
            enemiesKilled: 50,
            goldEarned: 2000,
            goldSpent: 1000,
            towersBuilt: 8,
            towersLost: 1,
            upgradesPurchased: 12,
          },
          lifetime: mockGameState.playerProfile.statistics,
          performance: {
            averageFPS: 60,
            lowestFPS: 30,
            memoryUsage: 0,
            saveLoadTimes: [],
            errorCount: 0,
          },
        },
        checksum: 'invalid_checksum',
      };

      const validation = DataIntegrityValidator.validateSaveData(saveData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Checksum validation failed');
    });
  });

  describe('Save Operations', () => {
    test('should save game successfully', async () => {
      const result: SaveResult = await saveManager.saveGame('test_slot', 'Test Save');

      expect(result.success).toBe(true);
      expect(result.slotId).toBe('test_slot');
      expect(result.timestamp).toBeGreaterThan(0);
      expect(result.fileSize).toBeGreaterThan(0);
      expect(result.error).toBeUndefined();

      // Verify data was saved to localStorage
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'save_test_slot',
        expect.any(String)
      );

      // Verify backup was created
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        expect.stringMatching(/backup_test_slot_\d+/),
        expect.any(String)
      );
    });

    test('should handle save errors gracefully', async () => {
      // Mock localStorage.setItem to throw error
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage quota exceeded');
      });

      const result: SaveResult = await saveManager.saveGame('test_slot', 'Test Save');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Storage quota exceeded');
    });

    test('should validate save data before saving', async () => {
      // Mock invalid game state
      (useGameStore.getState as jest.Mock).mockReturnValue({
        ...mockGameState,
        gold: 'invalid', // Invalid type
      });

      const result: SaveResult = await saveManager.saveGame('test_slot', 'Test Save');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Data validation failed');
    });
  });

  describe('Load Operations', () => {
    test('should load game successfully', async () => {
      // First save a game
      await saveManager.saveGame('test_slot', 'Test Save');

      // Then load it
      const result: LoadResult = await saveManager.loadGame('test_slot');

      expect(result.success).toBe(true);
      expect(result.saveData).toBeDefined();
      expect(result.saveData?.metadata.slotId).toBe('test_slot');
      expect(result.saveData?.metadata.name).toBe('Test Save');
      expect(result.error).toBeUndefined();

      // Verify game state was restored
      expect(useGameStore.setState).toHaveBeenCalled();
    });

    test('should handle missing save file', async () => {
      const result: LoadResult = await saveManager.loadGame('nonexistent_slot');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Save file not found');
    });

    test('should handle corrupted save data', async () => {
      // Save corrupted data directly to localStorage
      mockLocalStorage.setItem('save_corrupted_slot', 'invalid json data');

      const result: LoadResult = await saveManager.loadGame('corrupted_slot');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid save file format');
      expect(result.corruptedData).toBe(true);
    });

    test('should repair corrupted data when possible', async () => {
      // Create save data with missing player profile
      const corruptedData: SaveData = {
        version: '1.0.0',
        timestamp: Date.now(),
        metadata: {
          slotId: 'repair_test_slot',
          name: 'Repair Test',
          gameVersion: '1.0.0',
          totalPlaytime: 1800000,
          currentWave: 5,
          playerLevel: 3,
          fileSize: 1024,
          cloudSyncStatus: 'pending',
        },
        gameState: mockGameState,
        playerProfile: null as PlayerProfile | null, // Missing player profile
        achievements: mockGameState.achievements,
        dailyMissions: mockGameState.dailyMissions,
        settings: {
          audio: { musicVolume: 0.7, sfxVolume: 0.7, mute: false },
          visual: { healthBarAlwaysVisible: false, performanceMode: 'normal', showDamageNumbers: true, showFPS: false },
          gameplay: { autoSave: true, confirmActions: true, tutorialEnabled: true, difficultyLevel: 'normal' },
          cloud: { autoSync: true, syncOnSave: true, backupEnabled: true },
        },
        statistics: {
          session: {
            startTime: Date.now() - 1800000,
            currentTime: Date.now(),
            totalPlaytime: 1800000,
            wavesCompleted: 4,
            enemiesKilled: 50,
            goldEarned: 2000,
            goldSpent: 1000,
            towersBuilt: 8,
            towersLost: 1,
            upgradesPurchased: 12,
          },
          lifetime: mockGameState.playerProfile.statistics,
          performance: {
            averageFPS: 60,
            lowestFPS: 30,
            memoryUsage: 0,
            saveLoadTimes: [],
            errorCount: 0,
          },
        },
        checksum: '',
      };

      mockLocalStorage.setItem('save_repair_test_slot', JSON.stringify(corruptedData));

      const result: LoadResult = await saveManager.loadGame('repair_test_slot');

      expect(result.success).toBe(true);
      expect(result.saveData?.playerProfile).toBeDefined();
      expect(result.saveData?.playerProfile.level).toBe(1); // Default value
    });
  });

  describe('Save Slot Management', () => {
    test('should list available save slots', async () => {
      // Create multiple saves
      await saveManager.saveGame('slot_1', 'Save 1');
      await saveManager.saveGame('slot_2', 'Save 2');
      await saveManager.saveGame('slot_3', 'Save 3');

      const slots: SaveSlot[] = saveManager.getSaveSlots();

      expect(slots).toHaveLength(3);
      expect(slots.map(s => s.slotId)).toContain('slot_1');
      expect(slots.map(s => s.slotId)).toContain('slot_2');
      expect(slots.map(s => s.slotId)).toContain('slot_3');
      expect(slots.map(s => s.name)).toContain('Save 1');
      expect(slots.map(s => s.name)).toContain('Save 2');
      expect(slots.map(s => s.name)).toContain('Save 3');
    });

    test('should delete save slots', async () => {
      // Create a save
      await saveManager.saveGame('delete_test_slot', 'Delete Test');

      // Verify it exists
      let slots = saveManager.getSaveSlots();
      expect(slots.find(s => s.slotId === 'delete_test_slot')).toBeDefined();

      // Delete it
      const success = saveManager.deleteSave('delete_test_slot');
      expect(success).toBe(true);

      // Verify it's gone
      slots = saveManager.getSaveSlots();
      expect(slots.find(s => s.slotId === 'delete_test_slot')).toBeUndefined();
    });

    test('should handle corrupted slots gracefully', () => {
      // Add corrupted data to localStorage
      mockLocalStorage.setItem('save_corrupted_slot', 'invalid json');

      const slots: SaveSlot[] = saveManager.getSaveSlots();

      // Corrupted slot should be skipped
      expect(slots.find(s => s.slotId === 'corrupted_slot')).toBeUndefined();
    });
  });

  describe('Cloud Sync Functionality', () => {
    test('should prepare data for cloud sync', () => {
      const cloudSyncManager = CloudSyncManager.getInstance();
      
      const saveData: SaveData = {
        version: '1.0.0',
        timestamp: Date.now(),
        metadata: {
          slotId: 'cloud_test_slot',
          name: 'Cloud Test',
          gameVersion: '1.0.0',
          totalPlaytime: 1800000,
          currentWave: 5,
          playerLevel: 3,
          fileSize: 1024,
          cloudSyncStatus: 'disabled',
        },
        gameState: mockGameState,
        playerProfile: mockGameState.playerProfile,
        achievements: mockGameState.achievements,
        dailyMissions: mockGameState.dailyMissions,
        settings: {
          audio: { musicVolume: 0.7, sfxVolume: 0.7, mute: false },
          visual: { healthBarAlwaysVisible: false, performanceMode: 'normal', showDamageNumbers: true, showFPS: false },
          gameplay: { autoSave: true, confirmActions: true, tutorialEnabled: true, difficultyLevel: 'normal' },
          cloud: { autoSync: true, syncOnSave: true, backupEnabled: true },
        },
        statistics: {
          session: {
            startTime: Date.now() - 1800000,
            currentTime: Date.now(),
            totalPlaytime: 1800000,
            wavesCompleted: 4,
            enemiesKilled: 50,
            goldEarned: 2000,
            goldSpent: 1000,
            towersBuilt: 8,
            towersLost: 1,
            upgradesPurchased: 12,
          },
          lifetime: mockGameState.playerProfile.statistics,
          performance: {
            averageFPS: 60,
            lowestFPS: 30,
            memoryUsage: 0,
            saveLoadTimes: [],
            errorCount: 0,
          },
        },
        checksum: '',
      };

      const cloudData = cloudSyncManager.prepareForCloudSync(saveData);

      expect(cloudData.metadata.cloudSyncStatus).toBe('pending');
      expect(cloudData.metadata.lastSyncTimestamp).toBeDefined();
    });

    test('should get cloud sync status', () => {
      const cloudSyncManager = CloudSyncManager.getInstance();
      
      // Create a save with cloud sync status
      const saveData: SaveData = {
        version: '1.0.0',
        timestamp: Date.now(),
        metadata: {
          slotId: 'status_test_slot',
          name: 'Status Test',
          gameVersion: '1.0.0',
          totalPlaytime: 1800000,
          currentWave: 5,
          playerLevel: 3,
          fileSize: 1024,
          cloudSyncStatus: 'synced',
        },
        gameState: mockGameState,
        playerProfile: mockGameState.playerProfile,
        achievements: mockGameState.achievements,
        dailyMissions: mockGameState.dailyMissions,
        settings: {
          audio: { musicVolume: 0.7, sfxVolume: 0.7, mute: false },
          visual: { healthBarAlwaysVisible: false, performanceMode: 'normal', showDamageNumbers: true, showFPS: false },
          gameplay: { autoSave: true, confirmActions: true, tutorialEnabled: true, difficultyLevel: 'normal' },
          cloud: { autoSync: true, syncOnSave: true, backupEnabled: true },
        },
        statistics: {
          session: {
            startTime: Date.now() - 1800000,
            currentTime: Date.now(),
            totalPlaytime: 1800000,
            wavesCompleted: 4,
            enemiesKilled: 50,
            goldEarned: 2000,
            goldSpent: 1000,
            towersBuilt: 8,
            towersLost: 1,
            upgradesPurchased: 12,
          },
          lifetime: mockGameState.playerProfile.statistics,
          performance: {
            averageFPS: 60,
            lowestFPS: 30,
            memoryUsage: 0,
            saveLoadTimes: [],
            errorCount: 0,
          },
        },
        checksum: '',
      };

      mockLocalStorage.setItem('save_status_test_slot', JSON.stringify(saveData));

      const status = cloudSyncManager.getSyncStatus('status_test_slot');
      expect(status).toBe('synced');
    });
  });

  describe('Performance and Memory', () => {
    test('should handle large save data efficiently', async () => {
      // Create large game state
      const largeGameState = {
        ...mockGameState,
        // Add large arrays to simulate complex game state
        enemies: Array.from({ length: 1000 }, (_, i) => ({
          id: `enemy_${i}`,
          position: { x: Math.random() * 1000, y: Math.random() * 1000 },
          health: 100,
          maxHealth: 100,
          speed: 1,
          goldValue: 10,
          color: '#ff0000',
          damage: 10,
          isActive: true,
          size: 20,
        })),
        bullets: Array.from({ length: 500 }, (_, i) => ({
          id: `bullet_${i}`,
          position: { x: Math.random() * 1000, y: Math.random() * 1000 },
          size: 5,
          isActive: true,
          speed: 10,
          damage: 20,
          direction: { x: 1, y: 0 },
          color: '#ffff00',
          typeIndex: 0,
          life: 100,
        })),
      };

      (useGameStore.getState as jest.Mock).mockReturnValue(largeGameState);

      const startTime = performance.now();
      const result: SaveResult = await saveManager.saveGame('large_save_test', 'Large Save Test');
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result.fileSize).toBeGreaterThan(0);
    });

    test('should clean up resources properly', () => {
      // Mock setInterval and clearInterval
      const mockClearInterval = jest.fn();
      jest.spyOn(global, 'clearInterval').mockImplementation(mockClearInterval);

      saveManager.destroy();

      expect(mockClearInterval).toHaveBeenCalled();
    });
  });

  describe('Error Recovery', () => {
    test('should recover from localStorage errors', async () => {
      // Mock localStorage to fail intermittently
      let callCount = 0;
      mockLocalStorage.setItem.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Temporary storage error');
        }
      });

      const result: SaveResult = await saveManager.saveGame('recovery_test_slot', 'Recovery Test');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Temporary storage error');
    });

    test('should handle JSON parsing errors', async () => {
      // Save invalid JSON
      mockLocalStorage.setItem('save_invalid_json_slot', '{ invalid json }');

      const result: LoadResult = await saveManager.loadGame('invalid_json_slot');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid save file format');
      expect(result.corruptedData).toBe(true);
    });
  });
}); 