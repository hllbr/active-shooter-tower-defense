import React from 'react';
import { useGameStore } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/Constants';
import { formatCurrency, getAffordabilityColor, getUnifiedButtonText, formatSmartPercentage, formatProfessional } from '../../../utils/numberFormatting';

export const DefenseUpgrades: React.FC = () => {
  const gold = useGameStore((s) => s.gold);
  const mineLevel = useGameStore((s) => s.mineLevel);
  const wallLevel = useGameStore((s) => s.wallLevel);
  const defenseUpgradeLimits = useGameStore((s) => s.defenseUpgradeLimits);
  const upgradeMines = useGameStore((s) => s.upgradeMines);
  const upgradeWall = useGameStore((s) => s.upgradeWall);
  const deployMines = useGameStore((s) => s.deployMines);

  const maxMineLevel = GAME_CONSTANTS.MINE_UPGRADES.length;
  const maxWallLevel = GAME_CONSTANTS.WALL_SYSTEM.WALL_LEVELS.length;
  
  // CRITICAL FIX: Proper limit checking for unlimited purple cards bug
  const isMaxMineLevel = mineLevel >= maxMineLevel;
  const isMaxMinePurchases = defenseUpgradeLimits.mines.purchaseCount >= GAME_CONSTANTS.DEFENSE_UPGRADE_LIMITS.MINES.MAX_PURCHASES;
  const isMineUpgradeBlocked = isMaxMineLevel || isMaxMinePurchases;
  
  const isMaxWallLevel = wallLevel >= maxWallLevel;
  const isMaxWallPurchases = defenseUpgradeLimits.walls.purchaseCount >= GAME_CONSTANTS.DEFENSE_UPGRADE_LIMITS.WALLS.MAX_PURCHASES;
  const isWallUpgradeBlocked = isMaxWallLevel || isMaxWallPurchases;
  
  const mineUpgrade = isMineUpgradeBlocked ? null : GAME_CONSTANTS.MINE_UPGRADES[mineLevel];
  const wallUpgrade = isWallUpgradeBlocked ? null : GAME_CONSTANTS.WALL_SYSTEM.WALL_LEVELS[wallLevel];
  
  const canAffordMines = mineUpgrade && gold >= mineUpgrade.cost;
  const canAffordWall = wallUpgrade && gold >= wallUpgrade.cost;

  const handleMineUpgrade = () => {
    if (canAffordMines && !isMineUpgradeBlocked) {
      upgradeMines();
      // Deploy mines immediately on upgrade to see the new ones
      setTimeout(deployMines, 100); 
    }
  };

  const handleWallUpgrade = () => {
    if (canAffordWall && !isWallUpgradeBlocked) {
      upgradeWall();
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      padding: '20px',
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '12px',
      border: '2px solid #8a2be2',
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '10px',
      }}>
        <h3 style={{ margin: 0, color: '#8a2be2', fontSize: '24px' }}>
          🛡️ Savunma Sistemleri
        </h3>
        <p style={{ margin: '8px 0 0', color: '#ccc', fontSize: '14px' }}>
          Stratejik savunma yükseltmeleri ile düşmanları durdurun
        </p>
      </div>

      {/* Mine Upgrade Section */}
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

      {/* Wall Upgrade Section */}
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
    </div>
  );
}; 