import React from 'react';
import type { Store } from '../../../models/store';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/constants/gameConstants';
import { formatCurrency } from '../../../utils/formatters';
import { UI_TEXTS, getUnifiedButtonText, getAffordabilityColor } from '../../../utils/constants';
import { playSound } from '../../../utils/sound/soundEffects';

export const MineUpgrade: React.FC = () => {
  const gold: number = useGameStore((s: Store) => s.gold);
  const mineLevel: number = useGameStore((s: Store) => s.mineLevel);
  const defenseUpgradeLimits = useGameStore((s: Store) => s.defenseUpgradeLimits);
  const upgradeMines = useGameStore((s: Store) => s.upgradeMines);
  const deployMines = useGameStore((s: Store) => s.deployMines);
  const discountMultiplier = useGameStore((s: Store) => s.discountMultiplier);
  const diceUsed = useGameStore((s: Store) => s.diceUsed);

  const maxMineLevel: number = GAME_CONSTANTS.MINE_UPGRADES.length;
  const isMaxMineLevel: boolean = mineLevel >= maxMineLevel;
  const isMaxMinePurchases: boolean = defenseUpgradeLimits.mines.purchaseCount >= GAME_CONSTANTS.DEFENSE_UPGRADE_LIMITS.MINES.MAX_PURCHASES;
  const isMineUpgradeBlocked: boolean = isMaxMineLevel || isMaxMinePurchases;
  
  const mineUpgrade = isMineUpgradeBlocked ? null : GAME_CONSTANTS.MINE_UPGRADES[mineLevel];
  const baseCost = mineUpgrade?.cost || 0;
  const discountedCost = diceUsed && discountMultiplier > 0 
    ? Math.floor(baseCost * (1 - discountMultiplier))
    : baseCost;
  const finalCost = Math.max(1, discountedCost);
  const canAffordMines: boolean = mineUpgrade ? gold >= finalCost : false;

  const handleMineUpgrade = (): void => {
    if (canAffordMines && !isMineUpgradeBlocked && mineUpgrade) {
      upgradeMines();
      setTimeout(deployMines, 100);
      playSound('upgrade-purchase');
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(145deg, #2a1810 0%, #4a2818 100%)',
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      border: '2px solid #8b4513',
      boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
      }}>
        <h3 style={{
          color: '#fbbf24',
          fontSize: 20,
          fontWeight: 'bold',
          margin: 0,
          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
        }}>
          💣 {UI_TEXTS.UPGRADES.MINE}
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <span style={{
            background: isMineUpgradeBlocked ? '#4ade80' : '#1f2937',
            color: isMineUpgradeBlocked ? '#000' : '#fff',
            padding: '4px 8px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 'bold'
          }}>
            {isMineUpgradeBlocked ? UI_TEXTS.STATUS.COMPLETED : `Seviye ${mineLevel + 1}`}
          </span>
        </div>
      </div>

      <p style={{
        color: '#d1d5db',
        fontSize: 14,
        lineHeight: 1.5,
        margin: '0 0 16px 0'
      }}>
        {isMineUpgradeBlocked
          ? isMaxMinePurchases
            ? `Mayın limiti doldu! (${defenseUpgradeLimits.mines.purchaseCount}/${GAME_CONSTANTS.DEFENSE_UPGRADE_LIMITS.MINES.MAX_PURCHASES})`
            : 'Mayın sistemi tamamen geliştirildi!'
          : `Seviye ${mineLevel + 1} - Hasar: ${(mineUpgrade?.damage || 0) / 100}% düşman canı, Menzil: ${mineUpgrade?.radius}, Mayın sayısı: ${mineUpgrade?.count}`
        }
      </p>

      {!isMineUpgradeBlocked && (
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
            onClick={handleMineUpgrade}
            disabled={!canAffordMines}
            style={{
              background: canAffordMines ? '#16a34a' : '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 'bold',
              cursor: canAffordMines ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              opacity: canAffordMines ? 1 : 0.7
            }}
          >
            {getUnifiedButtonText(false, canAffordMines, false, 'upgrade')}
          </button>
        </div>
      )}
      
      {isMineUpgradeBlocked && (
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