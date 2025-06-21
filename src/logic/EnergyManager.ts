import { GAME_CONSTANTS } from '../utils/Constants';

export interface EnergyLog {
  time: number;
  action: string;
  delta: number;
  remaining: number;
}

export type EnergyListener = (energy: number, log: EnergyLog) => void;

class EnergyManager {
  private energy = GAME_CONSTANTS.BASE_ENERGY;
  private history: EnergyLog[] = [];
  private listeners: EnergyListener[] = [];
  private setState: ((energy: number, warning?: string | null) => void) | null = null;

  init(initial: number, setState: (energy: number, warning?: string | null) => void) {
    this.energy = initial;
    this.history = [];
    this.setState = setState;
  }

  onChange(listener: EnergyListener) {
    this.listeners.push(listener);
  }

  getEnergy() {
    return this.energy;
  }

  getHistory() {
    return this.history;
  }

  consume(amount: number, action: string): boolean {
    if (this.energy < amount) {
      if (GAME_CONSTANTS.DEBUG_MODE) {
        console.log(`[EnergyManager] Insufficient energy for ${action} (need ${amount}, have ${this.energy})`);
      }
      if (this.setState) this.setState(this.energy, `Not enough energy for ${action}`);
      return false;
    }
    this.energy -= amount;
    const log = { time: performance.now(), action, delta: -amount, remaining: this.energy };
    this.history.push(log);
    if (this.setState) this.setState(this.energy, null);
    if (GAME_CONSTANTS.DEBUG_MODE) {
      console.log(`[EnergyManager] ${action} -${amount} => ${this.energy}`);
    }
    this.listeners.forEach(l => l(this.energy, log));
    return true;
  }

  add(amount: number, action = 'regen') {
    this.energy += amount;
    const log = { time: performance.now(), action, delta: amount, remaining: this.energy };
    this.history.push(log);
    if (this.setState) this.setState(this.energy, null);
    if (GAME_CONSTANTS.DEBUG_MODE) {
      console.log(`[EnergyManager] ${action} +${amount} => ${this.energy}`);
    }
    this.listeners.forEach(l => l(this.energy, log));
  }
}

export const energyManager = new EnergyManager();
