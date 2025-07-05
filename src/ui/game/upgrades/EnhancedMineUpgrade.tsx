import React, { useState } from 'react';
import type { Store } from '../../../models/store';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/constants/gameConstants';
import { formatCurrency } from '../../../utils/formatters';
import { playSound } from '../../../utils/sound/soundEffects';

interface MineSelectionProps {
  onMineSelect: (mineType: 'explosive' | 'utility' | 'area_denial', mineSubtype: string) => void;
  gold: number;
  currentMines: number;
  maxMines: number;
}

const MineSelection: React.FC<MineSelectionProps> = ({ onMineSelect, gold, currentMines, maxMines }) => {
  const [selectedCategory, setSelectedCategory] = useState<'explosive' | 'utility' | 'area_denial' | null>(null);
  
  const mineCategories = {
    explosive: { name: 'Explosive', icon: '💥', color: '#dc2626' },
    utility: { name: 'Utility', icon: '⚡', color: '#2563eb' },
    area_denial: { name: 'Area Denial', icon: '🚫', color: '#7c2d12' }
  };

  const renderMineCategory = (category: 'explosive' | 'utility' | 'area_denial') => {
    const categoryInfo = mineCategories[category];
    const mines = GAME_CONSTANTS.MINE_TYPES[category];
    
    return (
      <div key={category} style={{ marginBottom: 16 }}>
        <div 
          style={{
            background: categoryInfo.color,
            color: 'white',
            padding: '8px 12px',
            borderRadius: '8px 8px 0 0',
            fontWeight: 'bold',
            fontSize: 14,
            cursor: 'pointer'
          }}
          onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
        >
          {categoryInfo.icon} {categoryInfo.name} {selectedCategory === category ? '▼' : '▶'}
        </div>
        
        {selectedCategory === category && (
          <div style={{
            background: '#1f2937',
            border: `2px solid ${categoryInfo.color}`,
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            padding: 12
          }}>
            {Object.entries(mines).map(([mineSubtype, mineConfig]) => {
              const canAfford = gold >= mineConfig.cost;
              const isAvailable = currentMines < maxMines;
              
              return (
                <div 
                  key={mineSubtype}
                  style={{
                    background: canAfford && isAvailable ? '#374151' : '#4b5563',
                    border: '1px solid #6b7280',
                    borderRadius: 6,
                    padding: 8,
                    marginBottom: 8,
                    cursor: canAfford && isAvailable ? 'pointer' : 'not-allowed',
                    opacity: canAfford && isAvailable ? 1 : 0.6
                  }}
                  onClick={() => {
                    if (canAfford && isAvailable) {
                      onMineSelect(category, mineSubtype);
                    }
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}>
                    <div>
                      <div style={{ 
                        color: '#fbbf24', 
                        fontSize: 12, 
                        fontWeight: 'bold' 
                      }}>
                        {mineConfig.icon} {mineConfig.name}
                      </div>
                      <div style={{ 
                        color: '#d1d5db', 
                        fontSize: 10, 
                        marginTop: 2 
                      }}>
                        {mineConfig.description}
                      </div>
                      <div style={{ 
                        color: '#9ca3af', 
                        fontSize: 9, 
                        marginTop: 2 
                      }}>
                        DMG: {mineConfig.damage} | Radius: {mineConfig.radius}
                      </div>
                    </div>
                    <div style={{ 
                      color: canAfford ? '#10b981' : '#ef4444', 
                      fontSize: 12, 
                      fontWeight: 'bold' 
                    }}>
                      {formatCurrency(mineConfig.cost)} 💰
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ 
        color: '#fbbf24', 
        fontSize: 14, 
        fontWeight: 'bold', 
        marginBottom: 12,
        textAlign: 'center'
      }}>
        💣 Select Mine Type ({currentMines}/{maxMines})
      </div>
      
      {Object.keys(mineCategories).map(category => 
        renderMineCategory(category as 'explosive' | 'utility' | 'area_denial')
      )}
      
      <div style={{
        background: '#374151',
        border: '1px solid #6b7280',
        borderRadius: 6,
        padding: 8,
        marginTop: 12,
        fontSize: 10,
        color: '#9ca3af',
        textAlign: 'center'
      }}>
        ⚠️ Mine Placement Limits: Max {GAME_CONSTANTS.MINE_PLACEMENT_LIMITS.MAX_MINES_PER_WAVE} per wave
        <br />
        Min distance between mines: {GAME_CONSTANTS.MINE_PLACEMENT_LIMITS.MIN_DISTANCE_BETWEEN_MINES}px
      </div>
    </div>
  );
};

export const EnhancedMineUpgrade: React.FC = () => {
  const [showMineSelection, setShowMineSelection] = useState(false);
  const gold: number = useGameStore((s: Store) => s.gold);
  const mines = useGameStore((s: Store) => s.mines);
  const deploySpecializedMine = useGameStore((s: Store) => s.deploySpecializedMine);
  const mineLevel: number = useGameStore((s: Store) => s.mineLevel);
  const upgradeMines = useGameStore((s: Store) => s.upgradeMines);
  const deployMines = useGameStore((s: Store) => s.deployMines);
  const defenseUpgradeLimits = useGameStore((s: Store) => s.defenseUpgradeLimits);
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
  
  const currentMines = mines.length;
  const maxMines = GAME_CONSTANTS.MINE_PLACEMENT_LIMITS.MAX_MINES_PER_WAVE;

  const handleMineUpgrade = (): void => {
    if (canAffordMines && !isMineUpgradeBlocked && mineUpgrade) {
      upgradeMines();
      setTimeout(deployMines, 100);
      playSound('upgrade-purchase');
    }
  };

  const handleMineSelect = (mineType: 'explosive' | 'utility' | 'area_denial', mineSubtype: string): void => {
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
            disabled={!canAffordMines}
            style={{
              background: canAffordMines ? '#16a34a' : '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 12,
              fontWeight: 'bold',
              cursor: canAffordMines ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
              opacity: canAffordMines ? 1 : 0.7
            }}
          >
            Upgrade Basic Mines
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
          disabled={currentMines >= maxMines}
          style={{
            background: currentMines >= maxMines ? '#6b7280' : '#16a34a',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 'bold',
            cursor: currentMines >= maxMines ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            width: '100%'
          }}
        >
          {showMineSelection ? 'Hide Mine Selection' : 'Deploy Specialized Mine'}
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