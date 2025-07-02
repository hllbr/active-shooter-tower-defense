import React from 'react';
import { useGameStore } from '../../../models/store';
import type { Store } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { formatCurrency, getAffordabilityColor, getUnifiedButtonText, formatSmartPercentage, formatProfessional } from '../../../utils/formatters';
import { playSound } from '../../../utils/sound/soundEffects';

export const WallUpgrade: React.FC = () => {
  const gold = useGameStore((s: Store) => s.gold);
  const wallLevel = useGameStore((s: Store) => s.wallLevel);
  const defenseUpgradeLimits = useGameStore((s: Store) => s.defenseUpgradeLimits);
  const upgradeWall = useGameStore((s: Store) => s.upgradeWall);

  const maxWallLevel = GAME_CONSTANTS.WALL_SYSTEM.WALL_LEVELS.length;
  
  const isMaxWallLevel = wallLevel >= maxWallLevel;
  const isMaxWallPurchases = defenseUpgradeLimits.walls.purchaseCount >= GAME_CONSTANTS.DEFENSE_UPGRADE_LIMITS.WALLS.MAX_PURCHASES;
  const isWallUpgradeBlocked = isMaxWallLevel || isMaxWallPurchases;
  
  const wallUpgrade = isWallUpgradeBlocked ? null : GAME_CONSTANTS.WALL_SYSTEM.WALL_LEVELS[wallLevel];
  const canAffordWall = wallUpgrade && gold >= wallUpgrade.cost;

  const handleWallUpgrade = () => {
    if (canAffordWall && !isWallUpgradeBlocked) {
      upgradeWall();
      playSound('upgrade-purchase');
    }
  };

  return (
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
          {isWallUpgradeBlocked
            ? isMaxWallPurchases
              ? `Sur limiti doldu! (${defenseUpgradeLimits.walls.purchaseCount}/${GAME_CONSTANTS.DEFENSE_UPGRADE_LIMITS.WALLS.MAX_PURCHASES})`
              : 'Sur sistemi tamamen geliştirildi!'
            : `${wallUpgrade?.name} - Güç: ${wallUpgrade?.strength}, 
               Yenilenme: ${formatProfessional((wallUpgrade?.regenTime || 0)/1000, 'stats')}s, 
               Ateş Hızı: ${formatSmartPercentage(((wallUpgrade?.fireRateBonus || 1) - 1), 'effectiveness')} artış`
          }
        </p>
        <p style={{ margin: '4px 0 0', color: '#ff6b6b', fontSize: '12px' }}>
          ⚠️ Sur yokken düşmanlar yavaşlar ve zaman donar! Surlar otomatik yenilenir.
        </p>
        {/* Limit information display */}
        <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
          Kalan hak: {GAME_CONSTANTS.DEFENSE_UPGRADE_LIMITS.WALLS.MAX_PURCHASES - defenseUpgradeLimits.walls.purchaseCount}
        </div>
      </div>
      
      {!isWallUpgradeBlocked && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold',
            color: getAffordabilityColor(wallUpgrade?.cost || 0, gold)
          }}>
            {formatCurrency(wallUpgrade?.cost || 0)} 💰
          </div>
          <button 
            onClick={handleWallUpgrade}
            disabled={!canAffordWall}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: canAffordWall 
                ? 'linear-gradient(135deg, #0096ff, #47a3ff)' 
                : 'rgba(255,255,255,0.1)',
              color: canAffordWall ? '#fff' : '#666',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: canAffordWall ? 'pointer' : 'not-allowed',
              textShadow: canAffordWall ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
            }}
          >
            {canAffordWall ? '🛡️ Yükselt' : '❌ Yetersiz'}
          </button>
        </div>
      )}
      
      {isWallUpgradeBlocked && (
        <div style={{
          padding: '8px 16px',
          borderRadius: '8px',
          background: 'rgba(255,255,255,0.05)',
          color: '#4ade80',
          fontSize: '14px',
          fontWeight: 'bold',
          border: '2px solid #4ade80',
        }}>
          {getUnifiedButtonText(true, false, false, 'upgrade')}
        </div>
      )}
    </div>
  );
}; 