import React from 'react';
import type { Enemy } from '../../../../../models/gameTypes';
import { GAME_CONSTANTS } from '../../../../../utils/constants';

/**
 * Enhanced Health Bar Renderer
 * Follows SOLID principles with single responsibility for health visualization
 */
export class HealthBarRenderer {
  /**
   * Get health percentage for an enemy
   */
  private static getHealthPercentage(enemy: Enemy): number {
    return Math.max(0, Math.min(1, enemy.health / enemy.maxHealth));
  }

  /**
   * Get health color based on percentage with proper color coding
   */
  private static getHealthColor(healthPercent: number): string {
    if (healthPercent >= 0.5) {
      return '#00ff00'; // Green for 100%–50% HP
    } else if (healthPercent >= 0.2) {
      return '#ffff00'; // Yellow for 49%–20% HP
    } else {
      return '#ff0000'; // Red for 19% and below
    }
  }

  /**
   * Get health bar dimensions based on enemy type
   */
  private static getHealthBarDimensions(enemy: Enemy): {
    width: number;
    height: number;
    yOffset: number;
  } {
    const isBoss = !!enemy.bossType;
    const baseWidth = enemy.size * (isBoss ? 1.8 : 1.2);
    const baseHeight = isBoss ? 10 : GAME_CONSTANTS.ENEMY_HEALTHBAR_HEIGHT;
    const yOffset = enemy.size / 2 + (isBoss ? 20 : 15);

    return {
      width: baseWidth,
      height: baseHeight,
      yOffset
    };
  }

  /**
   * Render health bar for any enemy
   */
  static render(enemy: Enemy): React.JSX.Element | null {
    const healthPercent = this.getHealthPercentage(enemy);
    const { width, height, yOffset } = this.getHealthBarDimensions(enemy);
    const healthColor = this.getHealthColor(healthPercent);
    const isBoss = !!enemy.bossType;

    return (
      <g>
        {/* Background bar */}
        <rect
          x={enemy.position.x - width / 2}
          y={enemy.position.y - yOffset}
          width={width}
          height={height}
          fill={GAME_CONSTANTS.HEALTHBAR_BG}
          stroke={isBoss ? '#ffd700' : '#000'} // Gold border for bosses
          strokeWidth={isBoss ? 2 : 1}
          rx={isBoss ? 4 : 2}
        />

        {/* Health bar */}
        <rect
          x={enemy.position.x - width / 2}
          y={enemy.position.y - yOffset}
          width={width * healthPercent}
          height={height}
          fill={healthColor}
          rx={isBoss ? 4 : 2}
        />

        {/* Boss-specific enhancements */}
        {isBoss && this.renderBossHealthBar(enemy, width, height, yOffset, healthPercent)}
      </g>
    );
  }

  /**
   * Render enhanced health bar for bosses
   */
  private static renderBossHealthBar(
    enemy: Enemy, 
    width: number, 
    height: number, 
    yOffset: number, 
    _healthPercent: number
  ): React.JSX.Element {
    return (
      <g>
        {/* Metallic/glowing frame effect */}
        <defs>
          <linearGradient id={`boss-frame-${enemy.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffd700" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#fff" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffd700" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Glowing frame */}
        <rect
          x={enemy.position.x - width / 2 - 2}
          y={enemy.position.y - yOffset - 2}
          width={width + 4}
          height={height + 4}
          fill="none"
          stroke={`url(#boss-frame-${enemy.id})`}
          strokeWidth={2}
          rx={6}
          opacity={0.8}
          style={{ animation: 'boss-frame-pulse 2s ease-in-out infinite alternate' }}
        />

        {/* Health text for bosses */}
        <text
          x={enemy.position.x}
          y={enemy.position.y - yOffset + height + 15}
          textAnchor="middle"
          fill="#fff"
          fontSize="12"
          fontWeight="bold"
          stroke="#000"
          strokeWidth={1}
        >
          {Math.ceil(enemy.health)}/{enemy.maxHealth}
        </text>

        {/* Phase indicator */}
        {enemy.bossPhase && (
          <text
            x={enemy.position.x}
            y={enemy.position.y - yOffset - 8}
            textAnchor="middle"
            fill="#ff6b35"
            fontSize="10"
            fontWeight="bold"
            stroke="#000"
            strokeWidth={0.5}
          >
            Phase {enemy.bossPhase}
          </text>
        )}
      </g>
    );
  }
}

/**
 * CSS animations for boss health bars
 */
export const BossHealthBarStyles = `
  @keyframes boss-frame-pulse {
    0% { opacity: 0.6; }
    100% { opacity: 1; }
  }
`; 