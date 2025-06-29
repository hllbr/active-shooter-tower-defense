import React from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { formatCurrency, getAffordabilityColor, getUnifiedButtonText, formatSmartPercentage } from '../../../utils/formatters';
import type { Store } from '../../../models/store';

// Type for mine upgrade data
interface MineUpgradeData {
  cost: number;
  count: number;
  damage: number;
  radius: number;
  description?: string;
}

export const MineUpgrade: React.FC = () => {
    const gold: number = useGameStore((s: Store) => s.gold);
    const mineLevel: number = useGameStore((s: Store) => s.mineLevel);
    const defenseUpgradeLimits = useGameStore((s: Store) => s.defenseUpgradeLimits);
    const upgradeMines = useGameStore((s: Store) => s.upgradeMines);
    const deployMines = useGameStore((s: Store) => s.deployMines);

  const maxMineLevel: number = GAME_CONSTANTS.MINE_UPGRADES.length;
  
  // CRITICAL FIX: Proper limit checking for unlimited purple cards bug
  const isMaxMineLevel: boolean = mineLevel >= maxMineLevel;
  const isMaxMinePurchases: boolean = defenseUpgradeLimits.mines.purchaseCount >= GAME_CONSTANTS.DEFENSE_UPGRADE_LIMITS.MINES.MAX_PURCHASES;
  const isMineUpgradeBlocked: boolean = isMaxMineLevel || isMaxMinePurchases;
  
  const mineUpgrade: MineUpgradeData | null = isMineUpgradeBlocked ? null : GAME_CONSTANTS.MINE_UPGRADES[mineLevel];
  const canAffordMines: boolean = mineUpgrade ? gold >= mineUpgrade.cost : false;

  const handleMineUpgrade = (): void => {
    if (canAffordMines && !isMineUpgradeBlocked && mineUpgrade) {
      upgradeMines();
      // Deploy mines immediately on upgrade to see the new ones
      setTimeout(deployMines, 100); 
    }
  };

  return (
    <div style={{
      background: 'rgba(255, 150, 0, 0.1)',
      padding: '20px',
      borderRadius: '12px',
      border: '2px solid #ff9600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '20px',
    }}>
      <div>
        <h4 style={{ margin: 0, color: '#ff9600', fontSize: '18px' }}>Mayın Sistemi</h4>
        <p style={{ margin: '8px 0 0', color: '#ccc', fontSize: '14px' }}>
          {isMineUpgradeBlocked
            ? isMaxMinePurchases
              ? `Mayın limiti doldu! (${defenseUpgradeLimits.mines.purchaseCount}/${GAME_CONSTANTS.DEFENSE_UPGRADE_LIMITS.MINES.MAX_PURCHASES})`
              : 'Mayın sistemi tamamen geliştirildi!'
            : `Seviye ${mineLevel + 1} - Hasar: ${formatSmartPercentage((mineUpgrade?.damage || 0) / 100, 'damage')} düşman canı, 
               Menzil: ${mineUpgrade?.radius}, Mayın sayısı: ${mineUpgrade?.count}`
          }
        </p>
        <p style={{ margin: '4px 0 0', color: '#ff6b6b', fontSize: '12px' }}>
          ⚠️ Mayınlar düşmanları yavaşlatır ve hasar verir. Stratejik konumlara otomatik yerleştirilir.
        </p>
        {/* Limit information display */}
        <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
          Kalan hak: {GAME_CONSTANTS.DEFENSE_UPGRADE_LIMITS.MINES.MAX_PURCHASES - defenseUpgradeLimits.mines.purchaseCount}
        </div>
      </div>
      
      {!isMineUpgradeBlocked && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 'bold',
            color: getAffordabilityColor(mineUpgrade?.cost || 0, gold)
          }}>
            {formatCurrency(mineUpgrade?.cost || 0)} 💰
          </div>
          <button 
            onClick={handleMineUpgrade}
            disabled={!canAffordMines}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: canAffordMines 
                ? 'linear-gradient(135deg, #ff9600, #ffb347)' 
                : 'rgba(255,255,255,0.1)',
              color: canAffordMines ? '#fff' : '#666',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: canAffordMines ? 'pointer' : 'not-allowed',
              textShadow: canAffordMines ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
            }}
          >
            {canAffordMines ? '🔧 Yükselt' : '❌ Yetersiz'}
          </button>
        </div>
      )}
      
      {isMineUpgradeBlocked && (
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