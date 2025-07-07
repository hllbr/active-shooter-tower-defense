/**
 * 🌍 Environment & Terrain Renderer
 * Issue #62: Terrain ve Environment Sistemi
 */

import React from 'react';
import type { 
  TerrainTile, 
  WeatherState, 
  TimeOfDayState, 
  EnvironmentalHazard, 
  InteractiveElement 
} from '../../../../models/gameTypes';
import { GAME_CONSTANTS } from '../../../../utils/constants';

interface EnvironmentRendererProps {
  terrainTiles: TerrainTile[];
  weatherState: WeatherState;
  timeOfDayState: TimeOfDayState;
  environmentalHazards: EnvironmentalHazard[];
  interactiveElements: InteractiveElement[];
  width: number;
  height: number;
}

export const EnvironmentRenderer: React.FC<EnvironmentRendererProps> = ({
  terrainTiles,
  weatherState,
  timeOfDayState,
  environmentalHazards,
  interactiveElements,
  width,
  height
}) => {
  return (
    <g>
      {/* Render Terrain Tiles */}
      {terrainTiles.map(tile => (
        <TerrainTileRenderer key={tile.id} tile={tile} />
      ))}
      
      {/* Render Interactive Elements */}
      {interactiveElements.filter(element => element.isActive).map(element => (
        <InteractiveElementRenderer key={element.id} element={element} />
      ))}
      
      {/* Render Environmental Hazards */}
      {environmentalHazards.map(hazard => (
        <EnvironmentalHazardRenderer key={hazard.id} hazard={hazard} />
      ))}
      
      {/* Render Weather Effects */}
      <WeatherEffectsRenderer weatherState={weatherState} width={width} height={height} />
      
      {/* Render Time of Day Lighting */}
      <TimeOfDayRenderer timeOfDayState={timeOfDayState} width={width} height={height} />
    </g>
  );
};

// Terrain Tile Renderer
const TerrainTileRenderer: React.FC<{ tile: TerrainTile }> = ({ tile }) => {
  const terrainConfig = GAME_CONSTANTS.ENVIRONMENT_SYSTEM.TERRAIN_TYPES[tile.terrainType];
  const tileSize = 40;
  
  return (
    <rect
      x={tile.position.x}
      y={tile.position.y}
      width={tileSize}
      height={tileSize}
      fill={terrainConfig.color}
      opacity={0.3}
      stroke={tile.isDestructible ? '#FF0000' : 'none'}
      strokeWidth={tile.isDestructible ? 1 : 0}
    />
  );
};

// Interactive Element Renderer
const InteractiveElementRenderer: React.FC<{ element: InteractiveElement }> = ({ element }) => {
  const getElementIcon = (type: string) => {
    switch (type) {
      case 'tree': return '🌳';
      case 'rock': return '🪨';
      case 'building': return '🏢';
      case 'bridge': return '🌉';
      case 'gate': return '🚪';
      default: return '📦';
    }
  };
  
  const healthPercentage = element.health / element.maxHealth;
  const color = healthPercentage > 0.7 ? '#00FF00' : 
                healthPercentage > 0.3 ? '#FFFF00' : '#FF0000';
  
  return (
    <g>
      {/* Element Background */}
      <circle
        cx={element.position.x}
        cy={element.position.y}
        r={element.size / 2}
        fill={color}
        opacity={0.6}
        stroke="#000000"
        strokeWidth={2}
      />
      
      {/* Element Icon */}
      <text
        x={element.position.x}
        y={element.position.y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={element.size / 2}
        fill="#000000"
      >
        {getElementIcon(element.type)}
      </text>
      
      {/* Health Bar */}
      <rect
        x={element.position.x - element.size / 2}
        y={element.position.y - element.size / 2 - 10}
        width={element.size * healthPercentage}
        height={4}
        fill={color}
        opacity={0.8}
      />
    </g>
  );
};

// Environmental Hazard Renderer
const EnvironmentalHazardRenderer: React.FC<{ hazard: EnvironmentalHazard }> = ({ hazard }) => {
  const getHazardColor = (type: string) => {
    switch (type) {
      case 'earthquake': return '#8B4513';
      case 'volcanic_activity': return '#FF4500';
      case 'solar_flare': return '#FFD700';
      case 'radioactive_zone': return '#32CD32';
      case 'magnetic_anomaly': return '#9370DB';
      default: return '#FF0000';
    }
  };
  
  const getHazardIcon = (type: string) => {
    switch (type) {
      case 'earthquake': return '🌋';
      case 'volcanic_activity': return '🌋';
      case 'solar_flare': return '☀️';
      case 'radioactive_zone': return '☢️';
      case 'magnetic_anomaly': return '🧲';
      default: return '⚠️';
    }
  };
  
  return (
    <g>
      {/* Hazard Area */}
      <circle
        cx={hazard.position.x}
        cy={hazard.position.y}
        r={hazard.radius}
        fill={getHazardColor(hazard.type)}
        opacity={0.3}
        stroke={getHazardColor(hazard.type)}
        strokeWidth={2}
      >
        <animate
          attributeName="opacity"
          values="0.3;0.6;0.3"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      
      {/* Hazard Icon */}
      <text
        x={hazard.position.x}
        y={hazard.position.y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={24}
        fill={getHazardColor(hazard.type)}
      >
        {getHazardIcon(hazard.type)}
      </text>
    </g>
  );
};

// Weather Effects Renderer
const WeatherEffectsRenderer: React.FC<{ 
  weatherState: WeatherState; 
  width: number; 
  height: number; 
}> = ({ weatherState, width, height }) => {
  const weatherConfig = GAME_CONSTANTS.ENVIRONMENT_SYSTEM.WEATHER_TYPES[weatherState.currentWeather];
  
  if (weatherState.currentWeather === 'clear') {
    return null;
  }
  
  return (
    <g>
      {/* Weather Overlay */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={weatherConfig.color}
        opacity={weatherState.weatherIntensity * 0.3}
      />
      
      {/* Weather Particles */}
      {Array.from({ length: 20 }, (_, i) => (
        <circle
          key={i}
          cx={Math.random() * width}
          cy={Math.random() * height}
          r={Math.random() * 3 + 1}
          fill={weatherConfig.color}
          opacity={0.6}
        >
          <animate
            attributeName="cy"
            values={`${height + 10};${-10}`}
            dur={`${Math.random() * 3 + 2}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </g>
  );
};

// Time of Day Renderer
const TimeOfDayRenderer: React.FC<{ 
  timeOfDayState: TimeOfDayState; 
  width: number; 
  height: number; 
}> = ({ timeOfDayState, width, height }) => {
  const phaseConfig = GAME_CONSTANTS.ENVIRONMENT_SYSTEM.TIME_OF_DAY[timeOfDayState.currentPhase];
  
  return (
    <rect
      x={0}
      y={0}
      width={width}
      height={height}
      fill={phaseConfig.color}
      opacity={(1 - timeOfDayState.lightingIntensity) * 0.4}
    />
  );
}; 