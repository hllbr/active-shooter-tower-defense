import React from 'react';
import { useGameStore } from '../../../../models/store';
import type { Enemy, Bullet, Effect, Mine } from '../../../../models/gameTypes';
import { HealthBarRenderer, BossHealthBarStyles } from './helpers/HealthBarRenderer';

/**
 * 🎯 Simplified Renderer - Clean & Performance Optimized
 * Replaces complex SVG effects with minimal, clear visuals
 */
export const SimplifiedRenderer: React.FC = () => {
  const { enemies, bullets, effects, mines } = useGameStore();

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1920 1080"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 1
      }}
    >
      {/* Enemies - Clean and Simple */}
      {enemies.map((enemy: Enemy) => {
        const isSpecial = enemy.bossType || enemy.type === 'Microbe' || enemy.type === 'Ghost';
        
        return (
          <g key={enemy.id}>
            {/* Enhanced Health Bar for all enemies */}
            {HealthBarRenderer.render(enemy)}
            
            {/* Enemy body - simple circle */}
            <circle
              cx={enemy.position.x}
              cy={enemy.position.y}
              r={enemy.size / 2}
              fill={enemy.color}
              stroke={isSpecial ? "#FFF" : "#000"}
              strokeWidth={isSpecial ? 3 : 2}
              opacity={enemy.type === 'Ghost' ? 0.7 : 1}
            />
            
            {/* Type indicators - simple icons */}
            {enemy.type === 'Scout' && (
              <text
                x={enemy.position.x}
                y={enemy.position.y + 4}
                textAnchor="middle"
                fill="#FFF"
                fontSize="12"
                fontWeight="bold"
              >
                ⚡
              </text>
            )}
            
            {enemy.type === 'Assassin' && (
              <text
                x={enemy.position.x}
                y={enemy.position.y + 4}
                textAnchor="middle"
                fill="#FFF"
                fontSize="12"
                fontWeight="bold"
              >
                🗡️
              </text>
            )}
            
            {enemy.type === 'Microbe' && (
              <text
                x={enemy.position.x}
                y={enemy.position.y + 4}
                textAnchor="middle"
                fill="#FFF"
                fontSize="10"
                fontWeight="bold"
              >
                🦠
              </text>
            )}
            
            {enemy.bossType && (
              <text
                x={enemy.position.x}
                y={enemy.position.y + 6}
                textAnchor="middle"
                fill="#FFF"
                fontSize="16"
                fontWeight="bold"
              >
                {enemy.bossType === 'legendary' ? '👑' : enemy.bossType === 'major' ? '⚔️' : '🛡️'}
              </text>
            )}
          </g>
        );
      })}

      {/* Bullets - Simple dots */}
      {bullets.map((bullet: Bullet) => (
        <circle
          key={bullet.id}
          cx={bullet.position.x}
          cy={bullet.position.y}
          r={Math.max(bullet.size / 2, 2)}
          fill={bullet.color || "#FFF"}
          opacity={0.9}
        />
      ))}

      {/* Effects - Minimal and clean */}
      {effects.map((effect: Effect) => {
        // Much smaller, cleaner effects
        const radius = Math.min(effect.radius * 0.3, 30); // 30% size, max 30px
        const opacity = Math.min(effect.life / effect.maxLife * 0.4, 0.4); // Max 40% opacity
        
        return (
          <circle
            key={effect.id}
            cx={effect.position.x}
            cy={effect.position.y}
            r={radius}
            fill={effect.color}
            fillOpacity={opacity}
            stroke={effect.color}
            strokeOpacity={opacity * 0.5}
            strokeWidth={1}
          />
        );
      })}

      {/* Mines - Clean and simple */}
      {mines.map((mine: Mine) => (
        <g key={mine.id}>
          {/* Mine body - simple octagon */}
          <polygon
            points={[
              `${mine.position.x - mine.size * 0.3},${mine.position.y - mine.size * 0.7}`,
              `${mine.position.x + mine.size * 0.3},${mine.position.y - mine.size * 0.7}`,
              `${mine.position.x + mine.size * 0.7},${mine.position.y - mine.size * 0.3}`,
              `${mine.position.x + mine.size * 0.7},${mine.position.y + mine.size * 0.3}`,
              `${mine.position.x + mine.size * 0.3},${mine.position.y + mine.size * 0.7}`,
              `${mine.position.x - mine.size * 0.3},${mine.position.y + mine.size * 0.7}`,
              `${mine.position.x - mine.size * 0.7},${mine.position.y + mine.size * 0.3}`,
              `${mine.position.x - mine.size * 0.7},${mine.position.y - mine.size * 0.3}`
            ].join(' ')}
            fill="#4A5568"
            stroke="#2D3748"
            strokeWidth={2}
          />
          
          {/* Simple indicator light */}
          <circle
            cx={mine.position.x}
            cy={mine.position.y}
            r={mine.size * 0.2}
            fill="#E53E3E"
            opacity={0.8}
          />
          
          {/* Mine icon */}
          <text
            x={mine.position.x}
            y={mine.position.y + 3}
            textAnchor="middle"
            fill="#FFF"
            fontSize="8"
            fontWeight="bold"
          >
            💣
          </text>
        </g>
      ))}
      <style>{BossHealthBarStyles}</style>
    </svg>
  );
}; 