import React from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/Constants';

export const SVGEffectsRenderer: React.FC = () => {
  const { enemies, bullets, effects, mines } = useGameStore();

  return (
    <>
      {/* Enemies */}
      {enemies.map((enemy) => (
        <g key={enemy.id}>
          <rect
            x={enemy.position.x - enemy.size / 2}
            y={enemy.position.y - enemy.size / 2 - 10}
            width={enemy.size}
            height={GAME_CONSTANTS.ENEMY_HEALTHBAR_HEIGHT}
            fill={GAME_CONSTANTS.HEALTHBAR_BG}
            rx={3}
          />
          <rect
            x={enemy.position.x - enemy.size / 2}
            y={enemy.position.y - enemy.size / 2 - 10}
            width={enemy.size * (enemy.health / enemy.maxHealth)}
            height={GAME_CONSTANTS.ENEMY_HEALTHBAR_HEIGHT}
            fill={enemy.health > enemy.maxHealth * 0.3 ? GAME_CONSTANTS.HEALTHBAR_GOOD : GAME_CONSTANTS.HEALTHBAR_BAD}
            rx={3}
          />
          {enemy.isSpecial ? (
            // Special microbe enemy with pulsing effect
            <>
              <circle
                cx={enemy.position.x}
                cy={enemy.position.y}
                r={enemy.size / 2 + 4}
                fill="none"
                stroke={GAME_CONSTANTS.MICROBE_ENEMY.pulseColor}
                strokeWidth={2}
                opacity={0.6}
                style={{
                  animation: 'pulse 1.5s ease-in-out infinite alternate'
                }}
              />
              <circle
                cx={enemy.position.x}
                cy={enemy.position.y}
                r={enemy.size / 2}
                fill={enemy.color}
                stroke={GAME_CONSTANTS.MICROBE_ENEMY.borderColor}
                strokeWidth={3}
              />
              {/* Microbe indicator */}
              <text
                x={enemy.position.x}
                y={enemy.position.y + enemy.size / 2 + 15}
                textAnchor="middle"
                fill={GAME_CONSTANTS.MICROBE_ENEMY.color}
                fontSize="12"
                fontWeight="bold"
              >
                💰
              </text>
            </>
          ) : (
            // Normal enemy
            <circle
              cx={enemy.position.x}
              cy={enemy.position.y}
              r={enemy.size / 2}
              fill={enemy.color}
              stroke="#b30000"
              strokeWidth={4}
            />
          )}
        </g>
      ))}

      {/* Bullets */}
      {bullets.map((bullet) => (
        <line
          key={bullet.id}
          x1={bullet.position.x - bullet.direction.x * bullet.size}
          y1={bullet.position.y - bullet.direction.y * bullet.size}
          x2={bullet.position.x + bullet.direction.x * bullet.size}
          y2={bullet.position.y + bullet.direction.y * bullet.size}
          stroke={bullet.color}
          strokeWidth={2}
        />
      ))}

      {/* Effects */}
      {effects.map((effect) => (
        <circle
          key={effect.id}
          cx={effect.position.x}
          cy={effect.position.y}
          r={(effect.radius * effect.life) / effect.maxLife}
          fill={effect.color}
          fillOpacity={effect.life / effect.maxLife}
          stroke="none"
        />
      ))}

      {/* Mines */}
      {mines.map((mine) => (
        <g key={mine.id} transform={`translate(${mine.position.x}, ${mine.position.y})`} style={{ pointerEvents: 'none' }}>
          {/* The horns of the mine */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
            <circle
              key={angle}
              cx={mine.size * 0.8 * Math.cos(angle * Math.PI / 180)}
              cy={mine.size * 0.8 * Math.sin(angle * Math.PI / 180)}
              r={mine.size * 0.25}
              fill={GAME_CONSTANTS.MINE_VISUALS.bodyColor}
            />
          ))}
          {/* The main body of the mine */}
          <circle
            cx="0"
            cy="0"
            r={mine.size * 0.75}
            fill={GAME_CONSTANTS.MINE_VISUALS.bodyColor}
            stroke={GAME_CONSTANTS.MINE_VISUALS.borderColor}
            strokeWidth={3}
          />
          {/* The pulsing light */}
          <circle
            cx="0"
            cy="0"
            r={mine.size * 0.3}
            fill={GAME_CONSTANTS.MINE_VISUALS.lightColor}
            style={{ animation: 'mine-light-pulse 2s ease-in-out infinite' }}
          />
        </g>
      ))}
    </>
  );
}; 