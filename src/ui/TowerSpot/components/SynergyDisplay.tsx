import React from 'react';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { towerSynergyManager } from '../../../game-systems/tower-system/TowerSynergyManager';
import type { TowerSlot } from '../../../models/gameTypes';

interface SynergyDisplayProps {
  towerSlots: TowerSlot[];
  isVisible: boolean;
}

/**
 * Synergy Display Component
 * Shows active synergies and their effects in the UI
 * Optimized for performance and cross-platform compatibility
 */
export const SynergyDisplay: React.FC<SynergyDisplayProps> = React.memo(({ 
  towerSlots, 
  isVisible 
}) => {
  if (!isVisible) return null;

  const activeSynergies = towerSynergyManager.getActiveSynergies(towerSlots);
  const visualEffects = towerSynergyManager.getSynergyVisualEffects(towerSlots);

  return (
    <g>
      {/* Visual synergy effects */}
      {visualEffects.map((effect, index) => (
        <circle
          key={`synergy-effect-${index}`}
          cx={effect.position.x}
          cy={effect.position.y}
          r={effect.radius}
          fill="none"
          stroke={effect.color}
          strokeWidth={2}
          opacity={effect.opacity}
          strokeDasharray={effect.type === 'synergy' ? '4 2' : '2 2'}
        />
      ))}

      {/* Synergy info panels */}
      {activeSynergies.map((towerSynergy) => {
        const slot = towerSlots.find(s => s.tower?.id === towerSynergy.towerId);
        if (!slot?.tower) return null;

        return (
          <g key={`synergy-panel-${towerSynergy.towerId}`}>
            {/* Background panel */}
            <rect
              x={slot.x - 80}
              y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 60}
              width={160}
              height={50}
              fill="rgba(0, 0, 0, 0.8)"
              stroke="#00FFFF"
              strokeWidth={1}
              rx={4}
            />
            
            {/* Synergy title */}
            <text
              x={slot.x}
              y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 45}
              fill="#00FFFF"
              fontSize={10}
              fontWeight="bold"
              textAnchor="middle"
            >
              Synergy Active
            </text>
            
            {/* Synergy details */}
            {towerSynergy.synergies.map((synergy, index) => (
              <text
                key={`synergy-detail-${index}`}
                x={slot.x}
                y={slot.y - GAME_CONSTANTS.TOWER_SIZE / 2 - 30 + (index * 12)}
                fill="#FFFFFF"
                fontSize={8}
                textAnchor="middle"
              >
                {synergy.description}
              </text>
            ))}
          </g>
        );
      })}
    </g>
  );
});

SynergyDisplay.displayName = 'SynergyDisplay'; 