import React, { useState } from 'react';
import type { Store } from '../../../models/store';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/constants/gameConstants';
import { formatCurrency } from '../../../utils/formatters';
import { playSound } from '../../../utils/sound/soundEffects';
import { MineSelection } from './components/MineSelection';
import { getMineUpgradeState } from './helpers/mineUpgradeHelpers';
import { toast } from 'react-toastify';

export const EnhancedMineUpgrade = () => {
  const [showMineSelection, setShowMineSelection] = useState(false);
  const gold: number = useGameStore((s: Store) => s.gold);
  const energy: number = useGameStore((s: Store) => s.energy);
  const mines = useGameStore((s: Store) => s.mines);
  const deploySpecializedMine = useGameStore((s: Store) => s.deploySpecializedMine);
  const mineLevel: number = useGameStore((s: Store) => s.mineLevel);
  const upgradeMines = useGameStore((s: Store) => s.upgradeMines);
  const deployMines = useGameStore((s: Store) => s.deployMines);
  const defenseUpgradeLimits = useGameStore((s: Store) => s.defenseUpgradeLimits);
  const discountMultiplier = useGameStore((s: Store) => s.discountMultiplier);
  const diceUsed = useGameStore((s: Store) => s.diceUsed);

  const {
    isMaxMineLevel: _isMaxMineLevel,
    isMaxMinePurchases,
    isMineUpgradeBlocked,
    mineUpgrade,
    baseCost,
    finalCost,
    canAffordMines
  } = getMineUpgradeState(gold, mineLevel, defenseUpgradeLimits, discountMultiplier, diceUsed);
  
  const currentMines = mines.length;
  const maxMines = GAME_CONSTANTS.MINE_PLACEMENT_LIMITS.MAX_MINES_PER_WAVE;
  
  // Energy cost checks
  const basicMineEnergyCost = GAME_CONSTANTS.ENERGY_COSTS.deployMine;
  const specializedMineEnergyCost = GAME_CONSTANTS.ENERGY_COSTS.deploySpecializedMine;
  const canAffordBasicMineEnergy = energy >= basicMineEnergyCost;
  const canAffordSpecializedMineEnergy = energy >= specializedMineEnergyCost;

  const handleMineUpgrade = (): void => {
    if (canAffordMines && canAffordBasicMineEnergy && !isMineUpgradeBlocked && mineUpgrade) {
      upgradeMines();
      setTimeout(deployMines, 100);
      playSound('upgrade-purchase');
    }
  };

  const handleMineSelect = (mineType: 'explosive' | 'utility' | 'area_denial', mineSubtype: string): void => {
    if (!canAffordSpecializedMineEnergy) {
      toast.warning('Yetersiz enerji!');
      playSound('error');
      return;
    }
    deploySpecializedMine(mineType, mineSubtype);
    playSound('tower-create-sound');
    setShowMineSelection(false);
  };

  // Mine type distribution display
  const mineTypeStats = {
    explosive: mines.filter(m => m.mineType === 'explosive').length,
    utility: mines.filter(m => m.mineType === 'utility').length,
    area_denial: mines.filter(m => m.mineType === 'area_denial').length
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
          💣 Enhanced Mine System
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
            {isMineUpgradeBlocked ? 'MAX' : `Level ${mineLevel + 1}`}
          </span>
        </div>
      </div>

      {/* Mine Type Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8,
        marginBottom: 12
      }}>
        <div style={{
          background: '#dc2626',
          color: 'white',
          padding: '4px 8px',
          borderRadius: 4,
          fontSize: 10,
          textAlign: 'center'
        }}>
          💥 Explosive: {mineTypeStats.explosive}/{GAME_CONSTANTS.MINE_PLACEMENT_LIMITS.MAX_MINES_PER_TYPE.explosive}
        </div>
        <div style={{
          background: '#2563eb',
          color: 'white',
          padding: '4px 8px',
          borderRadius: 4,
          fontSize: 10,
          textAlign: 'center'
        }}>
          ⚡ Utility: {mineTypeStats.utility}/{GAME_CONSTANTS.MINE_PLACEMENT_LIMITS.MAX_MINES_PER_TYPE.utility}
        </div>
        <div style={{
          background: '#7c2d12',
          color: 'white',
          padding: '4px 8px',
          borderRadius: 4,
          fontSize: 10,
          textAlign: 'center'
        }}>
          🚫 Area Denial: {mineTypeStats.area_denial}/{GAME_CONSTANTS.MINE_PLACEMENT_LIMITS.MAX_MINES_PER_TYPE.area_denial}
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
            ? `Mine limit reached! (${defenseUpgradeLimits.mines.purchaseCount}/${GAME_CONSTANTS.DEFENSE_UPGRADE_LIMITS.MINES.MAX_PURCHASES})`
            : 'Mine system fully upgraded!'
          : `Level ${mineLevel + 1} - Advanced mine deployment system with specialized mine types`
        }
      </p>

      {/* Basic Mine Upgrade */}
      {!isMineUpgradeBlocked && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <span style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: canAffordMines ? '#10b981' : '#ef4444'
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
            disabled={!canAffordMines || !canAffordBasicMineEnergy}
            style={{
              background: (canAffordMines && canAffordBasicMineEnergy) ? '#16a34a' : '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 12,
              fontWeight: 'bold',
              cursor: (canAffordMines && canAffordBasicMineEnergy) ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              opacity: (canAffordMines && canAffordBasicMineEnergy) ? 1 : 0.7
            }}
          >
            Upgrade Basic Mines ({basicMineEnergyCost}⚡)
          </button>
        </div>
      )}

      {/* Specialized Mine Deployment */}
      <div style={{
        borderTop: '1px solid #6b7280',
        paddingTop: 16
      }}>
        <button
          onClick={() => setShowMineSelection(!showMineSelection)}
          disabled={currentMines >= maxMines || !canAffordSpecializedMineEnergy}
          style={{
            background: (currentMines >= maxMines || !canAffordSpecializedMineEnergy) ? '#6b7280' : '#16a34a',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 'bold',
            cursor: (currentMines >= maxMines || !canAffordSpecializedMineEnergy) ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            width: '100%'
          }}
        >
          {showMineSelection ? 'Hide Mine Selection' : `Deploy Specialized Mine (${specializedMineEnergyCost}⚡)`}
        </button>

        {showMineSelection && (
          <MineSelection
            onMineSelect={handleMineSelect}
            gold={gold}
            currentMines={currentMines}
            maxMines={maxMines}
          />
        )}
      </div>
    </div>
  );
}; 