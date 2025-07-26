/**
 * 🌦️ Weather Effects Market System
 * Players can purchase weather effect cards with clear descriptions
 */

import { useGameStore } from '../../models/store';
import { playSound } from '../../utils/sound/soundEffects';
import { toast } from 'react-toastify';
// Logger import removed for production

import type { Enemy } from '../../models/gameTypes';
import { weatherManager } from '../weather';

export interface WeatherEffectCard {
  id: string;
  name: string;
  description: string;
  effectType: 'offensive' | 'defensive' | 'utility';
  icon: string;
  duration: number; // milliseconds
  cost: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  effect: WeatherEffect;
}

export interface WeatherEffect {
  type: 'explosion' | 'slow_enemies' | 'time_dilation' | 'healing_rain' | 'lightning_storm' | 'frost_wave';
  intensity: number; // 0-1
  areaSize: number; // radius in pixels
  damageAmount?: number;
  slowAmount?: number; // 0-1
  healAmount?: number;
  visualEffect: {
    color: string;
    particleCount: number;
    animationType: 'simple' | 'minimal';
  };
}

// ⚡ AVAILABLE WEATHER EFFECT CARDS
export const WEATHER_EFFECT_CARDS: WeatherEffectCard[] = [
  // 💥 OFFENSIVE CARDS
  {
    id: 'explosion_burst',
    name: 'Patlama Yağmuru',
    description: '🧨 Ekranda rastgele patlamalar oluşturur - Düşmanlara hasar verir',
    effectType: 'offensive',
    icon: '💥',
    duration: 15000, // 15 seconds
    cost: 150,
    rarity: 'common',
    effect: {
      type: 'explosion',
      intensity: 0.7,
      areaSize: 80,
      damageAmount: 50,
      visualEffect: {
        color: '#FF6B35',
        particleCount: 5,
        animationType: 'simple'
      }
    }
  },
  {
    id: 'lightning_storm',
    name: 'Şimşek Fırtınası',
    description: '⚡ Güçlü şimşekler düşmanları vurur - Zincir hasar etkisi',
    effectType: 'offensive',
    icon: '⚡',
    duration: 20000,
    cost: 300,
    rarity: 'rare',
    effect: {
      type: 'lightning_storm',
      intensity: 0.8,
      areaSize: 120,
      damageAmount: 80,
      visualEffect: {
        color: '#00FFFF',
        particleCount: 3,
        animationType: 'simple'
      }
    }
  },

  // 🛡️ DEFENSIVE CARDS
  {
    id: 'slow_mist',
    name: 'Yavaşlatma Sisi',
    description: '🌫️ Tüm düşmanları yavaşlatır - Hareket hızını %50 azaltır',
    effectType: 'defensive',
    icon: '🌫️',
    duration: 25000,
    cost: 200,
    rarity: 'common',
    effect: {
      type: 'slow_enemies',
      intensity: 0.5,
      areaSize: 999, // Global effect
      slowAmount: 0.5,
      visualEffect: {
        color: '#A0AEC0',
        particleCount: 8,
        animationType: 'minimal'
      }
    }
  },
  {
    id: 'frost_wave',
    name: 'Don Dalgası',
    description: '❄️ Düşmanları donduruyor - Kısa süre hareket edemezler',
    effectType: 'defensive',
    icon: '❄️',
    duration: 12000,
    cost: 400,
    rarity: 'epic',
    effect: {
      type: 'frost_wave',
      intensity: 0.9,
      areaSize: 200,
      slowAmount: 0.9,
      visualEffect: {
        color: '#E6FFFA',
        particleCount: 12,
        animationType: 'simple'
      }
    }
  },

  // 🔧 UTILITY CARDS
  {
    id: 'time_slow',
    name: 'Zaman Yavaşlatma',
    description: '🕰️ Oyun hızını %30 yavaşlatır - Daha iyi kontrol sağlar',
    effectType: 'utility',
    icon: '🕰️',
    duration: 10000,
    cost: 500,
    rarity: 'epic',
    effect: {
      type: 'time_dilation',
      intensity: 0.3,
      areaSize: 0, // Global effect
      visualEffect: {
        color: '#805AD5',
        particleCount: 4,
        animationType: 'minimal'
      }
    }
  },
  {
    id: 'healing_rain',
    name: 'İyileştirici Yağmur',
    description: '🌧️ Kulelerinizi iyileştirir - Hasar almış kuleleri tamir eder',
    effectType: 'utility',
    icon: '🌧️',
    duration: 18000,
    cost: 250,
    rarity: 'rare',
    effect: {
      type: 'healing_rain',
      intensity: 0.6,
      areaSize: 100,
      healAmount: 30,
      visualEffect: {
        color: '#68D391',
        particleCount: 6,
        animationType: 'simple'
      }
    }
  }
];

export class WeatherEffectMarket {
  private ownedCards: Set<string> = new Set();
  private activeEffects: Map<string, {
    card: WeatherEffectCard;
    startTime: number;
    endTime: number;
  }> = new Map();
  // Track last wave activation to enforce once-per-wave usage
  private lastActivatedWave: Map<string, number> = new Map();

  /**
   * Get available cards for purchase (not owned)
   */
  getAvailableCards(): WeatherEffectCard[] {
    return WEATHER_EFFECT_CARDS.filter(card => !this.ownedCards.has(card.id));
  }

  /**
   * Get owned cards that can be activated
   */
  getOwnedCards(): WeatherEffectCard[] {
    return WEATHER_EFFECT_CARDS.filter(card => this.ownedCards.has(card.id));
  }

  /**
   * Purchase a weather effect card
   */
  purchaseCard(cardId: string): boolean {
    const card = WEATHER_EFFECT_CARDS.find(c => c.id === cardId);
    if (!card) {
      // Weather card not found
      return false;
    }

    const { gold, spendGold } = useGameStore.getState();
    
    if (gold < card.cost) {
      playSound('error');
      return false;
    }

    if (this.ownedCards.has(cardId)) {
      // Card already owned
      return false;
    }

    // Purchase the card
    spendGold(card.cost);
    this.ownedCards.add(cardId);
    
    playSound('coin-collect');
    // Weather card purchased
    
    return true;
  }

  /**
   * Activate a weather effect
   */
  activateEffect(cardId: string): boolean {
    const card = WEATHER_EFFECT_CARDS.find(c => c.id === cardId);
    if (!card || !this.ownedCards.has(cardId)) {
      return false;
    }

    // Check if already active
    if (this.activeEffects.has(cardId)) {
      // Effect already active
      return false;
    }

    const now = performance.now();
    this.activeEffects.set(cardId, {
      card,
      startTime: now,
      endTime: now + card.duration
    });

    // Apply the effect to the game
    this.applyWeatherEffect(card);
    
    playSound('energy-recharge');
    // Weather effect activated
    
    return true;
  }

  /**
   * Apply weather effect to the game world
   */
  private applyWeatherEffect(card: WeatherEffectCard): void {
    const { effect } = card;
    const gameState = useGameStore.getState();

    switch (effect.type) {
      case 'explosion':
        this.createExplosionBurst(effect);
        break;
      
      case 'slow_enemies':
        this.applyEnemySlow(effect);
        break;
      
      case 'time_dilation':
        this.applyTimeDilation(effect);
        break;
      
      case 'healing_rain':
        this.applyHealingRain(effect);
        break;
      
      case 'lightning_storm':
        this.createLightningStorm(effect);
        break;
      
      case 'frost_wave':
        this.applyFrostWave(effect);
        break;
    }

    // Update weather state for visual effects using WeatherManager
    const weatherType = this.getWeatherTypeFromEffect(effect.type);
    weatherManager.addWeatherEffect(weatherType, effect.intensity, card.duration);
    
    // Update store state
    gameState.updateWeatherState({
      ...gameState.weatherState,
      currentWeather: weatherType,
      weatherIntensity: effect.intensity,
      startTime: performance.now(),
      duration: card.duration
    });
  }

  /**
   * Create simple explosion effects
   */
  private createExplosionBurst(effect: WeatherEffect): void {
    const explosionCount = Math.floor(effect.intensity * 8) + 3; // 3-11 explosions
    
    for (let i = 0; i < explosionCount; i++) {
      setTimeout(() => {
        const x = Math.random() * 1920;
        const y = Math.random() * 1080;
        
        // Create simple explosion effect
        const explosionEffect = {
          id: `weather_explosion_${Date.now()}_${i}`,
          position: { x, y },
          radius: effect.areaSize * 0.5, // Smaller for performance
          color: effect.visualEffect.color,
          life: 800,
          maxLife: 800,
          type: 'explosion'
        };
        
        useGameStore.getState().addEffect(explosionEffect);
        
        // Apply damage to enemies in area
        this.damageEnemiesInArea({ x, y }, effect.areaSize, effect.damageAmount || 0);
        
      }, i * 1000 + Math.random() * 500); // Spread explosions over time
    }
  }

     /**
    * Apply enemy slow effect
    */
   private applyEnemySlow(effect: WeatherEffect): void {
     const { enemies } = useGameStore.getState();
     
     enemies.forEach(enemy => {
       // Apply slow debuff by modifying enemy speed directly
       if (enemy.speed) {
         enemy.speed = enemy.speed * (1 - (effect.slowAmount || 0.5));
       }
       
       // Mark enemy as affected by weather effect
       const enemyWithEffects = enemy as Enemy & { weatherEffects?: Array<{ type: string; intensity: number; duration: number; startTime: number }> };
       if (!enemyWithEffects.weatherEffects) {
         enemyWithEffects.weatherEffects = [];
       }
       enemyWithEffects.weatherEffects.push({
         type: 'slow',
         intensity: effect.slowAmount || 0.5,
         duration: 25000,
         startTime: performance.now()
       });
     });
   }

  /**
   * Apply time dilation effect
   */
  private applyTimeDilation(effect: WeatherEffect): void {
    // This would slow down the game loop temporarily
    // Implementation would depend on how the game loop is structured
    // Time dilation applied
  }

  /**
   * Apply healing rain to towers
   */
  private applyHealingRain(effect: WeatherEffect): void {
    const { towerSlots } = useGameStore.getState();
    
    towerSlots.forEach(slot => {
      if (slot.tower && slot.tower.health < slot.tower.maxHealth) {
        slot.tower.health = Math.min(
          slot.tower.maxHealth,
          slot.tower.health + (effect.healAmount || 30)
        );
        
        // Create healing effect
        const healEffect = {
          id: `heal_${Date.now()}_${slot.tower.id}`,
          position: { x: slot.x, y: slot.y },
          radius: 30,
          color: effect.visualEffect.color,
          life: 2000,
          maxLife: 2000,
          type: 'healing'
        };
        
        useGameStore.getState().addEffect(healEffect);
      }
    });
  }

  /**
   * Create lightning storm effects
   */
  private createLightningStorm(effect: WeatherEffect): void {
    const { enemies } = useGameStore.getState();
    const targetCount = Math.min(enemies.length, Math.floor(effect.intensity * 6) + 2);
    
    for (let i = 0; i < targetCount; i++) {
      setTimeout(() => {
        const target = enemies[Math.floor(Math.random() * enemies.length)];
        if (target) {
          // Create lightning effect
          const lightningEffect = {
            id: `lightning_${Date.now()}_${i}`,
            position: target.position,
            radius: 40,
            color: effect.visualEffect.color,
            life: 400,
            maxLife: 400,
            type: 'lightning'
          };
          
          useGameStore.getState().addEffect(lightningEffect);
          
          // Apply damage
          this.damageEnemiesInArea(target.position, effect.areaSize, effect.damageAmount || 0);
        }
      }, i * 800);
    }
  }

  /**
   * Apply frost wave effect
   */
  private applyFrostWave(effect: WeatherEffect): void {
    const centerX = 960; // Screen center
    const centerY = 540;
    
    // Create frost wave visual
    const frostEffect = {
      id: `frost_wave_${Date.now()}`,
      position: { x: centerX, y: centerY },
      radius: effect.areaSize,
      color: effect.visualEffect.color,
      life: 3000,
      maxLife: 3000,
      type: 'frost_wave'
    };
    
    useGameStore.getState().addEffect(frostEffect);
    
    // Apply freeze to all enemies
    this.applyEnemySlow(effect);
  }

  /**
   * Damage enemies in area
   */
  private damageEnemiesInArea(center: { x: number; y: number }, radius: number, damage: number): void {
    const { enemies, damageEnemy } = useGameStore.getState();
    
    enemies.forEach(enemy => {
      const distance = Math.sqrt(
        Math.pow(enemy.position.x - center.x, 2) + 
        Math.pow(enemy.position.y - center.y, 2)
      );
      
      if (distance <= radius) {
        damageEnemy(enemy.id, damage);
      }
    });
  }

  /**
   * Get active effects
   */
  getActiveEffects(): Array<{ card: WeatherEffectCard; timeRemaining: number }> {
    const now = performance.now();
    const active = [];
    
    for (const [cardId, effectData] of this.activeEffects.entries()) {
      if (now < effectData.endTime) {
        active.push({
          card: effectData.card,
          timeRemaining: effectData.endTime - now
        });
      } else {
        this.activeEffects.delete(cardId);
      }
    }
    
    return active;
  }

  /**
   * Update active effects (call this from game loop)
   */
  update(): void {
    const now = performance.now();

    for (const [cardId, effectData] of this.activeEffects.entries()) {
      if (now >= effectData.endTime) {
        this.activeEffects.delete(cardId);
        // Weather effect expired
      }
    }
  }

  /**
   * Automatically activate all owned effects at wave start
   */
  autoActivateEffects(currentWave: number): void {
    const cardsToActivate = WEATHER_EFFECT_CARDS.filter(c =>
      this.ownedCards.has(c.id) && this.lastActivatedWave.get(c.id) !== currentWave
    );

    let delay = 0;
    for (const card of cardsToActivate) {
      setTimeout(() => {
        toast.info(`${card.name} hava yükseltmesi devreye alındı.`);
        if (this.activateEffect(card.id)) {
          toast.info(`${card.name} hava yükseltmesi uygulanıyor.`);
          this.lastActivatedWave.set(card.id, currentWave);
          setTimeout(() => {
            toast.info(`${card.name} hava yükseltmesi süresi doldu.`);
          }, card.duration);
        }
      }, delay);
      delay += card.duration + 1000; // küçük boşlukla sırayla başlat
    }
  }

  /**
   * Get weather type for visual effects
   */
  private getWeatherTypeFromEffect(effectType: string): 'clear' | 'rain' | 'fog' | 'storm' {
    switch (effectType) {
      case 'explosion':
      case 'lightning_storm':
        return 'storm';
      case 'slow_enemies':
      case 'frost_wave':
        return 'fog';
      case 'healing_rain':
        return 'rain';
      default:
        return 'clear';
    }
  }

  /**
   * Get card by rarity color
   */
  static getCardRarityColor(rarity: string): string {
    switch (rarity) {
      case 'common': return '#9CA3AF';
      case 'rare': return '#3B82F6';
      case 'epic': return '#8B5CF6';
      case 'legendary': return '#F59E0B';
      default: return '#9CA3AF';
    }
  }
}

// Export singleton instance
export const weatherEffectMarket = new WeatherEffectMarket(); 