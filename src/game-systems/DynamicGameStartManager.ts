import type { TowerClass, TowerSlot } from '../models/gameTypes';
import { useGameStore } from '../models/store';

/**
 * Dynamic Game Start Manager
 * Handles random tower placement, tower type unlocking, and visual feedback
 * for a more dynamic and varied game start experience
 */
export class DynamicGameStartManager {
  private static readonly TOWER_CLASSES: TowerClass[] = [
    'sniper',
    'gatling', 
    'laser',
    'mortar',
    'flamethrower',
    'radar',
    'supply_depot',
    'shield_generator',
    'repair_station',
    'emp',
    'stealth_detector',
    'air_defense'
  ];

  private static readonly TOWER_NAMES: Record<TowerClass, string> = {
    sniper: 'Sniper',
    gatling: 'Gatling',
    laser: 'Laser',
    mortar: 'Mortar',
    flamethrower: 'Flamethrower',
    radar: 'Radar',
    supply_depot: 'Supply Depot',
    shield_generator: 'Shield Generator',
    repair_station: 'Repair Station',
    emp: 'EMP',
    stealth_detector: 'Stealth Detector',
    air_defense: 'Air Defense'
  };

  /**
   * Initialize dynamic game start with random tower placement
   */
  static initializeDynamicGameStart(): void {
    const { towerSlots, buildTower, unlockAllTowerTypes, setFirstTowerInfo, gameReadyForWaves } = useGameStore.getState();

    // Unlock all tower types from the beginning
    unlockAllTowerTypes();

    // Only trigger wave spawning if gameReadyForWaves is true
    if (!gameReadyForWaves) return;

    // Place random tower on random valid position
    this.placeRandomStarterTower(towerSlots, buildTower, setFirstTowerInfo);
  }

  /**
   * Unlock all tower types for immediate availability
   */
  private static unlockAllTowerTypes(): void {
    const { unlockAllTowerTypes } = useGameStore.getState();
    unlockAllTowerTypes();
  }

  /**
   * Place a random tower on a random valid position
   */
  private static placeRandomStarterTower(
    towerSlots: TowerSlot[],
    buildTower: (slotIdx: number, free: boolean, towerType: 'attack' | 'economy', towerClass?: TowerClass) => void,
    setFirstTowerInfo: (info: { towerClass: TowerClass; towerName: string; slotIndex: number }) => void
  ): void {
    // Find all unlocked empty slots
    const availableSlots = towerSlots
      .map((slot, index) => ({ slot, index }))
      .filter(({ slot }) => slot.unlocked && !slot.tower);

    if (availableSlots.length === 0) {
      // No available slots for random tower placement
      return;
    }

    // Select random slot
    const randomSlotIndex = Math.floor(Math.random() * availableSlots.length);
    const selectedSlot = availableSlots[randomSlotIndex];

    // Select random tower class
    const randomTowerClassIndex = Math.floor(Math.random() * this.TOWER_CLASSES.length);
    const selectedTowerClass = this.TOWER_CLASSES[randomTowerClassIndex];
    const selectedTowerName = this.TOWER_NAMES[selectedTowerClass];

    // Place the tower
    buildTower(selectedSlot.index, true, 'attack', selectedTowerClass);

    // Set first tower info for visual feedback
    setFirstTowerInfo({
      towerClass: selectedTowerClass,
      towerName: selectedTowerName,
      slotIndex: selectedSlot.index
    });

            // Tower placed successfully
  }

  /**
   * Get all available tower classes
   */
  static getAllTowerClasses(): TowerClass[] {
    return [...this.TOWER_CLASSES];
  }

  /**
   * Get tower name by class
   */
  static getTowerName(towerClass: TowerClass): string {
    return this.TOWER_NAMES[towerClass];
  }

  /**
   * Check if a tower class is available (always true since all are unlocked)
   */
  static isTowerClassAvailable(_towerClass: TowerClass): boolean {
    return true; // All tower classes are available from the start
  }

  /**
   * Get random tower class for variety
   */
  static getRandomTowerClass(): TowerClass {
    const randomIndex = Math.floor(Math.random() * this.TOWER_CLASSES.length);
    return this.TOWER_CLASSES[randomIndex];
  }

  /**
   * Get tower class by category for strategic placement
   */
  static getTowerClassesByCategory(category: 'assault' | 'area_control' | 'support' | 'defensive' | 'specialist'): TowerClass[] {
    const categoryMap: Record<string, TowerClass[]> = {
      assault: ['sniper', 'gatling', 'laser'],
      area_control: ['mortar', 'flamethrower'],
      support: ['radar', 'supply_depot'],
      defensive: ['shield_generator', 'repair_station'],
      specialist: ['emp', 'stealth_detector', 'air_defense']
    };

    return categoryMap[category] || [];
  }
} 