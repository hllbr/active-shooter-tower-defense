import React from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
import type { TowerHealthBarProps } from '../types';

/**
 * Tower Health Bar Component
 * Displays a health bar above each tower with color-coded health status
 * Follows SOLID principles with single responsibility for health visualization
 * Now supports accessibility color modes
 */
export const TowerHealthBar = ({ 
  slot, 
  isVisible,
  showOnHover = true
}: TowerHealthBarProps) => {
  const tower = slot.tower;
  
  // Track previous health for animation
  const [prevHealth, setPrevHealth] = React.useState(tower?.health || 0);
  const [showDamageEffect, setShowDamageEffect] = React.useState(false);

  // Detect health changes for damage effect
  React.useEffect(() => {
    if (tower && tower.health < prevHealth) {
      setShowDamageEffect(true);
      setTimeout(() => setShowDamageEffect(false), 500);
    }
    if (tower) {
      setPrevHealth(tower.health);
    }
  }, [tower?.health, prevHealth, tower]);

  if (!tower) return null;

  const healthPercentage = (tower.health / tower.maxHealth) * 100;
  
  // Show health bar if:
  // 1. Always visible when not using hover mode
  // 2. Visible on hover when using hover mode and tower is damaged
  const shouldShow = !showOnHover || (isVisible && tower.health < tower.maxHealth);
  
  if (!shouldShow) return null;

  /**
   * Get health color based on percentage with accessibility support
   * Green (100%–50%), Yellow (49%–20%), Red (19% or less)
   */
  const getHealthColor = (percentage: number): string => {
    if (percentage >= 50) {
      return 'var(--health-good, #00ff00)'; // Green for 100%–50% HP
    } else if (percentage >= 20) {
      return 'var(--health-warning, #ffff00)'; // Yellow for 49%–20% HP
    } else {
      return 'var(--health-bad, #ff0000)'; // Red for 19% and below
    }
  };

  /**
   * Get health bar dimensions
   */
  const getHealthBarDimensions = () => {
    const width = GAME_CONSTANTS.TOWER_SIZE;
    const height = GAME_CONSTANTS.TOWER_HEALTHBAR_HEIGHT;
    const yOffset = GAME_CONSTANTS.TOWER_SIZE / 2 + 15; // Position above tower

    return { width, height, yOffset };
  };

  const { width, height, yOffset } = getHealthBarDimensions();
  const healthColor = getHealthColor(healthPercentage);

  return (
    <g>
      {/* Background bar */}
      <rect
        x={slot.x - width / 2}
        y={slot.y - yOffset}
        width={width}
        height={height}
        fill="var(--health-background, #333)"
        stroke="#000"
        strokeWidth={1}
        rx={2}
        opacity={0.9}
      />

      {/* Health bar */}
      <rect
        x={slot.x - width / 2}
        y={slot.y - yOffset}
        width={width * (healthPercentage / 100)}
        height={height}
        fill={healthColor}
        rx={2}
        opacity={0.95}
        className={`tower-health-bar ${healthPercentage < 50 ? 'health-bar-damaged' : ''} ${healthPercentage < 20 ? 'health-bar-critical' : ''} ${showDamageEffect ? 'damage-effect' : ''}`}
      />

      {/* Damage effect overlay */}
      {showDamageEffect && (
        <rect
          x={slot.x - width / 2}
          y={slot.y - yOffset}
          width={width}
          height={height}
          fill="#ff0000"
          rx={2}
          opacity={0.3}
          className="damage-flash"
        />
      )}

      {/* Health percentage text (only for critically damaged towers) */}
      {healthPercentage < 30 && (
        <text
          x={slot.x}
          y={slot.y - yOffset + height + 12}
          textAnchor="middle"
          fill="#ffffff"
          fontSize="10"
          fontWeight="bold"
          stroke="#000"
          strokeWidth={1}
        >
          {Math.round(healthPercentage)}%
        </text>
      )}

      {/* Warning indicator for critically damaged towers */}
      {healthPercentage < 20 && (
        <text
          x={slot.x}
          y={slot.y - yOffset - 8}
          textAnchor="middle"
          fill="#ff0000"
          fontSize="12"
          fontWeight="bold"
          stroke="#000"
          strokeWidth={1}
          className="critical-warning"
        >
          ⚠️
        </text>
      )}
    </g>
  );
}; 