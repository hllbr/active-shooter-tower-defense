import { GAME_CONSTANTS } from '../utils/constants';
import { playSound } from '../utils/sound/soundEffects';
import { toast } from 'react-toastify';
import type { Tower, TowerSlot } from '../models/gameTypes';

/**
 * Fire Hazard Manager
 * Handles random fire events on towers with extinguishing mechanics
 */
export class FireHazardManager {
  private static lastCheckWave = 0;
  private static burningTowers = new Set<string>();

  /**
   * Check if a fire hazard should occur this wave
   */
  static shouldTriggerFireHazard(currentWave: number): boolean {
    // Check every few waves
    if (currentWave - this.lastCheckWave < GAME_CONSTANTS.FIRE_HAZARD.CHECK_INTERVAL) {
      return false;
    }

    // Random probability check
    const shouldTrigger = Math.random() < GAME_CONSTANTS.FIRE_HAZARD.PROBABILITY_PER_WAVE;
    
    if (shouldTrigger) {
      this.lastCheckWave = currentWave;
    }
    
    return shouldTrigger;
  }

  /**
   * Start a fire on a random tower
   */
  static startFireHazard(towerSlots: TowerSlot[]): string | null {
    // Find towers that can catch fire (not already burning)
    const availableTowers = towerSlots.filter(slot => 
      slot.tower && 
      !slot.tower.fireHazard?.isBurning &&
      !this.burningTowers.has(slot.tower.id)
    );

    if (availableTowers.length === 0) {
      return null;
    }

    // Select a random tower
    const randomIndex = Math.floor(Math.random() * availableTowers.length);
    const targetSlot = availableTowers[randomIndex];
    const tower = targetSlot.tower!;

    // Start fire hazard
    tower.fireHazard = {
      isBurning: true,
      startTime: performance.now(),
      timeLimit: GAME_CONSTANTS.FIRE_HAZARD.TIME_LIMIT,
      extinguisherClicked: false
    };

    this.burningTowers.add(tower.id);

    // Play alarm sound
    playSound(GAME_CONSTANTS.FIRE_HAZARD.ALARM_SOUND);
    
    // Show warning toast
    toast.warning('🔥 Fire hazard detected! Click the extinguisher to save the tower!', {
      autoClose: 5000,
      position: 'top-center'
    });

    return tower.id;
  }

  /**
   * Extinguish fire on a tower
   */
  static extinguishFire(tower: Tower): boolean {
    if (!tower.fireHazard?.isBurning) {
      return false;
    }

    // Mark as extinguished
    tower.fireHazard.extinguisherClicked = true;
    tower.fireHazard.isBurning = false;
    this.burningTowers.delete(tower.id);

    // Play success sound
    playSound(GAME_CONSTANTS.FIRE_HAZARD.EXTINGUISH_SOUND);
    
    // Show success toast
    toast.success('🧯 Fire extinguished! Tower saved!', {
      autoClose: 3000
    });

    return true;
  }

  /**
   * Check if fire time limit has expired and destroy tower
   */
  static checkFireTimeLimit(tower: Tower): boolean {
    if (!tower.fireHazard?.isBurning) {
      return false;
    }

    const elapsed = performance.now() - tower.fireHazard.startTime;
    if (elapsed >= tower.fireHazard.timeLimit) {
      // Fire time limit expired - tower is destroyed
      this.burningTowers.delete(tower.id);
      
      // Play explosion sound
      playSound(GAME_CONSTANTS.FIRE_HAZARD.DESTROY_SOUND);
      
      // Show destruction toast
      toast.error('💥 Tower destroyed by fire!', {
        autoClose: 4000
      });

      return true; // Tower should be destroyed
    }

    return false;
  }

  /**
   * Get remaining time for fire hazard
   */
  static getRemainingTime(tower: Tower): number {
    if (!tower.fireHazard?.isBurning) {
      return 0;
    }

    const elapsed = performance.now() - tower.fireHazard.startTime;
    return Math.max(0, tower.fireHazard.timeLimit - elapsed);
  }

  /**
   * Check if tower is currently burning
   */
  static isTowerBurning(tower: Tower): boolean {
    return tower.fireHazard?.isBurning ?? false;
  }

  /**
   * Get all currently burning towers
   */
  static getBurningTowers(): Set<string> {
    return new Set(this.burningTowers);
  }

  /**
   * Reset fire hazard state (for new game)
   */
  static reset(): void {
    this.lastCheckWave = 0;
    this.burningTowers.clear();
  }
} 