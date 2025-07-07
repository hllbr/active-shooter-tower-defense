/**
 * 🌍 Environment Store Slice
 * Issue #62: Terrain ve Environment Sistemi
 */

import type { StateCreator } from 'zustand';
import type { Store } from '../index';
import type { 
  TerrainTile, 
  WeatherState, 
  TimeOfDayState, 
  EnvironmentalHazard, 
  InteractiveElement,
  Effect
} from '../../gameTypes';

export interface EnvironmentSlice {
  // Environment State
  terrainTiles: TerrainTile[];
  weatherState: WeatherState;
  timeOfDayState: TimeOfDayState;
  environmentalHazards: EnvironmentalHazard[];
  interactiveElements: InteractiveElement[];
  
  // Environment Actions
  updateWeatherState: (weatherState: WeatherState) => void;
  updateTimeOfDayState: (timeOfDayState: TimeOfDayState) => void;
  addEnvironmentalHazard: (hazard: EnvironmentalHazard) => void;
  removeEnvironmentalHazard: (hazardId: string) => void;
  updateInteractiveElement: (elementId: string, updates: Partial<InteractiveElement>) => void;
  destroyInteractiveElement: (elementId: string) => void;
  addEffect: (effect: Effect) => void;
}

export const createEnvironmentSlice: StateCreator<Store, [], [], EnvironmentSlice> = (set) => ({
  // Initial State
  terrainTiles: [],
  weatherState: {
    currentWeather: 'clear',
    weatherIntensity: 0,
    visibility: 1.0,
    movementPenalty: 0,
    damageModifier: 1.0,
    duration: 60000,
    startTime: Date.now(),
    transitionTime: 0
  },
  timeOfDayState: {
    currentPhase: 'day',
    cycleProgress: 0.5,
    lightingIntensity: 1.0,
    visibilityModifier: 1.0,
    enemyBehaviorModifier: 1.0
  },
  environmentalHazards: [],
  interactiveElements: [],

  // Actions
  updateWeatherState: (weatherState) => set({ weatherState }),
  
  updateTimeOfDayState: (timeOfDayState) => set({ timeOfDayState }),
  
  addEnvironmentalHazard: (hazard) => set((state) => ({
    environmentalHazards: [...state.environmentalHazards, hazard]
  })),
  
  removeEnvironmentalHazard: (hazardId) => set((state) => ({
    environmentalHazards: state.environmentalHazards.filter(h => h.id !== hazardId)
  })),
  
  updateInteractiveElement: (elementId, updates) => set((state) => ({
    interactiveElements: state.interactiveElements.map(element => 
      element.id === elementId ? { ...element, ...updates } : element
    )
  })),
  
  destroyInteractiveElement: (elementId) => set((state) => ({
    interactiveElements: state.interactiveElements.map(element => 
      element.id === elementId ? { ...element, isActive: false } : element
    )
  })),
  
  addEffect: (effect) => set((state) => ({
    effects: [...state.effects, effect]
  }))
}); 