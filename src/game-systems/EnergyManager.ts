import { GAME_CONSTANTS } from '../utils/constants';

export interface EnergyLog {
  time: number;
  action: string;
  delta: number;
  remaining: number;
}

export interface EnergyCooldownState {
  isActive: boolean;
  startTime: number;
  duration: number;
  remainingTime: number;
  reason: string;
}

export interface EnergyStats {
  current: number;
  max: number;
  passiveRegen: number;
  killBonus: number;
  efficiency: number;
  cooldownState: EnergyCooldownState;
}

export type EnergyListener = (energy: number, log: EnergyLog) => void;
export type CooldownListener = (cooldownState: EnergyCooldownState) => void;

// Performance-optimized energy messages
const ENERGY_MESSAGES: Record<string, string> = {
  buildTower: '⚡ Kule inşa etmek için yeterli enerji yok!',
  upgradeTower: '⚡ Kule yükseltmek için yeterli enerji yok!',
  relocateTower: '⚡ Kule taşımak için yeterli enerji yok!',
  specialAbility: '⚡ Özel yetenek kullanmak için yeterli enerji yok!',
  wall: '⚡ Duvar inşa etmek için yeterli enerji yok!',
  trench: '⚡ Hendek kazmak için yeterli enerji yok!',
  buff: '⚡ Güçlendirme uygulamak için yeterli enerji yok!',
  default: '⚡ Bu işlem için yeterli enerji yok!'
};

class EnergyManager {
  private energy: number = GAME_CONSTANTS.BASE_ENERGY;
  private maxEnergy = 100;
  private history: EnergyLog[] = [];
  private listeners: EnergyListener[] = [];
  private cooldownListeners: CooldownListener[] = [];
  private setState: ((energy: number, warning?: string | null) => void) | null = null;
  
  // Cooldown system
  private cooldownState: EnergyCooldownState = {
    isActive: false,
    startTime: 0,
    duration: 0,
    remainingTime: 0,
    reason: ''
  };
  
  // Performance optimization
  private lastUpdateTime = 0;
  private updateThrottle = 16; // ~60fps

  init(initial: number, setState: (energy: number, warning?: string | null) => void, maxEnergy: number = 100): void {
    this.energy = Math.min(initial, maxEnergy);
    this.maxEnergy = maxEnergy;
    this.history = [];
    this.setState = setState;
    this.lastUpdateTime = performance.now();
  }

  onChange(listener: EnergyListener): void {
    this.listeners.push(listener);
  }

  onCooldownChange(listener: CooldownListener): void {
    this.cooldownListeners.push(listener);
  }

  getEnergy(): number {
    return this.energy;
  }

  getMaxEnergy(): number {
    return this.maxEnergy;
  }

  getCooldownState(): EnergyCooldownState {
    return { ...this.cooldownState };
  }

  getEnergyStats(): EnergyStats {
    return {
      current: this.energy,
      max: this.maxEnergy,
      passiveRegen: GAME_CONSTANTS.ENERGY_REGEN_PASSIVE || 0.5,
      killBonus: GAME_CONSTANTS.ENERGY_REGEN_KILL || 2,
      efficiency: 0, // Will be calculated by store
      cooldownState: this.getCooldownState()
    };
  }

  setMaxEnergy(max: number): void {
    this.maxEnergy = max;
    if (this.energy > max) {
      this.energy = max;
      this.updateState(this.energy, null);
    }
  }

  getHistory(): readonly EnergyLog[] {
    return [...this.history];
  }

  private updateCooldownState(newState: Partial<EnergyCooldownState>): void {
    this.cooldownState = { ...this.cooldownState, ...newState };
    this.cooldownListeners.forEach(listener => listener(this.cooldownState));
  }

  private startCooldown(duration: number, reason: string): void {
    const now = performance.now();
    this.updateCooldownState({
      isActive: true,
      startTime: now,
      duration,
      remainingTime: duration,
      reason
    });
  }

  private updateCooldownTimer(deltaTime: number): void {
    if (!this.cooldownState.isActive) return;

    this.cooldownState.remainingTime = Math.max(0, this.cooldownState.remainingTime - deltaTime);
    
    if (this.cooldownState.remainingTime <= 0) {
      this.updateCooldownState({
        isActive: false,
        startTime: 0,
        duration: 0,
        remainingTime: 0,
        reason: ''
      });
    } else {
      this.cooldownListeners.forEach(listener => listener(this.cooldownState));
    }
  }

  private updateState(energy: number, warning: string | null): void {
    const now = performance.now();
    
    // Throttle updates for performance
    if (now - this.lastUpdateTime < this.updateThrottle) {
      return;
    }
    
    this.lastUpdateTime = now;
    
    if (this.setState) {
      this.setState(energy, warning);
    }
  }

  consume(amount: number, action: string, gameState?: { calculateEnergyStats: () => { efficiency: number } }): boolean {
    // Apply energy efficiency from upgrades
    let finalAmount = amount;
    if (gameState) {
      const efficiency = gameState.calculateEnergyStats().efficiency;
      finalAmount = Math.max(1, Math.ceil(amount * (1 - efficiency)));
    }
    
    if (this.energy < finalAmount) {
      // Start cooldown when energy is insufficient
      const cooldownDuration = Math.min(5000, 1000 + (finalAmount - this.energy) * 100);
      this.startCooldown(cooldownDuration, action);
      
      const userMessage = ENERGY_MESSAGES[action] || ENERGY_MESSAGES.default;
      this.updateState(this.energy, userMessage);
      return false;
    }
    
    this.energy -= finalAmount;
    this.energy = Number(this.energy.toFixed(2));
    
    const log: EnergyLog = { 
      time: performance.now(), 
      action, 
      delta: -finalAmount, 
      remaining: this.energy 
    };
    
    this.history.push(log);
    this.updateState(this.energy, null);
    this.listeners.forEach(l => l(this.energy, log));
    
    return true;
  }

  add(amount: number, action = 'regen'): void {
    this.energy = Math.min(this.energy + amount, this.maxEnergy);
    this.energy = Number(this.energy.toFixed(2));
    
    const log: EnergyLog = { 
      time: performance.now(), 
      action, 
      delta: amount, 
      remaining: this.energy 
    };
    
    this.history.push(log);
    this.updateState(this.energy, null);
    this.listeners.forEach(l => l(this.energy, log));
  }

  tick(deltaTime: number): void {
    if (!deltaTime || isNaN(deltaTime) || deltaTime <= 0) return;
    
    // Update cooldown timer
    this.updateCooldownTimer(deltaTime);
    
    // Passive energy regeneration
    const regenPerSecond = GAME_CONSTANTS.ENERGY_REGEN_PASSIVE || 0.5;
    const regenAmount = (deltaTime / 1000) * regenPerSecond;
    
    if (regenAmount > 0 && this.energy < this.maxEnergy) {
      this.add(regenAmount, 'passiveRegen');
    }
  }

  setEnergy(value: number): void {
    if (isNaN(value) || value < 0) {
      value = 0;
    }
    
    this.energy = Math.min(value, this.maxEnergy);
    this.energy = Number(this.energy.toFixed(2));
    this.updateState(this.energy, null);
  }

  reset(): void {
    this.energy = GAME_CONSTANTS.BASE_ENERGY || 100;
    this.maxEnergy = 100;
    this.history = [];
    this.updateCooldownState({
      isActive: false,
      startTime: 0,
      duration: 0,
      remainingTime: 0,
      reason: ''
    });
    this.updateState(this.energy, null);
  }

  // Performance optimization: Clear old history
  cleanup(): void {
    const maxHistorySize = 100;
    if (this.history.length > maxHistorySize) {
      this.history = this.history.slice(-maxHistorySize);
    }
  }
}

export const energyManager = new EnergyManager();
