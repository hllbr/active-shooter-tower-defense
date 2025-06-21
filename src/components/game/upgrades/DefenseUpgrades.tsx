import React from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/Constants';

export const DefenseUpgrades: React.FC = () => {
  const gold = useGameStore((s) => s.gold);
  const mineLevel = useGameStore((s) => s.mineLevel);
  const upgradeMines = useGameStore((s) => s.upgradeMines);
  const deployMines = useGameStore((s) => s.deployMines);

  const maxLevel = GAME_CONSTANTS.MINE_UPGRADES.length;
  const isMaxLevel = mineLevel >= maxLevel;
  const upgrade = isMaxLevel ? null : GAME_CONSTANTS.MINE_UPGRADES[mineLevel];
  const canAfford = upgrade && gold >= upgrade.cost;

  const handleUpgrade = () => {
    if (canAfford) {
      upgradeMines();
      // Deploy mines immediately on upgrade to see the new ones
      setTimeout(deployMines, 100); 
    }
  };

  return (
    <div style={{ width: '100%', marginTop: '24px' }}>
      <span style={{ fontWeight: 'bold', fontSize: 18, color: GAME_CONSTANTS.GOLD_COLOR, marginBottom: 12, display: 'block' }}>
        💣 Ek Savunma Sistemleri
      </span>
      <div style={{
        background: 'rgba(255, 69, 0, 0.1)',
        padding: '20px',
        borderRadius: '12px',
        border: `2px solid ${GAME_CONSTANTS.MINE_VISUALS.borderColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
      }}>
        <div>
          <h4 style={{ margin: 0, color: '#ff4500', fontSize: '18px' }}>Stratejik Mayın Tarlası</h4>
          <p style={{ margin: '8px 0 0', color: '#ccc', fontSize: '14px' }}>
            {isMaxLevel
              ? 'Mayın sistemi tamamen geliştirildi!'
              : `Haritaya ${upgrade?.count} adet mayın döşer. Her mayın ${upgrade?.damage} hasar verir.`
            }
          </p>
        </div>
        <button
          onClick={handleUpgrade}
          disabled={isMaxLevel || !canAfford}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '8px',
            cursor: (isMaxLevel || !canAfford) ? 'not-allowed' : 'pointer',
            background: isMaxLevel ? '#333' : canAfford ? '#ff4500' : '#555',
            color: isMaxLevel ? '#666' : '#fff',
            border: `2px solid ${isMaxLevel ? '#444' : canAfford ? '#fff' : '#777'}`,
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
        >
          {isMaxLevel
            ? 'MAX SEVİYE'
            : `Yükselt (${upgrade?.cost}💰)`
          }
        </button>
      </div>
    </div>
  );
}; 