import React from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/Constants';

export const ShieldUpgrades: React.FC = () => {
  const gold = useGameStore((s) => s.gold);
  const purchaseShield = useGameStore((s) => s.purchaseShield);

  return (
    <div style={{ width: '100%' }}>
      <span style={{ fontWeight: 'bold', fontSize: 18, color: GAME_CONSTANTS.GOLD_COLOR, marginBottom: 12, display: 'block' }}>
        🛡️ Kalkanlar
      </span>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 12
      }}>
        {GAME_CONSTANTS.WALL_SHIELDS.map((shield, i) => {
          const isDisabled = gold < shield.cost;
          const shieldColor = isDisabled ? '#444' : '#aa00ff';
          return (
            <div
              key={i}
              style={{
                padding: 12,
                borderRadius: 8,
                border: `2px solid ${shieldColor}`,
                background: isDisabled ? '#1a1a1a' : 'rgba(170, 0, 255, 0.1)',
                opacity: isDisabled ? 0.6 : 1,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isDisabled ? 'none' : '0 2px 8px rgba(170, 0, 255, 0.2)',
              }}
              onClick={() => {
                if (!isDisabled) {
                  purchaseShield(i);
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{
                  fontWeight: 'bold',
                  fontSize: 16,
                  color: isDisabled ? '#888' : shieldColor
                }}>
                  {shield.name}
                </span>
                <span style={{
                  fontWeight: 'bold',
                  fontSize: 14,
                  color: isDisabled ? '#888' : GAME_CONSTANTS.GOLD_COLOR
                }}>
                  {shield.cost} 💰
                </span>
              </div>
              <div style={{
                fontSize: 12,
                color: isDisabled ? '#888' : '#aaa',
                textAlign: 'left'
              }}>
                +{shield.strength} Kalkan Gücü
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 