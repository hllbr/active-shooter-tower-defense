/**
 * 🌍 Environment & Terrain System Manager
 * Issue #62: Terrain ve Environment Sistemi
 */

import type { 
  TerrainTile, 
  WeatherState, 
  TimeOfDayState, 
  EnvironmentalHazard, 
  InteractiveElement,
  Position,
  Effect
} from '../../models/gameTypes';
import { GAME_CONSTANTS } from '../../utils/constants';

export class EnvironmentManager {
  private terrainTiles: TerrainTile[] = [];
  private weatherState: WeatherState;
  private timeOfDayState: TimeOfDayState;
  private environmentalHazards: EnvironmentalHazard[] = [];
  private interactiveElements: InteractiveElement[] = [];
  private lastUpdate: number = 0;

  constructor() {
    this.weatherState = this.initializeWeatherState();
    this.timeOfDayState = this.initializeTimeOfDayState();
    this.generateTerrain();
    this.generateInteractiveElements();
  }

  /**
   * Initialize weather state
   */
  private initializeWeatherState(): WeatherState {
    return {
      currentWeather: 'clear',
      weatherIntensity: 0,
      visibility: 1.0,
      movementPenalty: 0,
      damageModifier: 1.0,
      duration: 60000,
      startTime: performance.now(),
      transitionTime: 0
    };
  }

  /**
   * Initialize time of day state
   */
  private initializeTimeOfDayState(): TimeOfDayState {
    return {
      currentPhase: 'day',
      cycleProgress: 0.5,
      lightingIntensity: 1.0,
      visibilityModifier: 1.0,
      enemyBehaviorModifier: 1.0
    };
  }

  /**
   * Generate terrain tiles
   */
  private generateTerrain(): void {
    const terrainTypes = Object.keys(GAME_CONSTANTS.ENVIRONMENT_SYSTEM.TERRAIN_TYPES) as Array<keyof typeof GAME_CONSTANTS.ENVIRONMENT_SYSTEM.TERRAIN_TYPES>;
    const gridSize = 50; // 50x50 grid
    const tileSize = 40;

    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const terrainType = terrainTypes[Math.floor(Math.random() * terrainTypes.length)];
        const terrainConfig = GAME_CONSTANTS.ENVIRONMENT_SYSTEM.TERRAIN_TYPES[terrainType];

        const tile: TerrainTile = {
          id: `terrain_${x}_${y}`,
          position: { x: x * tileSize, y: y * tileSize },
          terrainType,
          elevation: terrainConfig.elevation,
          isDestructible: Math.random() < 0.1, // 10% chance to be destructible
          health: terrainConfig.elevation > 0 ? 200 : 100,
          maxHealth: terrainConfig.elevation > 0 ? 200 : 100,
          coverBonus: terrainConfig.coverBonus,
          movementPenalty: 1 - terrainConfig.movementSpeed,
          visibilityBonus: terrainConfig.visibility - 1,
          towerBonus: terrainConfig.towerBonuses
        };

        this.terrainTiles.push(tile);
      }
    }
  }

  /**
   * Generate interactive elements
   */
  private generateInteractiveElements(): void {
    const elementTypes = Object.keys(GAME_CONSTANTS.ENVIRONMENT_SYSTEM.INTERACTIVE_ELEMENTS) as Array<keyof typeof GAME_CONSTANTS.ENVIRONMENT_SYSTEM.INTERACTIVE_ELEMENTS>;
    
    // Generate 20-30 interactive elements
    const elementCount = Math.floor(Math.random() * 11) + 20;
    
    for (let i = 0; i < elementCount; i++) {
      const elementType = elementTypes[Math.floor(Math.random() * elementTypes.length)];
      const elementConfig = GAME_CONSTANTS.ENVIRONMENT_SYSTEM.INTERACTIVE_ELEMENTS[elementType];

      const element: InteractiveElement = {
        id: `element_${i}`,
        type: elementType,
        position: {
          x: Math.random() * 1920,
          y: Math.random() * 1080
        },
        size: Math.random() * 30 + 20,
        health: elementConfig.health,
        maxHealth: elementConfig.health,
        isDestructible: true,
        strategicValue: elementConfig.strategicValue,
        effects: elementConfig.effects,
        isActive: true
      };

      this.interactiveElements.push(element);
    }
  }

  /**
   * Update environment systems
   */
  public updateEnvironment(
    currentTime: number,
    addEffect: (effect: Effect) => void
  ): void {
    this.lastUpdate = currentTime;

    // Update weather
    this.updateWeather(currentTime, addEffect);

    // Update time of day
    this.updateTimeOfDay(currentTime);

    // Update environmental hazards
    this.updateEnvironmentalHazards(currentTime, addEffect);

    // Update interactive elements
    this.updateInteractiveElements(currentTime, addEffect);
  }

  /**
   * Update weather system
   */
  private updateWeather(currentTime: number, addEffect: (effect: Effect) => void): void {
    const weatherDuration = currentTime - this.weatherState.startTime;

    // Check if weather should change
    if (weatherDuration > this.weatherState.duration) {
      this.changeWeather(currentTime, addEffect);
      return;
    }

    // Update weather intensity during transition
    if (this.weatherState.transitionTime > 0) {
      const transitionProgress = Math.min(1, (currentTime - this.weatherState.transitionTime) / 10000);
      this.weatherState.weatherIntensity = transitionProgress;
      
      if (transitionProgress >= 1) {
        this.weatherState.transitionTime = 0;
      }
    }

    // Apply weather effects
    this.applyWeatherEffects(addEffect);
  }

  /**
   * Change weather
   */
  private changeWeather(currentTime: number, addEffect: (effect: Effect) => void): void {
    const weatherTypes = Object.keys(GAME_CONSTANTS.ENVIRONMENT_SYSTEM.WEATHER_TYPES) as Array<keyof typeof GAME_CONSTANTS.ENVIRONMENT_SYSTEM.WEATHER_TYPES>;
    const newWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
    const weatherConfig = GAME_CONSTANTS.ENVIRONMENT_SYSTEM.WEATHER_TYPES[newWeather];

    // Create weather transition effect
    addEffect({
      id: `weather_transition_${currentTime}`,
      position: { x: 960, y: 540 }, // Center of screen
      radius: 1000,
      color: weatherConfig.color,
      life: 10000,
      maxLife: 10000,
      type: 'weather_transition'
    });

    // Update weather state
    this.weatherState = {
      currentWeather: newWeather,
      weatherIntensity: 0,
      visibility: weatherConfig.visibility,
      movementPenalty: weatherConfig.movementPenalty,
      damageModifier: weatherConfig.damageModifier,
      duration: Math.random() * (weatherConfig.duration.max - weatherConfig.duration.min) + weatherConfig.duration.min,
      startTime: currentTime,
      transitionTime: currentTime
    };
  }

  /**
   * Apply weather effects
   */
  private applyWeatherEffects(addEffect: (effect: Effect) => void): void {
    const weatherConfig = GAME_CONSTANTS.ENVIRONMENT_SYSTEM.WEATHER_TYPES[this.weatherState.currentWeather];
    
    // Create weather particle effects
    if (this.weatherState.currentWeather !== 'clear') {
      for (let i = 0; i < 5; i++) {
        addEffect({
          id: `weather_particle_${Date.now()}_${i}`,
          position: {
            x: Math.random() * 1920,
            y: Math.random() * 1080
          },
          radius: Math.random() * 10 + 5,
          color: weatherConfig.color,
          life: 2000,
          maxLife: 2000,
          type: 'weather_particle'
        });
      }
    }
  }

  /**
   * Update time of day
   */
  private updateTimeOfDay(currentTime: number): void {
    // Simulate 10-minute day/night cycle
    const cycleDuration = 600000; // 10 minutes
    const cycleProgress = ((currentTime % cycleDuration) / cycleDuration);
    
    this.timeOfDayState.cycleProgress = cycleProgress;

    // Determine current phase
    if (cycleProgress < 0.25) {
      this.timeOfDayState.currentPhase = 'dawn';
      this.timeOfDayState.lightingIntensity = 0.85 + (cycleProgress * 0.6);
    } else if (cycleProgress < 0.5) {
      this.timeOfDayState.currentPhase = 'day';
      this.timeOfDayState.lightingIntensity = 1.0;
    } else if (cycleProgress < 0.75) {
      this.timeOfDayState.currentPhase = 'dusk';
      this.timeOfDayState.lightingIntensity = 1.0 - ((cycleProgress - 0.5) * 0.4);
    } else {
      this.timeOfDayState.currentPhase = 'night';
      this.timeOfDayState.lightingIntensity = 0.6;
    }

    // Update visibility and behavior modifiers
    const phaseConfig = GAME_CONSTANTS.ENVIRONMENT_SYSTEM.TIME_OF_DAY[this.timeOfDayState.currentPhase];
    this.timeOfDayState.visibilityModifier = phaseConfig.visibility;
    this.timeOfDayState.enemyBehaviorModifier = phaseConfig.enemyBehavior;
  }

  /**
   * Update environmental hazards
   */
  private updateEnvironmentalHazards(currentTime: number, addEffect: (effect: Effect) => void): void {
    // Check for new hazard spawns
    const hazardTypes = Object.keys(GAME_CONSTANTS.ENVIRONMENT_SYSTEM.HAZARDS) as Array<keyof typeof GAME_CONSTANTS.ENVIRONMENT_SYSTEM.HAZARDS>;
    
    for (const hazardType of hazardTypes) {
      const hazardConfig = GAME_CONSTANTS.ENVIRONMENT_SYSTEM.HAZARDS[hazardType];
      
      // Check if it's time for a new hazard
      const lastHazard = this.environmentalHazards.find(h => h.type === hazardType);
      const timeSinceLastHazard = lastHazard ? currentTime - lastHazard.startTime : hazardConfig.frequency;
      
      if (timeSinceLastHazard >= hazardConfig.frequency) {
        this.spawnEnvironmentalHazard(hazardType, currentTime, addEffect);
      }
    }

    // Update existing hazards
    this.environmentalHazards = this.environmentalHazards.filter(hazard => {
      const isExpired = currentTime - hazard.startTime > hazard.duration;
      
      if (isExpired) {
        // Create hazard end effect
        addEffect({
          id: `hazard_end_${hazard.id}`,
          position: hazard.position,
          radius: hazard.radius,
          color: '#FF0000',
          life: 2000,
          maxLife: 2000,
          type: 'hazard_end'
        });
      }
      
      return !isExpired;
    });
  }

  /**
   * Spawn environmental hazard
   */
  private spawnEnvironmentalHazard(
    hazardType: keyof typeof GAME_CONSTANTS.ENVIRONMENT_SYSTEM.HAZARDS, 
    currentTime: number, 
    addEffect: (effect: Effect) => void
  ): void {
    const hazardConfig = GAME_CONSTANTS.ENVIRONMENT_SYSTEM.HAZARDS[hazardType];
    
    const hazard: EnvironmentalHazard = {
      id: `hazard_${hazardType}_${currentTime}`,
      type: hazardType as 'earthquake' | 'volcanic_activity' | 'solar_flare' | 'radioactive_zone' | 'magnetic_anomaly' | 'unstable_ground',
      position: {
        x: Math.random() * 1920,
        y: Math.random() * 1080
      },
      radius: Math.random() * 200 + 100,
      intensity: Math.random() * 0.5 + 0.5,
      duration: hazardConfig.duration,
      startTime: currentTime + hazardConfig.warningTime,
      effects: hazardConfig.effects,
      warningTime: hazardConfig.warningTime
    };

    this.environmentalHazards.push(hazard);

    // Create warning effect
    addEffect({
      id: `hazard_warning_${hazard.id}`,
      position: hazard.position,
      radius: hazard.radius,
      color: '#FFA500',
      life: hazardConfig.warningTime,
      maxLife: hazardConfig.warningTime,
      type: 'hazard_warning'
    });
  }

  /**
   * Update interactive elements
   */
  private updateInteractiveElements(currentTime: number, addEffect: (effect: Effect) => void): void {
    // Update element states and effects
    for (const element of this.interactiveElements) {
      if (!element.isActive) continue;

      // Check for damage from environmental hazards
      for (const hazard of this.environmentalHazards) {
        const distance = this.getDistance(element.position, hazard.position);
        if (distance <= hazard.radius) {
          element.health -= hazard.intensity * 10;
          
          if (element.health <= 0) {
            this.destroyInteractiveElement(element, currentTime, addEffect);
          }
        }
      }
    }
  }

  /**
   * Destroy interactive element
   */
  private destroyInteractiveElement(
    element: InteractiveElement, 
    currentTime: number, 
    addEffect: (effect: Effect) => void
  ): void {
    element.isActive = false;

    // Create destruction effect
    addEffect({
      id: `element_destroy_${element.id}`,
      position: element.position,
      radius: element.size,
      color: '#8B4513',
      life: 3000,
      maxLife: 3000,
      type: 'element_destruction'
    });
  }

  /**
   * Get distance between two positions
   */
  private getDistance(pos1: Position, pos2: Position): number {
    return Math.sqrt((pos1.x - pos2.x) ** 2 + (pos1.y - pos2.y) ** 2);
  }

  /**
   * Get terrain tile at position
   */
  public getTerrainAt(position: Position): TerrainTile | null {
    const tileSize = 40;
    const x = Math.floor(position.x / tileSize);
    const y = Math.floor(position.y / tileSize);
    
    return this.terrainTiles.find(tile => {
      const tileX = Math.floor(tile.position.x / tileSize);
      const tileY = Math.floor(tile.position.y / tileSize);
      return tileX === x && tileY === y;
    }) || null;
  }

  /**
   * Get weather effects for position
   */
  public getWeatherEffects(position: Position): {
    visibility: number;
    movementPenalty: number;
    damageModifier: number;
  } {
    const terrainTile = this.getTerrainAt(position);
    const terrainBonus = terrainTile?.visibilityBonus ?? 0;

    return {
      visibility: this.weatherState.visibility * this.timeOfDayState.visibilityModifier * (1 + terrainBonus),
      movementPenalty: this.weatherState.movementPenalty + (terrainTile?.movementPenalty ?? 0),
      damageModifier: this.weatherState.damageModifier
    };
  }

  /**
   * Get tower bonuses for position
   */
  public getTowerBonuses(position: Position): {
    damage: number;
    range: number;
    fireRate: number;
  } {
    const terrainTile = this.getTerrainAt(position);
    
    if (!terrainTile || !terrainTile.towerBonus) {
      return { damage: 0, range: 0, fireRate: 0 };
    }

    return {
      damage: terrainTile.towerBonus.damage ?? 0,
      range: terrainTile.towerBonus.range ?? 0,
      fireRate: terrainTile.towerBonus.fireRate ?? 0
    };
  }

  /**
   * Get current environment state
   */
  public getEnvironmentState(): {
    terrainTiles: TerrainTile[];
    weatherState: WeatherState;
    timeOfDayState: TimeOfDayState;
    environmentalHazards: EnvironmentalHazard[];
    interactiveElements: InteractiveElement[];
  } {
    return {
      terrainTiles: this.terrainTiles,
      weatherState: this.weatherState,
      timeOfDayState: this.timeOfDayState,
      environmentalHazards: this.environmentalHazards,
      interactiveElements: this.interactiveElements
    };
  }
} 