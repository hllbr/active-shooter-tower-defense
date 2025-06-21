import React from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/Constants';

export const DefenseUpgrades: React.FC = () => {
  const gold = useGameStore((s) => s.gold);
  const mineLevel = useGameStore((s) => s.mineLevel);
  const wallLevel = useGameStore((s) => s.wallLevel);
  const upgradeMines = useGameStore((s) => s.upgradeMines);
  const upgradeWall = useGameStore((s) => s.upgradeWall);
  const deployMines = useGameStore((s) => s.deployMines);

  const maxMineLevel = GAME_CONSTANTS.MINE_UPGRADES.length;
  const maxWallLevel = GAME_CONSTANTS.WALL_SYSTEM.WALL_LEVELS.length;
  const isMaxMineLevel = mineLevel >= maxMineLevel;
  const isMaxWallLevel = wallLevel >= maxWallLevel;
  
  const mineUpgrade = isMaxMineLevel ? null : GAME_CONSTANTS.MINE_UPGRADES[mineLevel];
  const wallUpgrade = isMaxWallLevel ? null : GAME_CONSTANTS.WALL_SYSTEM.WALL_LEVELS[wallLevel];
  
  const canAffordMines = mineUpgrade && gold >= mineUpgrade.cost;
  const canAffordWall = wallUpgrade && gold >= wallUpgrade.cost;

  const handleMineUpgrade = () => {
    if (canAffordMines) {
      upgradeMines();
      // Deploy mines immediately on upgrade to see the new ones
      setTimeout(deployMines, 100); 
    }
  };

  const handleWallUpgrade = () => {
    if (canAffordWall) {
      upgradeWall();
    }
  };

  return (
    <div style={{ width: '100%', marginTop: '24px' }}>
      {/* Mayın Sistemi */}
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
        marginBottom: '20px',
      }}>
        <div>
          <h4 style={{ margin: 0, color: '#ff4500', fontSize: '18px' }}>Stratejik Mayın Tarlası</h4>
          <p style={{ margin: '8px 0 0', color: '#ccc', fontSize: '14px' }}>
            {isMaxMineLevel
              ? 'Mayın sistemi tamamen geliştirildi!'
              : `Haritaya ${mineUpgrade?.count} adet mayın döşer. Her mayın ${mineUpgrade?.damage} hasar verir.`
            }
          </p>
        </div>
        <button
          onClick={handleMineUpgrade}
          disabled={isMaxMineLevel || !canAffordMines}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '8px',
            cursor: (isMaxMineLevel || !canAffordMines) ? 'not-allowed' : 'pointer',
            background: isMaxMineLevel ? '#333' : canAffordMines ? '#ff4500' : '#555',
            color: isMaxMineLevel ? '#666' : '#fff',
            border: `2px solid ${isMaxMineLevel ? '#444' : canAffordMines ? '#fff' : '#777'}`,
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
        >
          {isMaxMineLevel
            ? 'MAX SEVİYE'
            : `Yükselt (${mineUpgrade?.cost}💰)`
          }
        </button>
      </div>

      {/* Sur Güçlendirmesi */}
      <span style={{ fontWeight: 'bold', fontSize: 18, color: GAME_CONSTANTS.GOLD_COLOR, marginBottom: 12, display: 'block' }}>
        🛡️ Sur Güçlendirmesi
      </span>
      <div style={{
        background: 'rgba(0, 150, 255, 0.1)',
        padding: '20px',
        borderRadius: '12px',
        border: '2px solid #0096ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
      }}>
        <div>
          <h4 style={{ margin: 0, color: '#0096ff', fontSize: '18px' }}>Global Savunma Sistemi</h4>
          <p style={{ margin: '8px 0 0', color: '#ccc', fontSize: '14px' }}>
            {isMaxWallLevel
              ? 'Sur sistemi tamamen geliştirildi!'
              : `${wallUpgrade?.name} - Güç: ${wallUpgrade?.strength}, Yenilenme: ${(wallUpgrade?.regenTime || 0)/1000}s, Ateş Hızı: +${((wallUpgrade?.fireRateBonus || 1) - 1) * 100}%`
            }
          </p>
          <p style={{ margin: '4px 0 0', color: '#ff6b6b', fontSize: '12px' }}>
            ⚠️ Sur yokken düşmanlar yavaşlar ve zaman donar! Surlar otomatik yenilenir.
          </p>
        </div>
        <button
          onClick={handleWallUpgrade}
          disabled={isMaxWallLevel || !canAffordWall}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '8px',
            cursor: (isMaxWallLevel || !canAffordWall) ? 'not-allowed' : 'pointer',
            background: isMaxWallLevel ? '#333' : canAffordWall ? '#0096ff' : '#555',
            color: isMaxWallLevel ? '#666' : '#fff',
            border: `2px solid ${isMaxWallLevel ? '#444' : canAffordWall ? '#fff' : '#777'}`,
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
        >
          {isMaxWallLevel
            ? 'MAX SEVİYE'
            : `Yükselt (${wallUpgrade?.cost}💰)`
          }
        </button>
      </div>
    </div>
  );
}; 