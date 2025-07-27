/**
 * 🛡️ Enhanced Defensive Renderer Component
 * Renders enhanced walls and trenches with visual evolution based on level
 */

import React, { useMemo } from 'react';
import { enhancedDefensiveMechanics } from '../../../game-systems/defense-systems/EnhancedDefensiveMechanics';
import { GAME_CONSTANTS } from '../../../utils/constants/gameConstants';

interface EnhancedDefensiveRendererProps {
  slot: {
    x: number;
    y: number;
    tower?: {
      wallStrength: number;
      health: number;
      maxHealth: number;
    };
    modifier?: {
      type: string;
      level?: number;
    };
  };
  slotIdx: number;
  wallLevel: number;
  _isVisible: boolean;
}

export const EnhancedDefensiveRenderer = ({ 
  slot, 
  slotIdx, 
  wallLevel, 
  _isVisible 
}: EnhancedDefensiveRendererProps) => {
  // Get visual state for this defensive structure
  const wallVisualState = enhancedDefensiveMechanics.getVisualState(`wall_${slotIdx}`);
  const trenchVisualState = enhancedDefensiveMechanics.getVisualState(`trench_${slotIdx}`);

  // Calculate wall properties
  const wallProperties = useMemo(() => {
    if (!slot.tower?.wallStrength) return null;

    const wallLevelConfig = enhancedDefensiveMechanics.getAllWallLevels().find(w => w.level === wallLevel);
    if (!wallLevelConfig) return null;

    const healthPercentage = (slot.tower.wallStrength / wallLevelConfig.maxHealth) * 100;
    const crackLevel = wallVisualState?.crackLevel || 0;

    return {
      healthPercentage,
      crackLevel,
      material: wallLevelConfig.material,
      maxHealth: wallLevelConfig.maxHealth,
      _config: wallLevelConfig
    };
  }, [slot.tower?.wallStrength, wallLevel, wallVisualState]);

  // Calculate trench properties
  const trenchProperties = useMemo(() => {
    if (slot.modifier?.type !== 'trench') return null;

    const trenchLevel = slot.modifier.level || 1;
    const trenchConfig = enhancedDefensiveMechanics.getTrenchLevel(trenchLevel);
    if (!trenchConfig) return null;

    return {
      level: trenchLevel,
      config: trenchConfig,
      visualState: trenchVisualState
    };
  }, [slot.modifier, trenchVisualState]);

  // Render wall
  const renderWall = () => {
    if (!wallProperties) return null;

    const { healthPercentage, crackLevel, material } = wallProperties;
    const size = GAME_CONSTANTS.TOWER_SIZE;
    const halfSize = size / 2;

    // Get wall color based on material and health
    const getWallColor = () => {
      if (healthPercentage <= 10) return '#8B4513'; // Brown when almost destroyed
      if (healthPercentage <= 25) return '#A0522D'; // Dark brown when heavily damaged
      if (healthPercentage <= 50) return '#CD853F'; // Light brown when damaged
      
      switch (material) {
        case 'wooden': return '#8B4513';
        case 'stone': return '#696969';
        case 'reinforced': return '#C0C0C0';
        default: return '#8B4513';
      }
    };

    // Get wall stroke color based on health
    const getStrokeColor = () => {
      if (healthPercentage <= 10) return '#FF0000'; // Red when critical
      if (healthPercentage <= 25) return '#FFA500'; // Orange when damaged
      if (healthPercentage <= 50) return '#FFFF00'; // Yellow when warning
      return '#000000'; // Black when healthy
    };

    // Get wall stroke width based on health
    const getStrokeWidth = () => {
      if (healthPercentage <= 10) return 3;
      if (healthPercentage <= 25) return 2;
      if (healthPercentage <= 50) return 1;
      return 0;
    };

    return (
      <g>
        {/* Wall background */}
        <rect
          x={slot.x - halfSize}
          y={slot.y - halfSize}
          width={size}
          height={size}
          fill={getWallColor()}
          stroke={getStrokeColor()}
          strokeWidth={getStrokeWidth()}
          rx={4}
          opacity={0.9}
          className={`wall-renderer ${crackLevel > 0 ? 'wall-damaged' : ''} ${crackLevel >= 2 ? 'wall-critical' : ''}`}
        />

        {/* Wall cracks based on damage level */}
        {crackLevel > 0 && (
          <g className="wall-cracks">
            {crackLevel >= 1 && (
              <path
                d={`M ${slot.x - halfSize + 10} ${slot.y - halfSize + 10} L ${slot.x - halfSize + 20} ${slot.y - halfSize + 15} L ${slot.x - halfSize + 15} ${slot.y - halfSize + 25}`}
                stroke="#000000"
                strokeWidth={1}
                fill="none"
                opacity={0.6}
                className="crack-small"
              />
            )}
            {crackLevel >= 2 && (
              <path
                d={`M ${slot.x + halfSize - 15} ${slot.y - halfSize + 10} L ${slot.x + halfSize - 25} ${slot.y - halfSize + 20} L ${slot.x + halfSize - 20} ${slot.y - halfSize + 30}`}
                stroke="#000000"
                strokeWidth={2}
                fill="none"
                opacity={0.7}
                className="crack-medium"
              />
            )}
            {crackLevel >= 3 && (
              <path
                d={`M ${slot.x - halfSize + 5} ${slot.y + halfSize - 15} L ${slot.x - halfSize + 15} ${slot.y + halfSize - 25} L ${slot.x - halfSize + 25} ${slot.y + halfSize - 20}`}
                stroke="#000000"
                strokeWidth={3}
                fill="none"
                opacity={0.8}
                className="crack-large"
              />
            )}
          </g>
        )}

        {/* Wall material pattern */}
        {material === 'stone' && (
          <g className="stone-pattern">
            {Array.from({ length: 6 }, (_, i) => (
              <rect
                key={i}
                x={slot.x - halfSize + 5 + (i * 8)}
                y={slot.y - halfSize + 5 + (i % 2 * 8)}
                width={6}
                height={6}
                fill="#808080"
                opacity={0.3}
              />
            ))}
          </g>
        )}

        {material === 'reinforced' && (
          <g className="metal-pattern">
            <rect
              x={slot.x - halfSize + 8}
              y={slot.y - halfSize + 8}
              width={size - 16}
              height={size - 16}
              fill="none"
              stroke="#A0A0A0"
              strokeWidth={2}
              opacity={0.5}
            />
            <circle
              cx={slot.x}
              cy={slot.y}
              r={8}
              fill="#C0C0C0"
              opacity={0.4}
            />
          </g>
        )}

        {/* Health indicator */}
        {healthPercentage < 100 && (
          <rect
            x={slot.x - halfSize}
            y={slot.y - halfSize - 8}
            width={size * (healthPercentage / 100)}
            height={4}
            fill={healthPercentage > 50 ? '#00FF00' : healthPercentage > 25 ? '#FFFF00' : '#FF0000'}
            rx={2}
            opacity={0.8}
            className="wall-health-indicator"
          />
        )}

        {/* Damage pulse effect */}
        {wallVisualState?.debrisActive && (
          <g className="debris-effect">
            {Array.from({ length: 4 }, (_, i) => (
              <circle
                key={i}
                cx={slot.x - halfSize + 10 + (i * 12)}
                cy={slot.y - halfSize + 10 + (i * 8)}
                r={2}
                fill="#8B4513"
                opacity={0.6}
                className="debris-particle"
              />
            ))}
          </g>
        )}
      </g>
    );
  };

  // Render trench
  const renderTrench = () => {
    if (!trenchProperties) return null;

    const { level, config, visualState } = trenchProperties;
    const size = GAME_CONSTANTS.TOWER_SIZE;
    const halfSize = size / 2;

    // Get trench color based on level
    const getTrenchColor = () => {
      switch (level) {
        case 1: return '#8B4513'; // Basic brown
        case 2: return '#654321'; // Dark brown with stone
        case 3: return '#4A4A4A'; // Dark gray for deep stone
        default: return '#8B4513';
      }
    };

    // Get trench depth effect
    const depthEffect = visualState?.depthEffect || config.visualDepth;
    const depthOffset = depthEffect * 5; // Visual depth offset

    return (
      <g>
        {/* Trench background */}
        <rect
          x={slot.x - halfSize + depthOffset}
          y={slot.y - halfSize + depthOffset}
          width={size - (depthOffset * 2)}
          height={size - (depthOffset * 2)}
          fill={getTrenchColor()}
          stroke="#654321"
          strokeWidth={2}
          rx={6}
          opacity={0.8}
          className={`trench-renderer trench-level-${level} ${visualState?.mudSplashActive ? 'mud-splash-active' : ''}`}
        />

        {/* Trench depth effect */}
        <rect
          x={slot.x - halfSize + depthOffset + 4}
          y={slot.y - halfSize + depthOffset + 4}
          width={size - (depthOffset * 2) - 8}
          height={size - (depthOffset * 2) - 8}
          fill="none"
          stroke="#000000"
          strokeWidth={1}
          rx={4}
          opacity={0.4}
          className="trench-depth"
        />

        {/* Trench spikes for level 2+ */}
        {level >= 2 && (
          <g className="trench-spikes">
            {Array.from({ length: config.spikeCount }, (_, i) => {
              const angle = (i / config.spikeCount) * 2 * Math.PI;
              const spikeX = slot.x + Math.cos(angle) * (halfSize - 8);
              const spikeY = slot.y + Math.sin(angle) * (halfSize - 8);
              
              return (
                <polygon
                  key={i}
                  points={`${spikeX},${spikeY - 4} ${spikeX - 2},${spikeY + 4} ${spikeX + 2},${spikeY + 4}`}
                  fill="#696969"
                  stroke="#000000"
                  strokeWidth={1}
                  opacity={0.8}
                  className="trench-spike"
                />
              );
            })}
          </g>
        )}

        {/* Stone lining for level 2+ */}
        {level >= 2 && (
          <g className="stone-lining">
            {Array.from({ length: 8 }, (_, i) => (
              <rect
                key={i}
                x={slot.x - halfSize + 8 + (i * 6)}
                y={slot.y - halfSize + 8 + (i % 2 * 6)}
                width={4}
                height={4}
                fill="#808080"
                opacity={0.5}
                className="stone-block"
              />
            ))}
          </g>
        )}

        {/* Mud splash effect */}
        {visualState?.mudSplashActive && (
          <g className="mud-splash-effect">
            {Array.from({ length: 6 }, (_, i) => (
              <circle
                key={i}
                cx={slot.x - halfSize + 10 + (i * 8)}
                cy={slot.y - halfSize + 10 + (i * 6)}
                r={3}
                fill="#8B4513"
                opacity={0.7}
                className="mud-splash-particle"
              />
            ))}
          </g>
        )}

        {/* Trench level indicator */}
        <text
          x={slot.x}
          y={slot.y + halfSize + 15}
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="10"
          fontWeight="bold"
          stroke="#000000"
          strokeWidth={1}
          className="trench-level-indicator"
        >
          T{level}
        </text>
      </g>
    );
  };

  // Render screen shake effect
  const screenShakeState = enhancedDefensiveMechanics.getScreenShakeState();
  const shakeOffset = screenShakeState.active ? 
    Math.sin(performance.now() * 0.01) * screenShakeState.intensity * 0.1 : 0;

  return (
    <g
      transform={`translate(${shakeOffset}, 0)`}
      className="enhanced-defensive-renderer"
    >
      {renderTrench()}
      {renderWall()}
    </g>
  );
}; 