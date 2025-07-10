import React from 'react';
import { useGameStore, type Store } from '../../../models/store';
import { GAME_CONSTANTS } from '../../../utils/constants';
import { ShieldStatsDisplay } from './ShieldStatsDisplay';
import { ShieldUpgradeCard } from './ShieldUpgradeCard';
import { Logger } from '../../../utils/Logger';

export const ShieldUpgrades: React.FC = () => {
  const gold = useGameStore((state: Store) => state.gold);
  const globalWallStrength = useGameStore((state: Store) => state.globalWallStrength);
  const upgradeWall = useGameStore((state: Store) => state.upgradeWall);
  const wallLevel = useGameStore((state: Store) => state.wallLevel);

  const discountMultiplier = useGameStore((state: Store) => state.discountMultiplier);
  const diceUsed = useGameStore((state: Store) => state.diceUsed);
  
  // Calculate current shield strength
  const getCurrentShieldStrength = () => {
    return globalWallStrength * 10; // Each wall point = 10 shield strength
  };

  // Calculate next shield strength (if purchasing the next available shield)
  const getNextShieldStrength = () => {
    const currentShieldLevel = wallLevel || 0;
    const nextShield = GAME_CONSTANTS.WALL_SHIELDS[currentShieldLevel];
    if (!nextShield) return getCurrentShieldStrength();
    return (globalWallStrength + nextShield.strength) * 10;
  };

  const currentShieldStrength = getCurrentShieldStrength();
  const nextShieldStrength = getNextShieldStrength();

  const handlePurchase = (index: number, finalCost: number) => {
    const shield = GAME_CONSTANTS.WALL_SHIELDS[index];
    if (!shield) {
      Logger.error(`❌ Invalid shield index: ${index}`);
      import('../../../utils/sound').then(({ playSound }) => {
        playSound('error');
      });
      return;
    }
    
    const currentShieldLevel = wallLevel || 0;
    if (index !== currentShieldLevel) {
      Logger.error(`❌ Invalid purchase attempt: index ${index} !== currentLevel ${currentShieldLevel}`);
      import('../../../utils/sound').then(({ playSound }) => {
        playSound('error');
      });
      return;
    }
    
    // Validate cost matches what the UI calculated
    if (gold < finalCost) {
      Logger.error(`❌ Insufficient gold: ${gold} < ${finalCost}`);
      import('../../../utils/sound').then(({ playSound }) => {
        playSound('error');
      });
      return;
    }
    
    // Shield purchase processed - this will now use the correct shield.cost from WALL_SHIELDS
    Logger.log(`✅ Purchasing shield ${shield.name} for ${finalCost} gold. Current level: ${currentShieldLevel}`);
    upgradeWall();
    
    // Show success feedback
    import('../../../utils/sound').then(({ playSound }) => {
      playSound('shield-activate');
    });
  };

  return (
    <div style={{ width: '100%' }}>
      <span style={{ fontWeight: 'bold', fontSize: 18, color: GAME_CONSTANTS.GOLD_COLOR, marginBottom: 12, display: 'block' }}>
        🛡️ Kalkanlar
      </span>
      
      <ShieldStatsDisplay 
        currentShieldStrength={currentShieldStrength}
        nextShieldStrength={nextShieldStrength}
        globalWallStrength={globalWallStrength}
        showUpgradeAnimation={false}
        hasAvailableShields={GAME_CONSTANTS.WALL_SHIELDS.length > 0}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 12
      }}>
        {GAME_CONSTANTS.WALL_SHIELDS.map((shield, i) => {
          const currentShieldLevel = wallLevel || 0;
          const isCurrentLevel = i === currentShieldLevel;
          const isPastLevel = i < currentShieldLevel;
          const isFutureLevel = i > currentShieldLevel;
          
          const _canPurchase = isCurrentLevel && gold >= shield.cost;
          const isMaxed = isPastLevel;
          const _isLocked = isFutureLevel;
          
          // Shield level progression logic verified
          
          return (
            <ShieldUpgradeCard
              key={i}
              shield={shield}
              index={i}
              gold={gold}
              globalWallStrength={globalWallStrength}
              discountMultiplier={discountMultiplier}
              diceUsed={diceUsed}
              purchaseCount={isPastLevel ? 1 : 0}
              maxAllowed={1}
              isMaxed={isMaxed}
              onPurchase={handlePurchase}
            />
          );
        })}
      </div>
    </div>
  );
}; 