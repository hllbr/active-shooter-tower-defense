import React from 'react';
import type { Enemy } from '../../../../../models/gameTypes';
import { GAME_CONSTANTS } from '../../../../../utils/constants';

export const HealthBar: React.FC<{ enemy: Enemy }> = ({ enemy }) => {
  const healthPercent = enemy.health / enemy.maxHealth;
  const barWidth = enemy.size * (enemy.bossType ? 1.5 : 1);
  const barHeight = enemy.bossType ? 8 : GAME_CONSTANTS.ENEMY_HEALTHBAR_HEIGHT;
  const yOffset = enemy.size / 2 + 12;

  let healthColor: string = GAME_CONSTANTS.HEALTHBAR_GOOD;
  if (healthPercent < 0.3) {
    healthColor = GAME_CONSTANTS.HEALTHBAR_BAD;
  } else if (healthPercent < 0.6) {
    healthColor = '#ff8c00';
  }

  return (
    <g>
      <rect
        x={enemy.position.x - barWidth / 2}
        y={enemy.position.y - yOffset}
        width={barWidth}
        height={barHeight}
        fill={GAME_CONSTANTS.HEALTHBAR_BG}
        stroke="#000"
        strokeWidth={1}
        rx={2}
      />
      <rect
        x={enemy.position.x - barWidth / 2}
        y={enemy.position.y - yOffset}
        width={barWidth * healthPercent}
        height={barHeight}
        fill={healthColor}
        rx={2}
      />
      {enemy.bossType && (
        <text
          x={enemy.position.x}
          y={enemy.position.y - yOffset + barHeight + 12}
          textAnchor="middle"
          fill="#fff"
          fontSize="10"
          fontWeight="bold"
          stroke="#000"
          strokeWidth={0.5}
        >
          {Math.ceil(enemy.health)}/{enemy.maxHealth}
        </text>
      )}
    </g>
  );
};

export const StatusIndicators: React.FC<{ enemy: Enemy }> = ({ enemy }) => {
  const indicators: React.JSX.Element[] = [];
  let offsetX = -enemy.size / 2;

  if (enemy.frozenUntil && enemy.frozenUntil > performance.now()) {
    indicators.push(
      <text
        key="frozen"
        x={enemy.position.x + offsetX}
        y={enemy.position.y - enemy.size / 2 - 15}
        textAnchor="middle"
        fill="#00bfff"
        fontSize="12"
      >
        ❄️
      </text>
    );
    offsetX += 15;
  }

  if (enemy.bossType && enemy.bossPhase) {
    indicators.push(
      <text
        key="phase"
        x={enemy.position.x + offsetX}
        y={enemy.position.y - enemy.size / 2 - 15}
        textAnchor="middle"
        fill="#ff6b35"
        fontSize="10"
        fontWeight="bold"
      >
        P{enemy.bossPhase}
      </text>
    );
    offsetX += 20;
  }

  if (enemy.rageMode) {
    indicators.push(
      <text
        key="rage"
        x={enemy.position.x + offsetX}
        y={enemy.position.y - enemy.size / 2 - 15}
        textAnchor="middle"
        fill="#ff0000"
        fontSize="14"
      >
        🔥
      </text>
    );
    offsetX += 15;
  }

  if (enemy.shieldStrength && enemy.shieldStrength > 0) {
    indicators.push(
      <circle
        key="shield"
        cx={enemy.position.x}
        cy={enemy.position.y}
        r={enemy.size / 2 + 8}
        fill="none"
        stroke="#00bfff"
        strokeWidth={3}
        opacity={0.6}
        style={{ animation: 'pulse 2s ease-in-out infinite alternate' }}
      />
    );
  }

  return <g>{indicators}</g>;
};

export const BossRenderer: React.FC<{ enemy: Enemy }> = ({ enemy }) => {
  const size = enemy.size;
  const pos = enemy.position;

  return (
    <g>
      <defs>
        <radialGradient id={`boss-gradient-${enemy.id}`} cx="0.3" cy="0.3">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="100%" stopColor={enemy.color} />
        </radialGradient>
        <filter id={`boss-glow-${enemy.id}`}>
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle
        cx={pos.x}
        cy={pos.y}
        r={size / 2 + 10}
        fill={enemy.color}
        opacity={0.3}
        style={{ animation: 'pulse 3s ease-in-out infinite alternate' }}
      />
      <circle
        cx={pos.x}
        cy={pos.y}
        r={size / 2}
        fill={`url(#boss-gradient-${enemy.id})`}
        stroke="#000"
        strokeWidth={4}
        filter={`url(#boss-glow-${enemy.id})`}
      />
      {[0, 60, 120, 180, 240, 300].map((angle, index) => (
        <circle
          key={index}
          cx={pos.x + (size / 3) * Math.cos((angle * Math.PI) / 180)}
          cy={pos.y + (size / 3) * Math.sin((angle * Math.PI) / 180)}
          r={size / 8}
          fill={enemy.color}
          stroke="#000"
          strokeWidth={2}
        />
      ))}
      <circle
        cx={pos.x}
        cy={pos.y}
        r={size / 4}
        fill="#fff"
        opacity={0.8}
        style={{ animation: 'pulse 1.5s ease-in-out infinite alternate' }}
      />
    </g>
  );
};

export const SpecialEnemyRenderer: React.FC<{ enemy: Enemy }> = ({ enemy }) => {
  const size = enemy.size;
  const pos = enemy.position;

  return (
    <g>
      <circle
        cx={pos.x}
        cy={pos.y}
        r={size / 2 + 4}
        fill="none"
        stroke={GAME_CONSTANTS.MICROBE_ENEMY.pulseColor}
        strokeWidth={2}
        opacity={0.6}
        style={{ animation: 'pulse 1.5s ease-in-out infinite alternate' }}
      />
      <circle
        cx={pos.x}
        cy={pos.y}
        r={size / 2}
        fill={enemy.color}
        stroke={GAME_CONSTANTS.MICROBE_ENEMY.borderColor}
        strokeWidth={3}
      />
      <circle cx={pos.x} cy={pos.y} r={size / 4} fill="#fff" opacity={0.4} />
      {[0, 120, 240].map((angle, index) => (
        <circle
          key={index}
          cx={pos.x + (size / 2 + 8) * Math.cos((angle + performance.now() / 20) * Math.PI / 180)}
          cy={pos.y + (size / 2 + 8) * Math.sin((angle + performance.now() / 20) * Math.PI / 180)}
          r={3}
          fill={GAME_CONSTANTS.MICROBE_ENEMY.pulseColor}
          opacity={0.8}
        />
      ))}
    </g>
  );
};

export const StandardEnemyRenderer: React.FC<{ enemy: Enemy }> = ({ enemy }) => {
  const size = enemy.size;
  const pos = enemy.position;
  const type = enemy.type || 'Basic';

  const getTypeSpecificElements = () => {
    switch (type) {
      case 'Tank':
        return (
          <>
            <rect
              x={pos.x - size / 2}
              y={pos.y - size / 4}
              width={size}
              height={size / 2}
              fill="#4a5568"
              stroke="#000"
              strokeWidth={2}
              rx={4}
            />
            <rect
              x={pos.x + size / 4}
              y={pos.y - 2}
              width={size / 2}
              height={4}
              fill="#2d3748"
              stroke="#000"
              strokeWidth={1}
            />
          </>
        );
      case 'Scout':
        return (
          <>
            {[0, 1, 2].map(i => (
              <line
                key={i}
                x1={pos.x - size / 2 - 5 - i * 3}
                y1={pos.y - 4 + i * 4}
                x2={pos.x - size / 2 + 2 - i * 3}
                y2={pos.y - 4 + i * 4}
                stroke="#6ee7b7"
                strokeWidth={2}
                opacity={0.7 - i * 0.2}
              />
            ))}
          </>
        );
      case 'Ghost':
        return (
          <>
            <circle
              cx={pos.x}
              cy={pos.y}
              r={size / 2 + 3}
              fill={enemy.color}
              opacity={0.3}
              style={{ animation: 'pulse 2s ease-in-out infinite alternate' }}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <g>
      {getTypeSpecificElements()}
      <circle
        cx={pos.x}
        cy={pos.y}
        r={size / 2}
        fill={enemy.color}
        stroke="#b30000"
        strokeWidth={type === 'Ghost' ? 2 : 4}
        opacity={type === 'Ghost' ? 0.7 : 1}
      />
      {type === 'Assassin' && (
        <circle cx={pos.x} cy={pos.y} r={size / 3} fill="#000" opacity={0.5} />
      )}
    </g>
  );
};

export const BossEffects: React.FC<{ enemy: Enemy }> = ({ enemy }) => {
  if (!enemy.bossType) return null;

  const pos = enemy.position;
  const size = enemy.size;

  return (
    <g>
      {enemy.environmentalEffects?.includes('seismic_activity') && (
        <g>
          {[1, 2, 3].map(i => (
            <circle
              key={i}
              cx={pos.x}
              cy={pos.y + size / 2 + i * 10}
              r={i * 15}
              fill="none"
              stroke="#8b4513"
              strokeWidth={2}
              opacity={0.3 - i * 0.1}
              style={{ animation: `pulse ${1 + i * 0.5}s ease-in-out infinite alternate` }}
            />
          ))}
        </g>
      )}
      {enemy.environmentalEffects?.includes('storm_clouds') && (
        <g>
          <circle
            cx={pos.x}
            cy={pos.y - size}
            r={size}
            fill="#2d3748"
            opacity={0.6}
            style={{ animation: 'pulse 2s ease-in-out infinite alternate' }}
          />
        </g>
      )}
      {enemy.environmentalEffects?.includes('quantum_effects') && (
        <g>
          {[0, 72, 144, 216, 288].map((angle, index) => (
            <rect
              key={index}
              x={pos.x + (size / 2 + 15) * Math.cos(angle * Math.PI / 180) - 2}
              y={pos.y + (size / 2 + 15) * Math.sin(angle * Math.PI / 180) - 8}
              width={4}
              height={16}
              fill="#6b46c1"
              opacity={0.7}
              transform={`rotate(${angle + performance.now() / 10}, ${pos.x + (size / 2 + 15) * Math.cos(angle * Math.PI / 180)}, ${pos.y + (size / 2 + 15) * Math.sin(angle * Math.PI / 180)})`}
            />
          ))}
        </g>
      )}
    </g>
  );
};

export const TypeIndicator: React.FC<{ enemy: Enemy }> = ({ enemy }) => {
  const pos = enemy.position;
  const size = enemy.size;

  let indicator = '';

  if (enemy.bossType) {
    indicator = enemy.bossType === 'legendary' ? '👑' : enemy.bossType === 'major' ? '⚔️' : '🛡️';
  } else if (enemy.isSpecial) {
    indicator = '💰';
  } else {
    switch (enemy.type) {
      case 'Tank':
        indicator = '🛡️';
        break;
      case 'Scout':
        indicator = '⚡';
        break;
      case 'Ghost':
        indicator = '👻';
        break;
      case 'Assassin':
        indicator = '🗡️';
        break;
      case 'Berserker':
        indicator = '🔥';
        break;
      case 'Shaman':
        indicator = '🔮';
        break;
      case 'Archer':
        indicator = '🏹';
        break;
      case 'Demon':
        indicator = '😈';
        break;
      case 'Wraith':
        indicator = '💜';
        break;
      case 'Golem':
        indicator = '🗿';
        break;
      case 'Phoenix':
        indicator = '🔥';
        break;
      default:
        indicator = '';
    }
  }

  if (!indicator) return null;

  return (
    <text
      x={pos.x}
      y={pos.y + size / 2 + 20}
      textAnchor="middle"
      fill="#fff"
      fontSize={enemy.bossType ? '16' : '12'}
      fontWeight="bold"
      stroke="#000"
      strokeWidth={0.5}
    >
      {indicator}
    </text>
  );
};

