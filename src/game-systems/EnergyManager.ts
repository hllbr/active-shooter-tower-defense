import { GAME_CONSTANTS } from '../utils/constants';

export interface EnergyLog {
  time: number;
  action: string;
  delta: number;
  remaining: number;
}

export type EnergyListener = (energy: number, log: EnergyLog) => void;

// User-friendly Turkish energy messages
const ENERGY_MESSAGES: Record<string, string> = {
  'ability_rapid_fire': '⚡ Hızlı Ateş için yeterli enerji yok!',
  'ability_multi_shot': '⚡ Çoklu Atış için yeterli enerji yok!',
  'ability_chain_lightning': '⚡ Zincir Şimşeği için yeterli enerji yok!',
  'ability_freeze': '⚡ Dondurucu Güç için yeterli enerji yok!',
  'ability_burn': '⚡ Yakıcı Güç için yeterli enerji yok!',
  'ability_acid': '⚡ Asit Saldırısı için yeterli enerji yok!',
  'ability_quantum': '⚡ Kuantum Gücü için yeterli enerji yok!',
  'ability_nano': '⚡ Nano Sürü için yeterli enerji yok!',
  'ability_psi': '⚡ Psi Gücü için yeterli enerji yok!',
  'ability_time_warp': '⚡ Zaman Büküm için yeterli enerji yok!',
  'ability_god_mode': '⚡ Tanrı Modu için yeterli enerji yok!',
  'buildTower': '🏗️ Kule inşa etmek için yeterli enerji yok!',
  'upgradeTower': '⬆️ Kule yükseltmek için yeterli enerji yok!',
  'relocateTower': '🔄 Kule taşımak için yeterli enerji yok!',
  'specialAbility': '✨ Özel yetenek için yeterli enerji yok!',
};

class EnergyManager {
  private energy: number = GAME_CONSTANTS.BASE_ENERGY;
  private maxEnergy = 100; // Default max energy
  private history: EnergyLog[] = [];
  private listeners: EnergyListener[] = [];
  private setState: ((energy: number, warning?: string | null) => void) | null = null;

  init(initial: number, setState: (energy: number, warning?: string | null) => void, maxEnergy: number = 100) {
    this.energy = Math.min(initial, maxEnergy); // Ensure initial energy doesn't exceed max
    this.maxEnergy = maxEnergy;
    this.history = [];
    this.setState = setState;
  }

  onChange(listener: EnergyListener) {
    this.listeners.push(listener);
  }

  getEnergy() {
    return this.energy;
  }

  getMaxEnergy() {
    return this.maxEnergy;
  }

  setMaxEnergy(max: number) {
    this.maxEnergy = max;
    // If current energy exceeds new max, adjust it
    if (this.energy > max) {
      this.energy = max;
      if (this.setState) this.setState(this.energy, null);
    }
  }

  getHistory() {
    return this.history;
  }

  consume(amount: number, action: string, gameState?: { calculateEnergyStats: () => { efficiency: number } }): boolean {
    // CRITICAL FIX: Apply energy efficiency from upgrades
    let finalAmount = amount;
    if (gameState) {
      const efficiency = gameState.calculateEnergyStats().efficiency;
      finalAmount = Math.max(1, Math.ceil(amount * (1 - efficiency)));
      
      if (GAME_CONSTANTS.DEBUG_MODE && finalAmount !== amount) {
      }
    }
    
    if (this.energy < finalAmount) {
      if (GAME_CONSTANTS.DEBUG_MODE) {
      }
      
      // ✅ CRITICAL FIX: User-friendly Turkish energy messages
      const userMessage = ENERGY_MESSAGES[action] || `⚡ ${action} için yeterli enerji yok!`;
      if (this.setState) this.setState(this.energy, userMessage);
      return false;
    }
    this.energy -= finalAmount;
    // Float precision düzeltmesi
    this.energy = Number((this.energy).toFixed(2));
    const log = { time: performance.now(), action, delta: -finalAmount, remaining: this.energy };
    this.history.push(log);
    if (this.setState) this.setState(this.energy, null);
    if (GAME_CONSTANTS.DEBUG_MODE) {
    }
    this.listeners.forEach(l => l(this.energy, log));
    return true;
  }

  add(amount: number, action = 'regen') {
    // CRITICAL FIX: Prevent energy overflow by capping at maxEnergy
    this.energy = Math.min(this.energy + amount, this.maxEnergy);
    // Float precision düzeltmesi
    this.energy = Number((this.energy).toFixed(2));
    const log = { time: performance.now(), action, delta: amount, remaining: this.energy };
    this.history.push(log);
    if (this.setState) this.setState(this.energy, null);
    if (GAME_CONSTANTS.DEBUG_MODE) {
    }
    this.listeners.forEach(l => l(this.energy, log));
  }

  // CRITICAL FIX: Add missing tick function for passive energy regeneration
  tick(deltaTime: number) {
    if (!deltaTime || isNaN(deltaTime) || deltaTime <= 0) return;
    
    // Pasif enerji rejenerasyonu - saniye başına
    const regenPerSecond = GAME_CONSTANTS.ENERGY_REGEN_PASSIVE || 0.5;
    const regenAmount = (deltaTime / 1000) * regenPerSecond;
    
    if (regenAmount > 0 && this.energy < this.maxEnergy) {
      this.add(regenAmount, 'passiveRegen');
    }
  }

  // CRITICAL FIX: Add setEnergy function to directly set energy value
  setEnergy(value: number) {
    if (isNaN(value) || value < 0) {
      console.warn('⚠️ EnergyManager: Invalid energy value, resetting to 0:', value);
      value = 0;
    }
    
    this.energy = Math.min(value, this.maxEnergy);
    this.energy = Number(this.energy.toFixed(2));
    
    if (this.setState) {
      this.setState(this.energy, null);
    }
    
  }

  // CRITICAL FIX: Reset function to fix NaN issues
  reset() {
    this.energy = GAME_CONSTANTS.BASE_ENERGY || 100;
    this.maxEnergy = 100;
    this.history = [];
    
    if (this.setState) {
      this.setState(this.energy, null);
    }
    
  }
}

export const energyManager = new EnergyManager();
