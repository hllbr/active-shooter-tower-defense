import React from 'react';
import { GAME_CONSTANTS } from '../../../../../utils/constants';
import type { Enemy } from '../../../../../models/gameTypes';
import './enemyVisuals.css';

interface EnemyVisualRendererProps {
  enemy: Enemy;
}

/**
 * Enemy Visual Renderer
 * Provides CSS-based visual diversification for different enemy types
 * Follows SOLID principles with single responsibility for enemy visualization
 */
export class EnemyVisualRenderer {
  /**
   * Get CSS class for enemy type
   */
  private static getEnemyTypeClass(enemy: Enemy): string {
    if (enemy.bossType) {
      return `enemy-boss enemy-boss-${enemy.bossType}`;
    }

    switch (enemy.type) {
      case 'Basic':
        return 'enemy-basic';
      case 'Tank':
        return 'enemy-tank';
      case 'Scout':
        return 'enemy-scout';
      case 'Ghost':
        return 'enemy-ghost';
      case 'Assassin':
        return 'enemy-assassin';
      case 'Berserker':
        return 'enemy-berserker';
      case 'Shaman':
        return 'enemy-shaman';
      case 'Archer':
        return 'enemy-archer';
      case 'Demon':
        return 'enemy-demon';
      case 'Wraith':
        return 'enemy-wraith';
      case 'Golem':
        return 'enemy-golem';
      case 'Phoenix':
        return 'enemy-phoenix';
      default:
        return 'enemy-basic';
    }
  }

  /**
   * Get movement pattern class based on enemy behavior
   */
  private static getMovementPatternClass(enemy: Enemy): string {
    switch (enemy.behaviorTag) {
      case 'avoid':
        return 'movement-zigzag';
      case 'stealth':
        return 'movement-stealth';
      case 'tank':
        return 'movement-straight';
      case 'ghost':
        return 'movement-ghost';
      case 'rage':
        return 'movement-rage';
      case 'group':
        return 'movement-group';
      case 'flee':
        return 'movement-flee';
      default:
        return 'movement-normal';
    }
  }

  /**
   * Get speed boost class when near towers
   */
  private static getSpeedBoostClass(enemy: Enemy): string {
    // This will be applied via CSS when enemy is near towers
    return 'speed-boost-ready';
  }

  /**
   * Render enemy with CSS-based visual diversification
   */
  static render(enemy: Enemy): React.JSX.Element {
    const typeClass = this.getEnemyTypeClass(enemy);
    const movementClass = this.getMovementPatternClass(enemy);
    const speedBoostClass = this.getSpeedBoostClass(enemy);
    const isBoss = !!enemy.bossType;
    const isSpecial = enemy.isSpecial;

    return (
      <g className={`enemy-container ${typeClass} ${movementClass} ${speedBoostClass}`}>
        {/* Base enemy shape */}
        {this.renderEnemyShape(enemy)}
        
        {/* Special effects for bosses */}
        {isBoss && this.renderBossEffects(enemy)}
        
        {/* Special effects for special enemies */}
        {isSpecial && this.renderSpecialEffects(enemy)}
        
        {/* Movement trail effects */}
        {this.renderMovementTrail(enemy)}
      </g>
    );
  }

  /**
   * Render the base enemy shape based on type
   */
  private static renderEnemyShape(enemy: Enemy): React.JSX.Element {
    const { position, size, color } = enemy;
    const isBoss = !!enemy.bossType;

    switch (enemy.type) {
      case 'Tank':
        return (
          <rect
            x={position.x - size / 2}
            y={position.y - size / 2}
            width={size}
            height={size}
            fill={color}
            stroke="#000"
            strokeWidth={2}
            rx={4}
            className="enemy-shape tank-shape"
          />
        );

      case 'Scout':
        return (
          <polygon
            points={`${position.x},${position.y - size / 2} ${position.x - size / 3},${position.y + size / 2} ${position.x + size / 3},${position.y + size / 2}`}
            fill={color}
            stroke="#000"
            strokeWidth={2}
            className="enemy-shape scout-shape"
          />
        );

      case 'Ghost':
        return (
          <ellipse
            cx={position.x}
            cy={position.y}
            rx={size / 2}
            ry={size / 3}
            fill={color}
            stroke="#000"
            strokeWidth={2}
            opacity={0.7}
            className="enemy-shape ghost-shape"
          />
        );

      default:
        return (
          <circle
            cx={position.x}
            cy={position.y}
            r={size / 2}
            fill={color}
            stroke="#000"
            strokeWidth={isBoss ? 3 : 2}
            className="enemy-shape basic-shape"
          />
        );
    }
  }

  /**
   * Render boss-specific effects
   */
  private static renderBossEffects(enemy: Enemy): React.JSX.Element {
    const { position, size, bossType } = enemy;
    const bossSize = size * 1.5;

    return (
      <g className="boss-effects">
        {/* Boss aura */}
        <circle
          cx={position.x}
          cy={position.y}
          r={bossSize / 2 + 10}
          fill="none"
          stroke={bossType === 'legendary' ? '#ffd700' : bossType === 'major' ? '#ff6b35' : '#4ade80'}
          strokeWidth={3}
          opacity={0.6}
          className="boss-aura"
        />
        
        {/* Boss particles */}
        {[0, 60, 120, 180, 240, 300].map((angle, index) => (
          <circle
            key={index}
            cx={position.x + (bossSize / 3) * Math.cos((angle * Math.PI) / 180)}
            cy={position.y + (bossSize / 3) * Math.sin((angle * Math.PI) / 180)}
            r={bossSize / 8}
            fill={enemy.color}
            stroke="#000"
            strokeWidth={2}
            className="boss-particle"
          />
        ))}
      </g>
    );
  }

  /**
   * Render special enemy effects
   */
  private static renderSpecialEffects(enemy: Enemy): React.JSX.Element {
    const { position, size } = enemy;

    return (
      <g className="special-effects">
        {/* Pulse ring */}
        <circle
          cx={position.x}
          cy={position.y}
          r={size / 2 + 4}
          fill="none"
          stroke={GAME_CONSTANTS.MICROBE_ENEMY.pulseColor}
          strokeWidth={2}
          opacity={0.6}
          className="special-pulse"
        />
        
        {/* Orbiting particles */}
        {[0, 120, 240].map((angle, index) => (
          <circle
            key={index}
            cx={position.x + (size / 2 + 8) * Math.cos((angle + performance.now() / 20) * Math.PI / 180)}
            cy={position.y + (size / 2 + 8) * Math.sin((angle + performance.now() / 20) * Math.PI / 180)}
            r={3}
            fill={GAME_CONSTANTS.MICROBE_ENEMY.pulseColor}
            opacity={0.8}
            className="special-particle"
          />
        ))}
      </g>
    );
  }

  /**
   * Render movement trail effects
   */
  private static renderMovementTrail(enemy: Enemy): React.JSX.Element {
    const { position, size, type } = enemy;
    
    // Only show trails for certain enemy types
    if (!['Scout', 'Ghost', 'Assassin'].includes(type || '')) {
      return <g />;
    }

    return (
      <g className="movement-trail">
        {/* Trail effect */}
        <circle
          cx={position.x}
          cy={position.y}
          r={size / 2 + 2}
          fill="none"
          stroke={enemy.color}
          strokeWidth={1}
          opacity={0.3}
          className="trail-effect"
        />
      </g>
    );
  }
} 