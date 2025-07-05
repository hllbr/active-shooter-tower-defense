import React from 'react';
import type { Store } from '../../../models/store';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/constants/gameConstants';
import { formatCurrency } from '../../../utils/formatters';
import { UI_TEXTS, getUnifiedButtonText, getAffordabilityColor } from '../../../utils/constants';

export const WallUpgrade: React.FC = () => {
  const gold = useGameStore((s: Store) => s.gold);
  const wallLevel = useGameStore((s: Store) => s.wallLevel);
  const defenseUpgradeLimits = useGameStore((s: Store) => s.defenseUpgradeLimits);
  const upgradeWall = useGameStore((s: Store) => s.upgradeWall);
  const discountMultiplier = useGameStore((s: Store) => s.discountMultiplier);
  const diceUsed = useGameStore((s: Store) => s.diceUsed);

  const maxWallLevel = GAME_CONSTANTS.WALL_SYSTEM.WALL_LEVELS.length;
  const isMaxWallLevel = wallLevel >= maxWallLevel;
  const isMaxWallPurchases = defenseUpgradeLimits.walls.purchaseCount >= GAME_CONSTANTS.DEFENSE_UPGRADE_LIMITS.WALLS.MAX_PURCHASES;
  const isWallUpgradeBlocked = isMaxWallLevel || isMaxWallPurchases;

  const wallUpgrade = isWallUpgradeBlocked ? null : GAME_CONSTANTS.WALL_SYSTEM.WALL_LEVELS[wallLevel];
  const baseCost = wallUpgrade?.cost || 0;
  const discountedCost = diceUsed && discountMultiplier > 0 
    ? Math.floor(baseCost * (1 - discountMultiplier))
    : baseCost;
  const finalCost = Math.max(1, discountedCost);
  const canAffordWall = !!(wallUpgrade && gold >= finalCost);

  const handleWallUpgrade = () => {
    if (canAffordWall && !isWallUpgradeBlocked) {
      upgradeWall();
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(145deg, #1e293b 0%, #334155 100%)',
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      border: '2px solid #64748b',
      boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
      }}>
        <h3 style={{
          color: '#64748b',
          fontSize: 20,
          fontWeight: 'bold',
          margin: 0,
          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
        }}>
          🛡️ {UI_TEXTS.UPGRADES.WALL}
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <span style={{
            background: isWallUpgradeBlocked ? '#4ade80' : '#1f2937',
            color: isWallUpgradeBlocked ? '#000' : '#fff',
            padding: '4px 8px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 'bold'
          }}>
            {isWallUpgradeBlocked ? UI_TEXTS.STATUS.COMPLETED : `Seviye ${wallLevel + 1}`}
          </span>
        </div>
      </div>

      <p style={{
        color: '#d1d5db',
        fontSize: 14,
        lineHeight: 1.5,
        margin: '0 0 16px 0'
      }}>
        {isWallUpgradeBlocked
          ? isMaxWallPurchases
            ? `Duvar limiti doldu! (${defenseUpgradeLimits.walls.purchaseCount}/${GAME_CONSTANTS.DEFENSE_UPGRADE_LIMITS.WALLS.MAX_PURCHASES})`
            : 'Duvar sistemi tamamen geliştirildi!'
          : `Seviye ${wallLevel + 1} - ${wallUpgrade?.name} - Güç: ${wallUpgrade?.strength}, Yenilenme: ${((wallUpgrade?.regenTime || 0)/1000)}s`
        }
      </p>

      {!isWallUpgradeBlocked && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <span style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: getAffordabilityColor(finalCost, gold)
            }}>
              {formatCurrency(finalCost)} 💰
            </span>
            {diceUsed && discountMultiplier > 0 && (
              <span style={{
                fontSize: 12,
                color: '#4ade80',
                textDecoration: 'line-through'
              }}>
                {formatCurrency(baseCost)} 💰
              </span>
            )}
          </div>

          <button
            onClick={handleWallUpgrade}
            disabled={!canAffordWall}
            style={{
              background: canAffordWall ? '#16a34a' : '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 'bold',
              cursor: canAffordWall ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              opacity: canAffordWall ? 1 : 0.7
            }}
          >
            {getUnifiedButtonText(false, canAffordWall, false, 'upgrade')}
          </button>
        </div>
      )}
      
      {isWallUpgradeBlocked && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            padding: '10px 20px',
            borderRadius: 8,
            background: '#4ade80',
            color: '#000',
            fontSize: 14,
            fontWeight: 'bold',
            border: '2px solid #4ade80'
          }}>
            {UI_TEXTS.BUTTONS.MAXED}
          </div>
        </div>
      )}
    </div>
  );
}; 