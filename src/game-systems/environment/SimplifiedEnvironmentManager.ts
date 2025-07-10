/**
 * 🎯 Simplified Environment Manager
 * Optimized for performance and visual clarity
 */

import type { 
  WeatherState, 
  TimeOfDayState, 
  Effect
} from '../../models/gameTypes';

export class SimplifiedEnvironmentManager {
  private weatherState: WeatherState;
  private timeOfDayState: TimeOfDayState;
  private lastUpdate: number = 0;

  constructor() {
    this.weatherState = this.initializeWeatherState();
    this.timeOfDayState = this.initializeTimeOfDayState();
  }

  /**
   * Initialize simplified weather state
   */
  private initializeWeatherState(): WeatherState {
    return {
      currentWeather: 'clear',
      weatherIntensity: 0,
      visibility: 1.0,
      movementPenalty: 0,
      damageModifier: 1.0,
      duration: 120000, // 2 minutes for less frequent changes
      startTime: performance.now(),
      transitionTime: 0
    };
  }

  /**
   * Initialize simplified time of day state
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
   * Update simplified environment (minimal processing)
   */
  public updateEnvironment(
    currentTime: number,
    _addEffect: (effect: Effect) => void
  ): void {
    this.lastUpdate = currentTime;

    // Only update weather occasionally for minimal performance impact
    if (currentTime % 5000 < 100) { // Every 5 seconds
      this.updateSimpleWeather(currentTime);
    }

    // Slow time of day progression for subtle visual variety
    if (currentTime % 10000 < 100) { // Every 10 seconds
      this.updateSimpleTimeOfDay(currentTime);
    }
  }

  /**
   * Simple weather updates without heavy effects
   */
  private updateSimpleWeather(currentTime: number): void {
    const weatherDuration = currentTime - this.weatherState.startTime;

    // Change weather less frequently for stability
    if (weatherDuration > this.weatherState.duration) {
      // Simple weather progression: clear -> light effects -> clear
      const weatherCycle = ['clear', 'fog', 'clear', 'rain', 'clear'];
      const currentIndex = weatherCycle.indexOf(this.weatherState.currentWeather);
      const nextIndex = (currentIndex + 1) % weatherCycle.length;
      
      this.weatherState = {
        ...this.weatherState,
        currentWeather: weatherCycle[nextIndex] as WeatherState['currentWeather'],
        weatherIntensity: 0.3, // Keep intensity low for clarity
        startTime: currentTime,
        duration: 120000 + Math.random() * 60000 // 2-3 minutes
      };
    }
  }

  /**
   * Simple time of day progression
   */
  private updateSimpleTimeOfDay(currentTime: number): void {
    // Very slow progression for subtle background changes
    const cycleLength = 300000; // 5 minutes full cycle
    const progress = (currentTime % cycleLength) / cycleLength;
    
    this.timeOfDayState.cycleProgress = progress;
    
    // Smooth phase transitions
    if (progress < 0.25) {
      this.timeOfDayState.currentPhase = 'dawn';
      this.timeOfDayState.lightingIntensity = 0.7 + (progress * 4) * 0.3;
    } else if (progress < 0.75) {
      this.timeOfDayState.currentPhase = 'day';
      this.timeOfDayState.lightingIntensity = 1.0;
    } else {
      this.timeOfDayState.currentPhase = 'dusk';
      this.timeOfDayState.lightingIntensity = 1.0 - ((progress - 0.75) * 4) * 0.3;
    }
  }

  /**
   * Get simplified background gradient based on time and weather
   */
  public getBackgroundGradient(): string {
    const { currentPhase } = this.timeOfDayState;
    const { currentWeather } = this.weatherState;

    let baseColors: [string, string] = ['#2D3748', '#1A202C']; // Default dark

    // Time-based gradients
    switch (currentPhase) {
      case 'dawn':
        baseColors = ['#FEB2B2', '#2D3748']; // Soft pink to dark
        break;
      case 'day':
        baseColors = ['#4A5568', '#2D3748']; // Light gray to dark
        break;
      case 'dusk':
        baseColors = ['#D53F8C', '#2D3748']; // Purple to dark
        break;
      default:
        baseColors = ['#2D3748', '#1A202C']; // Night - darkest
    }

    // Weather modifications (subtle)
    if (currentWeather === 'fog') {
      baseColors = ['#718096', '#4A5568']; // Foggy gray
    } else if (currentWeather === 'rain') {
      baseColors = ['#4299E1', '#2D3748']; // Light blue tint
    }

    return `linear-gradient(135deg, ${baseColors[0]}, ${baseColors[1]})`;
  }

  /**
   * Get simple weather indicator for UI
   */
  public getWeatherIndicator(): { icon: string; text: string; color: string } {
    const { currentWeather } = this.weatherState;

    switch (currentWeather) {
      case 'clear':
        return { icon: '☀️', text: 'Clear', color: '#FEB2B2' };
      case 'fog':
        return { icon: '🌫️', text: 'Fog', color: '#A0AEC0' };
      case 'rain':
        return { icon: '🌧️', text: 'Rain', color: '#4299E1' };
      default:
        return { icon: '☀️', text: 'Clear', color: '#FEB2B2' };
    }
  }

  /**
   * Get minimal environment state (no complex terrain)
   */
  public getEnvironmentState(): {
    weatherState: WeatherState;
    timeOfDayState: TimeOfDayState;
    backgroundGradient: string;
    weatherIndicator: { icon: string; text: string; color: string };
  } {
    return {
      weatherState: this.weatherState,
      timeOfDayState: this.timeOfDayState,
      backgroundGradient: this.getBackgroundGradient(),
      weatherIndicator: this.getWeatherIndicator()
    };
  }

  /**
   * Get performance-optimized weather effects (minimal impact)
   */
  public getWeatherEffects(): {
    visibility: number;
    movementPenalty: number;
    damageModifier: number;
  } {
    const { currentWeather, weatherIntensity } = this.weatherState;
    
    // Very subtle effects to maintain gameplay clarity
    switch (currentWeather) {
      case 'fog':
        return {
          visibility: Math.max(0.9, 1 - weatherIntensity * 0.1), // Max 10% reduction
          movementPenalty: weatherIntensity * 0.05, // Max 5% penalty
          damageModifier: 1.0 // No damage changes for clarity
        };
      case 'rain':
        return {
          visibility: Math.max(0.95, 1 - weatherIntensity * 0.05), // Max 5% reduction
          movementPenalty: weatherIntensity * 0.03, // Max 3% penalty
          damageModifier: 1.0 // No damage changes for clarity
        };
      default:
        return {
          visibility: 1.0,
          movementPenalty: 0,
          damageModifier: 1.0
        };
    }
  }
} 